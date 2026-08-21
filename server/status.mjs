#!/usr/bin/env node
/**
 * Status endpoint.
 *
 * A second single-file service beside the contact endpoint, with no
 * dependencies and its own systemd unit. Separate on purpose: this one exists to
 * describe the box, and a fault in a page that describes the box must not be
 * able to take down the only channel a recruiter has to reach Max.
 *
 * Two things it does, and nothing else:
 *
 *   GET  /api/status        the public snapshot the /status page renders
 *   POST /api/status/probe  ingest, behind a bearer token
 *
 * The honest part, and the reason there are two sources of truth: a service
 * cannot report its own downtime. Whatever this process says about uptime is
 * necessarily said by a process that was up. So availability is measured from
 * outside — a scheduled job hits the public URL and posts what it saw here —
 * and this file only stores and serves it. The /status page says so in as many
 * words rather than implying a completeness it does not have.
 *
 * Nothing about visitors is recorded anywhere in this file. No addresses, no
 * counts, no geography. The site runs no analytics, and a status page is not a
 * side door for adding some.
 *
 * Environment:
 *   STATUS_TOKEN     required — the ingest token; without it, ingest is closed
 *   STATUS_STORE     default /var/lib/yastremskyi-status/status.json
 *   PORT             default 8789
 *   BIND_ADDR        default 127.0.0.1
 *   CONTACT_HEALTH   default http://127.0.0.1:8788/health
 */

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, renameSync, mkdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { timingSafeEqual } from 'node:crypto';

const PORT = Number(process.env.PORT ?? 8789);
const BIND = process.env.BIND_ADDR ?? '127.0.0.1';
const STORE_PATH = process.env.STATUS_STORE ?? '/var/lib/yastremskyi-status/status.json';
const CONTACT_HEALTH = process.env.CONTACT_HEALTH ?? 'http://127.0.0.1:8788/health';

/** How much history the page shows, and therefore how much is kept. */
export const RETENTION_DAYS = 30;

/**
 * The external prober runs every ten minutes. Two missed runs is a real signal;
 * one is a scheduler being a scheduler — GitHub's cron is explicitly best-effort
 * and drifts by minutes. So the page calls the data stale at twenty-five, and
 * says when it last heard anything rather than showing an old number as current.
 */
export const STALE_AFTER_MS = 25 * 60 * 1000;

/** Latency samples held per day. The count of checks stays exact regardless. */
export const SAMPLES_PER_DAY = 500;

/** Ingest attempts allowed per source per hour. The prober needs six. */
export const RATE = { max: 30, windowMs: 60 * 60 * 1000 };

const KINDS = new Set(['uptime', 'gates']);
/** Anything slower than this is a timeout someone reported wrongly. */
const MAX_PROBE_MS = 60_000;

// --- pure helpers ------------------------------------------------------------

/**
 * Nearest-rank percentile.
 *
 * No interpolation: with a few hundred samples of a page load, an interpolated
 * p95 invents a number that was never measured, and this page exists to show
 * measured numbers. Returns null for an empty set rather than 0, because "no
 * data" and "instant" are very different claims.
 */
export function percentile(samples, p) {
  if (!samples?.length) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const rank = Math.ceil((p / 100) * sorted.length);
  return sorted[Math.min(Math.max(rank, 1), sorted.length) - 1];
}

/** UTC day key. The box, the prober and CI are in three places; UTC is the one
 *  clock none of them argues with. */
export function dayKey(at) {
  return new Date(at).toISOString().slice(0, 10);
}

/**
 * Validation. Returns field -> message; empty means valid.
 *
 * The sender here is our own scheduled job rather than a person, so the messages
 * are for whoever is reading a failed workflow log at the time.
 */
