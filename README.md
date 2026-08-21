# yastremskyi.com

The personal engineering site of **Max Yastremskyi** — Senior Backend Engineer and
Tech Lead.

The site argues that its author is a senior engineer, so the repository has to
survive being read as evidence for that claim. That is why the gates below are
scripts rather than intentions, and why the numbers in this file come from runs
whose reports are committed in `docs/evidence/`.

**Live: https://yastremskyi.com** — see [`deploy/README.md`](deploy/README.md) for how it runs.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:4321
npm run verify       # everything below, in one command
```

## The gates

`npm run verify` runs these in order, and stops at the first failure.

| Command                | What it proves                                                                                                      |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `npm run format:check` | Prettier, over everything except the hand-formatted contract documents                                              |
| `npm run lint`         | ESLint with typescript-eslint and the Astro plugin                                                                  |
| `npm run check`        | `astro check` — types across `.astro`, `.ts` and the content schemas                                                |
| `npm test`             | The contact endpoint: 27 tests, delivery injected so nothing calls a paid API                                       |
| `npm run contrast`     | Every colour pair the design uses, measured against WCAG 2.2 AA — reading the shipping token file, not a copy of it |
| `npm run build`        | Static output                                                                                                       |
| `npm run audit`        | Over the built HTML: internal links resolve, headings descend without skipping, landmarks present                   |

Separately, because it needs a running server and takes a minute:

```bash
npm run build && npx astro preview --port 4330 &
npm run lighthouse   # writes reports to docs/evidence/
```

Two more, run when their inputs change rather than on every build:

```bash
npm run og           # regenerate the Open Graph card per route
npm run fonts        # re-subset the fonts to the characters the site now uses
```

## Measured

From the runs in `docs/evidence/`, mobile profile, Lighthouse 13:

|                      | Result                                                                   | Bar      |
| -------------------- | ------------------------------------------------------------------------ | -------- |
| Performance          | **100** on every route                                                   | ≥ 98     |
| Accessibility        | **100** on every route                                                   | 100      |
| Best practices       | **100** on every route                                                   | 100      |
| SEO                  | **100** on every route                                                   | 100      |
| CLS                  | **0.000**                                                                | < 0.01   |
| Total blocking time  | **0 ms**                                                                 | —        |
| JavaScript, per page | **534 B** gzipped, and **1094 B** on the home page with the contact form | < 30 KB  |
| Separate `.js` files | **none** — it all inlines                                                | —        |
| Internal links       | **152 checked, 0 broken**                                                | 0 broken |

**One bar is missed, on one route, and the earlier claim about it was wrong.**
The brief asks for LCP < 1200 ms. Measured against a local preview, every route
sat at 1202–1208 ms and this file used to say the bar could not be met at all.
Measured against the **deployed site** behind Cloudflare, four routes come in at
1096–1116 ms — the bar is met — and only `/` misses, at a median of 1254 ms over
three runs. It is the one page carrying a photograph, which an A/B on the built
HTML had already identified as its largest contentful paint. Getting it under
would mean taking the portrait out of the first mobile viewport: 54 ms against a
face on the page a hiring manager opens first. Live figures and the full table are
in [`docs/evidence/lighthouse-live.md`](docs/evidence/lighthouse-live.md).

The `npm run lighthouse` gate runs against a local preview and is a regression
guard, not the number to quote. On CI it enforces accessibility, best practices,
SEO, CLS and LCP — and **reports** performance and total blocking time without
failing on them. That is not a threshold quietly relaxed until it passed: across
two CI runs of an unchanged site, everything else held to within noise while TBT
swung from 151 ms to 862 ms and the performance score from 98 to 78, because both
are dominated by CPU time on a runner sharing a core with somebody else's build.
The same commit measures 0 ms and 100 locally, and 0 ms and 99 in production. A
gate that goes red for reasons unrelated to the change is a gate people learn to
ignore, so the two metrics a shared runner cannot measure are checked where they
can be. The evidence table is in `scripts/lighthouse.mjs`.

## How it is built

**Astro 7 · TypeScript strict · static output. No CSS framework.** No framework runtime
reaches the browser. The only JavaScript on the site is a theme toggle and the
contact form's progressive enhancement; both work when disabled.

```
src/
  content.config.ts     Zod schemas — the case-study spine is enforced here
  content/work/         Three case studies, one markdown file each
  content/notes/        Empty. The section does not exist until it is not.
  data/site.ts          Every fact the site states, in one typed place
  i18n/ui.ts            UI strings per locale
  layouts/Base.astro    Head, SEO, JSON-LD, landmarks
  components/           Section, Button, Stats, GateSimulator, ContactForm…
  pages/                Ten routes
  styles/               tokens.css · fonts.css (generated) · global.css
