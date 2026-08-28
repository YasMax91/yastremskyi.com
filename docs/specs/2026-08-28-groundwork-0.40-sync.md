# Spec — re-sync with Groundwork 0.40.0, and make the sync self-checking

- **Date:** 2026-08-28
- **Level:** L2
- **State:** approved, not implemented
- **Closes:** a red `npm run facts`, and the class of error that let a second figure drift unnoticed

---

## 1. Why

The site prints three numbers about Groundwork — procedures, gates, review agents — and its whole
argument is that a reader can open the repository and recount them. One of the three is now wrong,
and the gate that exists to catch exactly this caught only half of it.

## 2. What was verified before planning

| Claim                                                                          | Evidence                                                   |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| Installed plugin cache is 0.39.0; the public `main` is 0.40.0                  | `ls ~/.claude/plugins/cache/yasmax/groundwork`; GitHub API |
| Skills went 14 → 15 (`estimate` added)                                         | `ls skills/` in both trees                                 |
| Agents unchanged at 5                                                          | `ls agents/`                                               |
| Gate toggles went 11 → 13 (`estimate_claim` in 0.39, `defect_scan` in 0.40)    | `grep -o 'gates\.[a-z_]*' hooks/*.sh`, `hooks/hooks.json`  |
| `defect_scan` is **absent** from the plugin's own `.groundwork.json` template  | `templates/project/.groundwork.json` at 0.40.0             |
| `npm run facts` reports `DRIFT procedures 14 vs 15`, gates falsely `ok`        | ran it                                                     |
| The gate count is read from **this site's** `.groundwork.json`, not the plugin | `scripts/check-facts.mjs`                                  |
| `npm run facts` silently SKIPs in CI — the runner has no plugin cache          | `scripts/check-facts.mjs` + `.github/workflows/ci.yml`     |
| Public tags and releases stop at `v0.27.1`; `main` is 0.40.0                   | GitHub API: 29 tags, 9 releases                            |
| 13 version-bump commits exist for 0.28.0 … 0.40.0, one per version             | walked `.claude-plugin/plugin.json` through `git log`      |
| Release convention: title = commit subject, body = commit body                 | `gh release view v0.27.1`                                  |
| An English edit un-ticks its signed Ukrainian line                             | `docs/i18n-review.lock.json` hashes the English source     |

The template finding is the one that shapes the fix: counting gates from any single JSON file is
wrong at 0.40.0, because the newest gate is not in that file. The gates have to be derived from the
hooks that implement them.

## 3. Decisions (interview, unbounded mode, 2026-08-28)

| Decision          | Chosen                                                                                    |
| ----------------- | ----------------------------------------------------------------------------------------- |
| Source of truth   | the **public repository** `main` — what a reader can open, and reachable from CI          |
| Counting          | plugin **and** this project's `.groundwork.json`; a divergence is an error                |
| Drift response    | CI opens a pull request; `npm run facts --fix` locally. Never an auto-commit to `main`    |
| Trigger           | every CI run, plus a weekly job that also flags releases lagging behind `plugin.json`     |
| Published figures | **15 procedures · 13 gates · 5 agents**                                                   |
| `test_db_lock`    | **not** a gate — it serialises parallel sessions; it checks nothing about the work        |
| Version in the UI | a `Version` row in the `/groundwork` metadata block                                       |
| New copy          | one new section after "Five specialists": ledger · receipt · defect-scan · plain language |
| Releases          | tag and release `v0.28.0` … `v0.40.0` in this task, by the existing convention            |
| Ukrainian         | drafted in the same change; Max signs; **one** deploy with both locales complete          |

## 4. Scope

### In

1. `scripts/check-facts.mjs` rewritten: derives the figures from a plugin source tree, prefers the
   public repository, falls back to the installed cache, and gains `--fix` and `--releases`.
2. `src/data/site.ts`: `procedures: 15`, `gates: 13`, a `version` field, and `gateKeys` — the gate
   identifiers themselves, so the simulator stops carrying a hand-typed list.
3. `src/components/GateSimulator.astro`: chips rendered from `gateKeys` through an **exhaustive**
   label map, so a new gate with no name fails `tsc`, rather than disappearing from the page.
4. `/groundwork`: a `Version` metadata row and a new section of four cards.
5. Dictionaries: the new keys in English and Ukrainian, and `gw.meta` reworded off "eleven gates".
6. `.groundwork.json`: the two gate toggles this project never declared, plus an `estimates` block.
7. CI: figures checked on every run against the public repository; a weekly job that opens a PR on
   drift and reports releases lagging behind the manifest.
8. `docs/handoff.md`: the stale release item replaced with what is actually true.
9. Tags and releases `v0.28.0` … `v0.40.0` on the plugin repository.

### Out

- Automating the deploy. It stays `npm run verify` → `deploy/deploy.sh`, run by a person.
- Rewriting the existing narrative of `/groundwork`. The four problems, the level table and the five
  agents are unchanged and still true at 0.40.0.
- The adoption figures (7 codebases, ~340 runs, ~160 specs, 27 hand-offs). They match the plugin's
  own README and carry their date.

## 5. Acceptance criteria

- **AC1** — THE SYSTEM SHALL derive `procedures`, `agents` and the gate identifier set from a plugin
  source tree, and report 15 / 5 / 13 for Groundwork 0.40.0. → test: `derives the figures from a tree`
- **AC2** — WHERE a `gates.*` key is not a check on the work (`trim_tool_output`, `test_db_lock`,
  `test_lock_wait_seconds`, `analyse_skip_reason`, `sqlite_tests_reason`), THE SYSTEM SHALL exclude
  it from the gate count and SHALL state a reason for each exclusion in the source.
  → test: `excludes non-gates, each with a reason`