export function validateProbe(body) {
  const errors = {};
  if (!body || typeof body !== 'object') return { body: 'expected a JSON object' };

  if (!KINDS.has(body.kind)) {
    errors.kind = `expected one of ${[...KINDS].join(', ')}`;
    return errors;
  }

  if (body.kind === 'uptime') {
    if (typeof body.ok !== 'boolean') errors.ok = 'expected a boolean';
    if (!Number.isFinite(body.ms) || body.ms < 0 || body.ms > MAX_PROBE_MS)
      errors.ms = `expected 0..${MAX_PROBE_MS}`;
    if (body.status !== undefined && !Number.isInteger(body.status))
      errors.status = 'expected an HTTP status code';
    if (
      body.tlsDaysRemaining !== undefined &&
      (!Number.isFinite(body.tlsDaysRemaining) || body.tlsDaysRemaining < 0)
    )
      errors.tlsDaysRemaining = 'expected a non-negative number of days';
    return errors;
  }

  if (typeof body.commit !== 'string' || !/^[0-9a-f]{7,40}$/.test(body.commit))
    errors.commit = 'expected a commit sha';
  if (typeof body.ci !== 'string' || body.ci.length > 32) errors.ci = 'expected a short status';
  if (body.routes !== undefined) {
    const routes = body.routes;
    const bad =
      !Array.isArray(routes) ||
      routes.length > 12 ||
      routes.some(
        (r) =>
          typeof r?.route !== 'string' ||
          r.route.length > 64 ||
          !Number.isFinite(r.performance) ||
          r.performance < 0 ||
          r.performance > 100 ||
          !Number.isFinite(r.lcp) ||
          r.lcp < 0,
      );
    if (bad) errors.routes = 'expected up to 12 { route, performance 0..100, lcp }';
  }
  return errors;
}

/**
 * Constant-time bearer comparison.
 *
 * `timingSafeEqual` throws on a length mismatch, and catching that would leak
 * the length through timing anyway, so both sides are hashed to a fixed width
 * first. An unset token matches nothing: a service that has lost its
 * configuration must close the door, not open it.
 */
export function tokenMatches(header, token) {
  if (!token) return false;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return false;
  const given = header.slice('Bearer '.length);
  if (!given) return false;

  const a = Buffer.alloc(64);
  const b = Buffer.alloc(64);
  a.write(given.slice(0, 64));
  b.write(token.slice(0, 64));
  return timingSafeEqual(a, b) && given.length === token.length;
}

// --- the store ---------------------------------------------------------------

const EMPTY = () => ({ version: 1, days: [], last: null, gates: null });

function isStore(value) {
  return Boolean(value) && typeof value === 'object' && Array.isArray(value.days);
}

/**
 * The whole store is a few kilobytes of JSON, so it is a file.
 *
 * A database here would be a dependency to install, back up and explain, in
 * front of thirty rows that are rewritten once every ten minutes. The two things
 * a file does have to get right are done explicitly: the write is a
 * write-then-rename so a crash mid-write cannot leave a half-file, and a
 * damaged or missing file starts empty rather than taking the service down —
 * losing a month of latency samples is a smaller failure than a status page
 * that cannot start.
 */
