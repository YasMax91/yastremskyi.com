# Evidence — fonts, and the second script

Measured 2026-08-21, before any Ukrainian page existed. Step 0 of the Ukrainian
locale: the site could not have rendered a word of it.

## What was wrong

The three committed font sources were already Latin-only cuts. Parsing their
`cmap` tables directly:

| Source                                  | Ukrainian alphabet  |
| --------------------------------------- | ------------------- |
| `onest-400.ttf`                         | **0 of 66 letters** |
| `onest-800.ttf`                         | **0 of 66**         |
| `jetbrains-mono-400.ttf`                | **0 of 66**         |
| `scripts/og-fonts/*` (Open Graph cards) | **0 of 66**         |

Meanwhile `subset-fonts.mjs` listed the whole Ukrainian alphabet in its safety
set, with a comment saying the second locale "does not need a font rebuild to
render at all". Harfbuzz drops characters it cannot find without complaining, so
the request succeeded and produced Latin-only files. A comment claimed a
capability; the artefact never had it; nothing failed. That is the class of
defect this project exists to make impossible, so the coverage check that now
fails the build was written before anything else.

## The sources now

Downloaded from upstream and verified the same way — by parsing what is in the
file, not by reading a specimen page.

| Source                                                | Ukrainian | `«»—’…`  | Codepoints | Licence |
| ----------------------------------------------------- | --------- | -------- | ---------- | ------- |
| Onest, variable, from `google/fonts` `ofl/onest`      | complete  | complete | 780        | OFL 1.1 |
| JetBrains Mono Regular, from the JetBrains repository | complete  | complete | 1 372      | OFL 1.1 |

One source set now feeds both pipelines — the woff2 the browser gets and the
static instances the Open Graph generator draws with. Two sets diverge, and only
one of them gets updated.

## Two scripts, and who pays for which

Each face is cut twice and declared with `unicode-range`, so the browser fetches
a Cyrillic face only when the page contains a Cyrillic character. That is the
platform's rule rather than our logic, which is why it cannot drift.

|                                    | Before  | After       |
| ---------------------------------- | ------- | ----------- |
| What an English page loads         | 36.1 KB | **29.9 KB** |
| What a Ukrainian page loads on top | —       | 15.5 KB     |

English pages got **6.2 KB lighter** while gaining a second script. Proven at
runtime rather than argued: on an English page all three Cyrillic faces report
`unloaded`; inject a Ukrainian paragraph and all three flip to `loaded` and the
glyphs draw from Onest rather than a fallback.

The saving comes from `noLayoutClosure`, which drops glyphs reachable only
through layout substitution. The upstream originals carry far richer feature
tables than the cuts they replace — keeping them made every English page 18 KB
heavier. Measured that nothing real was lost: `fi`, `ff`, `fl`, `ffi` and the
words `financial`, `difference`, `classification` render to identical widths, to
the hundredth of a pixel, in both weights, against production. Onest has no such
ligatures to lose.

One thing did change: the em dash is 1.0 em wide in upstream Onest against 0.759
em in the old cut. An em dash is 1 em by definition, so this is the upstream
metric asserting itself — visible in prose that uses em dashes liberally, and
correct.

## Two defects found while doing it

**A character no font had.** The safety set asked for U+2011, the non-breaking
hyphen. Neither family has it, so it had been silently dropped and rendered from
a fallback all along. The new coverage check failed the build on its first run,
which is exactly what it is for.

**An overlapping `unicode-range`.** The Latin range was first written
`U+0000-04FF`, which claims the Cyrillic block as well. Two faces of one family
then match a Cyrillic character and the winner is decided by declaration order —
so it would have worked by accident, and broken the moment the order changed. It
is `U+0000-03FF, U+0500-FFFF` now. Invisible on English pages, tofu on Ukrainian
ones: it would have shipped.

## Effect on the measured bars

| Route         | LCP before | LCP after                  |
| ------------- | ---------- | -------------------------- |
| `/`           | 1 203 ms   | **1 203 ms** (median of 5) |
| `/groundwork` | 1 205 ms   | **1 057 ms**               |
| `/work`       | 1 205 ms   | **1 057 ms**               |
| `/about`      | 1 205 ms   | **1 057 ms**               |
| `/cv`         | 1 204 ms   | **1 055 ms**               |

Every route still 100/100/100/100, CLS 0, TBT 0. Five routes crossed a
round-trip boundary and came back 150 ms faster; the home page, the heaviest
document, held where it was.
