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
 * the whole page exists. It earned its keep immediately: it found that case
 * studies and notes were rendering their entire navigation, footer and skip link
 * in English, because a formatter had folded `<Base` onto one line and the
 * locale never reached the layout. Nothing in the source looked wrong, and the
 * pages looked plausible unless you knew what to compare.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';

import { LOCALES, DEFAULT_LOCALE } from '../src/i18n/dictionaries.ts';

const DIST = 'dist';

/**
 * Latin text that is not untranslated prose: identifiers, stack names, proper
 * nouns and the handful of terms a Ukrainian engineer writes in English anyway.
 * Deliberately short — every entry here is a thing the report will stop telling
 * anyone about, so the list has to stay something a person can read.
 */
const KEEP_LATIN =
  /^(Groundwork|GitHub|LinkedIn|MIT|OFL|PHP|Laravel|Node|NestJS|MySQL|PostgreSQL|Redis|Docker|OpenAPI|CSS|HTML|JavaScript|TypeScript|Astro|Claude Code|Bash|Caddy|systemd|Resend|Cloudflare|Sentry|UTC|EN|UA|CV|B2|LCP|CLS|TBT|SEO|API|VAT|PCI|NDA|SQL|AI|L0|L1|L2|L3|L4)\b/;

/**
 * Strings that stay English on purpose, listed exactly.
 *
 * Job titles are the whole of it: a Ukrainian CV writes "Senior Backend
 * Engineer", and translating it would make the role harder to recognise, not
 * easier. Kept as an explicit list rather than a pattern, because a pattern
 * broad enough to catch these would also hide real untranslated prose — and the
 * point of this report is the number reaching 100%.
 */
const DELIBERATE = new Set([
  'Senior Backend Engineer · Tech Lead',
  'Full-Stack PHP Engineer',
  'PHP Engineer',
  'Junior Engineer (C++ / .NET)',
]);

/** Agent and gate identifiers, and anything that reads like one. */
const IDENTIFIER = /^[a-z0-9]+(-[a-z0-9]+)+$/;

/** A route is a route in every language — these are paths, not words. */
const ROUTE = /^\/[\w/-]*$/;

/** An address is an address in every language. */
const EMAIL = /^[^@\s]+@[^@\s]+$/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

function visibleLines(html) {
  let h = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ');
  // Stack chips and gate chips are terms, not prose: "bcmath", "Idempotency
  // keys", "OpenAPI". They stay English in every language by an explicit
  // decision, so counting them as untranslated would leave the report
  // permanently short of 100% and therefore permanently ignored.
  h = h.replace(/<ul[^>]*class="[^"]*\b(tags|chips)\b[^"]*"[\s\S]*?<\/ul>/g, ' ');
  // Commands and code are not prose. `/plugin install groundwork@yasmax` is the
  // same in every language, and a report that keeps asking for it to be
  // translated is a report that trains people to skim past its findings.
  h = h.replace(/<(pre|code)[\s\S]*?<\/\1>/g, ' ');
  h = h.replace(/<[^>]+>/g, '\n');
  for (const [from, to] of [
    ['&amp;', '&'],
    ['&lt;', '<'],
    ['&gt;', '>'],
    ['&quot;', '"'],
    ['&#39;', "'"],
    ['&nbsp;', ' '],
  ]) {
    h = h.split(from).join(to);
  }
  return h
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

const CYRILLIC = /[Ѐ-ӿ]/;

if (!existsSync(DIST)) {
  console.error(`${DIST}/ not found — run the build first.`);
  process.exit(1);
}

const targets = LOCALES.filter((l) => l !== DEFAULT_LOCALE);
let totalLines = 0;
let totalEnglish = 0;

for (const locale of targets) {
  const root = join(DIST, locale);
  if (!existsSync(root)) continue;

  console.log(`\n${locale.toUpperCase()}\n`);
  const pages = walk(root).filter((f) => extname(f) === '.html');

  for (const page of pages.sort()) {
    const lines = visibleLines(readFileSync(page, 'utf8'));
    const prose = lines.filter((l) => /[A-Za-z]{4,}/.test(l));
    const english = prose.filter(
      (l) =>
        !CYRILLIC.test(l) &&
        !KEEP_LATIN.test(l) &&
        !IDENTIFIER.test(l) &&
        !DELIBERATE.has(l) &&
        !EMAIL.test(l) &&
        !ROUTE.test(l),
    );

    totalLines += prose.length;
    totalEnglish += english.length;

    const route = page.replace(`${DIST}/`, '').replace(/\/index\.html$/, '') || '/';
    const done =
      prose.length === 0 ? 100 : Math.round(((prose.length - english.length) / prose.length) * 100);
    const bar = '█'.repeat(Math.round(done / 5)).padEnd(20, '·');
    console.log(`  ${bar} ${String(done).padStart(3)}%  ${route}`);
    if (english.length) {
      for (const l of english.slice(0, 3)) console.log(`        · ${l.slice(0, 88)}`);
      if (english.length > 3) console.log(`        · …and ${english.length - 3} more`);
    }
  }
}

const done = totalLines === 0 ? 100 : Math.round(((totalLines - totalEnglish) / totalLines) * 100);
console.log(
  `\n${done}% translated · ${totalEnglish} English fragment(s) left across ${targets.join(', ')}\n`,
);
