/**
 * Tests for the status endpoint.
 *
 *   npm test
 *
 * Nothing here touches the network or the real store: the clock is injected and
 * every store lives in a temporary directory that the test owns. A suite that
 * depends on wall-clock time is a suite that fails at midnight and gets ignored.
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  createStore,
  createContactCheck,
  percentile,
  snapshot,
  validateProbe,
  tokenMatches,
  createApp,
  RETENTION_DAYS,
  STALE_AFTER_MS,
} from './status.mjs';

const TOKEN = 'a-long-enough-ingest-token-value';
let dir;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'status-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const storePath = () => join(dir, 'status.json');

describe('percentile', () => {
  test('returns null for no samples, rather than a made-up zero', () => {
    assert.equal(percentile([], 50), null);
  });

  test('is the value itself for a single sample', () => {
    assert.equal(percentile([120], 95), 120);
  });

  test('picks the nearest rank, not an interpolation nobody asked for', () => {
    const samples = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    assert.equal(percentile(samples, 50), 50);
    assert.equal(percentile(samples, 95), 100);
  });

  test('does not care what order the samples arrive in', () => {
    assert.equal(percentile([90, 10, 50, 30, 70], 50), 50);
  });
});

describe('validateProbe', () => {
  const uptime = { kind: 'uptime', ok: true, ms: 143, status: 200 };

  test('accepts a well-formed uptime probe', () => {
    assert.deepEqual(validateProbe(uptime), {});
  });

  test('rejects an unknown kind', () => {
    assert.ok(validateProbe({ ...uptime, kind: 'whatever' }).kind);
  });

  test('rejects a non-boolean ok', () => {
    assert.ok(validateProbe({ ...uptime, ok: 'yes' }).ok);
  });

  test('rejects a negative or absurd duration', () => {
    assert.ok(validateProbe({ ...uptime, ms: -1 }).ms);
    assert.ok(validateProbe({ ...uptime, ms: 60 * 60 * 1000 }).ms);
  });

  test('accepts a gates probe carrying route scores', () => {
    assert.deepEqual(
      validateProbe({
        kind: 'gates',
        commit: 'a9a24a8',
        ci: 'passing',
        routes: [{ route: '/', performance: 100, lcp: 1209 }],
      }),
      {},
    );
  });

  test('rejects a gates probe whose commit is not a commit', () => {
    assert.ok(validateProbe({ kind: 'gates', commit: 'not a sha!!', ci: 'passing' }).commit);
  });

  test('rejects a score outside 0..100', () => {
    const errors = validateProbe({
      kind: 'gates',
      commit: 'a9a24a8',
      ci: 'passing',
      routes: [{ route: '/', performance: 101, lcp: 1209 }],
    });
    assert.ok(errors.routes);
  });
});

describe('tokenMatches', () => {
  test('accepts the configured token', () => {
    assert.equal(tokenMatches(`Bearer ${TOKEN}`, TOKEN), true);
  });

  test('rejects a wrong token of the same length', () => {
    const wrong = 'b'.repeat(TOKEN.length);
    assert.equal(tokenMatches(`Bearer ${wrong}`, TOKEN), false);
  });

  test('rejects a wrong token of a different length without throwing', () => {
    assert.equal(tokenMatches('Bearer short', TOKEN), false);
  });

  test('rejects a missing or malformed header', () => {
    assert.equal(tokenMatches(undefined, TOKEN), false);
    assert.equal(tokenMatches(TOKEN, TOKEN), false);
    assert.equal(tokenMatches('Bearer ', TOKEN), false);
  });

  test('refuses to match when no token is configured', () => {
    assert.equal(tokenMatches('Bearer anything', ''), false);
    assert.equal(tokenMatches('Bearer anything', undefined), false);
  });
});

describe('createStore', () => {
  test('starts empty when the file does not exist', () => {
    const store = createStore(storePath());
    assert.deepEqual(store.read().days, []);
  });

  test('starts empty rather than throwing when the file is corrupt', () => {
    writeFileSync(storePath(), '{ this is not json');
    const store = createStore(storePath());
    assert.deepEqual(store.read().days, []);
  });

  test('starts empty when the file holds valid JSON of the wrong shape', () => {
    writeFileSync(storePath(), '"a string"');
    const store = createStore(storePath());
    assert.deepEqual(store.read().days, []);
  });

  test('creates the directory it was pointed at', () => {
    const nested = join(dir, 'deep', 'status.json');
    const store = createStore(nested);
    store.recordUptime({ ok: true, ms: 100 }, Date.parse('2026-08-21T10:00:00Z'));
    assert.equal(store.read().days.length, 1);
  });

  test('leaves no temporary file behind — the write is a rename', () => {
    const store = createStore(storePath());
    store.recordUptime({ ok: true, ms: 100 }, Date.parse('2026-08-21T10:00:00Z'));
    assert.deepEqual(readdirSync(dir), ['status.json']);
  });

  test('survives a reload: what was written is what is read back', () => {
    const at = Date.parse('2026-08-21T10:00:00Z');
    createStore(storePath()).recordUptime({ ok: true, ms: 143 }, at);
    const reopened = createStore(storePath()).read();
    assert.equal(reopened.days.length, 1);
    assert.equal(reopened.days[0].checks, 1);
    assert.equal(reopened.last.ms, 143);
  });

  test('groups samples by UTC day', () => {
    const store = createStore(storePath());
    store.recordUptime({ ok: true, ms: 100 }, Date.parse('2026-08-21T23:59:00Z'));
    store.recordUptime({ ok: true, ms: 100 }, Date.parse('2026-08-22T00:01:00Z'));
    assert.deepEqual(
      store.read().days.map((d) => d.date),
      ['2026-08-21', '2026-08-22'],
    );
  });

  test('counts a failed probe as a failure, and still records the day', () => {
    const store = createStore(storePath());
    const at = Date.parse('2026-08-21T10:00:00Z');
    store.recordUptime({ ok: true, ms: 100 }, at);
    store.recordUptime({ ok: false, ms: 0, status: 502 }, at + 1000);
    const [day] = store.read().days;
    assert.equal(day.checks, 2);
    assert.equal(day.failures, 1);
  });

  test('a failed probe contributes no latency sample — a 502 is not a fast page', () => {
    const store = createStore(storePath());
    const at = Date.parse('2026-08-21T10:00:00Z');
    store.recordUptime({ ok: false, ms: 3, status: 502 }, at);
    assert.equal(store.read().days[0].p50, null);
  });

  test(`keeps ${RETENTION_DAYS} days and drops the oldest`, () => {
    const store = createStore(storePath());
    const day0 = Date.parse('2026-01-01T00:00:00Z');
    for (let i = 0; i < RETENTION_DAYS + 10; i += 1) {
      store.recordUptime({ ok: true, ms: 100 }, day0 + i * 86_400_000);
    }
    const { days } = store.read();
    assert.equal(days.length, RETENTION_DAYS);
    assert.equal(days.at(-1).date, '2026-02-09');
    assert.ok(!days.some((d) => d.date === '2026-01-01'));
  });

  test('caps the samples held for one day so the file cannot grow without bound', () => {
    const store = createStore(storePath());
    const at = Date.parse('2026-08-21T10:00:00Z');
    for (let i = 0; i < 5000; i += 1) store.recordUptime({ ok: true, ms: i }, at + i);
    const [day] = store.read().days;
    assert.equal(day.checks, 5000, 'the count is exact even when samples are sampled');
    assert.ok(day.sampleCount <= 500);
  });

  test('records gate results separately from uptime', () => {
    const store = createStore(storePath());
    const at = Date.parse('2026-08-21T10:00:00Z');
    store.recordGates({ commit: 'a9a24a8', ci: 'passing', routes: [] }, at);
    const read = store.read();
    assert.equal(read.gates.commit, 'a9a24a8');
    assert.deepEqual(read.days, [], 'a gate report is not an uptime check');
  });
});

describe('snapshot', () => {
  const now = Date.parse('2026-08-21T12:00:00Z');

  function seed(days, { failuresOnLastDay = 0 } = {}) {
    const store = createStore(storePath());
    for (let i = days - 1; i >= 0; i -= 1) {
      const at = now - i * 86_400_000;
      store.recordUptime({ ok: true, ms: 100 + i }, at);
      if (i === 0) {
        for (let f = 0; f < failuresOnLastDay; f += 1) {
          store.recordUptime({ ok: false, ms: 0, status: 502 }, at + f);
        }
      }
    }
    return store;
  }

  test('reports availability over the window', () => {
    const out = snapshot(seed(3).read(), now);
    assert.equal(out.uptime.checks, 3);
    assert.equal(out.uptime.failures, 0);
    assert.equal(out.uptime.availability, 1);
  });

  test('availability falls when probes fail, and the day shows it', () => {
    const out = snapshot(seed(2, { failuresOnLastDay: 1 }).read(), now);
    assert.equal(out.uptime.failures, 1);
    assert.ok(out.uptime.availability < 1);
    assert.equal(out.days.at(-1).failures, 1);
  });

  test('renders one entry per retained day, oldest first', () => {
    const out = snapshot(seed(5).read(), now);
    assert.equal(out.days.length, 5);
    const dates = out.days.map((d) => d.date);
    assert.deepEqual(dates, [...dates].sort());
  });

  test('marks the probe stale when nothing has arrived recently', () => {
    const store = seed(1);
    const fresh = snapshot(store.read(), now);
    assert.equal(fresh.probe.stale, false);

    const later = snapshot(store.read(), now + STALE_AFTER_MS + 1000);
    assert.equal(later.probe.stale, true);
  });

  test('says so plainly when there is no data at all', () => {
    const out = snapshot(createStore(storePath()).read(), now);
    assert.equal(out.uptime.checks, 0);
    assert.equal(out.uptime.availability, null);
    assert.equal(out.probe.stale, true);
    assert.deepEqual(out.days, []);
  });

  test('stays inside the size budget with a full window', () => {
    const store = createStore(storePath());
    for (let i = RETENTION_DAYS - 1; i >= 0; i -= 1) {
      const at = now - i * 86_400_000;
      for (let n = 0; n < 144; n += 1) store.recordUptime({ ok: true, ms: 100 + n }, at + n * 1000);
    }
    store.recordGates(
      {
        commit: 'a9a24a8',
        ci: 'passing',
        routes: ['/', '/work', '/about', '/cv', '/groundwork', '/notes'].map((route) => ({
          route,
          performance: 100,
          lcp: 1209,
        })),
      },
      now,
    );
    const bytes = Buffer.byteLength(JSON.stringify(snapshot(store.read(), now)));
    assert.ok(bytes < 4096, `snapshot is ${bytes} bytes`);
  });
});

// --- the request path --------------------------------------------------------

function listen(app) {
  const server = createServer(app);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        base: `http://127.0.0.1:${port}`,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

function appFor(overrides = {}) {
  return createApp({
    store: createStore(storePath()),
    token: TOKEN,
    now: () => Date.parse('2026-08-21T12:00:00Z'),
    ...overrides,
  });
}

const probe = (base, body, headers = {}) =>
  fetch(`${base}/api/status/probe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

const UPTIME = { kind: 'uptime', ok: true, ms: 143, status: 200 };
const AUTH = { Authorization: `Bearer ${TOKEN}` };

describe('POST /api/status/probe', () => {
  test('refuses an unauthenticated probe', async () => {
    const { base, close } = await listen(appFor());
    const res = await probe(base, UPTIME);
    assert.equal(res.status, 401);
    await close();
  });

  test('refuses a wrong token', async () => {
    const { base, close } = await listen(appFor());
    const res = await probe(base, UPTIME, { Authorization: 'Bearer wrong-token-entirely' });
    assert.equal(res.status, 401);
    await close();
  });

  test('accepts an authenticated probe and stores it', async () => {
    const store = createStore(storePath());
    const { base, close } = await listen(appFor({ store }));
    const res = await probe(base, UPTIME, AUTH);
    assert.equal(res.status, 202);
    assert.equal(store.read().days[0].checks, 1);
    await close();
  });

  test('rejects a malformed probe with the field that is wrong', async () => {
    const { base, close } = await listen(appFor());
    const res = await probe(base, { ...UPTIME, ms: -5 }, AUTH);
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.ok(body.errors.ms);
    await close();
  });

  test('rejects a body that is not JSON at all', async () => {
    const { base, close } = await listen(appFor());
    const res = await fetch(`${base}/api/status/probe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...AUTH },
      body: 'not json',
    });
    assert.equal(res.status, 400);
    await close();
  });

  test('rate-limits a flood from one source', async () => {
    const { base, close } = await listen(appFor());
    const codes = [];
    for (let i = 0; i < 40; i += 1) codes.push((await probe(base, UPTIME, AUTH)).status);
    assert.ok(codes.includes(429), 'expected the limiter to close the door');
    await close();
  });

  test('never reveals whether the token was close', async () => {
    const { base, close } = await listen(appFor());
    const a = await probe(base, UPTIME, { Authorization: 'Bearer x' });
    const b = await probe(base, UPTIME, { Authorization: `Bearer ${'a'.repeat(TOKEN.length)}` });
    assert.equal(await a.text(), await b.text());
    await close();
  });
});

describe('GET /api/status', () => {
  test('answers with a snapshot', async () => {
    const store = createStore(storePath());
    store.recordUptime({ ok: true, ms: 143 }, Date.parse('2026-08-21T11:00:00Z'));
    const { base, close } = await listen(appFor({ store }));
    const res = await fetch(`${base}/api/status`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /application\/json/);
    const body = await res.json();
    assert.equal(body.uptime.checks, 1);
    await close();
  });

  test('needs no token — it is a public page', async () => {
    const { base, close } = await listen(appFor());
    assert.equal((await fetch(`${base}/api/status`)).status, 200);
    await close();
  });

  test('asks not to be cached for long, so the page is not stale by design', async () => {
    const { base, close } = await listen(appFor());
    const res = await fetch(`${base}/api/status`);
    assert.match(res.headers.get('cache-control') ?? '', /max-age=\d+/);
    await close();
  });

  test('answers a health check', async () => {
    const { base, close } = await listen(appFor());
    assert.equal((await fetch(`${base}/health`)).status, 200);
    await close();
  });

  test('is not a general-purpose server', async () => {
    const { base, close } = await listen(appFor());
    assert.equal((await fetch(`${base}/anything-else`)).status, 404);
    assert.equal((await fetch(`${base}/api/status`, { method: 'DELETE' })).status, 404);
    await close();
  });
});

describe('TLS expiry, as seen from outside', () => {
  test('accepts and keeps the days remaining reported by the prober', () => {
    const store = createStore(storePath());
    store.recordUptime(
      { ok: true, ms: 100, tlsDaysRemaining: 61 },
      Date.parse('2026-08-21T10:00:00Z'),
    );
    const out = snapshot(store.read(), Date.parse('2026-08-21T12:00:00Z'));
    assert.equal(out.tls.daysRemaining, 61);
  });

  test('reports null rather than zero when nothing has said', () => {
    const store = createStore(storePath());
    store.recordUptime({ ok: true, ms: 100 }, Date.parse('2026-08-21T10:00:00Z'));
    assert.equal(
      snapshot(store.read(), Date.parse('2026-08-21T12:00:00Z')).tls.daysRemaining,
      null,
    );
  });

  test('rejects a nonsensical expiry', () => {
    assert.ok(
      validateProbe({ kind: 'uptime', ok: true, ms: 1, tlsDaysRemaining: -3 }).tlsDaysRemaining,
    );
  });
});

describe('contact-endpoint health', () => {
  test('reports the neighbour as up when it answers', async () => {
    const check = createContactCheck('http://unused', async () => ({ ok: true }));
    assert.equal((await check(1000)).ok, true);
  });

  test('reports it as down rather than throwing when it does not answer', async () => {
    const check = createContactCheck('http://unused', async () => {
      throw new Error('ECONNREFUSED');
    });
    assert.equal((await check(1000)).ok, false);
  });

  test('caches, so refreshing the page cannot become a flood next door', async () => {
    let calls = 0;
    const check = createContactCheck(
      'http://unused',
      async () => {
        calls += 1;
        return { ok: true };
      },
      60_000,
    );
    await check(1000);
    await check(2000);
    await check(70_000);
    assert.equal(calls, 2, 'two calls: the first, and one after the cache expired');
  });

  test('a down neighbour does not stop the snapshot being served', async () => {
    const { base, close } = await listen(
      appFor({
        checkContact: createContactCheck('http://unused', async () => {
          throw new Error('nope');
        }),
      }),
    );
    const res = await fetch(`${base}/api/status`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).contact.ok, false);
    await close();
  });
});

describe('what the store must never do', () => {
  test('does not let a probe write outside its own file', () => {
    const nested = join(dir, 'sub');
    mkdirSync(nested);
    const store = createStore(join(nested, 'status.json'));
    store.recordUptime({ ok: true, ms: 1 }, Date.parse('2026-08-21T10:00:00Z'));
    assert.deepEqual(readdirSync(nested), ['status.json']);
  });

  test('ignores fields it was not asked to store', () => {
    const store = createStore(storePath());
    store.recordUptime(
      { ok: true, ms: 1, secret: 'do not keep me', ip: '203.0.113.1' },
      Date.parse('2026-08-21T10:00:00Z'),
    );
    const raw = JSON.stringify(store.read());
    assert.ok(!raw.includes('do not keep me'));
    assert.ok(!raw.includes('203.0.113.1'));
  });
});
