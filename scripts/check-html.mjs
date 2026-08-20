#!/usr/bin/env node
/**
 * Static audit of the built output: internal links, and heading order.
 *
 * Both are release gates in the brief ("zero broken links", "correct landmarks
 * and heading order"), so both are measured here rather than trusted. Lighthouse
 * catches the same things in CI, but a check that runs in under a second is a
 * check that runs before every commit.
 *
 *   node scripts/check-html.mjs
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';
/** Absolute links to our own origin are internal, and must resolve too. */
const ORIGIN = 'https://yastremskyi.com';

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

if (!existsSync(DIST)) {
  console.error(`${DIST}/ not found — run the build first.`);
  process.exit(1);
}

const pages = walk(DIST).filter((f) => extname(f) === '.html');
const brokenLinks = [];
const headingJumps = [];
const missingLandmarks = [];
const external = new Set();
let linksChecked = 0;

/** dist/foo/index.html serves at /foo, so both spellings must resolve. */
function resolves(path) {
  const clean = path.split('#')[0].split('?')[0];
  if (clean === '' || clean === '/') return existsSync(join(DIST, 'index.html'));
  const rel = clean.replace(/^\//, '');
  return (
    existsSync(join(DIST, rel)) ||
    existsSync(join(DIST, `${rel}.html`)) ||
    existsSync(join(DIST, rel, 'index.html'))
  );
}

const strip = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const label = page.replace(`${DIST}/`, '');

  // --- links ---------------------------------------------------------------
  const HREF = /\b(href|src)="([^"]+)"/g;
  const META = /<meta[^>]+(?:property|name)="(?:og:image|twitter:image)"[^>]+(content)="([^"]+)"/g;
  for (const [, attr, value] of [...html.matchAll(HREF), ...html.matchAll(META)]) {
    if (value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('data:')) continue;
    if (/^https?:\/\//.test(value)) {
      if (value.startsWith(ORIGIN)) {
        linksChecked++;
        if (!resolves(value.slice(ORIGIN.length))) brokenLinks.push({ page: label, attr, value });
      } else {
        external.add(value);
      }
      continue;
    }
    linksChecked++;
    if (!resolves(value)) brokenLinks.push({ page: label, attr, value });
  }

  // --- heading order -------------------------------------------------------
  // A jump from h2 straight to h4 breaks the outline for anyone navigating by
  // headings, and it is invisible on screen — which is exactly why it needs a
  // machine to notice.
  let previous = 0;
  for (const m of html.matchAll(/<(h[1-6])[^>]*>([\s\S]*?)<\/\1>/g)) {
    const level = Number(m[1][1]);
    if (previous && level > previous + 1) {
      headingJumps.push({
        page: label,
        from: `h${previous}`,
        to: m[1],
        text: strip(m[2]).slice(0, 48),
      });
    }
    previous = level;
  }

  // --- landmarks -----------------------------------------------------------
  for (const [needle, what] of [
    ['<main', 'main landmark'],
    ['<header', 'header landmark'],
    ['<footer', 'footer landmark'],
    ['class="skip"', 'skip link'],
  ]) {
    if (!html.includes(needle)) missingLandmarks.push({ page: label, what });
  }
}

console.log(`pages:            ${pages.length}`);
console.log(`internal links:   ${linksChecked} checked`);
console.log(`external links:   ${external.size} distinct, not fetched`);

let failed = 0;

if (brokenLinks.length) {
  failed += brokenLinks.length;
  console.log('\nBROKEN LINKS:');
  for (const b of brokenLinks) console.log(`  ${b.page}  ${b.attr}="${b.value}"`);
}

if (headingJumps.length) {
  failed += headingJumps.length;
  console.log('\nHEADING ORDER:');
  for (const h of headingJumps) console.log(`  ${h.page}  ${h.from} -> ${h.to}  "${h.text}"`);
}

if (missingLandmarks.length) {
  failed += missingLandmarks.length;
  console.log('\nLANDMARKS:');
  for (const m of missingLandmarks) console.log(`  ${m.page}  missing ${m.what}`);
}

console.log(
  failed === 0
    ? '\nLinks resolve, headings descend in order, landmarks present.'
    : `\n${failed} problem(s).`,
);
process.exit(failed === 0 ? 0 : 1);
