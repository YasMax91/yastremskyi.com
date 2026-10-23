/**
 * The CV's copy may not type a figure that site.ts owns.
 *
 * `npm run facts` keeps site.ts in step with the plugin and rewrites it with
 * `--fix`; a number typed into the CV's own copy would be the one copy nothing
 * updates. That happened once already: the CV said "seven" codebases for two
 * months after the site said twelve.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const CV = readFileSync('src/data/cv.ts', 'utf8');
const SITE = readFileSync('src/data/site.ts', 'utf8');

const number = (key) => new RegExp(`${key}:\\s*(\\d+)`).exec(SITE)[1];
const text = (key) => new RegExp(`${key}:\\s*'([^']+)'`).exec(SITE)[1];

/** Each figure with the word that follows it in the CV, so "12" alone is not a hit. */
const OWNED = [
  [number('agents'), 'specialized review agents'],
  [number('agents'), 'review agents'],
  [number('gates'), 'automated gates'],
  [number('versions'), 'releases'],
  [number('tests'), 'hook tests'],
  [number('codebases'), 'production codebases'],
  [number('codebases'), 'codebases'],
  [text('procedureRuns'), 'procedure runs'],
  [text('specsWritten'), 'specs'],
  [number('frontendHandoffs'), 'auto-generated frontend hand-offs'],
  [text('experience'), 'building'],
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

test('the CV types no figure that site.ts owns', () => {
  const typed = OWNED.filter(([value, after]) =>
    new RegExp(`(^|[^\\w$])${escape(value)}\\s+${escape(after)}`).test(CV),
  ).map(([value, after]) => `${value} ${after}`);
  assert.deepEqual(typed, []);
});

test('the CV reads those figures from site.ts', () => {
  // `gw` and `stats` are the file's own aliases for site.groundwork and site.stats.
  const reads = (path) => {
    const [group, key] = path.split('.');
    const names = group === 'groundwork' ? ['site.groundwork', 'gw'] : ['site.stats', 'stats'];
    return names.some((n) => CV.includes(`\${${n}.${key}}`));
  };
  for (const path of [
    'groundwork.agents',
    'groundwork.gates',
    'groundwork.versions',
    'groundwork.tests',
    'stats.codebases',
    'stats.procedureRuns',
    'stats.specsWritten',
    'stats.frontendHandoffs',
    'stats.stoppedBeforeCode',
  ])
    assert.ok(reads(path), `cv.ts does not interpolate ${path}`);
  assert.ok(CV.includes('${site.experience}'), 'cv.ts does not interpolate site.experience');
});

test('the CV carries no phone number', () => {
  assert.doesNotMatch(CV, /\+\d{1,3}[\s.-]?\(?\d{2,3}\)?[\s.-]?\d{3}[\s.-]?\d{2}[\s.-]?\d{2}\b/);
});
