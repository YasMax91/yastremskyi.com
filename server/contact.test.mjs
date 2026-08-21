/**
 * Tests for the contact endpoint.
 *
 *   node --test server/
 *
 * Delivery is injected, so the whole request path is exercised without ever
 * calling Resend — a suite that depends on a paid third party is a suite that
 * fails for reasons unrelated to the change under test, and gets ignored.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import {
  clientIp,
  localeOf,
  thanksPath,
  validate,
  looksAutomated,
  createLimiter,
  escapeHtml,
  buildEmail,
  createApp,
  MIN_FILL_MS,
  LIMITS,
} from './contact.mjs';

const VALID = {
  name: 'A Recruiter',
  email: 'someone@example.com',
  message: 'We have a senior backend role and your Groundwork work is relevant to it.',
};

describe('validate', () => {
  test('accepts a complete message', () => {
    assert.deepEqual(validate(VALID), {});
  });

  test('reports each missing field separately', () => {
    const errors = validate({});
    assert.deepEqual(Object.keys(errors).sort(), ['email', 'message', 'name']);
  });

  test('rejects an address without a domain', () => {
    assert.ok(validate({ ...VALID, email: 'someone@localhost' }).email);
  });

  test('rejects a one-word message', () => {
    assert.ok(validate({ ...VALID, message: 'hi' }).message);
  });

  test('rejects fields past their limit', () => {
    assert.ok(validate({ ...VALID, name: 'x'.repeat(LIMITS.name + 1) }).name);
    assert.ok(validate({ ...VALID, message: 'x'.repeat(LIMITS.message + 1) }).message);
  });

  test('treats whitespace as empty', () => {
    assert.ok(validate({ ...VALID, name: '   ' }).name);
  });
});

describe('looksAutomated', () => {
  test('passes a human submission', () => {
    assert.equal(looksAutomated({ ...VALID, started: Date.now() - 30_000 }), null);
  });

  test('catches a filled honeypot', () => {
    assert.equal(looksAutomated({ ...VALID, company: 'Acme' }), 'honeypot');
  });

  test('catches a submission faster than a person can type', () => {
    assert.equal(
      looksAutomated({ ...VALID, started: Date.now() - (MIN_FILL_MS - 500) }),
      'too-fast',
    );
  });

  test('does not punish a missing timestamp', () => {
    assert.equal(looksAutomated({ ...VALID }), null);
  });
});

describe('createLimiter', () => {
  test('allows up to the limit and then refuses', () => {
    const limiter = createLimiter({ max: 3, windowMs: 1000 });
    assert.equal(limiter.check('ip', 0).allowed, true);
    assert.equal(limiter.check('ip', 1).allowed, true);
    assert.equal(limiter.check('ip', 2).allowed, true);
    assert.equal(limiter.check('ip', 3).allowed, false);
  });

  test('counts each address on its own', () => {
    const limiter = createLimiter({ max: 1, windowMs: 1000 });
    assert.equal(limiter.check('a', 0).allowed, true);
    assert.equal(limiter.check('b', 0).allowed, true);
    assert.equal(limiter.check('a', 0).allowed, false);
  });

  test('opens again once the window has passed', () => {
    const limiter = createLimiter({ max: 1, windowMs: 1000 });
    assert.equal(limiter.check('ip', 0).allowed, true);
    assert.equal(limiter.check('ip', 500).allowed, false);
    assert.equal(limiter.check('ip', 1000).allowed, true);
  });

  test('sweeps expired entries so memory does not grow forever', () => {
    const limiter = createLimiter({ max: 5, windowMs: 1000 });
    limiter.check('a', 0);
    limiter.check('b', 0);
    assert.equal(limiter.size, 2);
    limiter.sweep(2000);
    assert.equal(limiter.size, 0);
  });
});

describe('clientIp', () => {
  const req = (headers) => ({ headers, socket: { remoteAddress: '10.0.0.1' } });

  test('prefers the header Cloudflare sets', () => {
    assert.equal(
      clientIp(req({ 'cf-connecting-ip': '203.0.113.7', 'x-forwarded-for': '172.16.0.1' })),
      '203.0.113.7',
    );
  });

  test('falls back to the first entry of x-forwarded-for', () => {
    assert.equal(clientIp(req({ 'x-forwarded-for': '203.0.113.9, 172.16.0.1' })), '203.0.113.9');
  });

  test('falls back to the socket when there is no proxy', () => {
    assert.equal(clientIp(req({})), '10.0.0.1');
  });

  test('does not collapse two visitors onto one edge address', () => {
    const a = clientIp(req({ 'cf-connecting-ip': '203.0.113.7', 'x-forwarded-for': '172.16.0.1' }));
    const b = clientIp(req({ 'cf-connecting-ip': '203.0.113.8', 'x-forwarded-for': '172.16.0.1' }));
    assert.notEqual(a, b, 'behind a proxy every visitor would otherwise share a rate limit');
  });
});

describe('escapeHtml', () => {
  test('neutralises a script tag from the sender', () => {
    assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('escapes quotes and ampersands', () => {
    assert.equal(escapeHtml(`a & "b" 'c'`), 'a &amp; &quot;b&quot; &#39;c&#39;');
  });
});

describe('buildEmail', () => {
  test('sets reply-to to the sender so a reply goes to them', () => {
    assert.equal(buildEmail(VALID).reply_to, VALID.email);
  });

  test('never puts raw sender markup in the html body', () => {
    const mail = buildEmail({ ...VALID, message: '<img src=x onerror=alert(1)>' });
    assert.ok(!mail.html.includes('<img'));
    assert.ok(mail.html.includes('&lt;img'));
  });

  test('keeps the plain-text part unescaped and readable', () => {
    assert.ok(buildEmail(VALID).text.includes(VALID.message));
  });
});

// --- request path -----------------------------------------------------------

/** Start the app on an ephemeral port and return a POST helper. */
async function withServer(deps, run) {
  const server = createServer(createApp(deps));
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const post = (body, headers = {}) =>
    fetch(`http://127.0.0.1:${port}/api/contact`, {
      method: 'POST',
      redirect: 'manual',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headers },
      body: JSON.stringify(body),
    });
  try {
    await run({ post, port });
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe('the endpoint', () => {
  test('answers the health check', async () => {
    await withServer({ send: async () => {} }, async ({ port }) => {
      const res = await fetch(`http://127.0.0.1:${port}/health`);
      assert.equal(res.status, 200);
      assert.equal(await res.text(), 'ok');
    });
  });

  test('404s anything that is not the contact route', async () => {
    await withServer({ send: async () => {} }, async ({ port }) => {
      const res = await fetch(`http://127.0.0.1:${port}/api/anything`, { method: 'POST' });
      assert.equal(res.status, 404);
    });
  });

  test('delivers a valid message once', async () => {
    const sent = [];
    await withServer({ send: async (p) => sent.push(p) }, async ({ post }) => {
      const res = await post({ ...VALID, started: Date.now() - 30_000 });
      assert.equal(res.status, 200);
      assert.equal((await res.json()).ok, true);
    });
    assert.equal(sent.length, 1);
    assert.equal(sent[0].reply_to, VALID.email);
  });

  test('returns per-field errors and sends nothing', async () => {
    const sent = [];
    await withServer({ send: async (p) => sent.push(p) }, async ({ post }) => {
      const res = await post({ name: '', email: 'nope', message: '' });
      assert.equal(res.status, 422);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.deepEqual(Object.keys(body.errors).sort(), ['email', 'message', 'name']);
    });
    assert.equal(sent.length, 0);
  });

  test('answers a honeypot hit with success but sends nothing', async () => {
    const sent = [];
    await withServer({ send: async (p) => sent.push(p) }, async ({ post }) => {
      const res = await post({ ...VALID, company: 'Acme Ltd' });
      assert.equal(res.status, 200);
      assert.equal((await res.json()).ok, true);
    });
    assert.equal(sent.length, 0, 'a bot must not learn that it was caught');
  });

  test('refuses once the hourly limit is spent', async () => {
    const limiter = createLimiter({ max: 2, windowMs: 60_000 });
    await withServer({ send: async () => {}, limiter }, async ({ post }) => {
      const payload = { ...VALID, started: Date.now() - 30_000 };
      assert.equal((await post(payload)).status, 200);
      assert.equal((await post(payload)).status, 200);
      assert.equal((await post(payload)).status, 429);
    });
  });

  test('reports a delivery failure in the body, not as a 5xx', async () => {
    // A 5xx has its body replaced by the CDN in front of this, which loses the
    // sentence that tells the visitor to email directly. The status describes
    // the request; `ok` describes the delivery.
    await withServer(
      {
        send: async () => {
          throw new Error('resend 500');
        },
      },
      async ({ post }) => {
        const res = await post({ ...VALID, started: Date.now() - 30_000 });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.ok, false, 'it must not claim the message was sent');
        assert.match(body.message, /email me directly/i);
      },
    );
  });

  test('redirects a form POST without JavaScript instead of returning JSON', async () => {
    await withServer({ send: async () => {} }, async ({ port }) => {
      const res = await fetch(`http://127.0.0.1:${port}/api/contact`, {
        method: 'POST',
        redirect: 'manual',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...VALID, started: String(Date.now() - 30_000) }),
      });
      assert.equal(res.status, 303);
      assert.match(res.headers.get('location'), /\/thanks$/);
    });
  });
});

