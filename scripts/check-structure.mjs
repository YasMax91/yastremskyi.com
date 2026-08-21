#!/usr/bin/env node
/**
 * Compare the built pages' markup structure against what is live.
 *
 *   npm run build && npm run structure
 *
 * Not part of `npm run verify`: it needs the network and the deployed site, and
 * a gate that depends on both is a gate that fails for reasons unrelated to the
 * change. Run it deliberately, after a refactor that touched markup.
 *
 * --- Why it exists ----------------------------------------------------------
 *
 * Moving every string into a dictionary meant rewriting markup with scripts, and
 * a script that rewrites markup can quietly drop an element. Two did:
 *
 *   `<b>The subtle part</b>` lost its `<b>` on the work index. The CSS styles
 *   `.subtle b`, so the label stopped being a label — it rendered as body text
 *   welded to the sentence after it. Valid HTML, correct words, wrong element.
 *
 *   The pull quote on /groundwork lost its `<cite>`, and with it the line
 *   attributing the quote.
 *
 * Neither is visible to a spell-checker, a link checker, a type checker or a
 * translation-coverage report: every one of those sees the right words in the
 * right language. Only the shape is wrong. Max found the first by looking at the
 * page, which is a fine way to find one bug and a poor way to find the others.
 *
 * So this compares tag sequences — not text, which is supposed to have changed —
 * between each local page and its deployed counterpart. Three differences are
 * expected and named below; anything else is reported.
 */

import { readFileSync, existsSync } from 'node:fs';

const ORIGIN = process.env.STRUCTURE_ORIGIN ?? 'https://yastremskyi.com';

const ROUTES = [
  '',
  '/about',
  '/groundwork',
  '/work',
  '/work/payments-and-clearing',
  '/work/voice-to-structured-data',
  '/work/multi-market-commerce',
  '/cv',
  '/notes',
  '/notes/colour-space-ocr',
  '/thanks',
];

/**
 * Differences that are intended, so the report can say "nothing else".
 *
 * Two are ours — the language switcher in the header and the hidden field that
 * tells the contact endpoint which language to answer in. The third is not: the
 * CDN rewrites email links into a `<span>` it owns, so the live page has markup
 * this build never produced.
 */
const EXPECTED = new Set([
  // The language switcher in the header.
  '+ul',
  '+li',
  '+a',
  '+/a',
  '+/li',
  '+/ul',
  // The hidden field telling the contact endpoint which language to answer in.
  '+input',
  // hreflang alternates. They appear once a locale is publishable, so a build
  // made with `npm run i18n:preview` has three the live site does not — yet.
  '+link',
  // Not ours: the CDN rewrites email links into a `<span>` it owns, so the live
  // page carries markup this build never produced.
  '-span',
  '-/span',
]);

function skeleton(html) {
  // NOT `split('<body', 1)`: in JavaScript the second argument truncates the
  // result array rather than limiting the number of splits, so that expression
  // returns everything BEFORE the body. This check silently compared two <head>
  // sections and reported every page as fine — a green check that looks at
  // nothing, which is worse than no check. Caught by deleting an <h3> and
  // watching it stay green.
  const start = html.indexOf('<body');
  let body = start === -1 ? html : html.slice(start);
  body = body.replace(/<(script|style)[\s\S]*?<\/\1>/g, '');
  return [...body.matchAll(/<(\/?)([a-zA-Z0-9]+)/g)].map(
    ([, close, tag]) => `${close ? '/' : ''}${tag.toLowerCase()}`,
  );
}

/** Which tags were added or removed, as a multiset difference. */
function differences(live, local) {
  const count = (list) => {
    const m = new Map();
    for (const t of list) m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  };
  const a = count(live);
  const b = count(local);
  const out = [];
  for (const tag of new Set([...a.keys(), ...b.keys()])) {
    const delta = (b.get(tag) ?? 0) - (a.get(tag) ?? 0);
    for (let i = 0; i < Math.abs(delta); i += 1) out.push(`${delta > 0 ? '+' : '-'}${tag}`);
  }
  return out;
}

let findings = 0;
let checked = 0;

for (const route of ROUTES) {
  const path = route === '' ? 'dist/index.html' : `dist${route}/index.html`;
  if (!existsSync(path)) {
    console.log(`  skip  ${route || '/'} — not built`);
    continue;
  }

  let live;
  try {
    const res = await fetch(`${ORIGIN}${route}`, { headers: { 'User-Agent': 'structure-check' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    live = await res.text();
  } catch (err) {
    console.log(`  skip  ${route || '/'} — ${err.message}`);
    continue;
  }

  checked += 1;
  const diff = differences(skeleton(live), skeleton(readFileSync(path, 'utf8')));
  const unexpected = diff.filter((d) => !EXPECTED.has(d));

  if (unexpected.length === 0) {
    console.log(
      `  ok    ${(route || '/').padEnd(32)} ${diff.length ? 'only expected differences' : 'identical'}`,
    );
    continue;
  }

  findings += 1;
  console.log(`  DIFF  ${(route || '/').padEnd(32)} ${unexpected.length} unexpected`);
  for (const d of unexpected.slice(0, 12)) console.log(`          ${d}`);
}

console.log(
  `\n${checked} route(s) compared against ${ORIGIN}, ${findings} with unexplained structure.\n` +
    (findings
      ? 'A tag that appears or disappears without a reason is markup somebody lost.\n'
      : ''),
);
process.exit(findings > 0 ? 1 : 0);