export function createStore(path = STORE_PATH) {
  let data = EMPTY();
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8'));
    if (isStore(parsed)) data = parsed;
    else console.warn(`[status] ${path} is not a store — starting empty`);
  } catch (err) {
    if (err.code !== 'ENOENT') console.warn(`[status] could not read ${path}: ${err.message}`);
  }

  function persist() {
    mkdirSync(dirname(path), { recursive: true });
    const tmp = join(dirname(path), `.status.${process.pid}.tmp`);
    try {
      writeFileSync(tmp, JSON.stringify(data), { mode: 0o644 });
      renameSync(tmp, path);
    } catch (err) {
      try {
        unlinkSync(tmp);
      } catch {
        /* the temp file may never have been created */
      }
      throw err;
    }
  }

  function dayFor(at) {
    const date = dayKey(at);
    let day = data.days.find((d) => d.date === date);
    if (!day) {
      day = { date, checks: 0, failures: 0, samples: [], cursor: 0 };
      data.days.push(day);
      data.days.sort((a, b) => a.date.localeCompare(b.date));
      if (data.days.length > RETENTION_DAYS) data.days.splice(0, data.days.length - RETENTION_DAYS);
    }
    return day;
  }

  return {
    /** Derived fields are computed here, so nothing downstream re-implements them. */
    read() {
      return {
        ...data,
        days: data.days.map((d) => ({
          date: d.date,
          checks: d.checks,
          failures: d.failures,
          sampleCount: d.samples.length,
          p50: percentile(d.samples, 50),
          p95: percentile(d.samples, 95),
        })),
      };
    },

    /**
     * One external check. Only the four fields below are kept — a probe carrying
     * anything else is storing it nowhere, which is the point.
     */
    recordUptime(probe, at = Date.now()) {
      const day = dayFor(at);
      day.checks += 1;
      if (probe.ok) {
        // A failed request contributes no latency sample: a 502 arriving in 3ms
        // is not evidence that the site is fast.
        if (day.samples.length < SAMPLES_PER_DAY) day.samples.push(probe.ms);
        else {
          day.samples[day.cursor % SAMPLES_PER_DAY] = probe.ms;
          day.cursor = (day.cursor + 1) % SAMPLES_PER_DAY;
        }
      } else {
        day.failures += 1;
      }
      data.last = {
        at,
        ok: Boolean(probe.ok),
        ms: Number(probe.ms) || 0,
        status: Number.isInteger(probe.status) ? probe.status : null,
        tlsDaysRemaining: Number.isFinite(probe.tlsDaysRemaining) ? probe.tlsDaysRemaining : null,
      };
      persist();
      return day;
    },

    /** What CI saw on the commit that is now in production. Not an uptime check. */
    recordGates(payload, at = Date.now()) {
      data.gates = {
        at,
        commit: String(payload.commit),
        ci: String(payload.ci),
        routes: (payload.routes ?? []).map((r) => ({
          route: String(r.route),
          performance: Math.round(r.performance),
          lcp: Math.round(r.lcp),
        })),
      };
      persist();
      return data.gates;
    },
  };
}

// --- the public snapshot -----------------------------------------------------

const iso = (at) => (at ? new Date(at).toISOString() : null);
const round = (n, places) => (n === null ? null : Number(n.toFixed(places)));

/**
 * What the page renders. Everything here is derived; nothing is stored twice.
 *
 * Kept under 4 KB with a full window on purpose — the page fetches it, and this
 * site treats bytes on the wire as a budget rather than a detail.
 */
export function snapshot(data, now = Date.now(), extra = {}) {
  const days = data.days ?? [];
  const checks = days.reduce((n, d) => n + d.checks, 0);
  const failures = days.reduce((n, d) => n + d.failures, 0);
  const samples = days.flatMap((d) => [d.p50, d.p95].filter((v) => v !== null));

  return {
    generatedAt: iso(now),
    window: RETENTION_DAYS,
    uptime: {
      checks,
      failures,
      availability: checks === 0 ? null : round((checks - failures) / checks, 5),
    },
    latency: {
      p50: percentile(
        days.map((d) => d.p50).filter((v) => v !== null),
        50,
      ),
      p95: percentile(
        days.map((d) => d.p95).filter((v) => v !== null),
        95,
      ),
      unit: 'ms',
      samples: samples.length,
    },
    days: days.map((d) => ({
      date: d.date,
      checks: d.checks,
      failures: d.failures,
      availability: d.checks === 0 ? null : round((d.checks - d.failures) / d.checks, 4),
    })),
    probe: {
      lastAt: iso(data.last?.at ?? null),
      ok: data.last?.ok ?? null,
      stale: !data.last || now - data.last.at > STALE_AFTER_MS,
      intervalMinutes: 10,
      source: 'external',
    },
    tls: { daysRemaining: data.last?.tlsDaysRemaining ?? null },
    gates: data.gates
      ? {
          at: iso(data.gates.at),
          commit: data.gates.commit,
          ci: data.gates.ci,
          routes: data.gates.routes,
        }
      : null,
    ...extra,
  };
}

// --- rate limiting -----------------------------------------------------------

/** Fixed window, one map, no store to operate — the same shape the contact
 *  endpoint uses, for the same reason. */
