#!/usr/bin/env node
/**
 * The motion barrier.
 *
 * The site claims that its animation costs nothing measurable. That claim is
 * only worth something if something enforces it, so this runs over the built
 * output on every `npm run verify` and fails the build on any of four counts:
 *
 *   1. Motion introduced JavaScript. It is meant to be free; a script is not.
 *   2. An animation that `prefers-reduced-motion: reduce` cannot switch off.
 *      WCAG 2.2 and the brief both require the preference to be honoured, and
 *      "we remembered" is not a mechanism.
 *   3. A scroll-driven animation declared outside `@supports`. Firefox ships no
 *      `animation-timeline` (verified 2026-08-21 against MDN compat data), so an
 *      ungated rule is how content ends up stuck at `opacity: 0` for a share of
 *      real visitors — the single worst failure mode this layer has.
 *   4. Any animation reaching the hero. Chromium does not treat a transparent
 *      element as an LCP candidate, so an entrance reveal on the largest
 *      above-the-fold element delays LCP by its own duration. The measured
 *      headroom is under 100 ms; an entrance reveal spends more than that.
 *
 * Deliberately not a CSS parser: it is a brace-aware scanner that tracks which
 * at-rules a declaration block sits inside. That is all four questions need, and
 * a dependency here would be a dependency in the gate that guards the claim.
 *
 *   node scripts/check-motion.mjs
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = 'dist';

/**
 * Rules allowed to declare an animation outside a `no-preference` block,
 * because reduced motion neutralises them by a different route: the
 * view-transition pseudo-elements cannot be reached by the duration tokens, so
 * they are switched off by an explicit `animation: none` under `reduce`. That
 * override's existence is itself verified below — the exemption is not taken on
 * trust.
 */
const REDUCE_EXEMPT = /::view-transition/;

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

const files = walk(DIST);
const pages = files.filter((f) => extname(f) === '.html');

const problems = [];

/* --- 1. motion brought no JavaScript -------------------------------------- */

const scriptFiles = files.filter((f) => ['.js', '.mjs'].includes(extname(f)));
for (const f of scriptFiles) {
  problems.push(`external script emitted: ${f} — the motion layer is CSS only`);
}

/* --- the scanner ----------------------------------------------------------
   Yields one entry per declaration block: its selector, its body, and the stack
   of at-rule preludes enclosing it. Comments are stripped first so that an
   example inside one cannot fail the build.
   ------------------------------------------------------------------------- */

function* blocks(css) {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const stack = [];
  let buf = '';

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];

    if (ch === '{') {
      const prelude = buf.trim();
      buf = '';
      // An at-rule that opens a block is a context (@media, @supports, @layer);
      // anything else is a selector, and what follows is its declarations.
      if (prelude.startsWith('@') && !prelude.startsWith('@keyframes')) {
        stack.push(prelude);
        continue;
      }
      // Read the declaration body, allowing for nested braces inside keyframes.
      let depth = 1;
      let body = '';
      i += 1;
      for (; i < src.length && depth > 0; i += 1) {
        if (src[i] === '{') depth += 1;
        else if (src[i] === '}') {
          depth -= 1;
          if (depth === 0) break;
        }
        body += src[i];
      }
      yield { selector: prelude, body, context: [...stack] };
      continue;
    }

    if (ch === '}') {
      stack.pop();
      buf = '';
      continue;
    }

    buf += ch;
  }
}

/* --- 2/3/4. the CSS rules -------------------------------------------------- */

const HERO = /\.hero\b/;
const ANIMATION = /(^|[;{\s])animation(-name)?\s*:/;

let sawReduceOverride = false;
let animatedRules = 0;
let timelineRules = 0;

for (const page of pages) {
  const html = readFileSync(page, 'utf8');
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);

  for (const css of styles) {
    for (const { selector, body, context } of blocks(css)) {
      const inNoPreference = context.some((c) =>
        /prefers-reduced-motion\s*:\s*no-preference/.test(c),
      );
      const inReduce = context.some((c) => /prefers-reduced-motion\s*:\s*reduce/.test(c));
      const inSupportsTimeline = context.some((c) => /@supports[^{]*animation-timeline/.test(c));

      if (inReduce && REDUCE_EXEMPT.test(selector) && /animation\s*:\s*none/.test(body)) {
        sawReduceOverride = true;
      }

      if (!ANIMATION.test(body)) continue;
      animatedRules += 1;

      if (!inNoPreference && !inReduce && !REDUCE_EXEMPT.test(selector)) {
        problems.push(`${page}: "${selector}" animates outside a prefers-reduced-motion block`);
      }

      if (/animation-timeline\s*:/.test(body)) {
        timelineRules += 1;
        if (!inSupportsTimeline) {
          problems.push(
            `${page}: "${selector}" uses animation-timeline outside @supports — ` +
              `content can be left invisible where it is unsupported`,
          );
        }
      }

      if (HERO.test(selector)) {
        problems.push(`${page}: "${selector}" animates the hero — this delays LCP`);
      }
    }
  }

  /* The hero heading must also stay clear of the motion classes, which is a
     question about the markup rather than the stylesheet. */
  const hero = html.match(/<div class="hero[^"]*"[\s\S]*?<h1[^>]*>/);
  if (hero && /\bm-(reveal|stagger|swap)\b/.test(hero[0])) {
    problems.push(`${page}: the hero carries a motion class`);
  }
}

if (animatedRules > 0 && !sawReduceOverride) {
  problems.push(
    'no `animation: none` override for the view-transition pseudo-elements under ' +
      'prefers-reduced-motion: reduce',
  );
}

/* --- report ---------------------------------------------------------------- */

if (problems.length > 0) {
  console.error('Motion barrier failed:\n');
  for (const p of problems) console.error(`  ✗ ${p}`);
  console.error('');
  process.exit(1);
}

console.log(
  `Motion: ${animatedRules} animated rules across ${pages.length} pages, ` +
    `${timelineRules} scroll-driven and all inside @supports, ` +
    `0 external scripts, hero untouched.`,
);
