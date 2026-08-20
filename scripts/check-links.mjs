#!/usr/bin/env node
/**
 * Internal link check over the built output.
 *
 * "Zero broken links" is a release gate in the brief, so it is measured rather
 * than asserted. Walks every built HTML file, collects internal hrefs and src
 * values, and resolves each against dist/. External links are listed but not
 * fetched — a check that hits the network fails for reasons that have nothing
 * to do with this site.
 *
 *   node scripts/check-links.mjs
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
const broken = [];
const external = new Set();
let checked = 0;

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

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  // og:image and twitter:image live in `content`, not href/src. They pointed
  // at a file that did not exist and this check walked straight past them —
  // exactly the failure a link checker exists to catch.
  const HREF = /\b(href|src)="([^"]+)"/g;
  const META = /<meta[^>]+(?:property|name)="(?:og:image|twitter:image)"[^>]+(content)="([^"]+)"/g;
  for (const [, attr, value] of [...html.matchAll(HREF), ...html.matchAll(META)]) {
    if (value.startsWith('#') || value.startsWith('mailto:') || value.startsWith('data:')) continue;
    if (/^https?:\/\//.test(value)) {
      // An absolute link to our own origin is an internal link wearing a
      // hostname, and has to resolve like any other.
      if (value.startsWith(ORIGIN)) {
        checked++;
        if (!resolves(value.slice(ORIGIN.length))) {
          broken.push({ page: page.replace(`${DIST}/`, ''), attr, value });
        }
      } else {
        external.add(value);
      }
      continue;
    }
    checked++;
    if (!resolves(value)) {
      broken.push({ page: page.replace(`${DIST}/`, ''), attr, value });
    }
  }
}

console.log(`pages:            ${pages.length}`);
console.log(`internal links:   ${checked} checked`);
console.log(`external links:   ${external.size} distinct, not fetched`);

if (broken.length) {
  console.log('\nBROKEN:');
  for (const b of broken) console.log(`  ${b.page}  ${b.attr}="${b.value}"`);
  console.log(`\n${broken.length} broken internal link(s).`);
  process.exit(1);
}

console.log('\nNo broken internal links.');
