#!/usr/bin/env node
/**
 * Re-derive the Groundwork figures the site prints, and fail if they drifted.
 *
 *   npm run facts            # check against the public repository
 *   npm run facts -- --fix   # rewrite the drifted figures in src/data/site.ts
 *   npm run facts -- --local # count the installed plugin instead of the repo
 *   npm run facts -- --releases  # is the published release behind the manifest?
 *
 * Three things were learned the hard way and are encoded here.
 *
 * One: the source of truth is the **public repository**, not the plugin
 * installed on the machine that happens to run the build. The site's claim is
 * that a reader can open the repository and recount; on 2026-08-28 the installed
 * cache said 0.39.0 while `main` said 0.40.0, and only one of those is the thing
 * being claimed.
 *
 * Two: gates are derived from the hooks that read them, never from a config
 * file. At 0.40.0 the newest gate, `defect_scan`, is implemented by a hook and
 * absent from the plugin's own `.groundwork.json` template — so any check built
 * on that template would have reported a confident, wrong number.
 *
 * Three: a skip is not a pass. When neither source can be read the exit is zero
 * and the output says so out loud, naming both attempts.
 */

import { readdirSync, readFileSync, existsSync, statSync, mkdtempSync } from 'node:fs';
import { join } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const REPO = 'YasMax91/groundwork';
const PLUGIN_CACHE = join(homedir(), '.claude', 'plugins', 'cache', 'yasmax', 'groundwork');
const SITE = 'src/data/site.ts';
const PROJECT_CONFIG = '.groundwork.json';

/**
 * Keys that live in the `gates` block but are not gates, each with the reason it
 * is excluded. The site prints this count; a number a reader can recount has to
 * be defensible key by key, so the argument lives in the code rather than in
 * somebody's memory.
 */
export const NOT_GATES = {
  trim_tool_output: 'filters the output of a tool call; it checks nothing about the work',
  test_db_lock: 'serialises parallel sessions around the test database — a lock, not a check',
  test_lock_wait_seconds: 'a timeout in seconds, not a toggle, and not a check',
  analyse_skip_reason: 'prose recording why the analyse gate is off in this project',
  sqlite_tests_reason: 'prose recording a declared SQLite exception',
};

/** Count the skills, agents, gates and version of one plugin source tree. */
export function deriveFigures(root) {
  const manifest = join(root, '.claude-plugin', 'plugin.json');
  for (const path of [manifest, join(root, 'skills'), join(root, 'agents'), join(root, 'hooks')]) {
    if (!existsSync(path)) throw new Error(`not a Groundwork tree — ${path} is missing`);
  }

  const version = JSON.parse(readFileSync(manifest, 'utf8')).version;

  const procedures = readdirSync(join(root, 'skills')).filter((entry) =>
    statSync(join(root, 'skills', entry)).isDirectory(),
  ).length;

  const agents = readdirSync(join(root, 'agents')).filter((f) => f.endsWith('.md')).length;

  // Every toggle a hook actually reads, in first-seen order.
  const seen = new Set();
  for (const file of readdirSync(join(root, 'hooks')).filter((f) => f.endsWith('.sh'))) {
    const source = readFileSync(join(root, 'hooks', file), 'utf8');
    for (const [, key] of source.matchAll(/gates\.([a-z_]+)/g)) {
      if (!(key in NOT_GATES)) seen.add(key);
    }
  }

  return { version, procedures, agents, gateKeys: [...seen].sort() };
}

/** The figures src/data/site.ts states, read out of the source rather than imported. */
export function readStated(source) {
  const number = (key) => {
    const m = new RegExp(`${key}:\\s*(\\d+)`).exec(source);
    return m ? Number(m[1]) : null;
  };
  const version = /version:\s*'(v[\d.]+)'/.exec(source)?.[1] ?? null;
  const keys = /gateKeys:\s*\[([^\]]*)\]/.exec(source)?.[1] ?? '';

  return {
    procedures: number('procedures'),
    agents: number('agents'),
    gates: number('gates'),
    version,
    gateKeys: [...keys.matchAll(/'([a-z_]+)'/g)].map(([, k]) => k),
  };
}

