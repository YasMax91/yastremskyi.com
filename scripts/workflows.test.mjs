/**
 * The workflows' own tests.
 *
 * GitHub runs a `run:` step with no `shell:` as `bash -e {0}` — without
 * `pipefail` — so `cmd | tee log` exits with tee's status, not cmd's. The weekly
 * Facts job was written exactly that way: from 2026-09-21 it printed twenty
 * problems every Monday and reported success, and the pull request it exists to
 * open was never opened. A rule against the shape is cheaper than remembering it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = '.github/workflows';

/**
 * The steps of a workflow, each as its own block of lines. A step starts at a
 * `- ` list item at the indentation the first step sets, and runs until the next
 * item at that indentation or a line that is less indented.
 */
function steps(source) {
  const lines = source.split('\n');
  const blocks = [];
  let indent = null;
  let current = null;
  let inSteps = false;

  for (const line of lines) {
    if (/^\s*steps:\s*$/.test(line)) {
      inSteps = true;
      indent = null;
      continue;
    }
    if (!inSteps) continue;
    // A comment at the steps' own indentation is neither a step nor the end of
    // the list. The first version of this scan stopped at one, and passed
    // facts.yml — the file it was written for.
    if (line.trim().startsWith('#')) continue;

    const item = /^(\s*)- /.exec(line);
    const depth = line.length - line.trimStart().length;

    if (item && (indent === null || item[1].length === indent)) {
      indent = item[1].length;
      current = [line];
      blocks.push(current);
    } else if (current && (line.trim() === '' || depth > indent)) {
      current.push(line);
    } else if (line.trim() !== '') {
      inSteps = false;
      current = null;
    }
  }

  return blocks.map((block) => block.join('\n'));
}

/** A step whose failure a pipe into `tee` would hide. */
function hidesFailure(step) {
  if (!/\|\s*tee\b/.test(step)) return false;
  if (/pipefail/.test(step)) return false;
  return !/^\s*shell:\s*bash\s*$/m.test(step);
}

test('the detector sees the shape that hid four weeks of drift', () => {
  const workflow = [
    'jobs:',
    '  figures:',
    '    steps:',
    '      - uses: actions/checkout@v4',
    '',
    '      # A comment at step indentation, as facts.yml has.',
    '      - name: Check',
    '        run: npm run facts -- --releases | tee facts.log',
    '      - name: Guarded',
    '        run: |',
    '          set -o pipefail',
    '          npm run facts | tee facts.log',
    '      - name: Bash shell',
    '        shell: bash',
    '        run: npm run facts | tee facts.log',
    '      - name: No pipe',
    '        run: npm run facts',
  ].join('\n');

  const found = steps(workflow);
  assert.equal(found.length, 5, 'every step is found, past the comment');
  assert.deepEqual(
    found.map(hidesFailure),
    [false, true, false, false, false],
    'only the unguarded pipe is reported',
  );
});

test('no workflow step hides a failure behind a pipe', () => {
  const offenders = [];
  for (const file of readdirSync(DIR).filter((f) => /\.ya?ml$/.test(f))) {
    for (const step of steps(readFileSync(join(DIR, file), 'utf8'))) {
      if (hidesFailure(step)) offenders.push(`${file}: ${step.trim().split('\n')[0]}`);
    }
  }

  assert.deepEqual(offenders, [], 'add `set -o pipefail`, or `shell: bash`, to each');
});
