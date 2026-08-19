#!/usr/bin/env node
/**
 * WCAG 2.2 contrast measurement for the design tokens.
 *
 * Reads the colours out of `src/styles/tokens.css` — the file the site actually
 * ships — rather than keeping a second copy here. A harness that measures its
 * own copy of the palette will one day certify a colour that is not on the site.
 *
 * Prints the real ratio for every pair the design relies on and exits non-zero
 * if a required pair falls short.
 *
 *   node docs/design/contrast.mjs
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOKENS = join(HERE, '..', '..', 'src', 'styles', 'tokens.css');

/**
 * Pull one custom-property block out of the stylesheet by its selector.
 *
 * Matched with a pattern rather than a literal string: the formatter is free to
 * rewrite `[data-theme="dark"]` as `[data-theme='dark']`, and a harness that
 * breaks when the code is formatted is a harness nobody keeps running.
 */
function block(css, pattern) {
  const found = pattern.exec(css);
  if (!found) throw new Error(`selector not found in tokens.css: ${pattern}`);
  const at = found.index;
  const open = css.indexOf('{', at);
  const close = css.indexOf('}', open);
  const body = css.slice(open + 1, close);
  const vars = {};
  for (const [, name, value] of body.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    vars[name] = value.trim();
  }
  return vars;
}

const css = readFileSync(TOKENS, 'utf8');
const light = block(css, /:root\s*\{/g);
const dark = { ...light, ...block(css, /:root\[data-theme=['"]dark['"]\]/g) };

const THEMES = { light, dark };

// --- WCAG maths -------------------------------------------------------------

const hex = (h) => {
  const s = h.replace('#', '').trim();
  const n = s.length === 3 ? [...s].map((c) => c + c).join('') : s;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
};

const lum = (rgb) => {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** WCAG 2.2 AA minimums. `large` is text at or above 18.66px bold / 24px regular. */
const NEED = { body: 4.5, large: 3.0, ui: 3.0 };

/** Every pair the design actually puts next to each other. */
const PAIRS = [
  ['ink', 'surface', 'body', 'body text on the page'],
  ['ink', 'surface-sunk', 'body', 'body text on a sunk panel'],
  ['ink-muted', 'surface', 'body', 'secondary prose'],
  ['ink-muted', 'surface-sunk', 'body', 'secondary prose on a panel'],
  ['accent-text', 'surface', 'body', 'small accent text: labels, "the subtle part"'],
  ['accent-text', 'surface-sunk', 'body', 'small accent text on a panel'],
  ['accent', 'surface', 'large', 'display numerals and oversized headings'],
  ['on-accent', 'accent', 'body', 'text inside an accent fill: buttons, highlight'],
  ['border', 'surface', 'ui', 'the 2px structural rules'],
  ['focus', 'surface', 'ui', 'focus ring against the page'],
  ['focus', 'surface-sunk', 'ui', 'focus ring against a panel'],
];

let failed = 0;
console.log(`tokens: ${TOKENS.replace(process.cwd() + '/', '')}`);
for (const [theme, t] of Object.entries(THEMES)) {
  console.log(`\n${theme.toUpperCase()}`);
  console.log('        ratio   need  pair');
  for (const [fg, bg, kind, why] of PAIRS) {
    if (!t[fg] || !t[bg]) throw new Error(`missing token in ${theme}: ${!t[fg] ? fg : bg}`);
    const r = ratio(t[fg], t[bg]);
    const ok = r >= NEED[kind];
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'} ${r.toFixed(2).padStart(6)}  ${String(NEED[kind]).padStart(4)}  ` +
        `${fg} on ${bg} — ${why}`,
    );
  }
}

console.log(
  failed === 0
    ? `\nAll ${PAIRS.length * 2} required pairs meet WCAG 2.2 AA.`
    : `\n${failed} pair(s) below the required ratio.`,
);
process.exit(failed === 0 ? 0 : 1);
