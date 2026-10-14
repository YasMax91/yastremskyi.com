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
import { execFileSync } from 'node:child_process';

import {
  NOT_GATES,
  deriveFigures,
  readStated,
  compare,
  applyFix,
  releaseLag,
  loadPluginTree,
  deriveVersions,
  countCases,
  testsFigure,
  untaggedVersions,
  fetchWithRetry,
} from './check-facts.mjs';

/** Groundwork 0.47.0, reduced to the parts the checker reads. */
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
  'install-portal',
  'lane',
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
  'handoff_on_stop',
  'slice_ledger',
  'plain_language',
];

/** Read only by a Python hook — the class of gate a shell-only scan cannot see. */
const PYTHON_GATES = ['full_suite_before_push'];

function fixtureTree({ version = '0.47.0', skills = SKILLS, agents = AGENTS, gates = GATES } = {}) {
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
  // Configuration that lives in the gates block, read the ways 0.47.0 reads it.
  writeFileSync(
    join(root, 'hooks', 'handoff-gate.sh'),
    '#!/usr/bin/env bash\n' +
      `surface="$(jq -r '.gates.handoff_surface // empty' .groundwork.json)"\n` +
      `exclude="$(jq -r '.gates.handoff_surface_exclude // empty' .groundwork.json)"\n` +
      `reason="$(jq -r '.gates.handoff_skip_reason // empty' .groundwork.json)"\n` +
      `scope="$(jq -r '.gates.test_scope // "targeted"' .groundwork.json)"\n` +
      line('isolate_stdin'),
  );
  // The two shapes the Python hooks use, copied from push-gate.py and lane-guard.py.
  writeFileSync(
    join(root, 'hooks', 'push-gate.py'),
    '"""Refuses a push to `gates.shared_branches` without the whole suite."""\n' +
      'gates = cfg.get("gates") or {}\n' +
      `if gates.get("${PYTHON_GATES[0]}") is False or gates.get("test_on_stop") is False:\n` +
      '    pass\n' +
      'shared = gates.get("shared_branches") or DEFAULT_SHARED\n',
  );
  writeFileSync(
    join(root, 'hooks', 'lane-guard.py'),
    'if (cfg.get("gates") or {}).get("lane_guard") is False:\n    pass\n' +
      'if (cfg.get("gates") or {}).get("lane_idle_stop") is False:\n    pass\n',
  );

  return root;
}

/** A git repository whose manifest moved through the given states, one commit each. */
function fixtureHistory(steps) {
  const root = mkdtempSync(join(tmpdir(), 'gw-history-'));
  const git = (...args) =>
    execFileSync('git', ['-C', root, '-c', 'user.name=t', '-c', 'user.email=t@t', ...args], {
      stdio: 'pipe',
    });
  git('init', '-q');
  mkdirSync(join(root, '.claude-plugin'), { recursive: true });
  for (const step of steps) {
    writeFileSync(
      join(root, '.claude-plugin', 'plugin.json'),
      JSON.stringify(step, null, 2) + '\n',
    );
    git('add', '-A');
    git('commit', '-q', '-m', `step ${JSON.stringify(step)}`);
  }
  return root;
}

/** One CI job log in the shape GitHub serves it: a timestamp on every line. */
const CI_LOG = [
  '== lib',
  '  ok   eq helper                      [0]',
  '  passed: 19, failed: 0',
  '== run',
  'passed: 32   failed: 0',
  '== trim-output',
  '  ok   opt-out                    (passed through)',
  'passed: 9   failed: 0',
  '== plain-language',
  '  23 passed, 0 failed',
  '== follow-through',
  '  Ran 69 tests in 26.739s',
  'all hook suites passed',
]
  .map((line) => `2026-10-06T12:00:00.0000000Z ${line}`)
  .join('\n');

const SITE_FIXTURE = `export const site = {
  name: 'Max Yastremskyi',
  groundwork: {
    repo: 'https://github.com/YasMax91/groundwork',
    licence: 'MIT',
    version: 'v0.39.0',
    agents: 5,
    gates: 12,
    procedures: 14,
    tests: 379,
    versions: 40,
    gateKeys: ['format_on_edit'] as const,
  },
} as const;
`;

