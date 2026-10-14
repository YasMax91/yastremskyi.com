# Spec — re-sync with Groundwork 0.47.0, honest adoption figures, and a weekly check that can fail

- **Date:** 2026-10-14
- **Level:** L2
- **State:** shipped — live on yastremskyi.com 2026-10-14 (PRs #5, #6; plugin PR YasMax91/groundwork#1)
- **Supersedes nothing:** extends `2026-08-28-groundwork-0.40-sync.md`; its AC ids are not reused here.

---

## 1. Why

The site, live included, says Groundwork v0.40.0 with 15 procedures and 13 gates. The public `main` is
0.47.0. The weekly job built to catch exactly this ran four times on drift (from 2026-09-21, at 0.42.0)
and reported success every time. The adoption figures still carry "as of August 2026" and have roughly
doubled since.

## 2. Source requirements (verbatim)

| ID  | Requirement (verbatim)                                                                    | Source                          | Proof                                                                                               |
| --- | ----------------------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------------------------------------------------- |
| R1  | «Обнови сайт с новыми данными»                                                            | chat, 2026-10-14, first message | live yastremskyi.com 2026-10-14: v0.47.0, 17 gates, 549 / 54 rows on /groundwork and /uk/groundwork |
| R2  | «Но цифры немного приукрась, если можно»                                                  | chat, interview round 1         | not invented: measured floors (§3) chosen by Max in round 2; AGENTS.md invariant 1                  |
| R3  | «Groundwork 0.47.0» · «Новые цифры внедрения»                                             | chat, round 1                   | `npm run facts` all ok on main; live / shows 12 · 800+ · 300+ · 90                                  |
| R4  | «17» (gates)                                                                              | chat, round 1                   | `npm run audit`: 4 gate lists match 17; live /groundwork has 17 chips                               |
| R5  | «Да, в этой задаче» (publish v0.41.0 … v0.47.0)                                           | chat, round 1                   | 12 releases published; `npm run facts -- --releases` → all 54 versions tagged, v0.47.0 Latest       |
| R6  | «Свежие, с плюсом» · «12» (codebases)                                                     | chat, round 2                   | live / shows 12 · 800+ · 300+ · 90, "as of October 2026"; /cv and /cv.pdf say 12                    |
| R7  | «Да, в этой задаче» (plugin README) · «Через PR»                                          | chat, rounds 2–3                | YasMax91/groundwork#1 merged; README on main shows the October figures                              |
| R8  | «379 автотестов» · «Темп выпуска» → «549» · «54 версии с июня 2026» · «Шапка /groundwork» | chat, rounds 2–3                | live /groundwork header: "549, run on every push" · "54 since June 2026"                            |
| R9  | «Да, тег + релиз» (v0.1.0, v0.19.1)                                                       | chat, round 4                   | tags v0.1.0 and v0.19.1 published; 54 tags for 54 versions                                          |
| R10 | «Одна, после подписи» · «Ты при мне» (deploy)                                             | chat, round 4                   | uk signed in chat (#6, 374/374); one deploy by Max from main 9498ff6; checked live                  |

R2 is met by measurement, not invention: AGENTS.md integrity invariant 1 forbids a figure that does not
trace to a source, and the site's argument is that a reader can recount. The measured figures are
roughly double August's; Max chose them over the August ones in round 2.

## 3. What was verified before planning

| Claim                                                                                     | Evidence                                                            |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Public `main` and installed cache are 0.47.0; live `/groundwork` says v0.40.0             | `npm run facts`; `curl yastremskyi.com/groundwork`                  |
| Skills 15 → 17 (`grill`, `lane`); agents 5                                                | `ls skills agents` at 0.47.0                                        |
| `npm run facts` reports 21 gates — 5 of the 8 new keys are configuration, not checks      | `handoff-gate.sh:71,79,93`, `test-gate.sh:89`, `stdin-guard.sh:33`  |
| The checker scans `hooks/*.sh` only; `push-gate.py` reads `full_suite_before_push`        | `scripts/check-facts.mjs:69`; `push-gate.py:73`                     |
| Weekly step runs under `bash -e {0}`; `… \| tee facts.log` exits 0 on drift               | run 38259040246 log: `shell: /usr/bin/bash -e {0}`, `20 problem(s)` |
| 54 distinct versions in `.claude-plugin/plugin.json` history, 0.1.0 (2026-06-14) … 0.47.0 | GitHub API, every commit touching the manifest                      |
| 42 tags; untagged: v0.1.0, v0.19.1, v0.41.0 … v0.47.0 (12)                                | `gh api repos/YasMax91/groundwork/tags`                             |
| 549 hook test cases in 25 suites on macOS, 541 on Linux, at f34a344                       | plugin CI run 37462106031, summed across the three summary formats  |
| Plugin README says "379 cases, 17 suites" — stale                                         | `README.md:208` at 0.47.0                                           |
| Job logs need authentication (403 anonymous); run listings do not                         | `curl` against `/actions/jobs/112263964567/logs`                    |
| `gh release create` marks a new release Latest unless `--latest=false`                    | `gh release create --help`                                          |
| The local plugin checkout has an uncommitted `hooks/lane.py` — another session's work     | `git status` in `~/Development/Projects/groundwork`                 |

**Adoption measurement** (this machine, counts only, no project names; reproducible):

- Codebases: 15 unique git remotes carry `.groundwork.json`, 12 of them Laravel. Max states 12 are in
  production.
- Procedure runs: 475 Groundwork skill launches since 2026-09-01, de-duplicated by tool-call id across
  `~/.claude/projects/**/*.jsonl` (plus 6 typed slash commands). This machine shows 162 before September
  against the brief's ~340, so the brief's baseline counted more than this machine; the published figure
  is the floor `340 + 475 = 815` → **800+**.
- Specs: 323 files under `docs/ai/specs/` across the 15 remotes; a before/after split was not reliable →
  **300+**.
- Frontend hand-offs: 28 `frontend-handoff` runs before September (brief: 27), 63 since → **90**.
- "1 in 3 stopped before code" is not re-measurable from logs and stays as Max stated it.

## 4. Decisions (interview, unbounded mode, 2026-10-14)

| Decision            | Chosen                                                                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Scope of "new data" | Groundwork 0.47.0 **and** adoption figures                                                                                                            |
| Gates               | **17** — the 13, plus `handoff_on_stop`, `slice_ledger`, `plain_language`, `full_suite_before_push`                                                   |
| Not gates (new)     | `handoff_skip_reason`, `handoff_surface`, `handoff_surface_exclude`, `test_scope`, `shared_branches`, `isolate_stdin`, `lane_guard`, `lane_idle_stop` |
| Adoption            | **12** codebases · **800+** runs · **300+** specs · **90** hand-offs · 1 in 3, "as of October 2026"                                                   |
| New plugin facts    | **549** test cases · **54 versions since June 2026**, as two rows in the `/groundwork` header                                                         |
| Derivation          | both new facts are re-derived by `npm run facts`, like the other figures                                                                              |
| Releases            | tag + release v0.1.0, v0.19.1, v0.41.0 … v0.47.0 by the existing convention; v0.47.0 stays Latest                                                     |
| Plugin README       | "In practice" figures and the "379 cases, 17 suites" line, through a **PR** Max merges                                                                |
| Deploy              | **one** deploy after Max signs the Ukrainian; Max runs `deploy.sh`, the agent verifies live                                                           |

## 5. Scope

### In

1. `scripts/check-facts.mjs`
   - gate keys read from `hooks/*.py` as well as `*.sh`, including `gates.get("key")` and
     `.get("gates") or {}).get("key")`; the token `get` itself is never a key;
   - `NOT_GATES` gains the eight keys above, each with its reason;
   - source becomes a clone of the public repository (1.7 MB, full history), from which the tree and
     the manifest's version history both derive; the installed cache stays the offline fallback for
     the tree;
   - `versions`: distinct `version` values across the manifest's history;
   - `tests`: the latest successful `hooks` workflow run on `main`, every job log summed across the
     formats `passed: N, failed: M`, `passed: N   failed: M`, `N passed, M failed`; the largest job
     total is the figure;
   - `--releases`: also names every manifest version without a tag.
2. `src/data/site.ts`: `version: 'v0.47.0'`, `procedures: 17`, `gates: 17`, `tests: 549`,
   `versions: 54`, four new `gateKeys`; `stats` → 12 · '800+' · '300+' · 90.
3. `src/components/GateSimulator.astro`: four labels in the exhaustive map.
4. `/groundwork` header: `Tests` and `Versions` rows.
5. Dictionaries, en + uk draft: `gs.gate.handoff`, `gs.gate.slices`, `gs.gate.plain`, `gs.gate.suite`,
   `gw.tests`, `gw.testsValue`, `gw.versions`, `gw.versionsValue`; `meta.asOf` → October 2026.
6. `src/pages/cv.astro`: "seven" → "twelve" production codebases; `public/cv.pdf` regenerated.
7. `.groundwork.json`: the four new gates declared (`handoff_on_stop: false` with
   `handoff_skip_reason`, `slice_ledger: true`, `plain_language: true`, `full_suite_before_push: false`).
8. `.github/workflows/facts.yml`: `set -o pipefail` in the step that pipes into `tee`.
9. Plugin repository: 12 tags and releases; one README PR.
10. `docs/handoff.md`: the release line updated to what is true after this task.

### Out

- New prose on `/groundwork` describing lanes, the slice ledger or the push suite.
- Counting the follow-through plugin (`follow-through/`) — a separate plugin in the same repository.
- A check that the plugin README's figures agree with the site — deferred; the README drifted on its
  own here, and that check would belong in the plugin's CI, not in this site.
- Automating the deploy.

## 6. Acceptance criteria

Ids continue the 0.40 spec's numbering scheme but are local to this spec.

- **AC1** — THE SYSTEM SHALL derive procedures, agents and the gate set from a plugin tree, reading gate
  keys from both shell and Python hooks, and report 17 / 5 / 17 for a tree shaped like 0.47.0.
  → test: `derives the figures from a tree` · `a gate read only by a Python hook is counted`
- **AC2** — WHERE a `gates.*` key is configuration rather than a check, THE SYSTEM SHALL exclude it and
  state a reason; `gates.get` SHALL NOT yield a key named `get`.
  → test: `excludes non-gates, each with a reason` · `gates.get is not a gate`
- **AC3** — THE SYSTEM SHALL count the distinct versions the manifest has carried across the
  repository's history. → test: `counts every version the manifest has carried`
- **AC4** — THE SYSTEM SHALL sum test cases from a CI job log across all three summary formats and take
  the largest job total. → test: `sums every suite format in a CI log`
- **AC5** — IF the version history or the CI log cannot be read (offline, no token, 403), THEN THE
  SYSTEM SHALL report that figure as SKIPPED by name, still check the others, and never print it as ok.
  → test: `a figure without a source is skipped by name`
- **AC6** — IF `tests` or `versions` in `site.ts` differs from the derived figure THEN THE SYSTEM SHALL
  exit non-zero naming it, and WHEN run with `--fix` it SHALL rewrite them and leave the rest of the
  file byte-identical. → test: `drift in site.ts fails` · `--fix rewrites only the figures` (extended)
- **AC7** — WHEN run with `--releases`, IF a manifest version has no tag THEN THE SYSTEM SHALL name it
  and exit non-zero. → test: `an untagged version is reported`
- **AC8** — THE SYSTEM SHALL fail when a workflow step pipes a command into `tee` without
  `pipefail`. → test: `scripts/workflows.test.mjs` — `no workflow step hides a failure behind a pipe`
- **AC9** — THE SITE SHALL render one chip per gate (17) and the `/groundwork` header SHALL show the
  version, test and version-count figures from `site.ts`, in both locales.
  → test: `scripts/check-html.mjs` (chip audit existing; header assertion added)
- **AC10** — THE SITE SHALL show 12 · 800+ · 300+ · 90 · 1 in 3 with "as of October 2026" on `/` and
  `/groundwork`, and the CV SHALL say twelve. → manual: built pages + screenshots; `grep` of `dist/cv`
- **AC11** — WHILE a new Ukrainian string is unsigned, `/uk/` SHALL render its English.
  → test: `npm run i18n:check` (existing mechanism)
- **AC12** — THE plugin repository SHALL carry a tag and a release for every manifest version, with
  v0.47.0 as Latest. → test: `npm run facts -- --releases` exits 0
- **AC13** — THE plugin README SHALL state the October figures and "549 cases, 25 suites", through a
  PR. → manual: PR URL

- **AC14** — IF a GitHub API call for the test figure answers 5xx THEN THE SYSTEM SHALL retry it once,
  and SHALL NOT retry a 4xx. → test: `a GitHub 5xx is retried once, and nothing else is` (added after
  the first post-merge weekly run skipped the figure on a momentary 503)

## 7. Technical approach

**One clone, every figure.** The repository is 1.7 MB, so a plain clone carries the whole history:
`git log -p -- .claude-plugin/plugin.json` reads every manifest the repository has had, and the
checked-out tree is what the existing derivation already reads. The start month of "54 versions since
June 2026" lives in the dictionary, not in `site.ts`: Ukrainian needs the month in the genitive. Counting the public repository and the installed
cache stays one code path for the tree; the version history exists only in the clone, so offline it is
skipped by name (AC5).

**Tests come from CI, not from the files.** A static count of the suites gives 117 assertions where CI
runs 549 — loops and per-suite helpers. Running the suites from the checker is executing another
repository's code inside this site's build. The CI log is what the plugin itself publishes as proof, so
it is the number a reader can open. Job logs need a token: CI has `GITHUB_TOKEN`; locally the checker
reads `GITHUB_TOKEN`, and without it the figure is a loud skip.

**Releases without moving Latest.** Each release is created with `--target <bump commit>` and
`--latest=false`, oldest first; v0.47.0 is created last with `--latest`. Title = commit subject, body =
commit body, as for v0.28.0 … v0.40.0.

**Plugin README in a separate clone** under the scratchpad, never in `~/Development/Projects/groundwork`,
whose working tree carries another session's uncommitted `hooks/lane.py`.

## 8. Risks and assumptions

| Risk / assumption                                                                    | Handling                                                                                                                           |
| ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| UNKNOWN: this repository's `GITHUB_TOKEN` may not read another repository's job logs | the PR's own CI run shows it; on 403 the figure skips loudly, and the fallback is a repository secret — asked of Max then, not now |
| `git` unavailable                                                                    | present on macOS and `ubuntu-latest`; reported as an environment problem                                                           |
| Publishing 12 releases on a public repository                                        | one `gh release create` per version, no history rewrite, confirmed in chat before the run                                          |
| The README PR merges after the site deploys                                          | figures and date are identical in both; the order only matters for a day                                                           |
| Assumed: 12 codebases are production                                                 | Max's statement, round 2                                                                                                           |
| Assumed: the brief's ~340 runs as of August is accurate                              | 800+ is a floor on top of it; if 340 was high, 475 measured here alone still stands                                                |
| Open PR #4 is red on `facts` until this merges                                       | rebased after merge; no edit to it here                                                                                            |
| An English edit (`meta.asOf`) un-ticks its signed Ukrainian line                     | returns to the review file with the new keys; Max signs before the single deploy                                                   |

## 9. Blind spots considered

- **A safety net that cannot fail.** Closed by AC8 — the test fails on the exact line that hid four
  weeks of drift, and on any future step written the same way.
- **A reader recounting tags and finding 52, not 54.** Closed by tagging v0.1.0 and v0.19.1 (AC12).
- **An old release becoming "Latest".** Closed by `--latest=false` on every release but v0.47.0.
- **The plugin README contradicting the site.** Closed by the README PR (AC13).
- **The CV saying seven while the site says twelve.** Closed in scope; the PDF is printed from the page.
- **NDA.** The adoption measurement reports counts only; no project name leaves the machine.

## 10. Verification plan

Fail-first in `scripts/check-facts.test.mjs` (AC1–AC7) and `scripts/workflows.test.mjs` (AC8), against fixture trees, a fixture git repository
built in the test, and a fixture CI log — offline and deterministic. AC9 by `check-html.mjs`, AC11 by
`npm run i18n:check`. Then `npm run verify`, `/groundwork`, `/uk/groundwork`, `/` and `/cv` in the
browser with screenshots, the PR's CI run, `npm run facts -- --releases` after publishing, and the live
site after Max's deploy.

**Estimate:** ledger median 55 active agent minutes, p75 91 (n=117 tasks across projects; this project
n=1, 38). This task is above the median in scope — twelve releases, a second repository's PR, two new
derivations — so the p75 is the honest figure: ~90 minutes. Max's time is separate: sign ~9 Ukrainian
lines (~5 min), review the README PR (~5 min), run the deploy (~5 min).