- **AC3** — IF a figure in `src/data/site.ts` differs from the derived figure, THEN THE SYSTEM SHALL
  exit non-zero and name the figure. → test: `drift in site.ts fails`
- **AC4** — IF this project's `.groundwork.json` omits a gate the plugin implements, THEN THE SYSTEM
  SHALL exit non-zero and name the missing key. → test: `a gate missing from the project config fails`
- **AC5** — WHEN invoked with `--fix`, THE SYSTEM SHALL rewrite the drifted figures and the version in
  `src/data/site.ts` and leave the rest of the file byte-identical. → test: `--fix rewrites only the figures`
- **AC6** — IF neither the public repository nor an installed plugin can be read, THEN THE SYSTEM SHALL
  exit zero with a visible SKIPPED notice naming both attempts, and SHALL NOT report a pass.
  → test: `no source at all is a loud skip, not a pass`
- **AC7** — WHEN invoked with `--releases`, THE SYSTEM SHALL compare the manifest version against the
  latest published release, and IF they differ THEN it SHALL name both and exit non-zero.
  → test: `release lag is reported`
- **AC8** — THE SYSTEM SHALL fail the type check when a gate identifier has no display label.
  → test: `npm run check` (compile-time, via an exhaustive `Record`)
- **AC9** — THE SITE SHALL render one chip per gate identifier, in the order declared in `site.ts`.
  → test: `npm run build` + the chip count asserted in `scripts/check-html.mjs`, which also fails when it finds no gate list to count
- **AC10** — WHILE a new English string is unsigned, its Ukrainian page SHALL render the English.
  → already guaranteed by `useTranslations`; asserted by `npm run i18n:check`

## 6. Technical approach

**One tarball, one counting routine.** The checker fetches
`api.github.com/repos/YasMax91/groundwork/tarball/main`, extracts it to a temporary directory with
`tar`, and runs the same derivation it runs against a local plugin tree. Counting the public
repository and counting the installed cache are then the same code path, not two implementations that
can disagree.

**Gates are derived from the hooks, not from a config file.** `grep`ping `gates.<key>` across
`hooks/*.sh` finds every toggle a hook actually reads, including `defect_scan`, which the plugin's own
template omits. The exclusion list is explicit and each entry carries its reason in the source, so the
number the site prints can be defended line by line.

**The label map is the build gate.** `gateKeys` is a `const` tuple in `site.ts`; the simulator's label
map is `Record<(typeof gateKeys)[number], UIKey>`. Adding a gate without naming it is a type error, not
a missing chip — the failure lands at `npm run check`, before anything is published.

**Network failure is a skip, never a red.** A divergence between the site and the plugin is an error; a
GitHub outage is not. The checker says which source it used, in every run, so a fallback is visible
rather than silent — the same rule the plugin's own gates follow.

**Trade-off accepted:** the verify chain now makes one network request. It is authenticated in CI with
`GITHUB_TOKEN` for the rate limit, and degrades to the local cache offline. The alternative — trusting
the installed cache — is what let the site and the public repository disagree by a version in the first
place.

## 7. Risks and assumptions

| Risk                                            | Handling                                                                                      |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `verify` becomes flaky on someone else's outage | network failure falls back to the cache, then to a loud skip; never a red                     |
| `tar` unavailable                               | present on macOS and `ubuntu-latest`; its absence is reported as an environment problem       |
| The English edit un-ticks signed Ukrainian      | exactly one existing key changes (`gw.meta`); it returns to the review file with the new ones |
| Tagging 13 versions touches a public repository | done only on explicit confirmation, one `gh` call per version, no history rewrite             |
| A weekly PR nobody reads                        | it fails the job as well, so the drift is visible in the repository's status                  |

**Assumption:** the plugin repository keeps `.claude-plugin/plugin.json`, `skills/`, `agents/` and
`hooks/` at those paths. If it reorganises, the checker fails loudly with the path it could not find —
which is the correct outcome, not a regression.

## 8. Blind spots considered

- **A reader recounting the gates and getting 14.** Closed: the site states the figure, and the
  exclusion of `test_db_lock` is defensible in one sentence — it is a lock, not a check.
- **The site claiming semver while the releases page stops 13 versions back.** Closed in this task by
  publishing the tags and releases, and kept closed by the weekly check.
- **The figures becoming right locally and wrong publicly.** Closed by making the public repository
  the source of truth rather than the machine that happens to run the build.
- **The Ukrainian page silently degrading on every future copy edit.** Not closed here, and not a
  defect: it is the designed behaviour, and `npm run i18n:check` reports it out loud.
- **Deferred:** publishing the receipt of this task on `/status`. Interesting, out of scope, and it
  needs a decision about what a public receipt may contain.

## 9. Verification plan

Fail-first tests in `scripts/check-facts.test.mjs` (node:test), added to `npm test` — AC1 through AC7,
each against a fixture plugin tree rather than the live repository, so the suite is offline and
deterministic. AC8 falls to `npm run check`, AC9 to `check-html.mjs`, AC10 to `npm run i18n:check`.

Then the full chain: `npm run verify` — format, lint, types, tests, contrast, facts, build, HTML audit,
motion, i18n. Live check on the built preview: `/groundwork` and `/uk/groundwork`, chips counted,
version row present, simulator still operable with the keyboard and with scripting off.

**Estimate:** ~45–70 active agent minutes. The ledger for this project reports `n=42, median=8` — but
that unit is a commit window, not a measured Groundwork task, so the figure rests on a seed corpus and
is quoted as such. Max's own time is separate: ~10 minutes to sign the Ukrainian, plus two
confirmations.
