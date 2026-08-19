# AGENTS.md — Portfolio site · Max Yastremskyi

> Process, the discovery and grounding protocols, TDD, and the Definition of Done are provided by
> the **groundwork** plugin. Follow its skills (`/groundwork:start-task`, `:spec`,
> `:implement-approved`, `:risk-review`, `:final-check`, `:ground-integration`).
> **This file holds domain facts only** — do not duplicate the generic process here.

## Stack caveat — read before trusting the plugin's automation   <!-- from code -->

groundwork targets Laravel backends; this repository is an **Astro / TypeScript static site**.
Everything PHP-shaped in the plugin is inert here, and is switched off in `.groundwork.json` with the
reason recorded:

- The `analyse`, `test` and `openapi` Stop gates and `format-on-edit` all key on changed `*.php`,
  so they never fire here. They are not evidence of anything on this project.
- Laravel Boost, Sail, Larastan and l5-swagger are neither installed nor applicable. There is no
  `laravel-boost` MCP server, so `impact-mapper` and `adversarial-verifier` work from the filesystem
  and the open web only.
- The session banner and the status line print a `DB engine` field. This project has no database;
  that field is plugin boilerplate — ignore it.

What still applies in full: L0–L4 classification, Discovery before code, the blast-radius and
blind-spot passes, checkpoints under `.claude/groundwork/`, specs under `docs/specs/`, risk review,
and the reporting discipline — never an unqualified "done", always state what stayed unverified.
Real enforcement lives in npm scripts and CI; see **Quality bars**.

## Always-on baseline

- Classify every non-trivial task (L0–L4); start in Discovery; no code before an approved plan. The
  brief's own phase gates sit on top of this: Direction → Design system → Build → Verification →
  Hand-off, each an explicit stop (CRD §9).
- **Never invent a fact.** Every claim about Max, his work, his numbers and his stack traces to
  CRD §2. No fabricated metrics, clients, testimonials, endorsements or logos. If a section needs
  proof that does not exist, leave it out and say what real proof would fill it (CRD §8).
- Ground every external-service claim (Astro/Tailwind APIs, form provider, analytics, deploy target)
  in cited official docs before designing against it — `/groundwork:ground-integration`.
- Report measured numbers, never claims: Lighthouse, axe-core and bundle sizes are evidence;
  "should be fine" is not. A missed quality bar is stated explicitly with a proposed trade-off,
  never passed over in silence.

## Requirements source (CRD)   <!-- from repo -->

`portfolio-site-prompt.md` at the repo root — the complete brief and the only permitted source of
facts about Max. Section references in this file (§1 … §11) point into it.

## Product   <!-- from CRD · confirm -->

A personal engineering site for Max Yastremskyi (Senior Backend Engineer · Tech Lead). Primary
audience: hiring managers, CTOs and technical recruiters at international product companies and
studios evaluating him for a Senior Backend / Tech Lead role, remote or relocation. Secondary:
engineers arriving from the Groundwork repository. The site's own craft is the argument — it is a
work sample, not a template fill-in.

The one sentence it must land: a senior backend engineer who owns hard domains end-to-end — money,
orders, production workflows — and who has built the tooling that makes AI-assisted engineering
trustworthy. Three differentiators, in priority order; every element on the site serves one of them:
(1) he builds the tools that verify the work — Groundwork, the flagship; (2) he ships AI that
survives contact with production; (3) he is trusted with money and irreversible operations. Voice:
precise, senior, evidence-first, quietly confident (CRD §3).

## Information architecture   <!-- from CRD -->

Five routes, no more: `/` (the whole argument on one page) · `/work` + `/work/<slug>` ·
`/groundwork` (OSS deep-dive) · `/about` · `/cv` (HTML rendering plus `/cv.pdf`). Blog structure is
built but shipped empty or hidden, and adding a post must be a one-file operation. Locales: English
at `/`, Ukrainian at `/uk/`, with the i18n layer architected so a third locale is a content
addition, not a refactor (CRD §4, §7).

## Content model   <!-- from CRD · planned -->

All copy lives in typed content files and i18n dictionaries — never hard-coded in components, so Max
edits text without touching markup. Content collections carry Zod schemas.

