#!/usr/bin/env node
/**
 * WCAG 2.2 contrast measurement for the design tokens.
 *
 * Not a linter and not a claim — it prints the actual ratio for every pair the
 * design relies on, in both themes, and exits non-zero if any required pair
 * fails. Run it whenever a token changes:  node docs/design/contrast.mjs
 */

const hex = h => {
  const s = h.replace('#', '');
  const n = s.length === 3 ? s.split('').map(c => c + c).join('') : s;
  return [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16));
};

// WCAG relative luminance
const lum = rgb => {
  const [r, g, b] = rgb.map(v => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const ratio = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

/** Required minimums, WCAG 2.2 AA. */
const NEED = {
  body: 4.5,       // text under 18.66px bold / 24px regular
  large: 3.0,      // display text at or above that size
  ui: 3.0,         // borders, focus rings, meaningful graphics
};

export { ratio, NEED };

// ---------------------------------------------------------------------------

const THEMES = {
  light: {
    surface:        '#ffffff',
    'surface-sunk': '#f2f2f2',
    ink:            '#000000',
    'ink-muted':    '#4a4a4a',
    border:         '#000000',
    accent:         '#ff3b00',  // fills and display sizes only
    'accent-text':  '#c42200',  // the same hue, taken down until small text passes
    // Black, not white: white on this vermilion measures 3.57:1 and fails AA.
    // Black measures 5.88:1 and suits the Swiss direction better anyway.
    'on-accent':    '#000000',
    focus:          '#0040ff',
  },
  dark: {
    surface:        '#000000',
    'surface-sunk': '#121212',
    ink:            '#ffffff',
    'ink-muted':    '#a6a6a6',
    border:         '#ffffff',
    accent:         '#ff5227',
    'accent-text':  '#ff7a52',
    'on-accent':    '#000000',
    focus:          '#66a3ff',
  },
};

/** Every pair the design actually puts next to each other. */
const PAIRS = [
  ['ink',           'surface',       'body', 'body text on the page'],
  ['ink',           'surface-sunk',  'body', 'body text on a sunk panel'],
  ['ink-muted',     'surface',       'body', 'secondary prose'],
  ['ink-muted',     'surface-sunk',  'body', 'secondary prose on a panel'],
  ['accent-text',   'surface',       'body', 'small accent text: labels, "the subtle part"'],
  ['accent-text',   'surface-sunk',  'body', 'small accent text on a panel'],
  ['accent',        'surface',       'large','display numerals and oversized headings'],
  ['on-accent',     'accent',        'body', 'text inside an accent fill: buttons, highlight'],
  ['border',        'surface',       'ui',   'the 2px structural rules'],
  ['focus',         'surface',       'ui',   'focus ring against the page'],
  ['focus',         'surface-sunk',  'ui',   'focus ring against a panel'],
];

let failed = 0;
for (const [theme, t] of Object.entries(THEMES)) {
  console.log(`\n${theme.toUpperCase()}`);
  console.log('  ratio   need  pair');
  for (const [fg, bg, kind, why] of PAIRS) {
    const r = ratio(t[fg], t[bg]);
    const need = NEED[kind];
    const ok = r >= need;
    if (!ok) failed++;
    console.log(
      `  ${ok ? 'PASS' : 'FAIL'} ${r.toFixed(2).padStart(5)}  ${String(need).padStart(4)}  ` +
      `${fg} on ${bg} — ${why}`
    );
  }
}

console.log(
  failed === 0
    ? '\nAll required pairs meet WCAG 2.2 AA.'
    : `\n${failed} pair(s) below the required ratio.`
);
process.exit(failed === 0 ? 0 : 1);
