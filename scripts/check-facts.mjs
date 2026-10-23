#!/usr/bin/env node
/**
 * Re-derive the Groundwork figures the site prints, and fail if they drifted.
 *
 *   npm run facts            # check against the public repository
 *   npm run facts -- --fix   # rewrite the drifted figures in src/data/site.ts
 *   npm run facts -- --local # count the installed plugin instead of the repo
 *   npm run facts -- --releases  # is every version tagged, and the newest released?
 *
 * Four things were learned the hard way and are encoded here.
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
 *
 * Four, at 0.47.0: hooks are not all shell any more. The newest gate,
 * `full_suite_before_push`, is read only by `push-gate.py`, and a scan of
 * `*.sh` alone reported 21 gates that day — five of them settings, and the real
 * new one missing.
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
  handoff_skip_reason: 'prose recording why the handoff gate is off in this project',
  handoff_surface: 'a path pattern widening what counts as frontend-facing — scope, not a check',
  handoff_surface_exclude:
    'a path pattern narrowing what counts as frontend-facing — scope, not a check',
  test_scope: 'chooses which tests the test gate runs, targeted or full — the gate is test_on_stop',
  shared_branches: 'the list of branches the push gate protects — scope, not a check',
  isolate_stdin:
    'gives every command an empty stdin so it cannot hang — it checks nothing about the work',
  lane_guard:
    'keeps parallel sessions on their own stacks — isolation, like test_db_lock, not a check',
  lane_idle_stop: 'stops an idle lane’s containers — housekeeping, not a check',
  full_suite_max_age_hours:
    'how old a whole-suite run may be before the push gate wants another — a threshold, not a check',
  test_budget_seconds:
    'how many seconds of targeted tests the test gate runs — a budget, not a check',
};

/** A non-gate key with a reason above, or a word the patterns below can catch that is no key at all. */
const isGateKey = (key) => !(key in NOT_GATES) && key !== 'get' && key !== 'gates';

/**
 * Every gate key one hook file reads. Shell reads `.gates.<key>` through jq;
 * Python reads `gates.get("<key>")`, `(cfg.get("gates") or {}).get("<key>")`, or
 * — since 0.52 — `gates(cfg).get("<key>")`, bare or as `gw.gates(cfg)`. At
 * 0.52.1 the two keys read that last way were found only because a comment
 * happened to name them. Prose in a docstring that names `gates.<key>` is caught
 * by the first pattern too, which is right: it names a key the file is about.
 */