describe('language', () => {
  test('takes the locale the form declared', () => {
    assert.equal(localeOf({ lang: 'uk' }), 'uk');
    assert.equal(localeOf({ lang: 'en' }), 'en');
  });

  test('falls back to English when the field is absent, empty or unknown', () => {
    assert.equal(localeOf({}), 'en');
    assert.equal(localeOf({ lang: '' }), 'en');
    assert.equal(localeOf({ lang: 'de' }), 'en');
    assert.equal(localeOf({ lang: 42 }), 'en');
  });

  test('cannot be used to aim the redirect somewhere else', () => {
    // The field arrives from a form anyone can forge, so it selects from a fixed
    // set rather than being interpolated into a path. Anything else is a way to
    // bounce a visitor off this site with our own domain in the address bar.
    for (const hostile of [
      '../../evil',
      'https://evil.example',
      '//evil.example',
      'uk/../../x',
      'en\r\nLocation: https://evil.example',
    ]) {
      assert.equal(localeOf({ lang: hostile }), 'en');
      assert.ok(!thanksPath(localeOf({ lang: hostile })).includes('evil'));
    }
  });

  test('sends a Ukrainian visitor to the Ukrainian thank-you page', () => {
    assert.equal(thanksPath('uk'), '/uk/thanks');
    assert.equal(thanksPath('en'), '/thanks');
  });

  test('answers a Ukrainian submission in Ukrainian', () => {
    const errors = validate({ name: '', email: '', message: '' }, 'uk');
    assert.ok(/[\u0400-\u04FF]/.test(errors.name), `expected Ukrainian, got: ${errors.name}`);
    assert.ok(/[\u0400-\u04FF]/.test(errors.email));
    assert.ok(/[\u0400-\u04FF]/.test(errors.message));
  });

  test('answers an English submission in English, unchanged', () => {
    const errors = validate({ name: '', email: '', message: '' }, 'en');
    assert.equal(errors.name, 'Please tell me your name.');
  });

  test('a Ukrainian no-JavaScript submission redirects to /uk/thanks', async () => {
    await withServer({ send: async () => ({ id: 'x' }) }, async ({ post }) => {
      const res = await post({ ...VALID, lang: 'uk' }, { Accept: 'text/html' });
      assert.equal(res.status, 303);
      assert.match(res.headers.get('location'), /\/uk\/thanks$/);
    });
  });

  test('an English submission still redirects to /thanks', async () => {
    await withServer({ send: async () => ({ id: 'x' }) }, async ({ post }) => {
      const res = await post(VALID, { Accept: 'text/html' });
      assert.equal(res.status, 303);
      assert.match(res.headers.get('location'), /\/thanks$/);
      assert.ok(!res.headers.get('location').includes('/uk/'));
    });
  });
});