export function createLimiter({ max = RATE.max, windowMs = RATE.windowMs } = {}) {
  const hits = new Map();
  return {
    check(key, now = Date.now()) {
      const entry = hits.get(key);
      if (!entry || now - entry.start >= windowMs) {
        hits.set(key, { start: now, count: 1 });
        return { allowed: true };
      }
      entry.count += 1;
      return { allowed: entry.count <= max };
    },
    sweep(now = Date.now()) {
      for (const [key, entry] of hits) if (now - entry.start >= windowMs) hits.delete(key);
      return hits.size;
    },
  };
}

// --- server ------------------------------------------------------------------

function readBody(req, limitBytes = 16 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error('body too large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

/** Same reasoning as the contact endpoint: behind Cloudflare only this header
 *  carries the caller, and nothing but Caddy can reach this process. */
export function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.trim()) return cf.trim();
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress ?? 'unknown';
}

function json(res, status, payload, headers = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

/**
 * Is the contact endpoint answering?
 *
 * Checked from this process because both run on the same box, and cached for a
 * minute so a page refresh cannot turn into a health-check flood next door.
 */
export function createContactCheck(url = CONTACT_HEALTH, fetchImpl = fetch, ttlMs = 60_000) {
  let cached = { at: 0, value: null };
  return async (now = Date.now()) => {
    // `cached.value` and not the timestamp alone: an empty cache at at=0 looks
    // fresh to any small `now`, and the first caller would be handed the null
    // it was supposed to fill in.
    if (cached.value && now - cached.at < ttlMs) return cached.value;
    let value;
    try {
      const res = await fetchImpl(url, { signal: AbortSignal.timeout(2000) });
      value = { ok: res.ok, checkedAt: iso(now) };
    } catch {
      value = { ok: false, checkedAt: iso(now) };
    }
    cached = { at: now, value };
    return value;
  };
}

export function createApp({
  store = createStore(),
  token = process.env.STATUS_TOKEN,
  limiter = createLimiter(),
  now = Date.now,
  checkContact = null,
} = {}) {
  return async (req, res) => {
    const url = (req.url ?? '').split('?')[0];

    if (req.method === 'GET' && url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    if (req.method === 'GET' && url === '/api/status') {
      const extra = {
        service: {
          startedAt: iso(now() - Math.round(process.uptime() * 1000)),
          node: process.versions.node,
        },
      };
      if (checkContact) extra.contact = await checkContact(now());
      // A minute of caching: fresh enough for a page that changes every ten
      // minutes, and enough that a link doing the rounds cannot become load.
      json(res, 200, snapshot(store.read(), now(), extra), {
        'Cache-Control': 'public, max-age=60',
      });
      return;
    }

    if (req.method === 'POST' && url === '/api/status/probe') {
      // Rate limit before authentication, so a wrong token cannot be guessed at
      // speed. The honest prober needs six requests an hour and will never see
      // this.
      if (!limiter.check(clientIp(req), now()).allowed) {
        json(res, 429, { ok: false, error: 'too many requests' });
        return;
      }

      if (!tokenMatches(req.headers.authorization, token)) {
        // One body for every rejection: which half was wrong is not information
        // this endpoint gives away.
        json(res, 401, { ok: false, error: 'unauthorized' });
        return;
      }

      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        json(res, 400, { ok: false, error: 'expected a JSON body' });
        return;
      }

      const errors = validateProbe(body);
      if (Object.keys(errors).length) {
        json(res, 422, { ok: false, errors });
        return;
      }

      if (body.kind === 'uptime') store.recordUptime(body, now());
      else store.recordGates(body, now());

      // 202: accepted and stored. The prober has nothing to do with the answer,
      // so there is nothing to return but the fact that it landed.
      json(res, 202, { ok: true });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('not found');
  };
}

// Started directly rather than imported by a test.
if (import.meta.url === `file://${process.argv[1]}`) {
  if (!process.env.STATUS_TOKEN) {
    console.error('[status] missing required environment variable: STATUS_TOKEN');
    process.exit(1);
  }
  const limiter = createLimiter();
  setInterval(() => limiter.sweep(), RATE.windowMs).unref?.();

  createServer(
    createApp({ store: createStore(STORE_PATH), limiter, checkContact: createContactCheck() }),
  ).listen(PORT, BIND, () => {
    console.log(`[status] listening on ${BIND}:${PORT}, store ${STORE_PATH}`);
  });
}
