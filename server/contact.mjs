#!/usr/bin/env node
/**
 * Contact endpoint.
 *
 * A single file with no dependencies: node:http for the server, global fetch for
 * Resend. A contact form is roughly forty lines of logic, and every dependency
 * added to it is a thing that can break, be abandoned, or read the messages.
 *
 * It runs behind Caddy on the same box as the static site, which is why there is
 * no TLS, no CORS wildcard and no framework here — Caddy terminates TLS and only
 * this origin can reach the endpoint.
 *
 * Works with JavaScript disabled. A plain form POST is answered with a redirect
 * to a real page; the enhanced path uses the same endpoint and reads the JSON.
 *
 * Environment:
 *   RESEND_API_KEY   required
 *   MAIL_TO          required — where messages land
 *   MAIL_FROM        required — must be on a Resend-verified domain
 *   PORT             default 8788
 *   SITE_ORIGIN      default https://yastremskyi.com
 */

import { createServer } from 'node:http';

const PORT = Number(process.env.PORT ?? 8788);
const ORIGIN = process.env.SITE_ORIGIN ?? 'https://yastremskyi.com';
const RESEND_KEY = process.env.RESEND_API_KEY;
const MAIL_TO = process.env.MAIL_TO;
const MAIL_FROM = process.env.MAIL_FROM;

/** Field limits. Anything longer is a bot or a mistake, not a message. */
export const LIMITS = { name: 120, email: 254, message: 5000 };

/** A form filled faster than this was not filled by a person. */
export const MIN_FILL_MS = 2500;

/** Requests allowed per IP per window. */
export const RATE = { max: 5, windowMs: 60 * 60 * 1000 };

/**
 * Validation. Returns a map of field -> message; an empty map means valid.
 *
 * Deliberately not a schema library: the rules are four lines, and the error
 * strings have to be readable by the person who typed the form, not by a
 * developer reading a stack trace.
 */
export function validate(body) {
  const errors = {};
  const name = (body.name ?? '').trim();
  const email = (body.email ?? '').trim();
  const message = (body.message ?? '').trim();

  if (!name) errors.name = 'Please tell me your name.';
  else if (name.length > LIMITS.name) errors.name = 'That name is longer than this field allows.';

  if (!email) errors.email = 'I need an address to reply to.';
  else if (email.length > LIMITS.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    errors.email = 'That does not look like an email address.';

  if (!message) errors.message = 'The message is empty.';
  else if (message.length < 10) errors.message = 'A little more detail would help.';
  else if (message.length > LIMITS.message)
    errors.message = 'That is longer than this form accepts — email me directly instead.';

  return errors;
}

/**
 * Spam checks that cost the sender nothing.
 *
 * A honeypot field hidden from people but not from bots, and a timing floor.
 * The brief asks for a honeypot specifically; a CAPTCHA would push third-party
 * JavaScript onto a page whose whole argument is that it ships almost none.
 */
export function looksAutomated(body, now = Date.now()) {
  if ((body.company ?? '').trim() !== '') return 'honeypot';
  const started = Number(body.started);
  if (Number.isFinite(started) && started > 0 && now - started < MIN_FILL_MS) return 'too-fast';
  return null;
}

/** Fixed-window rate limiter. One small server, one map; no store to operate. */
export function createLimiter({ max = RATE.max, windowMs = RATE.windowMs } = {}) {
  const hits = new Map();
  return {
    check(key, now = Date.now()) {
      const entry = hits.get(key);
      if (!entry || now - entry.start >= windowMs) {
        hits.set(key, { start: now, count: 1 });
        return { allowed: true, remaining: max - 1 };
      }
      entry.count += 1;
      return { allowed: entry.count <= max, remaining: Math.max(0, max - entry.count) };
    },
    /** Called on a timer so an idle server does not hold addresses for ever. */
    sweep(now = Date.now()) {
      for (const [key, entry] of hits) if (now - entry.start >= windowMs) hits.delete(key);
      return hits.size;
    },
    get size() {
      return hits.size;
    },
  };
}

/** Never interpolate sender input into HTML. Plain text only, and escaped. */
export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
}

export function buildEmail({ name, email, message }) {
  return {
    from: MAIL_FROM,
    to: [MAIL_TO],
    reply_to: email,
    subject: `yastremskyi.com — ${name}`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html:
      `<p><strong>${escapeHtml(name)}</strong> &lt;${escapeHtml(email)}&gt;</p>` +
      `<pre style="white-space:pre-wrap;font:14px/1.6 ui-monospace,monospace">${escapeHtml(message)}</pre>`,
  };
}