Case studies follow one fixed spine, and a case study missing a part of it is not done: Context ·
The constraint · The decision (including what was rejected, and the trade-off) · **The subtle part**
(the detail a mid-level engineer would have got wrong) · Outcome · Stack, as chips. Four of them:
Groundwork · the voice→structured-data AI pipeline · payments/clearing & accounting integration ·
the multi-market e-commerce platform (CRD §5).

## Domain language   <!-- from CRD · confirm -->

- **Groundwork** — the open-source plugin; the flagship, named and linked from every page, and the
  only project on the site that may be named at all.
- **Case study** — the CRD §5 engineering decision record. Not "project", not "portfolio item".
- **The subtle part** — the fixed section name inside a case study. Never renamed to "challenges",
  "lessons learned" or "highlights".
- **Signature element** — the single chosen interactive piece (CRD §6). Exactly one, never two.
- **Concept A / B / C** — Editorial · Instrument · Structural. Use these names until one is chosen.
- Avoid: "portfolio project", skill percentage bars, and every phrase on the forbidden-copy list
  (CRD §3).

## Tech stack & runtime   <!-- planned — nothing installed yet -->

Astro (latest stable) · Tailwind CSS · TypeScript strict · content collections with Zod · static
output · islands only where interactivity genuinely exists (CRD §7). Host has Node v24.4.1,
npm 11.4.2 and pnpm. There is no `package.json` yet — the toolchain arrives in the brief's Phase 3.
**Re-run `/groundwork:init` after scaffolding** so the gate commands in `.groundwork.json` are
recorded from commands that were actually run, not guessed.

## Repo layout   <!-- planned · refresh after scaffold -->

Today: `portfolio-site-prompt.md` plus the contract files. Expected: `src/pages` (routes, per
locale) · `src/content` (typed collections) · `src/components` · `src/styles` (design tokens) ·
`src/i18n` (dictionaries) · `public/` · `docs/specs/` (groundwork specs) · `.claude/groundwork/`
(working memory, git-ignored).

## Integrity invariants   <!-- from CRD · absolute -->

1. **No invented facts** — every claim traces to CRD §2.
2. **NDA, absolute** — no client names, product names, logos, client-UI screenshots, or links to
   private repositories. Domains are described generically. Groundwork is the single exception:
   public, named, linked.
3. **No lorem ipsum**, at any phase, concepts included.
4. **No dark patterns** — no fake urgency, no arrival modal, no newsletter interruption.
5. **Stack honesty** — the site's stated stack lists only what the site actually uses.
6. **Degrades without JavaScript** — content readable, navigation working, contact reachable.
7. **A missed bar is announced**, with the trade-off proposed. Never silently missed.

## Quality bars — the real release gates   <!-- from CRD §1 · measured, not claimed -->

Lighthouse (mobile, throttled): Performance ≥ 98, Accessibility 100, Best Practices 100, SEO 100 ·
LCP < 1.2 s on 4G, CLS < 0.01, INP < 100 ms · under 30 KB gzipped JS on the home page and zero JS on
routes that need none · WCAG 2.2 AA with full keyboard operation, visible focus, correct landmarks
and `prefers-reduced-motion` honoured · flawless 320–2560 px, tested at 375/768/1440 · both themes
fully designed, not an inverted filter · a clean printed one-pager · self-hosted subset fonts, at
most 2 families / 3 weights, preloaded, `font-display: swap`.

Enforced by npm scripts and a GitHub Action running build + Lighthouse CI on PRs — not by the
plugin's Stop gates. Evidence is attached per route, or the bar counts as unmet.

## Open decisions & missing assets   <!-- needs you -->

None of these can be derived from the repository (CRD §6, §7 and the appendix):

- Which of Concept A / B / C wins, and which single signature element — the Groundwork gate
  simulator or the animated voice→intent pipeline diagram.
- Deploy target (Cloudflare Pages / Netlify / Vercel), contact-form provider (Formspree /
  Web3Forms / Resend) and analytics (Plausible / Umami) — each needs a recommendation with its
  justification before it is wired.
- Groundwork repository / marketplace URL, and whether the star count is shown.
- GitHub profile URL, preferred domain name, professional portrait (if one is to be used).
- Confirmation of which case-study details are safe to publish under the NDAs.
- Ukrainian copy requires Max's own review as a native speaker; flag anything uncertain.
