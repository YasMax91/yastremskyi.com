#!/usr/bin/env node
/**
 * Subset the web fonts to the characters this site actually renders.
 *
 * The brief asks for subset fonts. What shipped before was Google's *script*
 * subset — every latin glyph, including hundreds this site will never draw. This
 * cuts them to the characters present in the built HTML plus a safety set, which
 * measurably shortens the critical path: these files are preloaded, so every
 * kilobyte in them sits in front of the first paint.
 *
 * Run after a build, then build again so the hashes and the CSS line up:
 *   npm run build && npm run fonts && npm run build
 *
 * Regenerating from the built output is what keeps this honest — add a case
 * study with a character nobody used before and the next run picks it up.
 *
 * --- Two scripts, and why English pays nothing for the second one ------------
 *
 * The site is bilingual, and Ukrainian needs about seventy Cyrillic glyphs that
 * no English page will ever draw. Rather than one file per locale plus logic to
 * pick between them, each face is cut twice — Latin and Cyrillic — and declared
 * with `unicode-range`. The browser then downloads a face only if the page
 * actually contains a character in its range, which is a rule the platform
 * enforces and we cannot get wrong. An English page never requests the Cyrillic
 * file; a Ukrainian page requests both, because it genuinely renders both.
 *
 * The preload hints in Base.astro are the one part that must still choose,
 * because a preload is unconditional by definition.
 *
 * --- Coverage is checked, not hoped for -------------------------------------
 *
 * This script previously asked for the Ukrainian alphabet in its safety set and
 * silently got nothing: the committed sources were Latin-only cuts with zero
 * Cyrillic codepoints, and harfbuzz drops what it cannot find without
 * complaining. The result was a comment claiming the second locale would render,
 * and files that could not have rendered a single word of it. Every requested
 * character is now checked against the source's own cmap, and a miss fails the
 * build rather than becoming a page full of tofu.
 */

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import subsetFont from 'subset-font';

const DIST = 'dist';
const SOURCE = 'scripts/font-sources';
const OUT = 'public/fonts';

/**
 * Characters kept whatever the current copy happens to contain: printable ASCII,
 * the punctuation good typography reaches for, the Ukrainian alphabet, and the
 * guillemets and non-breaking space Ukrainian typesetting needs.
 */
const SAFETY =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') +
  '“”‘’«»—–…·•±×÷≥≤≈°§¶©®™€£₴¥№ ' +
  'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ' +
  'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя';

/**
 * The two ranges, and the `unicode-range` each is declared with.
 *
 * Cyrillic is the block plus its supplement; everything else is "latin" here,
 * which includes the punctuation and symbols both scripts share. Shared glyphs
 * live in the Latin cut only — a Ukrainian page loads both faces anyway, and
 * duplicating them would pay for the same comma twice.
 */
const CYRILLIC_START = 0x0400;
const CYRILLIC_END = 0x04ff;

const RANGES = [
  {
    id: 'latin',
    // Everything EXCEPT the Cyrillic block, stated as two ranges rather than one
    // open one. Writing this as `U+0000-04FF` — which it briefly was — makes the
    // Latin face claim the Cyrillic block as well. Two faces of the same family
    // then match a Cyrillic character, the winner is decided by declaration
    // order, and the one that wins by accident is the one with no such glyph.
    // The bug renders as tofu on Ukrainian pages and is invisible on English
    // ones, so it would have shipped.
    css: 'U+0000-03FF, U+0500-FFFF',
    holds: (cp) => cp < CYRILLIC_START || cp > CYRILLIC_END,
  },
  {
    id: 'cyrillic',
    css: 'U+0400-04FF',
    holds: (cp) => cp >= CYRILLIC_START && cp <= CYRILLIC_END,
  },
];

const FACES = [
  { src: 'onest-variable.ttf', family: 'Onest', weight: 400, wght: 400, slug: 'onest-400' },
  { src: 'onest-variable.ttf', family: 'Onest', weight: 800, wght: 800, slug: 'onest-800' },
  {
    src: 'jetbrains-mono-400.ttf',
    family: 'JetBrains Mono',
    weight: 400,
    slug: 'jetbrains-mono-400',
  },
];

// --- what the source font can actually draw ---------------------------------

/**
 * The codepoints a font's `cmap` maps. Read directly rather than trusted from a
 * specimen page: a specimen describes the family, and what matters here is the
 * file on disk.
 */
function codepointsOf(buffer) {
  const numTables = buffer.readUInt16BE(4);
  let cmapOffset = null;
  for (let i = 0; i < numTables; i += 1) {
    const rec = 12 + 16 * i;
    if (buffer.toString('latin1', rec, rec + 4) === 'cmap') {
      cmapOffset = buffer.readUInt32BE(rec + 8);
      break;
    }
  }
  if (cmapOffset === null) throw new Error('font has no cmap table');

  const subtables = buffer.readUInt16BE(cmapOffset + 2);
  let best = null;
  for (let i = 0; i < subtables; i += 1) {
    const rec = cmapOffset + 4 + 8 * i;
    const offset = cmapOffset + buffer.readUInt32BE(rec + 4);
    const format = buffer.readUInt16BE(offset);
    // Prefer the widest table present; 12 covers beyond the BMP, 4 does not.
    if (format === 4 || format === 12) best = { offset, format };
  }
  if (!best) throw new Error('font has no usable cmap subtable');

  const chars = new Set();
  if (best.format === 4) {
    const segCountX2 = buffer.readUInt16BE(best.offset + 6);
    const segCount = segCountX2 / 2;
    for (let i = 0; i < segCount; i += 1) {
      const end = buffer.readUInt16BE(best.offset + 14 + 2 * i);
      const start = buffer.readUInt16BE(best.offset + 16 + segCountX2 + 2 * i);
      if (end === 0xffff) continue;
      for (let cp = start; cp <= end; cp += 1) chars.add(cp);
    }
  } else {
    const groups = buffer.readUInt32BE(best.offset + 12);
    for (let i = 0; i < groups; i += 1) {
      const rec = best.offset + 16 + 12 * i;
      const start = buffer.readUInt32BE(rec);
      const end = buffer.readUInt32BE(rec + 4);
      for (let cp = start; cp <= end; cp += 1) chars.add(cp);
    }
  }
  return chars;
}

