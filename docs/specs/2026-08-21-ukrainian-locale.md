# Spec — the Ukrainian locale

- **Date:** 2026-08-21
- **Level:** L4
- **State:** step 0 (fonts) DELIVERED and measured; steps 1–2 in progress
- **Closes:** the last unticked line of CRD §10 — "Both locales complete"

---

## 1. Why, and what it actually costs

The brief promised two locales and launch shipped one, by an explicit deviation Max accepted. This
closes it.

The work is not "turn on the translations". What exists today is a dictionary and two helper
functions; the routing, the content model, the fonts and the CV pipeline are all English-only. And
the largest cost is not engineering time: roughly **5 000 words** that only Max can sign off, because
the project makes him the native-speaker reviewer.

## 2. What was verified before planning

| Claim                                                                                 | Evidence                                                                               |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 50 UI keys already exist in both locales                                              | `src/i18n/ui.ts`                                                                       |
| `PUBLISHED_LOCALES` is declared and read by nothing                                   | grep across `src/`                                                                     |
| No `/uk` route exists; all 11 routes are flat files                                   | `src/pages/`                                                                           |
| Content collections have no language field                                            | `src/content.config.ts`                                                                |
| **The bundled fonts contain zero Cyrillic glyphs**                                    | parsed the `cmap` of all three TTFs in `scripts/font-sources/` and `scripts/og-fonts/` |
| Upstream Onest (Google Fonts, OFL 1.1, variable) covers Ukrainian and `«»—’…` in full | downloaded and parsed its `cmap`: 780 codepoints, nothing missing                      |
| Upstream JetBrains Mono (JetBrains repo, OFL 1.1) covers Ukrainian in full            | same method: 1 372 codepoints                                                          |
| The contact endpoint hard-codes `/thanks` and English validation messages             | `server/contact.mjs`                                                                   |
| `docs/i18n-review.md`, referenced by `src/i18n/ui.ts`, does not exist                 | `ls`                                                                                   |
| Visible copy across the site: 6 887 words over 13 routes                              | word count over the built HTML                                                         |

The font finding is the one that changes the shape of the task: the committed sources are already
Latin-only cuts, so Ukrainian pages would render tofu. Upstream originals must be fetched, and the
OG-card generator needs them too or Ukrainian cards render as boxes.

## 3. Decisions (settled in interview, 2026-08-21)

| Decision                 | Chosen                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------- |
| Scope                    | Everything — all 11 routes, three case studies, the note                                              |
| Who writes it            | Agent drafts, Max reviews; nothing ships unreviewed                                                   |
| Review format            | One file, `docs/i18n-review.md`, English beside Ukrainian, per-string sign-off                        |
| Review order             | A trial batch first (~900 words: navigation, home, one case study), then the rest                     |
| **The CV stays English** | Both `/cv` and `/cv.pdf`. The Ukrainian nav keeps the item, marked `EN`                               |
| URLs                     | English slugs under `/uk/…`, so both locales share a path shape                                       |
| Publication              | Only after Max's sign-off. One deploy, no public draft                                                |
| Language switching       | Manual switcher in the header beside the theme toggle. No auto-redirect                               |
| Fonts                    | One source set, each face cut twice and selected by `unicode-range`. English pages got 6.2 KB LIGHTER |
| Technical vocabulary     | Restrained — `backend`, `code review`, agent and gate names stay English                              |
| Register                 | Impersonal; direct address only where unavoidable                                                     |
| Name                     | **Макс Ястремський** on Ukrainian pages; both spellings in JSON-LD so search links them               |
| Contact endpoint         | Localised: messages in the page's language, no-JS submit lands on `/uk/thanks`                        |
| Content parity           | Not enforced. A case study or note may exist in one language; the build says so                       |
| Military-status block    | Ukrainian contact section only. **Max supplies the wording**; the agent invents nothing               |

## 4. Acceptance criteria

| #   | Criterion                                                                                               | Proven by                                                               |
| --- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| U1  | 11 Ukrainian routes build under `/uk/`, English routes unchanged                                        | build output diff                                                       |
| U2  | No Ukrainian string reaches the build unreviewed                                                        | `scripts/check-i18n.mjs` fails on any unsigned entry                    |
| U3  | English pages load no more font bytes than today                                                        | measured: 36.1 KB → **29.9 KB**, and no Cyrillic file is fetched at all |
| U4  | No tofu: every glyph rendered on a Ukrainian page exists in its subset                                  | subset script asserts coverage and fails on a miss                      |
| U5  | Every route carries correct `hreflang` pairs plus `x-default`                                           | `scripts/check-html.mjs`                                                |
| U6  | The switcher lands on the same page in the other language, or on the English original where none exists | link check                                                              |
| U7  | Lighthouse bars hold on Ukrainian routes as on English ones                                             | `npm run lighthouse`                                                    |
| U8  | Contact form answers in the page's language and lands a no-JS submit on the right `/thanks`             | `server/contact.test.mjs`                                               |
| U9  | The CV is reachable from Ukrainian pages and marked as English                                          | markup assertion                                                        |
| U10 | Nothing overflows at 375 px in Ukrainian, which runs ~10–15% longer                                     | measured per route                                                      |
| U11 | Untranslated content is labelled, never silently English                                                | build-time check                                                        |

## 5. Red list (written before the code)

`server/contact.test.mjs` — additions: a Ukrainian request gets Ukrainian field errors · the no-JS
redirect targets `/uk/thanks` for a Ukrainian submit and `/thanks` otherwise · an unknown or absent
locale falls back to English rather than erroring · the locale cannot be used to inject a redirect
target.

`scripts/check-i18n.mjs` — new barrier: fails when a Ukrainian string is missing, when it is present
but unsigned in the review file, when an English string changed after its translation was signed, and
when a page renders a glyph absent from its font subset.

## 6. Plan

**Step 0 — fonts.** Fetch upstream Onest and JetBrains Mono, instance the variable Onest at 400/800,
commit them beside the existing sources with their licences. Teach `subset-fonts.mjs` to emit one set
per locale and to fail on an uncovered glyph. Same for `og.mjs`.

**Step 1 — the machinery, no translated copy yet.** Locale-aware routing for all 11 routes, a `lang`
dimension in the content collections, per-locale `site.ts` data, `hreflang`/canonical/JSON-LD in
`Base.astro`, the header switcher, the sitemap filter, `check-i18n.mjs`. Ukrainian renders as English
fallback at this stage, so the plumbing is provable before any prose exists.

**Step 2 — the trial batch.** Navigation, the home page and one case study — about 900 words — into
`docs/i18n-review.md` for Max. Stop there.

**Step 3 — the rest**, after his notes on the batch settle tone and terminology.

**Step 4 — the contact endpoint**, localised, tested, deployed.

**Step 5 — publish**: flip `PUBLISHED_LOCALES`, regenerate OG cards, measure every Ukrainian route,
deploy once.

## 7. Risks

- **Ukrainian runs longer than English.** Display type with `clamp()`, a five-column simulator and
  tight stat tiles are where that shows. Measured at 375 px per route, not eyeballed.
- **The variable Onest may not instance cleanly** through `subset-font`. Fallback is a static
  instance from Google Fonts' own release; either way the check for missing glyphs is what proves it.
- **A half-reviewed locale must not leak.** `PUBLISHED_LOCALES` becomes load-bearing rather than dead,
  and the barrier fails the build on an unsigned string.
- The military-status wording is Max's to write. The slot is built so inserting it is one line, and
  the site ships without it if it does not arrive.