/** The one side effect in this file, so it is the one thing a test injects. */
export async function sendViaResend(payload) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
  return res.json();
}

// --- server -----------------------------------------------------------------

function readBody(req, limitBytes = 64 * 1024) {
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

function parseBody(raw, contentType = '') {
  if (contentType.includes('application/json')) return JSON.parse(raw);
  return Object.fromEntries(new URLSearchParams(raw));
}

/**
 * The visitor's address, for rate limiting.
 *
 * Behind Cloudflare's proxy the origin sees Cloudflare's edge addresses, not the
 * visitor's — so `CF-Connecting-IP`, which Cloudflare documents as "the client IP
 * address connecting to Cloudflare", comes first. Getting this wrong collapses
 * every visitor onto a handful of edge IPs, and the first person to send two
 * messages locks out everyone else.
 *
 * These headers are only trustworthy because nothing else can reach this
 * process: it binds to 127.0.0.1, and Caddy is the only thing in front of it.
 */
export function clientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (typeof cf === 'string' && cf.trim()) return cf.trim();

  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) return fwd.split(',')[0].trim();

  return req.socket.remoteAddress ?? 'unknown';
}

function respond(req, res, { status, ok, errors = {}, message = '' }) {
  const wantsJson = (req.headers.accept ?? '').includes('application/json');
  if (wantsJson) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok, errors, message }));
    return;
  }
  // No JavaScript: answer with a redirect to a real page rather than a blob of
  // JSON in the address bar.
  const target = ok
    ? `${ORIGIN}/thanks`
    : `${ORIGIN}/#contact?error=${encodeURIComponent(message || 'invalid')}`;
  res.writeHead(303, { Location: target });
  res.end();
}

/**
 * @param {object} [deps]
 * @param {(payload: object) => Promise<unknown>} [deps.send] delivery, injected so
 *   a test can exercise the whole request path without touching a paid API.
 * @param {ReturnType<typeof createLimiter>} [deps.limiter]
 */
export function createApp({ send = sendViaResend, limiter = createLimiter() } = {}) {
  return async (req, res) => {
    if (req.method === 'GET' && req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }

    if (req.method !== 'POST' || !req.url?.startsWith('/api/contact')) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('not found');
      return;
    }

    const { allowed } = limiter.check(clientIp(req));
    if (!allowed) {
      respond(req, res, {
        status: 429,
        ok: false,
        message: 'That is more messages than this form accepts in an hour. Email me directly.',
      });
      return;
    }

    let body;
    try {
      body = parseBody(await readBody(req), req.headers['content-type'] ?? '');
    } catch {
      respond(req, res, { status: 400, ok: false, message: 'That message could not be read.' });
      return;
    }

    // Silence, not an error page: telling a bot which check caught it is free
    // advice on how to pass next time.
    if (looksAutomated(body)) {
      respond(req, res, {
        status: 200,
        ok: true,
        message: 'Thank you — your message is on its way.',
      });
      return;
    }

    const errors = validate(body);
    if (Object.keys(errors).length) {
      respond(req, res, {
        status: 422,
        ok: false,
        errors,
        message: 'Please check the fields above.',
      });
      return;
    }

    try {
      await send(buildEmail(body));
    } catch (err) {
      console.error('[contact] delivery failed:', err.message);
      respond(req, res, {
        status: 502,
        ok: false,
        message: 'The message did not go through. Email me directly and I will see it.',
      });
      return;
    }

    respond(req, res, {
      status: 200,
      ok: true,
      message: 'Thank you — your message is on its way.',
    });
  };
}

// Started directly rather than imported by a test.
if (import.meta.url === `file://${process.argv[1]}`) {
  for (const name of ['RESEND_API_KEY', 'MAIL_TO', 'MAIL_FROM']) {
    if (!process.env[name]) {
      console.error(`[contact] missing required environment variable: ${name}`);
      process.exit(1);
    }
  }
  const limiter = createLimiter();
  setInterval(() => limiter.sweep(), RATE.windowMs).unref?.();

  createServer(createApp({ limiter })).listen(PORT, '127.0.0.1', () => {
    console.log(`[contact] listening on 127.0.0.1:${PORT}`);
  });
}
