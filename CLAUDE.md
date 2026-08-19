# CLAUDE.md

Project instructions for Claude Code. **Read `AGENTS.md` first** — it is the domain contract, and it
opens with the caveat that this is not a Laravel repository.

Generic process, the discovery and grounding protocols, and the Definition of Done come from the
**groundwork** plugin (installed via the `yasmax` marketplace). Do not duplicate them here. The
plugin's Laravel-specific automation (Boost, Sail, Larastan, the PHP Stop gates, the OpenAPI gate)
does not apply to this Astro/TypeScript site and is switched off in `.groundwork.json` with the
reason recorded — quality here is enforced by npm scripts and CI instead, and by measured evidence
attached to every claim.

Quick rules: classify tasks (L0–L4); Discovery before code; the brief's phase gates (§9) are real
stops, so never skip to code; ground external-service claims with cited official docs; every fact
about Max comes from `portfolio-site-prompt.md` and nothing is invented; report measured numbers
rather than "should be fine"; keep changes scoped and reversible.

Communicate with the user in Russian by default. Keep repository artifacts (code, names, comments,
tests, commit messages, specs, docs) in English. Site content is a separate matter: the site ships
English and Ukrainian copy, and every Ukrainian string needs Max's review as a native speaker.