/**
 * What the site says, against what the plugin is — and against what this project
 * declares it runs. The third comparison is the one that catches a gate the
 * plugin added and nobody here noticed: the config would still be valid JSON and
 * still be quietly a version behind.
 */
export function compare({ stated, actual, projectGates }) {
  const failures = [];

  if (stated.procedures !== actual.procedures)
    failures.push(
      `procedures — site says ${stated.procedures}, the plugin has ${actual.procedures}`,
    );
  if (stated.agents !== actual.agents)
    failures.push(`agents — site says ${stated.agents}, the plugin has ${actual.agents}`);
  if (stated.gates !== actual.gateKeys.length)
    failures.push(`gates — site says ${stated.gates}, the plugin has ${actual.gateKeys.length}`);
  if (stated.version !== `v${actual.version}`)
    failures.push(`version — site says ${stated.version}, the plugin is v${actual.version}`);

  const statedKeys = new Set(stated.gateKeys);
  for (const key of actual.gateKeys) {
    if (!statedKeys.has(key))
      failures.push(`gateKeys — ${key} is a gate in the plugin and is not listed in ${SITE}`);
  }
  for (const key of stated.gateKeys) {
    if (!actual.gateKeys.includes(key))
      failures.push(`gateKeys — ${key} is listed in ${SITE} and is not a gate in the plugin`);
  }

  if (projectGates) {
    for (const key of actual.gateKeys) {
      if (!(key in projectGates))
        failures.push(
          `${PROJECT_CONFIG} — ${key} is a gate in the plugin and is not declared here`,
        );
    }
  }

  return { failures };
}

/**
 * Rewrite the figures, and only the figures.
 *
 * The gate identifiers are deliberately left alone. A new gate needs a name a
 * reader understands, in two languages, and a script cannot write that — so the
 * build stays red until a person names it, which is the whole point of the list
 * being typed.
 */
export function applyFix(source, actual) {
  return source
    .replace(/procedures:\s*\d+/, `procedures: ${actual.procedures}`)
    .replace(/agents:\s*\d+/, `agents: ${actual.agents}`)
    .replace(/gates:\s*\d+/, `gates: ${actual.gateKeys.length}`)
    .replace(/version:\s*'v[\d.]+'/, `version: 'v${actual.version}'`);
}

/** Is the published release behind the manifest? */
export function releaseLag(manifestVersion, latestTag) {
  return {
    behind: latestTag !== `v${manifestVersion}`,
    manifest: manifestVersion,
    latest: latestTag,
  };
}

const authHeaders = () =>
  process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};

/**
 * The public repository, extracted to a temporary directory.
 *
 * One request for the whole tree rather than one per file: the counting routine
 * then runs against a real directory, identical to the local path, instead of
 * against a second implementation that reads the API and can disagree with it.
 */
