# Phase 2 — design system

Derived from **Concept C, "Structural"**. Deliverable for §9 Phase 2: the token set, the component
inventory, and one fully designed page as reference.

| File | What it is |
|---|---|
| `tokens.css` | The token set. Authored in the form Phase 3 ships — semantic custom properties plus a commented Tailwind v4 `@theme inline` hook. |
| `contrast.mjs` | Contrast measurement. Prints the real ratio for every pair the design relies on and exits non-zero if one fails. |
| `reference-groundwork.html` | The fully designed `/groundwork` page, using nothing but the tokens. Chosen because it carries the flagship and the signature element — the densest screen on the site. |

```bash
node docs/design/contrast.mjs
```

## Colour — measured, not asserted

Two roles for one accent, because a single vermilion cannot do both jobs:

- `--accent` `#ff3b00` — **fills and display sizes only**. 3.57:1 on white: clears the 3.0 bar for
  large text, fails the 4.5 bar for small.
- `--accent-text` `#c42200` — the same hue taken down until small text passes at **5.87:1**. Labels,
  "the subtle part", step numerals, inline links.

Using the wrong one is the easiest way to break this palette, which is why they are named by role
rather than by shade.

**One defect this pass caught.** Concept C put white text on the vermilion CTA — **3.57:1, a
straight AA failure on the page's primary button**. Black on the same vermilion measures **5.88:1**,
so the fix keeps the accent at full strength and happens to suit the Swiss direction better than
white did. `--on-accent` is black in both themes.

Dark is designed rather than inverted: pure black ground so the 2px rules stay hard, a slightly
warmer accent so it does not vibrate against black, and muted ink lifted rather than dimmed.

Latest run: **22 of 22 pairs meet WCAG 2.2 AA**, across both themes.

## Type

Two families, three weights — exactly the brief's ceiling, spent deliberately.

| Role | Face | Weight |
|---|---|---|
| Display | Archivo | 800 |
| Prose | Archivo | 400 |
| Data, labels, code | JetBrains Mono | 400 |

Every display step has a floor that fits "Yastremskyi" on one line at 320px — the defect that shipped
in the concept and was fixed. Measure is capped at 62ch; labels use `0.16em` tracking, display uses
`-0.045em`.

## Space, edges, motion

One 4px-rooted scale (`--space-1` … `--space-16`); nothing in the design invents a gap outside it.
`--rule` is 2px and is the structural element of the whole direction; `--rule-thin` is 1px and is
only used inside dense lists.

`--radius` is **0**, everywhere, and exists as a token so Phase 3 cannot round a corner by reflex.
Elevation is offset, never blur — a soft shadow would read as a different design system.

Motion caps entrance at `--dur-enter` 380ms, under the brief's 400ms, on `cubic-bezier(0.2, 0, 0, 1)`.
All durations collapse to `0ms` under `prefers-reduced-motion: reduce`.

## Component inventory

Every component below appears in the reference page, in situ rather than on a swatch sheet.

| Component | Notes |
|---|---|
| Skip link | First focusable element; becomes visible on focus. |
| Header, primary nav | Wraps at narrow widths. Current page marked with `aria-current="page"`. |
| Theme toggle | The site's only runtime JavaScript. Applies the stored theme before first paint, so there is no flash. The flip is instant — transitions are suppressed for one frame, or the whole page crossfades and reads as a smear. |
| Page header | Kicker, display heading, lede with accent highlight, meta row. |
| Section header | Two-column at ≥56rem: heading left, framing prose right. |
| Prose block | Capped at `--measure`. |
| Pull quote | 8px accent bar, optional attribution. |
| Step list | Oversized accent numerals; used for narrative sequences. |
| Matrix table | Scrolls **inside its own box**, so the page never scrolls sideways. |
| Agent cards | Auto-fit grid on a shared 2px lattice. |
| Stat grid | Tabular numerals, always stamped with an "as of" date. |
| **Gate simulator** | The signature element. Zero JavaScript — radio inputs and `:checked` sibling selectors. Keyboard-native, works with scripting disabled. |
| Chip strip | The always-armed gates. |
| Code block | Install commands, taken from the plugin's own README rather than reconstructed. |
| Callout | Accent-bordered aside for the claim worth arguing about. |
| Buttons | Primary fill and outline, in a shared bordered row. |
| Footer | Mono micro-type. |

## Measured on this page

Real browser, 2026-08-19:

| Check | Result |
|---|---|
| Contrast, both themes | **22/22 pairs pass** WCAG 2.2 AA (`contrast.mjs`) |
| Horizontal overflow at 320 / 375 / 768 / 1440 | **0 px** — the wide table scrolls inside its own container |
| Looked at, both themes | 375 and 768 reviewed visually in light and dark |
| Theme toggle | Switches both directions, persists, applies before first paint, flips instantly |
| Gate simulator | Switches L0–L4; keyboard reaches it; **zero** JavaScript involved |
| Runtime JavaScript, whole page | **806 bytes uncompressed** — the theme toggle and nothing else. Budget was 30 KB gzipped. |
| Print | Rendered to PDF from headless Chrome **in dark mode**: 4 pages, all legible |
| Console errors | none |

### Defects this pass found and fixed

1. **White on the vermilion CTA measured 3.57:1** — an AA failure on the primary button of the
   winning concept. `--on-accent` is black in both themes: 5.88:1, accent at full strength.
2. **The portrait frame blew out the single-column layout** — ~968 px of dead space at tablet width.
3. **Concept C scrolled horizontally at 320–375 px** — the surname could not fit on one line, then
   the primary nav could not wrap.
4. **The simulator's level name rendered as secondary text.** `.panel > p` outranks a bare
   `.verdict` on specificity, so the single most important output of the signature element was
   painted in the muted colour. Only visible by looking — no measurement would have caught it.
5. **Printing from dark mode produced invisible text.** The print block recoloured `body` but every
   element taking its colour from a token kept the dark value, so the meta row's values were white
   on white paper. The print block now pins the light token set outright, because paper has one
   theme. Page count also dropped from 6 to 4, and page one is no longer two-thirds blank.

## Known gaps, stated rather than skipped

- **Fonts still load from Google.** Phase 3 self-hosts a subset with `font-display: swap` and
  preload, per §1.
- **The portrait is still absent**, so no page yet proves the image treatment.
- **Lighthouse has not been run.** It belongs to Phase 4 and needs the real build, not this
  standalone page.