scripts/                og · fonts · html audit · lighthouse
server/                 The contact endpoint and its tests
deploy/                 Caddyfile, systemd unit, deploy script
docs/                   Concepts, design system, evidence
```

### The signature element ships no JavaScript

The gate simulator on `/` and `/groundwork` is radio inputs and `:checked`
sibling selectors. It is keyboard-operable natively, it works with scripting
disabled, and it costs nothing. The brief budgeted under 5 KB for it.

### Facts have exactly two sources

`portfolio-site-prompt.md` §2 and Max's own CV. Anything not traceable to one of
them does not go on the site. `src/data/site.ts` is where that rule is kept.

---

## Adding a case study

One file in `src/content/work/`. The schema in `src/content.config.ts` enforces
the spine, so a case study missing a part of it **fails the build** rather than
shipping as a feature list.

```markdown
---
order: 4
title: What it was
summary: One sentence for the card and the search result.
context: |
  The domain, in one honest paragraph. Unnamed under NDA, but concrete.
constraint: |
  What actually made it hard. The real constraint, not a generic one.
decision:
  chosen: |
    What was built, and why that.
  rejected: |
    What was not built, stated fairly — the rejected option should sound
    reasonable, because it was.
  tradeoff: |
    What the choice costs. If it costs nothing it was not a decision.
subtle: |
  The detail a mid-level engineer would have got wrong. This is the section a
  senior reader is actually here for.
outcome: |
  What it does in production now.
stack: [Laravel, Redis, Idempotency keys]
ndaReviewed: false
---
```

Then:

```bash
npm run og && npm run build && npm run audit
```

`order` sets its place on `/work` and on the home page. Set `ndaReviewed: true`
only after Max has personally cleared the wording — nothing here is published
without that.

## Adding a note

One file in `src/content/notes/`. See
[`src/content/notes/README.md`](src/content/notes/README.md), including the one
gotcha: a _deleted_ post survives in Astro's content store until `npm run clean`.

## The CV PDF is generated, not maintained

```bash
npm run build && npm run cv
```

`/cv.pdf` is printed from the site's own `/cv` page by headless Chrome, so the
page and the PDF cannot say different things. They already had: a hand-made PDF
was still quoting figures that were true two plugin versions earlier while the
page quoted the current ones, and nobody would have noticed until a reader did.

The print stylesheet is not an afterthought — it is the layout of the document a
recruiter downloads. Two pages, light, dense, no navigation, no theme toggle, and
no download button inside the download.

There is **no phone number** on it, deliberately. The PDF is printed from the
page, so anything on the PDF is in the HTML of `/cv`, and `/cv` is indexed —
`display: none` hides a value from a reader, not from a crawler, so a
"print-only" number would have been published by the mechanism meant to keep it
private. Putting it back means a separate `/cv-print` route, noindex and out of
the sitemap; the reasoning is written up in `src/pages/cv.astro`.

`public/cv.pdf` stays git-ignored: it is a build artefact, and the repository is
public.

## Editing copy without touching markup

- Facts about Max → `src/data/site.ts`
- Case studies → `src/content/work/*.md`
- UI strings and locales → `src/i18n/ui.ts`
- Colour, type, spacing, motion → `src/styles/tokens.css`

Changing a colour means changing one token and re-running `npm run contrast`,
which reads that same file.

## Locales

English ships. Ukrainian is built for and not published: the routing, the
dictionaries and the font subsets all cover it, and `/uk/` stays out of the
build and the sitemap until Max has reviewed the copy as a native speaker.
Announcing a locale that is not ready is worse than shipping one language well.

## Licence

Code MIT. The text, the photograph and the CV are Max's and are not.
The fonts are Onest and JetBrains Mono, both SIL OFL 1.1 — see `public/fonts/`.
