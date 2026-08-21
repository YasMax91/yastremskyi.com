#!/usr/bin/env node
/**
 * How much of each translated page is still in English.
 *
 *   npm run build && npm run i18n:coverage
 *
 * A report rather than a gate: while a locale is being translated the honest
 * number is "not yet", and a check that fails on that would just be switched
 * off. The gate that does fail — `npm run i18n:check` — guards a different
 * thing: that nothing unreviewed reaches a reader.
 *
 * It reads the built HTML rather than the source, because that is the only place
 * a whole page exists. It earned its keep immediately, finding that case studies
 * and notes were rendering their entire navigation, footer and skip link in
 * English because a formatter had folded `<Base` onto one line and the locale
 * never reached the layout. Nothing in the source looked wrong.
 *
 * --- What it looks at, and why the first version was wrong ------------------
 *
 * The first version reported 100% while a reader could still see English, which
 * is the worst thing a report can do. Two mistakes, both in this file:
 *
 *   It read text nodes only. Attributes a person perceives — `alt`, `title`,
 *   `aria-label`, `placeholder`, the meta description, the Open Graph title and
 *   image alt — were invisible to it. The portrait's alt text and an Open Graph
 *   alt stayed English on every Ukrainian page and nothing said so.
 *
 *   It skipped whole element classes — chips and code — on the theory that they
 *   hold terms. Some do. But "Idempotency keys", "Accounting and tax export" and
 *   "Blast-radius discovery before planning" are prose that happened to be
 *   rendered as chips, and silencing the container silenced them too.
 *
 * So it now reads everything and subtracts an explicit, readable list of strings
 * that stay Latin on purpose. Anything new shows up until somebody decides,
 * deliberately, that it should not — which is the opposite of a container class
 * silencing whatever gets put inside it later.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

import { LOCALES, DEFAULT_LOCALE } from '../src/i18n/dictionaries.ts';

const DIST = 'dist';

/** Attributes a reader actually perceives. */
const ATTRIBUTES = ['alt', 'title', 'aria-label', 'placeholder', 'data-network-error'];

/** Meta values that are prose rather than machinery. */
const META_PROSE = ['description', 'og:title', 'og:description', 'og:image:alt', 'twitter:title'];

/**
 * Latin strings that stay Latin on purpose, matched exactly.
 *
 * Product names, the one project this site may name, and the four job titles.
 * Exact strings rather than patterns: a pattern loose enough to cover these
 * would also swallow real untranslated prose, and the point of this report is
 * the number reaching 100% honestly.
 */
const DELIBERATE = new Set([
  'Groundwork',
  'GitHub',
  'LinkedIn',
  'Claude Code',
  'MIT',
  // Job titles. A Ukrainian CV writes these in English; translating them makes
  // the role harder to recognise, not easier.
  'Senior Backend Engineer · Tech Lead',
  'Full-Stack PHP Engineer',
  'PHP Engineer',
  'Junior Engineer (C++ / .NET)',
  // Stack and platform names.
  'PHP 8.4, Laravel 12',
  'PHP 8.4 · Laravel 12 · Node / NestJS',
  'MySQL 8 · Redis · Docker',
  'Node, NestJS',
  'MySQL 8, PostgreSQL',
  'Redis',
  'Docker',
  'Laravel',
  'Laravel 12',
  'bcmath',
  'JSON API',
  'JSON-LD',
  'OAuth',
  'Whisper STT',
  'WebSocket',
  'LCP',
  'Node',
  'Bash',
  'OpenAPI',
]);

/** Agent and gate identifiers, and anything shaped like one. */
const IDENTIFIER = /^[a-z0-9]+(-[a-z0-9]+)+$/;
/** A route is a route in every language. */
const ROUTE = /^\/[\w/-]*$/;
/** An address is an address in every language. */
const EMAIL = /^[^@\s]+@[^@\s]+$/;
/** A URL, a viewport declaration, a card type — machinery, not prose. */
const MACHINERY = /^(https?:\/\/|width=device-width|summary_large_image|website|article)/;
/** Shell and plugin commands. */
const COMMAND = /^[/$][\w:@/. -]+$/m;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const ENTITIES = [
  ['&amp;', '&'],
  ['&lt;', '<'],
  ['&gt;', '>'],
  ['&quot;', '"'],
  ['&#39;', "'"],
  ['&nbsp;', ' '],
];

/** Everything a reader can perceive: text, and the attributes that speak. */
function perceivable(html) {
  const out = [];
  const stripped = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ');

  for (const m of stripped.matchAll(/>([^<>]+)</g)) out.push(m[1]);

  for (const attr of ATTRIBUTES) {
    for (const m of html.matchAll(new RegExp(`\\b${attr}="([^"]*)"`, 'g'))) out.push(m[1]);
  }

  for (const name of META_PROSE) {
    const re = new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`, 'g');
    for (const m of html.matchAll(re)) out.push(m[1]);
  }

  return out
    .map((v) => ENTITIES.reduce((acc, [from, to]) => acc.split(from).join(to), v).trim())
    .filter(Boolean);
}

const CYRILLIC = /[Ѐ-ӿ]/;
const HAS_WORDS = /[A-Za-z]{3,}/;

if (!existsSync(DIST)) {
  console.error(`${DIST}/ not found — run the build first.`);
  process.exit(1);
}

const targets = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
let totalItems = 0;
let totalEnglish = 0;

for (const locale of targets) {
  const root = join(DIST, locale);
  if (!existsSync(root)) continue;

  console.log(`\n${locale.toUpperCase()}\n`);
  const pages = walk(root).filter((f) => extname(f) === '.html');

  for (const page of pages.sort()) {
    const items = perceivable(readFileSync(page, 'utf8')).filter((v) => HAS_WORDS.test(v));
    const english = [
      ...new Set(
        items.filter(
          (v) =>
            !CYRILLIC.test(v) &&
            !DELIBERATE.has(v) &&
            !IDENTIFIER.test(v) &&
            !ROUTE.test(v) &&
            !EMAIL.test(v) &&
            !MACHINERY.test(v) &&
            !COMMAND.test(v),
        ),
      ),
    ];

    totalItems += items.length;
    totalEnglish += english.length;

    const route = page.replace(`${DIST}/`, '').replace(/\/index\.html$/, '') || '/';
    const done =
      items.length === 0 ? 100 : Math.round(((items.length - english.length) / items.length) * 100);
    const bar = '█'.repeat(Math.round(done / 5)).padEnd(20, '·');
    console.log(`  ${bar} ${String(done).padStart(3)}%  ${route}`);
    for (const v of english.slice(0, 4)) console.log(`        · ${v.slice(0, 88)}`);
    if (english.length > 4) console.log(`        · …and ${english.length - 4} more`);
  }
}

const done = totalItems === 0 ? 100 : Math.round(((totalItems - totalEnglish) / totalItems) * 100);
console.log(
  `\n${done}% translated · ${totalEnglish} English fragment(s) left across ${targets.join(', ')}\n`,
);