// --- what the built site renders --------------------------------------------

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Text nodes only — tag names and attribute values are never rendered. */
function textOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

const pages = walk(DIST).filter((f) => extname(f) === '.html');
const used = new Set([...SAFETY]);
for (const page of pages) for (const ch of textOf(readFileSync(page, 'utf8'))) used.add(ch);

const chars = [...used]
  .filter((c) => c.codePointAt(0) > 31 || c === ' ')
  .sort()
  .join('');

console.log(`pages read:       ${pages.length}`);
console.log(`distinct glyphs:  ${chars.length}`);

// --- cut, check, write -------------------------------------------------------

const faces = [];
const missing = [];
let before = 0;
let after = 0;

for (const face of FACES) {
  const source = readFileSync(join(SOURCE, face.src));
  const available = codepointsOf(source);
  before += source.length;

  for (const range of RANGES) {
    const wanted = [...chars].filter((c) => range.holds(c.codePointAt(0)));
    const absent = wanted.filter((c) => !available.has(c.codePointAt(0)));
    if (absent.length) {
      missing.push(`${face.src} (${range.id}) cannot draw: ${absent.join(' ')}`);
      continue;
    }
    if (wanted.length === 0) continue;

    const out = `${face.slug}-${range.id}.woff2`;
    const subset = await subsetFont(source, wanted.join(''), {
      targetFormat: 'woff2',
      // Onest ships as one variable file; pinning the axis here means the source
      // is committed once instead of once per weight.
      ...(face.wght ? { variationAxes: { wght: face.wght } } : {}),
      // Drop glyphs reachable only through layout substitution — ligatures and
      // alternates this design never asks for. The upstream originals carry far
      // richer feature tables than the Latin-only cuts they replace, and keeping
      // them made every English page 18 KB heavier for glyphs it does not draw.
      // With this, the Latin cuts come out SMALLER than what shipped before:
      // Onest 400 at 8.1 KB against 9.6, the mono at 13.6 against 16.7.
      // Kerning is untouched — that is GPOS, and closure is a GSUB concern.
      noLayoutClosure: true,
    });
    writeFileSync(join(OUT, out), subset);
    after += subset.length;
    faces.push({ ...face, out, range: range.css, id: range.id, bytes: subset.length });
    console.log(
      `  ${out.padEnd(34)} ${String(wanted.length).padStart(4)} glyphs  ${(subset.length / 1024).toFixed(1)} KB`,
    );
  }
}

if (missing.length) {
  console.error('\nThe source fonts cannot draw characters the site renders:\n');
  for (const line of missing) console.error(`  ✗ ${line}`);
  console.error('\nA subset cannot invent a glyph. Use a source that has it.\n');
  process.exit(1);
}

const latin = faces.filter((f) => f.id === 'latin').reduce((n, f) => n + f.bytes, 0);
const cyrillic = faces.filter((f) => f.id === 'cyrillic').reduce((n, f) => n + f.bytes, 0);
console.log(`\nsources: ${(before / 1024).toFixed(1)} KB`);
console.log(
  `latin:   ${(latin / 1024).toFixed(1)} KB  (what an English page loads)\n` +
    `cyrillic:${(cyrillic / 1024).toFixed(1)} KB  (what a Ukrainian page loads on top)\n` +
    `total:   ${(after / 1024).toFixed(1)} KB`,
);

// The @font-face rules are generated from the same list that produced the files,
// so a family can never be declared that was not built.
const css = `/* ===========================================================================
   Self-hosted fonts — GENERATED by scripts/subset-fonts.mjs. Do not hand-edit.
   ---------------------------------------------------------------------------
   Subset to the characters the built site actually renders, plus a safety set
   covering printable ASCII, typographic punctuation and the Ukrainian alphabet.
   These files are preloaded, so their size sits directly in front of the first
   paint — which is why they are cut to content rather than to script.

   Each face is declared twice, Latin and Cyrillic, with a \`unicode-range\`. The
   browser fetches a face only when the page contains a character inside its
   range, so an English page never downloads a Cyrillic glyph and a Ukrainian one
   downloads both because it renders both. That selection is the platform's job,
   not ours, which is why it cannot drift.

   Onest is instanced from one variable source at 400 and 800 rather than
   committed twice.

   Both families are under the SIL Open Font License 1.1 — see OFL-*.txt here.
   =========================================================================== */

${faces
  .map(
    (f) => `@font-face {
  font-family: '${f.family}';
  font-style: normal;
  font-weight: ${f.weight};
  font-display: swap;
  src: url('/fonts/${f.out}') format('woff2');
  unicode-range: ${f.range};
}`,
  )
  .join('\n\n')}
`;

writeFileSync('src/styles/fonts.css', css);
console.log('src/styles/fonts.css regenerated');
