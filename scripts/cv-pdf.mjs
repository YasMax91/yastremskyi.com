#!/usr/bin/env node
/**
 * Generate /cv.pdf from the site's own /cv page.
 *
 * One source for the CV instead of two. The page renders from src/data/site.ts
 * and the PDF is printed from that page, so they cannot say different things —
 * which they did: the hand-made PDF still quoted figures that were true two
 * plugin versions ago while the page quoted the current ones.
 *
 *   npm run build && npm run cv
 *
 * There is no phone number on it. The PDF is printed from the page, so anything
 * on the PDF is in the HTML of /cv, and /cv is indexed — a "print-only" number
 * would have been published by the mechanism meant to keep it private. See the
 * note in src/pages/cv.astro.
 */

import { spawn } from 'node:child_process';
import { existsSync, copyFileSync, statSync } from 'node:fs';
import { platform } from 'node:os';

const OUT = 'dist/cv.pdf';
const KEEP = 'public/cv.pdf';
const PORT = Number(process.env.CV_PORT ?? 4331);

/** Where Chrome lives, unless CHROME_PATH says otherwise. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) {
  console.error('No Chrome found. Set CHROME_PATH, or install Chrome/Chromium.');
  console.error(`Looked in: ${CANDIDATES.join(', ')}`);
  process.exit(1);
}

if (!existsSync('dist/cv/index.html')) {
  console.error('dist/cv/index.html is missing — run `npm run build` first.');
  process.exit(1);
}

const preview = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
  stdio: 'ignore',
  env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
});

/** Poll rather than sleep: a fixed wait is either too short or wasted. */
async function waitForServer(url, timeoutMs = 30_000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(`preview did not answer on ${url} within ${timeoutMs} ms`);
}

try {
  await waitForServer(`http://localhost:${PORT}/cv`);

  await new Promise((resolve, reject) => {
    const args = [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--virtual-time-budget=10000',
      '--no-pdf-header-footer',
      // Print styles pin the light palette, but forcing dark proves it: if the
      // pinning ever breaks, this catches it instead of shipping white on white.
      '--force-dark-mode',
      `--print-to-pdf=${OUT}`,
      `http://localhost:${PORT}/cv`,
    ];
    const child = spawn(chrome, args, { stdio: 'ignore' });
    child.on('error', reject);
    child.on('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`chrome exited ${code}`)),
    );
  });

  if (!existsSync(OUT)) throw new Error('Chrome reported success but wrote no file');

  // Kept in public/ so the next build copies it through, and so a deploy that
  // rsyncs --delete does not remove it from the server.
  copyFileSync(OUT, KEEP);

  const kb = (statSync(OUT).size / 1024).toFixed(1);
  console.log(`  ${OUT}  ${kb} KB`);
  console.log(`  ${KEEP}  (kept so the next build carries it)`);
} finally {
  preview.kill(platform() === 'win32' ? undefined : 'SIGTERM');
}
