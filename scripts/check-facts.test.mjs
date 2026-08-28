/**
 * The fact checker's own tests.
 *
 * Every case runs against a fixture plugin tree, never against the live
 * repository: a suite that needs the network is a suite that goes red on
 * somebody else's outage, and this one exists to make a claim about arithmetic,
 * not about GitHub's availability.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  NOT_GATES,
  deriveFigures,
  readStated,
  compare,
  applyFix,
  releaseLag,
  loadPluginTree,
} from './check-facts.mjs';

/** Groundwork 0.40.0, reduced to the parts the checker reads. */
const SKILLS = [
  'client-doc',
  'deep-discovery',
  'deep-grounding',
  'deep-review',
  'estimate',
  'final-check',
  'frontend-handoff',
  'grill',
  'ground-integration',
  'implement-approved',
  'init',
  'openapi-audit',
  'risk-review',
  'spec',
  'start-task',
];

const AGENTS = [
  'adversarial-verifier',
  'blind-spot-mapper',
  'conformance-reviewer',
  'grounded-researcher',
  'impact-mapper',
];

const GATES = [
  'format_on_edit',
  'analyse_on_stop',
  'test_on_stop',
  'openapi_on_stop',
  'enforce_runner',
  'lock_shipped_migrations',
  'lock_edits_in_discovery',
  'check_unpushed',
  'coverage_claim',
  'task_intent',
  'agent_contract',
  'estimate_claim',
  'defect_scan',
];

function fixtureTree({ version = '0.40.0', skills = SKILLS, agents = AGENTS, gates = GATES } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'gw-fixture-'));

  mkdirSync(join(root, '.claude-plugin'), { recursive: true });
  writeFileSync(join(root, '.claude-plugin', 'plugin.json'), JSON.stringify({ version }));

  for (const skill of skills) mkdirSync(join(root, 'skills', skill), { recursive: true });

  mkdirSync(join(root, 'agents'), { recursive: true });
  for (const agent of agents) writeFileSync(join(root, 'agents', `${agent}.md`), '# agent\n');
  // A stray non-agent file: the count is of agent definitions, not of directory entries.
  writeFileSync(join(root, 'agents', 'README.txt'), 'not an agent\n');

  mkdirSync(join(root, 'hooks'), { recursive: true });
  // Spread over two files, the way the plugin spreads them, and with the
  // non-gate keys present so the exclusion list is actually exercised.
  const half = Math.ceil(gates.length / 2);
  const line = (k) => `[ "$(cfg 'gates.${k}')" = "false" ] && exit 0\n`;
  writeFileSync(
    join(root, 'hooks', 'done-gate.sh'),
    '#!/usr/bin/env bash\n' + gates.slice(0, half).map(line).join('') + line('trim_tool_output'),
  );
  writeFileSync(
    join(root, 'hooks', 'test-gate.sh'),
    '#!/usr/bin/env bash\n' +
      gates.slice(half).map(line).join('') +
      line('test_db_lock') +
      line('test_lock_wait_seconds') +
      line('analyse_skip_reason'),
  );

  return root;
}

const SITE_FIXTURE = `export const site = {
  name: 'Max Yastremskyi',
  groundwork: {
    repo: 'https://github.com/YasMax91/groundwork',
    licence: 'MIT',
    version: 'v0.39.0',
    agents: 5,
    gates: 12,
    procedures: 14,
    gateKeys: ['format_on_edit'] as const,
  },
} as const;
`;

test('derives the figures from a tree', () => {
  const actual = deriveFigures(fixtureTree());

  assert.equal(actual.version, '0.40.0');
  assert.equal(actual.procedures, 15);
  assert.equal(actual.agents, 5);
  assert.equal(actual.gateKeys.length, 13);
  assert.ok(actual.gateKeys.includes('defect_scan'), 'the newest gate is derived from the hooks');
});

test('excludes non-gates, each with a reason', () => {
  const actual = deriveFigures(fixtureTree());

  for (const key of Object.keys(NOT_GATES)) {
    assert.ok(!actual.gateKeys.includes(key), `${key} must not be counted as a gate`);
    assert.ok(
      typeof NOT_GATES[key] === 'string' && NOT_GATES[key].length > 20,
      `${key} must carry a reason a reader can weigh`,
    );
  }
});