function gateKeysIn(source) {
  const keys = [];
  for (const [, key] of source.matchAll(/gates\.([a-z_]+)/g)) keys.push(key);
  for (const [, key] of source.matchAll(/gates(?:\([a-z_]*\))?\.get\(\s*["']([a-z_]+)["']/g))
    keys.push(key);
  for (const [, key] of source.matchAll(
    /get\(\s*["']gates["']\s*\)\s*or\s*\{\}\s*\)\s*\.get\(\s*["']([a-z_]+)["']/g,
  ))
    keys.push(key);
  return keys.filter(isGateKey);
}

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

  // Every toggle a hook actually reads, shell or Python.
  const seen = new Set();
  for (const file of readdirSync(join(root, 'hooks')).filter((f) => /\.(sh|py)$/.test(f))) {
    for (const key of gateKeysIn(readFileSync(join(root, 'hooks', file), 'utf8'))) seen.add(key);
  }

  return { version, procedures, agents, gateKeys: [...seen].sort() };
}

const bySemver = (a, b) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
};

/**
 * Every version the manifest has carried, read from the repository's history.
 *
 * Distinct values, not commits: a manifest commit that changes the description
 * is not a release. The site prints this as "N versions since June 2026", and a
 * reader recounts it against the tags — which `--releases` keeps complete.
 */
export function deriveVersions(gitRoot) {
  const log = execFileSync(
    'git',
    ['-C', gitRoot, 'log', '-p', '--format=', '--', '.claude-plugin/plugin.json'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  );
  const versions = new Set();
  for (const [, v] of log.matchAll(/^\+\s*"version":\s*"(\d+\.\d+\.\d+)"/gm)) versions.add(v);
  return [...versions].sort(bySemver);
}

/** Tags in the repository, newest information the clone has. */
function tagsIn(gitRoot) {
  return execFileSync('git', ['-C', gitRoot, 'tag', '--list', 'v*'], { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

/** Manifest versions with no `v<version>` tag. */
export function untaggedVersions(versions, tags) {
  const tagged = new Set(tags);
  return versions.filter((v) => !tagged.has(`v${v}`));
}

/**
 * The test cases one CI job ran, summed over every suite's summary line.
 *
 * The suites print three shapes — `passed: N, failed: M`, `passed: N   failed:
 * M` and `N passed, M failed` — and a line has to be exactly one of them, after
 * GitHub's timestamp, to count. A test whose name contains "passed" does not.
 * The follow-through plugin's `Ran N tests` is another plugin and is not counted.
 */
export function countCases(log) {
  let total = 0;
  for (const raw of log.split('\n')) {
    const line = raw.replace(/^\S+Z\s/, '').trim();
    const m =
      /^passed:\s*(\d+),?\s+failed:\s*\d+$/.exec(line) ?? /^(\d+) passed, \d+ failed$/.exec(line);
    if (m) total += Number(m[1]);
  }
  return total;
}

/** The figure is the largest job — the platform where every suite runs. */
export function testsFigure(jobLogs) {
  if (!jobLogs.length) return null;
  return Math.max(...jobLogs.map(countCases));
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
    tests: number('tests'),
    versions: number('versions'),
    version,
    gateKeys: [...keys.matchAll(/'([a-z_]+)'/g)].map(([, k]) => k),
  };
}

/**
 * The figures that come from outside the tree — the manifest's history and the
 * plugin's CI. Either can be unreadable (offline, no token, the cache has no
 * history), and then it is skipped by name rather than compared against nothing.
 */
const EXTERNAL = [
  ['tests', 'test cases'],
  ['versions', 'versions'],
];

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

  const skipped = [];
  for (const [key, noun] of EXTERNAL) {
    if (actual[key] === null || actual[key] === undefined) skipped.push(key);
    else if (stated[key] !== actual[key])
      failures.push(`${key} — site says ${stated[key]}, the plugin has ${actual[key]} ${noun}`);
  }

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

  return { failures, skipped };
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
  let out = source
    .replace(/procedures:\s*\d+/, `procedures: ${actual.procedures}`)
    .replace(/agents:\s*\d+/, `agents: ${actual.agents}`)
    .replace(/gates:\s*\d+/, `gates: ${actual.gateKeys.length}`)
    .replace(/version:\s*'v[\d.]+'/, `version: 'v${actual.version}'`);
  // A figure nothing could count stays as it was — rewriting it to null would
  // turn an outage into a change.
  for (const [key] of EXTERNAL) {
    if (actual[key] !== null && actual[key] !== undefined)
      out = out.replace(new RegExp(`${key}:\\s*\\d+`), `${key}: ${actual[key]}`);
  }
  return out;
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
 * One retry on a 5xx, nothing more.
 *
 * The first weekly run after the 0.47 sync skipped the test count because one
 * job log answered 503 for a moment. A server error that brief is a flake; one
 * that survives a retry is an outage, and stays a loud skip. A 4xx is an
 * answer — retrying a 403 only spends the rate limit.
 */
export async function fetchWithRetry(url, options, { fetchImpl = fetch, delayMs = 3000 } = {}) {
  const res = await fetchImpl(url, options);
  if (res.status < 500) return res;
  await new Promise((r) => setTimeout(r, delayMs));
  return fetchImpl(url, options);
}

/**
 * The public repository, cloned to a temporary directory.
 *
 * A clone rather than the tarball the 0.40 version fetched: the version count
 * needs the manifest's history, and a tarball has none. The repository is under
 * 2 MB, so the whole history costs less than one screenshot. The counting
 * routine still runs against a real directory, identical to the local path.
 */
async function fetchRemoteTree() {
  const dir = join(mkdtempSync(join(tmpdir(), 'groundwork-main-')), 'groundwork');
  try {
    execFileSync(
      'git',
      ['clone', '--quiet', '--branch', 'main', `https://github.com/${REPO}.git`, dir],
      {
        stdio: 'pipe',
        timeout: 60_000,
      },
    );
  } catch (error) {
    const reason = error.stderr?.toString().trim().split('\n').at(-1) || error.message;
    throw new Error(`git clone failed — ${reason}`);
  }
  return dir;
}

/**
 * The test cases the plugin's own CI ran on `main`, from the latest successful
 * run's job logs.
 *
 * The suites are not counted from the files: loops and per-suite helpers put
 * 117 assertions on the page where CI runs 549, and running another
 * repository's tests inside this site's build is not this script's business.
 * The CI log is what the plugin itself publishes as proof, so it is the number a
 * reader can open. GitHub serves job logs to authenticated callers only.
 */
async function fetchTestsFigure() {
  if (!process.env.GITHUB_TOKEN) throw new Error('job logs need GITHUB_TOKEN, and none is set');
  const api = async (path) => {
    const res = await fetchWithRetry(`https://api.github.com/repos/${REPO}/${path}`, {
      headers: { accept: 'application/vnd.github+json', ...authHeaders() },
    });
    if (!res.ok) throw new Error(`GitHub answered ${res.status} for ${path.split('?')[0]}`);
    return res;
  };

  const runs = await (
    await api('actions/workflows/ci.yml/runs?branch=main&status=success&per_page=1')
  ).json();
  const run = runs.workflow_runs?.[0];
  if (!run) throw new Error('no successful CI run on main');

  const { jobs } = await (await api(`actions/runs/${run.id}/jobs`)).json();
  const logs = [];
  for (const job of jobs) logs.push(await (await api(`actions/jobs/${job.id}/logs`)).text());

  const figure = testsFigure(logs);
  if (!figure) throw new Error(`run ${run.id} printed no suite summaries`);
  return { figure, sha: run.head_sha.slice(0, 7) };
}

/** The highest version directory in the plugin cache, compared numerically. */
function highestInstalled(cacheRoot) {
  const versions = readdirSync(cacheRoot)
    .filter((entry) => /^\d+\.\d+\.\d+$/.test(entry))
    .sort(bySemver);
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

  const actual = { ...deriveFigures(root), tests: null, versions: null };
  const notes = {};

  // The installed cache is a copy of one version's files, with no history.
  const hasHistory = existsSync(join(root, '.git'));
  const history = hasHistory ? deriveVersions(root) : null;
  if (history) actual.versions = history.length;
  else notes.versions = 'the source has no git history (installed cache)';

  if (local) notes.tests = '--local reads no network';
  else {
    try {
      const { figure, sha } = await fetchTestsFigure();
      actual.tests = figure;
      notes.testsFrom = `CI run on ${sha}`;
    } catch (error) {
      notes.tests = error.message;
    }
  }

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
  const { failures, skipped } = compare({ stated, actual, projectGates });

  console.log(`source:  ${origin}`);
  console.log(`plugin:  groundwork ${actual.version}`);
  console.log(`${'figure'.padEnd(12)} ${'site says'.padStart(10)} ${'actual'.padStart(8)}`);
  console.log('-'.repeat(32));
  const row = (key, statedValue, value) => {
    const mark = value === null ? 'SKIP ' : statedValue === value ? 'ok   ' : 'DRIFT';
    console.log(
      `${mark} ${key.padEnd(11)} ${String(statedValue).padStart(9)} ${String(value ?? '—').padStart(8)}`,
    );
  };
  row('procedures', stated.procedures, actual.procedures);
  row('agents', stated.agents, actual.agents);
  row('gates', stated.gates, actual.gateKeys.length);
  row('version', stated.version, `v${actual.version}`);
  row('tests', stated.tests, actual.tests);
  row('versions', stated.versions, actual.versions);
  if (notes.testsFrom) console.log(`      tests counted from the ${notes.testsFrom}`);

  // Loud, and never folded into the pass line below.
  for (const key of skipped)
    console.log(`\nSKIPPED ${key} — ${notes[key]}. The site's figure was not checked.`);

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

    // "N versions" is recounted against the tags, so every version needs one.
    if (history) {
      const untagged = untaggedVersions(history, tagsIn(root));
      console.log(
        untagged.length
          ? `DRIFT tags — ${untagged.length} of ${history.length} versions have no tag.`
          : `ok    tags — all ${history.length} versions are tagged.`,
      );
      for (const v of untagged) failures.push(`tags — v${v} is a manifest version with no tag`);
    } else {
      console.log(`SKIPPED tags — ${notes.versions}.`);
    }
  }

  if (failures.length) {
    console.log(`\n${failures.length} problem(s):`);
    for (const failure of failures) console.log(`  · ${failure}`);
    console.log(`\nRun \`npm run facts -- --fix\` for the figures; a new gate also needs a name.`);
    return 1;
  }

  console.log(
    skipped.length
      ? `\nEvery figure that could be counted matches groundwork ${actual.version}; ${skipped.join(' and ')} could not be.`
      : `\nEvery figure the site prints matches groundwork ${actual.version}.`,
  );
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(await main(process.argv.slice(2)));
}
