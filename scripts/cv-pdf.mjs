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
 *
 * The preview server. Astro 7 runs one `astro preview` per project and records
 * it in .astro/preview.json. If one is already running, the CV is printed from
 * it and it is left running: preview reads dist/ from disk on every request, so
 * it serves the build that was just made. Otherwise the script starts its own
 * and stops it on the way out. It used to `spawn('npx', ['astro', 'preview'])`
 * and kill npx — but when an AI agent runs the command, Astro detaches the
 * server into its own process group and exits, so the kill reached nothing and
 * the server outlived the script. Starting it with `--background` on purpose
 * and stopping it with `astro preview stop` works the same whoever runs it.
 */

import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { existsSync, copyFileSync, statSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { constants } from 'node:os';
import { pathToFileURL } from 'node:url';

const OUT = 'dist/cv.pdf';
const KEEP = 'public/cv.pdf';
const PORT = Number(process.env.CV_PORT ?? 4331);

/** The CLI itself, run by node — not the npx wrapper around it. */
const ASTRO = 'node_modules/astro/bin/astro.mjs';
const ASTRO_ENV = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' };

/** Where Chrome lives, unless CHROME_PATH says otherwise. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

/** The command line of `pid`, or null where `ps` cannot say. */
function commandOf(pid) {
  try {
    return execFileSync('ps', ['-o', 'command=', '-p', String(pid)], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return null;
  }
}

/**
 * The preview server already running for the project at `root`, or null.
 *
 * A lock outlives a server killed by a signal, so the lock alone proves
 * nothing: its pid must be alive, and still be `astro preview` rather than a
 * process that was handed the same number later.
 */
export function runningPreview(root = '.', command = commandOf) {
  let lock;
  try {
    lock = JSON.parse(readFileSync(join(root, '.astro/preview.json'), 'utf8'));
  } catch {
    return null;
  }
  if (!Number.isInteger(lock?.pid) || typeof lock.url !== 'string') return null;

  try {
    process.kill(lock.pid, 0);
  } catch {
    return null;
  }
  const cmd = command(lock.pid);
  if (cmd !== null && !/\bastro\b.*\bpreview\b/.test(cmd)) return null;

  return { pid: lock.pid, url: lock.url, startedAt: lock.startedAt };
}

/** The last lines of the preview's own log, which says why it did not start. */
function logTail(lines = 20) {
  try {
    return readFileSync('.astro/preview.log', 'utf8')
      .trimEnd()
      .split('\n')
      .slice(-lines)
      .join('\n');
  } catch {
    return '';
  }
}

/**
 * Start a preview in the background and return it once it is listening.
 *
 * `--background` returns as soon as the server has written its lock, and fails
 * at once if the server exits first — a busy port, say — so there is no
 * timeout to sit through.
 */
function startPreview() {
  const since = Date.now();
  const run = spawnSync(
    process.execPath,
    [ASTRO, 'preview', '--background', '--port', String(PORT)],
    { encoding: 'utf8', env: ASTRO_ENV },
  );
  const server = runningPreview();
  if (run.status !== 0 || !server) {
    const said = [run.stdout, run.stderr, logTail()].filter((s) => s?.trim()).join('\n');
    throw new Error(`astro preview did not start on port ${PORT}.\n${said}`);
  }
  // One that started between our look and Astro's own is someone else's: use
  // it, but leave it running.
  return { ...server, ours: Date.parse(server.startedAt) >= since };
}

/** Stop the preview this script started, and only that one. */
function stopPreview(server) {
  if (runningPreview()?.pid !== server.pid) return;
  const run = spawnSync(process.execPath, [ASTRO, 'preview', 'stop'], {
    encoding: 'utf8',
    env: ASTRO_ENV,
  });
  if (run.status !== 0 || runningPreview()?.pid === server.pid) {
    console.error(
      `Could not stop the preview (pid ${server.pid}). Run \`npx astro preview stop\`.`,
    );
  }
}

/** Poll rather than sleep: a fixed wait is either too short or wasted. */
async function waitForServer(url, timeoutMs = 10_000) {
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

async function main() {
  const chrome = CANDIDATES.find((p) => existsSync(p));
  if (!chrome) {
    throw new Error(
      `No Chrome found. Set CHROME_PATH, or install Chrome/Chromium.\nLooked in: ${CANDIDATES.join(', ')}`,
    );
  }

  if (!existsSync('dist/cv/index.html')) {
    throw new Error('dist/cv/index.html is missing — run `npm run build` first.');
  }

  let server = runningPreview();
  if (server) {
    console.log(`  using the preview already running at ${server.url} (pid ${server.pid})`);
  } else {
    server = startPreview();
  }

  let owned = server.ours ? server : null;
  const release = () => {
    if (owned) stopPreview(owned);
    owned = null;
  };
  // Ctrl-C reaches this process, not the server: it is in its own group.
  for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.once(signal, () => {
      release();
      process.exit(128 + constants.signals[signal]);
    });
  }

  try {
    const page = new URL('/cv', server.url).href;
    await waitForServer(page);

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
        page,
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
    release();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await main();
  } catch (err) {
    console.error(err.message);
    process.exitCode = 1;
  }
}