test('drift in site.ts fails', () => {
  const actual = deriveFigures(fixtureTree());
  const stated = readStated(SITE_FIXTURE);
  const { failures } = compare({
    stated,
    actual,
    projectGates: Object.fromEntries(GATES.map((g) => [g, true])),
  });

  assert.ok(failures.some((f) => f.includes('procedures')));
  assert.ok(failures.some((f) => f.includes('gates')));
  assert.ok(failures.some((f) => f.includes('version')));
  assert.ok(!failures.some((f) => f.includes('agents')));
});

test('a gate missing from the project config fails', () => {
  const actual = deriveFigures(fixtureTree());
  const stated = readStated(SITE_FIXTURE);
  const projectGates = Object.fromEntries(
    GATES.filter((g) => g !== 'defect_scan').map((g) => [g, true]),
  );

  const { failures } = compare({ stated, actual, projectGates });

  assert.ok(
    failures.some((f) => f.includes('defect_scan') && f.includes('.groundwork.json')),
    'the missing key is named, not merely counted',
  );
});

test('--fix rewrites only the figures', () => {
  const actual = deriveFigures(fixtureTree());
  const fixed = applyFix(SITE_FIXTURE, actual);

  assert.match(fixed, /procedures: 15/);
  assert.match(fixed, /gates: 13/);
  assert.match(fixed, /version: 'v0\.40\.0'/);
  assert.match(
    fixed,
    /gateKeys: \['format_on_edit'\] as const/,
    'the key list is not rewritten blind',
  );
  assert.equal(
    fixed
      .replace(/procedures: 15/, 'procedures: 14')
      .replace(/gates: 13/, 'gates: 12')
      .replace(/version: 'v0\.40\.0'/, "version: 'v0.39.0'"),
    SITE_FIXTURE,
    'nothing outside the figures moved',
  );
});

test('no source at all is a loud skip, not a pass', async () => {
  const resolved = await loadPluginTree({
    fetchRemote: async () => {
      throw new Error('offline');
    },
    cacheRoot: join(tmpdir(), 'definitely-not-a-plugin-cache-9a7f'),
  });

  assert.equal(resolved.root, null);
  assert.equal(resolved.origin, null);
  assert.equal(
    resolved.attempts.length,
    2,
    'both attempts are reported, so a skip names what it tried',
  );
});

test('the installed cache is used when the network is down', async () => {
  const cacheRoot = mkdtempSync(join(tmpdir(), 'gw-cache-'));
  const tree = fixtureTree();
  mkdirSync(join(cacheRoot, '0.40.0'), { recursive: true });
  // The cache holds one directory per version; the checker takes the highest.
  const target = join(cacheRoot, '0.40.0');
  writeFileSync(join(target, '.keep'), '');
  const resolved = await loadPluginTree({
    fetchRemote: async () => {
      throw new Error('offline');
    },
    cacheRoot,
    // The fixture stands in for the extracted version directory.
    resolveVersionDir: () => tree,
  });

  assert.equal(resolved.root, tree);
  assert.equal(resolved.origin, 'installed plugin cache');
  assert.ok(resolved.attempts[0].includes('offline'), 'the failed attempt stays visible');
});

test('release lag is reported', () => {
  assert.deepEqual(releaseLag('0.40.0', 'v0.27.1'), {
    behind: true,
    manifest: '0.40.0',
    latest: 'v0.27.1',
  });
  assert.equal(releaseLag('0.40.0', 'v0.40.0').behind, false);
  assert.equal(releaseLag('0.40.0', null).behind, true, 'no release at all is also behind');
});

test('the site fixture is the shape the real file has', () => {
  const real = readFileSync('src/data/site.ts', 'utf8');
  const stated = readStated(real);

  for (const key of ['procedures', 'agents', 'gates']) {
    assert.equal(typeof stated[key], 'number', `${key} is readable from the real site.ts`);
  }
  assert.match(stated.version ?? '', /^v\d+\.\d+\.\d+$/, 'the real site.ts carries a version');
});
