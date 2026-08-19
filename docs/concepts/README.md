# Phase 1 — three home-page concepts

Deliverable for §9 Phase 1 of `portfolio-site-prompt.md`. **Not the site** — three home pages,
built to be compared and thrown away except for the one that wins.

Open `index.html` for the side-by-side view, or serve the folder:

```bash
python3 -m http.server 4321 --directory docs/concepts
```

## The three

| | Reads as | Appeals to | Risks |
|---|---|---|---|
| **A — Editorial** | A well-set magazine feature. Fraunces display, generous rhythm, one warm accent (`#c4520a`, carried from Max's own CV). | Hiring managers and CTOs who read before they scroll. Signals maturity, not novelty; still current in five years. | Least memorable in a stack of forty portfolios. The warmth can read "consultant" rather than "systems engineer". |
| **B — Instrument** | A developer tool someone designed carefully. Dark, hairline grid, monospace data, panel layout. | Engineers and technical leads — including everyone arriving from the Groundwork repository. Makes the AI-tooling story feel native. | Dark technical UI is the most crowded look in the field. A non-technical recruiter may find the density unwelcoming. |
| **C — Structural** | A Swiss poster. Oversized Archivo, hard 2px rules, one vermilion accent, maximum contrast. | Anyone opening forty portfolios a week — this is the one they can still describe afterwards. | Commits hard. A conservative enterprise reader may read brutalism as a designer's site. Least forgiving typography at small sizes. |

## What is real here

- **Every word.** No placeholder text at any point, per §1. Copy is identical across all three so the
  comparison judges design, not wording. Provenance is recorded in `_copy.md`.
- **The signature element works.** The gate simulator is live in all three and ships **zero
  JavaScript** — radio inputs plus `:checked` sibling selectors. It is keyboard-operable natively
  (Tab to the group, arrow keys to move) and works with scripting disabled. The brief budgeted under
  5 KB of JS for it; it costs none.
- **The L0–L4 mapping is not decorative.** Levels, agent names and gate names are read from the
  installed plugin at v0.27.1, not from the brief's older figures.

## What is not

- **The portrait is a reserved frame, not a stock photo.** It swaps for `<img>` in one line.
- **Fonts load from Google here** so the concepts could be reviewed immediately. The real build
  self-hosts a subset with `font-display: swap`, per §1.
- **Home pages only.** Routes, locales, the content model, the form, SEO and OG images are Phase 3.

## Measured, not assumed

Checked in a real browser at 2026-08-19, after two defects were found and fixed:

| Check | Result |
|---|---|
| Horizontal overflow at 320 / 375 / 814 / 1440 px | **0 px** in all three concepts |
| Gate simulator switches panels (L0…L4) | Verified in all three, with JavaScript uninvolved |
| Console errors | **none** |
| Light and dark | Both defined via `prefers-color-scheme`; flip your OS setting to check |

Defects found and fixed during this pass, rather than discovered later:

1. **Portrait frame blew out the single-column layout** — at tablet width a full-width 4:5 frame
   produced ~968 px of dead space. Capped and centred.
2. **Concept C scrolled horizontally at 320–375 px** — the surname could not fit on one line, then
   the primary nav could not wrap. Both fixed; nav now wraps in all three.

## Still needed from Max

- The **portrait file** — it arrived in chat as an image, not as a file in the project.
- The **chosen concept**. Phase 2 (tokens, component inventory, one fully designed reference page)
  starts from it.