test('derives the figures from a tree', () => {
  const actual = deriveFigures(fixtureTree());

  assert.equal(actual.version, '0.47.0');
  assert.equal(actual.procedures, 17);
  assert.equal(actual.agents, 5);
  assert.equal(actual.gateKeys.length, 17);
  assert.ok(actual.gateKeys.includes('slice_ledger'), 'a new shell gate is derived from the hooks');
});

test('a gate read only by a Python hook is counted', () => {
  const actual = deriveFigures(fixtureTree());

  assert.ok(
    actual.gateKeys.includes('full_suite_before_push'),
    'push-gate.py reads it and no shell hook does',
  );
});

test('gates.get is not a gate', () => {
  const actual = deriveFigures(fixtureTree());

  assert.ok(!actual.gateKeys.includes('get'), 'the method name is not a key');
  assert.ok(!actual.gateKeys.includes('gates'), 'nor is the block it reads');
});

test('excludes non-gates, each with a reason', () => {
  const actual = deriveFigures(fixtureTree());

  for (const key of [
    'handoff_skip_reason',
    'handoff_surface',
    'handoff_surface_exclude',
    'test_scope',
    'shared_branches',
    'isolate_stdin',
    'lane_guard',
    'lane_idle_stop',
  ]) {
    assert.ok(key in NOT_GATES, `${key} is configuration, and the exclusion says why`);
  }

  for (const key of Object.keys(NOT_GATES)) {
    assert.ok(!actual.gateKeys.includes(key), `${key} must not be counted as a gate`);
    assert.ok(
      typeof NOT_GATES[key] === 'string' && NOT_GATES[key].length > 20,
      `${key} must carry a reason a reader can weigh`,
    );
  }
});

/** The tree's figures plus the two that come from history and CI. */
const withHistory = (actual) => ({ ...actual, tests: 549, versions: 54 });
const ALL_GATES = [...GATES, ...PYTHON_GATES];

test('drift in site.ts fails', () => {
  const actual = withHistory(deriveFigures(fixtureTree()));
  const stated = readStated(SITE_FIXTURE);
  const { failures } = compare({
    stated,
    actual,
    projectGates: Object.fromEntries(ALL_GATES.map((g) => [g, true])),
  });

  assert.ok(failures.some((f) => f.includes('procedures')));
  assert.ok(failures.some((f) => f.includes('gates')));
  assert.ok(failures.some((f) => f.startsWith('version ')));
  assert.ok(
    failures.some((f) => f.startsWith('tests ')),
    'the test count is named',
  );
  assert.ok(
    failures.some((f) => f.startsWith('versions ')),
    'the version count is named',
  );
  assert.ok(!failures.some((f) => f.includes('agents')));
});

test('a figure without a source is skipped by name', () => {
  const actual = { ...deriveFigures(fixtureTree()), tests: null, versions: null };
  const stated = readStated(SITE_FIXTURE);
  const { failures, skipped } = compare({ stated, actual, projectGates: null });

  assert.deepEqual([...skipped].sort(), ['tests', 'versions']);
  assert.ok(
    !failures.some((f) => f.startsWith('tests ') || f.startsWith('versions ')),
    'a figure nothing could count is neither a pass nor a drift',
  );
});

test('counts every version the manifest has carried', () => {
  const root = fixtureHistory([
    { name: 'groundwork', version: '0.1.0' },
    { name: 'groundwork', version: '0.1.0', description: 'a change that is not a release' },
    { name: 'groundwork', version: '0.2.0' },
    { name: 'groundwork', version: '0.2.1' },
  ]);

  assert.deepEqual(deriveVersions(root), ['0.1.0', '0.2.0', '0.2.1']);
});

test('sums every suite format in a CI log', () => {
  assert.equal(countCases(CI_LOG), 19 + 32 + 9 + 23, 'three formats, and no prose counted');

  const linux = CI_LOG.replace('passed: 32', 'passed: 24');
  assert.equal(testsFigure([linux, CI_LOG]), 83, 'the largest job is the figure');
  assert.equal(testsFigure([]), null, 'no job log, no figure');
});

