#!/usr/bin/env node
/**
 * Re-derive the Groundwork figures the site prints, and fail if they drifted.
 *
 * The site states counts a reader can verify by opening the repository. The
 * brief's own numbers were already stale when this project started — it quoted
 * 11 procedures and 8 gates, true at v0.20 and wrong by v0.27.1 — which is
 * exactly how a site about evidence ends up printing something checkable and
 * wrong. This counts them from the installed plugin instead of trusting a
 * comment.
 *
 *   npm run facts
 *
 * Skips loudly when the plugin is not installed (CI, a fresh clone). A skip is
 * reported as a skip, never as a pass.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const PLUGIN_ROOT = join(homedir(), '.claude', 'plugins', 'cache', 'yasmax', 'groundwork');
const SITE = 'src/data/site.ts';
const GROUNDWORK_CONFIG = '.groundwork.json';

if (!existsSync(PLUGIN_ROOT)) {
  console.log(`SKIPPED — the Groundwork plugin is not installed at ${PLUGIN_ROOT}.`);
  console.log('The figures in src/data/site.ts were not checked against anything.');
  process.exit(0);
}

/** Highest installed version, compared numerically rather than as strings. */
const versions = readdirSync(PLUGIN_ROOT).sort((a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
});
const version = versions.at(-1);
const root = join(PLUGIN_ROOT, version);

const gatesBlock = JSON.parse(readFileSync(GROUNDWORK_CONFIG, 'utf8')).gates;

const actual = {
  procedures: readdirSync(join(root, 'skills')).length,
  agents: readdirSync(join(root, 'agents')).filter((f) => f.endsWith('.md')).length,
  // Boolean toggles only. `analyse_skip_reason` is a string explaining why a
  // gate is off, and `trim_tool_output` filters output rather than gating
  // anything — neither is a gate, and counting them would inflate the number
  // the site prints.
  gates: Object.entries(gatesBlock).filter(
    ([key, value]) => typeof value === 'boolean' && key !== 'trim_tool_output',
  ).length,
};

const site = readFileSync(SITE, 'utf8');
const stated = Object.fromEntries(
  ['procedures', 'agents', 'gates'].map((key) => {
    const m = new RegExp(`${key}:\\s*(\\d+)`).exec(site);
    return [key, m ? Number(m[1]) : null];
  }),
);

console.log(`plugin:  groundwork ${version}`);
console.log(`${'figure'.padEnd(12)} ${'site says'.padStart(10)} ${'actual'.padStart(8)}`);
console.log('-'.repeat(32));

let failed = 0;
for (const key of ['procedures', 'agents', 'gates']) {
  const ok = stated[key] === actual[key];
  if (!ok) failed++;
  console.log(
    `${ok ? 'ok  ' : 'DRIFT'} ${key.padEnd(11)} ${String(stated[key]).padStart(9)} ${String(actual[key]).padStart(8)}`,
  );
}

if (failed) {
  console.log(`\n${failed} figure(s) in ${SITE} no longer match the installed plugin.`);
  process.exit(1);
}
console.log(`\nEvery figure the site prints matches groundwork ${version}.`);
