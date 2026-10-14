/**
 * The CV script's own tests.
 *
 * Only the part that decides whether a preview server is already running is
 * tested here: printing needs Chrome and a build, and CI has neither. That part
 * is the one that went wrong — the script waited thirty seconds on a port
 * nobody was going to answer, because a preview for the project was already up
 * on another one.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';

import { runningPreview } from './cv-pdf.mjs';

const ASTRO_CMD = 'node /site/node_modules/astro/bin/astro.mjs preview --port 4330';

/** A project root whose .astro/preview.json says `lock`. */
function project(lock) {
  const root = mkdtempSync(join(tmpdir(), 'cv-pdf-'));
  if (lock !== undefined) {
    mkdirSync(join(root, '.astro'));
    writeFileSync(
      join(root, '.astro/preview.json'),
      typeof lock === 'string' ? lock : JSON.stringify(lock),
    );
  }
  return root;
}

const lockFor = (pid) => ({
  pid,
  port: 4330,
  url: 'http://localhost:4330',
  background: true,
  startedAt: '2026-10-14T15:55:16.416Z',
});

/** The pid of a process that has already exited. */
const deadPid = () => spawnSync(process.execPath, ['-e', '']).pid;

test('a live preview recorded in the lock is found', () => {
  const root = project(lockFor(process.pid));
  assert.deepEqual(
    runningPreview(root, () => ASTRO_CMD),
    {
      pid: process.pid,
      url: 'http://localhost:4330',
      startedAt: '2026-10-14T15:55:16.416Z',
    },
  );
});

test('no lock means no preview', () => {
  assert.equal(
    runningPreview(project(), () => ASTRO_CMD),
    null,
  );
});

test('a lock whose process has exited is stale', () => {
  // A preview killed by a signal leaves its lock behind; Astro itself treats
  // such a lock as stale, and so must this.
  const root = project(lockFor(deadPid()));
  assert.equal(
    runningPreview(root, () => ASTRO_CMD),
    null,
  );
});

test('a live pid that is not astro preview is a recycled number', () => {
  const root = project(lockFor(process.pid));
  assert.equal(
    runningPreview(root, () => 'node /usr/local/bin/some-other-tool'),
    null,
  );
});

test('a live pid is trusted when its command cannot be read', () => {
  const root = project(lockFor(process.pid));
  assert.equal(runningPreview(root, () => null)?.pid, process.pid);
});

test('an unreadable lock is no lock', () => {
  assert.equal(
    runningPreview(project('{not json'), () => ASTRO_CMD),
    null,
  );
  assert.equal(
    runningPreview(project({ pid: 'x', url: 1 }), () => ASTRO_CMD),
    null,
  );
});