test('a GitHub 5xx is retried once, and nothing else is', async () => {
  // Observed 2026-10-14: the first weekly run after the fix skipped the test
  // count because one job log answered 503 for a moment.
  const answers = (...statuses) => {
    const calls = [];
    const impl = async (url) => {
      calls.push(url);
      return { ok: statuses[calls.length - 1] < 400, status: statuses[calls.length - 1] };
    };
    return { impl, calls };
  };

  const flaky = answers(503, 200);
  assert.equal((await fetchWithRetry('u', {}, { fetchImpl: flaky.impl, delayMs: 0 })).status, 200);
  assert.equal(flaky.calls.length, 2, 'one retry after a 5xx');

  const down = answers(502, 503, 200);
  assert.equal((await fetchWithRetry('u', {}, { fetchImpl: down.impl, delayMs: 0 })).status, 503);
  assert.equal(down.calls.length, 2, 'only one retry — a real outage stays a skip');

  const missing = answers(404, 200);
  assert.equal(
    (await fetchWithRetry('u', {}, { fetchImpl: missing.impl, delayMs: 0 })).status,
    404,
  );
  assert.equal(missing.calls.length, 1, 'a 4xx is an answer, not a flake');
});

test('an untagged version is reported', () => {
  assert.deepEqual(
    untaggedVersions(['0.1.0', '0.2.0', '0.19.1', '0.47.0'], ['v0.2.0', 'v0.47.0', 'v9.9.9']),
    ['0.1.0', '0.19.1'],
  );
  assert.deepEqual(untaggedVersions(['0.2.0'], ['v0.2.0']), []);
});

test('a gate missing from the project config fails', () => {
  const actual = deriveFigures(fixtureTree());
  const stated = readStated(SITE_FIXTURE);
  const projectGates = Object.fromEntries(
    ALL_GATES.filter((g) => g !== 'defect_scan').map((g) => [g, true]),
  );

  const { failures } = compare({ stated, actual, projectGates });

  assert.ok(
    failures.some((f) => f.includes('defect_scan') && f.includes('.groundwork.json')),
    'the missing key is named, not merely counted',
  );
});

test('--fix rewrites only the figures', () => {
  const actual = withHistory(deriveFigures(fixtureTree()));
  const fixed = applyFix(SITE_FIXTURE, actual);

  assert.match(fixed, /procedures: 17/);
  assert.match(fixed, /gates: 17/);
  assert.match(fixed, /version: 'v0\.47\.0'/);
  assert.match(fixed, /tests: 549/);
  assert.match(fixed, /versions: 54/);
  assert.match(
    fixed,
    /gateKeys: \['format_on_edit'\] as const/,
    'the key list is not rewritten blind',
  );
  assert.equal(
    fixed
      .replace(/procedures: 17/, 'procedures: 14')
      .replace(/gates: 17/, 'gates: 12')
      .replace(/version: 'v0\.47\.0'/, "version: 'v0.39.0'")
      .replace(/tests: 549/, 'tests: 379')
      .replace(/versions: 54/, 'versions: 40'),
    SITE_FIXTURE,
    'nothing outside the figures moved',
  );
});

test('--fix leaves a figure alone when nothing could count it', () => {
  const actual = { ...deriveFigures(fixtureTree()), tests: null, versions: null };
  const fixed = applyFix(SITE_FIXTURE, actual);

  assert.match(fixed, /tests: 379/, 'a skipped figure is not rewritten to null');
  assert.match(fixed, /versions: 40/);
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
  mkdirSync(join(cacheRoot, '0.47.0'), { recursive: true });
  // The cache holds one directory per version; the checker takes the highest.
  const target = join(cacheRoot, '0.47.0');
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

  for (const key of ['procedures', 'agents', 'gates', 'tests', 'versions']) {
    assert.equal(typeof stated[key], 'number', `${key} is readable from the real site.ts`);
  }
  assert.match(stated.version ?? '', /^v\d+\.\d+\.\d+$/, 'the real site.ts carries a version');
});
