# Evidence — the motion layer, and what it cost

Measured 2026-08-21 against `astro preview` on `localhost:4330`. Lighthouse mobile with simulated
throttling; runtime behaviour driven through the headless Chrome that `lighthouse` already brings,
at a 412 × 823 viewport. Raw Lighthouse reports for the final state are in this directory.

## Result

| Route                         | Perf | A11y | BP  | SEO | LCP     | CLS   | TBT |
| ----------------------------- | ---- | ---- | --- | --- | ------- | ----- | --- |
| `/`                           | 100  | 100  | 100 | 100 | 1209 ms | 0.000 | 0   |
| `/groundwork`                 | 100  | 100  | 100 | 100 | 1203 ms | 0.000 | 0   |
| `/work`                       | 100  | 100  | 100 | 100 | 1205 ms | 0.000 | 0   |
| `/work/payments-and-clearing` | 100  | 100  | 100 | 100 | 1204 ms | 0.000 | 0   |
| `/about`                      | 100  | 100  | 100 | 100 | 1054 ms | 0.000 | 0   |
| `/cv`                         | 100  | 100  | 100 | 100 | 1207 ms | 0.000 | 0   |

Before this change the home page measured LCP 1205 ms. It now measures 1209 ms, with the motion
layer shipping. Every threshold is met; nothing was loosened to meet it.

## The regression that got us here

The first build of the motion layer put the home page at **LCP 1364 ms** against a 1300 ms gate.

The obvious explanation was wrong, and the measurement said so immediately: **FCP moved by the same
amount as LCP** (641 → 817 ms, 1205 → 1364 ms, both ≈ +155 ms). An entrance animation on a
transparent element delays LCP alone — Chromium does not treat an element at `opacity: 0` as an LCP
candidate. A change that moves _first_ paint is not that; it is a change to the critical path.

Bisecting the built document found it:

| Build                    | HTML raw | Served (gzip) | LCP     | FCP    |
| ------------------------ | -------- | ------------- | ------- | ------ |
| before motion            | 64 292 B | **14 305 B**  | 1205 ms | 641 ms |
| motion, first cut        | 66 101 B | 14 950 B      | 1364 ms | 817 ms |
| motion, trimmed          | 65 728 B | 14 672 B      | 1358 ms | 800 ms |
| motion, no CSS framework | 55 480 B | **12 372 B**  | 1209 ms | 641 ms |

All CSS on this site is inlined into the document, so **the stylesheet is the document**.
Lighthouse's simulated connection starts with the standard initial congestion window of ten packets,
about **14 600 bytes**. The home page was already sitting **295 bytes** under that ceiling. The
motion layer costs 367 bytes served, so it bought one extra round trip, and a round trip on that
connection is 150 ms.

Trimming the layer recovered 278 of those bytes and was not enough. There is no version of this
feature that fits in 295 bytes.

## What actually paid for it

The budget itself was the problem. **Tailwind was installed, inlined into every page, and used
nowhere.** No Tailwind utility appears in any template — `.grid` in the case-study page and
`.visually-hidden` in the gate simulator are both this project's own scoped classes. What shipped
was the preflight and a block of theme variables, on the critical path, on every route.

Removing it and writing the reset the site actually needs (`src/styles/global.css`) frees
**2 300 served bytes per page**. The home page now sits ~2 200 bytes clear of the ceiling instead of
72 bytes over it.

Layout was verified rather than eyeballed: every element's box was fingerprinted with and without
the framework and compared position by position.

| Route                         | Elements compared | Differences |
| ----------------------------- | ----------------- | ----------- |
| `/`                           | 385               | **0**       |
| `/cv`                         | 196               | **0**       |
| `/work/payments-and-clearing` | 71                | **0**       |

Page heights match exactly (7 899 / 5 266 / 1 989 px). The removal is invisible to the eye and to
the pixel. `npm ci` installs 34 fewer packages.

Noted while there: `README.md` stated the stack as "Astro 7 · Tailwind 4". Integrity invariant 5
requires the stated stack to list only what the site uses, so it now reads "Astro 7 · TypeScript
strict · static output. No CSS framework."

## Two bugs the static barrier could not have caught

**The animations were not running at all.** Written with the `animation` shorthand, they looked
correct and did nothing: the shorthand resets `animation-duration` to its `0s` default, and a
scroll-driven animation with a zero duration finishes on the frame it starts — the element sits at
its end state at every scroll position. A progress-based timeline needs `animation-duration: auto`,
which maps the animation onto the range instead of onto a clock. Only the longhand form is used now.
Confirmed by reading the computed style mid-range: opacity 0 → 0.13 → 0.99 → 1 and
`translateY` 20 px → 0 across the scroll band.

**One rule could never finish being drawn.** Walking all eleven routes end to end found the closing
hairline of the last section on `/` stuck at `scaleX(0.889)` at maximum scroll: sitting at the very
bottom of the document, it can never travel far enough to complete its range. It also landed on the
same pixel row as the footer's own top border — a 4 px line where the design has 2 px. Dropping that
one rule fixes both.

## Runtime proof

Every route walked top to bottom, then checked at rest:

```
ok   /                       hero=1  scrollable=8690px  stuck=0
ok   /work                           scrollable=2063px  stuck=0
ok   /work/payments-and-clearing     scrollable=1757px  stuck=0
ok   /work/voice-to-structured-data  scrollable=1846px  stuck=0
ok   /work/multi-market-commerce     scrollable=1733px  stuck=0
ok   /about                          scrollable=4216px  stuck=0
ok   /cv                             scrollable=5764px  stuck=0
ok   /groundwork                     scrollable=5826px  stuck=0
ok   /notes/colour-space-ocr         scrollable=1830px  stuck=0
ok   /thanks                         scrollable=0px     stuck=0
ok   /404                            scrollable=66px    stuck=0
```

`hero=1` is the home page's `h1` at full opacity on the first frame, before any scrolling — the LCP
element is never animated. `/thanks` does not scroll at all, so its timelines are inactive; an
inactive timeline renders the element's base style, which is the finished state, so a page too short
to scroll simply shows its content. That is the fallback working, measured rather than assumed.

Under `prefers-reduced-motion: reduce`, emulated at the browser level:

```
{ matches: true, animationsAttached: 0, invisibleAtTop: 0,
  --dur-enter: 0s, --dur-transition: 0s }
```

Zero animations attached anywhere in the document, and nothing hidden.

## In production

Deployed 2026-08-21. Measured against `https://yastremskyi.com` rather than a preview, median of
three runs: **LCP 1113 ms**, document served in 12 624 bytes. All eleven routes walked end to end
against production — nothing stuck, hero at full opacity on the first frame. The contact endpoint
was checked after the deploy and still answers 422 with its field errors.

## What guards this now

`scripts/check-motion.mjs` runs in `npm run verify` and fails the build on: an emitted script file,
an animation outside a `prefers-reduced-motion` block, `animation-timeline` outside `@supports`, or
any animation reaching the hero. The barrier was tested by breaking each rule in turn and confirming
it goes red — a gate that has only ever been seen green is not evidence of anything.

What it cannot catch is what the two bugs above were: a rule that parses, passes every static check,
and does nothing. Those need a browser, and the browser checks in this document are the record that
they were run.