async function fetchRemoteTree() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/tarball/main`, {
    headers: { accept: 'application/vnd.github+json', ...authHeaders() },
  });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);

  const dir = mkdtempSync(join(tmpdir(), 'groundwork-main-'));
  execFileSync('tar', ['-xzf', '-', '-C', dir], { input: Buffer.from(await res.arrayBuffer()) });

  const [extracted] = readdirSync(dir);
  if (!extracted) throw new Error('the tarball extracted to nothing');
  return join(dir, extracted);
}

/** The highest version directory in the plugin cache, compared numerically. */
function highestInstalled(cacheRoot) {
  const versions = readdirSync(cacheRoot)
    .filter((entry) => /^\d+\.\d+\.\d+$/.test(entry))
    .sort((a, b) => {
      const pa = a.split('.').map(Number);
      const pb = b.split('.').map(Number);
      for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
      return 0;
    });
  const version = versions.at(-1);
  if (!version) throw new Error(`no version directory under ${cacheRoot}`);
  return join(cacheRoot, version);
}

/**
 * Resolve a plugin tree: the public repository first, the installed cache as the
 * offline fallback, and neither as a stated skip. Every failed attempt is kept
 * so the caller can print what it tried — a fallback nobody can see is how a
 * stale number survives a green build.
 */
export async function loadPluginTree({
  fetchRemote = fetchRemoteTree,
  cacheRoot = PLUGIN_CACHE,
  resolveVersionDir = highestInstalled,
  preferRemote = true,
} = {}) {
  const attempts = [];

  if (preferRemote) {
    try {
      return { root: await fetchRemote(), origin: `public repository (${REPO} main)`, attempts };
    } catch (error) {
      attempts.push(`public repository — ${error.message}`);
    }
  }

  try {
    if (!existsSync(cacheRoot)) throw new Error(`nothing installed at ${cacheRoot}`);
    return { root: resolveVersionDir(cacheRoot), origin: 'installed plugin cache', attempts };
  } catch (error) {
    attempts.push(`installed plugin — ${error.message}`);
  }

  return { root: null, origin: null, attempts };
}

async function main(argv) {
  const fix = argv.includes('--fix');
  const local = argv.includes('--local');
  const checkReleases = argv.includes('--releases');

  const { root, origin, attempts } = await loadPluginTree({ preferRemote: !local });

  if (!root) {
    console.log('SKIPPED — no Groundwork source could be read.');
    for (const attempt of attempts) console.log(`  · ${attempt}`);
    console.log(`The figures in ${SITE} were not checked against anything.`);
    return 0;
  }

  for (const attempt of attempts) console.log(`note: ${attempt} — fell back`);

  const actual = deriveFigures(root);
  const projectGates = existsSync(PROJECT_CONFIG)
    ? JSON.parse(readFileSync(PROJECT_CONFIG, 'utf8')).gates
    : null;

  if (fix) {
    const { writeFileSync } = await import('node:fs');
    const before = readFileSync(SITE, 'utf8');
    const after = applyFix(before, actual);
    if (before !== after) {
      writeFileSync(SITE, after);
      console.log(`fixed the figures in ${SITE} against groundwork ${actual.version}.`);
    } else {
      console.log(`nothing to fix — ${SITE} already matches groundwork ${actual.version}.`);
    }
  }

  const stated = readStated(readFileSync(SITE, 'utf8'));
  const { failures } = compare({ stated, actual, projectGates });

  console.log(`source:  ${origin}`);
  console.log(`plugin:  groundwork ${actual.version}`);
  console.log(`${'figure'.padEnd(12)} ${'site says'.padStart(10)} ${'actual'.padStart(8)}`);
  console.log('-'.repeat(32));
  for (const [key, value] of [
    ['procedures', actual.procedures],
    ['agents', actual.agents],
    ['gates', actual.gateKeys.length],
  ]) {
    const ok = stated[key] === value;
    console.log(
      `${ok ? 'ok  ' : 'DRIFT'} ${key.padEnd(11)} ${String(stated[key]).padStart(9)} ${String(value).padStart(8)}`,
    );
  }
  console.log(
    `${stated.version === `v${actual.version}` ? 'ok  ' : 'DRIFT'} version     ${String(stated.version).padStart(9)} ${`v${actual.version}`.padStart(8)}`,
  );

  if (checkReleases) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { accept: 'application/vnd.github+json', ...authHeaders() },
    });
    const latest = res.ok ? (await res.json()).tag_name : null;
    const lag = releaseLag(actual.version, latest);
    console.log(
      lag.behind
        ? `\nDRIFT releases — the manifest is ${lag.manifest}, the latest published release is ${lag.latest ?? 'none'}.`
        : `\nok    releases — v${lag.manifest} is published.`,
    );
    if (lag.behind)
      failures.push(
        `releases — v${lag.manifest} is not published (latest: ${lag.latest ?? 'none'})`,
      );
  }

  if (failures.length) {
    console.log(`\n${failures.length} problem(s):`);
    for (const failure of failures) console.log(`  · ${failure}`);
    console.log(`\nRun \`npm run facts -- --fix\` for the figures; a new gate also needs a name.`);
    return 1;
  }

  console.log(`\nEvery figure the site prints matches groundwork ${actual.version}.`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main(process.argv.slice(2)));
}
