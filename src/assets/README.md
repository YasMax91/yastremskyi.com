# Image sources

Images live **here**, not in `public/`. Astro only runs its pipeline — AVIF/WebP
conversion, explicit width and height, responsive `srcset` — on files it can see
at build time, and anything in `public/` is copied through untouched.

## Pending

- `portrait.jpg` — Max's portrait, at original resolution and unrecompressed.
  Until it lands, the hero renders a reserved frame rather than a stock
  substitute. Dropping the file in and referencing it is a one-line change in
  `src/pages/index.astro`.
