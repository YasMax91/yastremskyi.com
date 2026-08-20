#!/usr/bin/env node
/**
 * Open Graph images — one per route, generated rather than hand-made.
 *
 * satori lays the card out and converts the text to paths using the fonts it is
 * given, so the resulting SVG is self-contained; sharp then rasterises it. That
 * keeps the pipeline to one new build-time dependency and no font installed on
 * the machine.
 *
 * The cards use the same tokens as the site: black field, one vermilion block,
 * hard edges, mono micro-type. A card that looked like a different site would
 * be worse than none.
 *
 *   node scripts/og.mjs
 */

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

const FONTS = 'scripts/og-fonts';
const OUT = 'public/og';

const ACCENT = '#ff3b00';
const INK = '#ffffff';
const MUTED = '#a6a6a6';
const SURFACE = '#000000';

const fonts = [
  { name: 'Onest', data: readFileSync(join(FONTS, 'onest-400.ttf')), weight: 400, style: 'normal' },
  { name: 'Onest', data: readFileSync(join(FONTS, 'onest-800.ttf')), weight: 800, style: 'normal' },
  {
    name: 'JetBrains Mono',
    data: readFileSync(join(FONTS, 'jetbrains-mono-400.ttf')),
    weight: 400,
    style: 'normal',
  },
];

/** Every route that has a page. Keep in step with src/pages. */
const CARDS = [
  { file: 'default', kicker: 'Senior Backend Engineer · Tech Lead', title: 'Max Yastremskyi' },
  { file: 'groundwork', kicker: 'Open source · MIT · the flagship', title: 'Groundwork' },
  { file: 'work', kicker: 'Selected work', title: 'Four decisions' },
  { file: 'about', kicker: 'About', title: 'The person' },
  { file: 'cv', kicker: 'Curriculum vitae', title: 'Max Yastremskyi' },
  {
    file: 'work-voice-to-structured-data',
    kicker: 'Case study · applied AI',
    title: 'Voice to structured data',
  },
  {
    file: 'work-payments-and-clearing',
    kicker: 'Case study · money',
    title: 'Payments, clearing and tax documents',
  },
  {
    file: 'work-multi-market-commerce',
    kicker: 'Case study · platform',
    title: 'Multi-market commerce platform',
  },
];

/** Long titles must not overflow the card, so the size steps down with length. */
const titleSize = (text) => (text.length > 34 ? 74 : text.length > 22 ? 92 : 116);

const card = ({ kicker, title }) => ({
  type: 'div',
  props: {
    style: {
      width: 1200,
      height: 630,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      background: SURFACE,
      color: INK,
      fontFamily: 'Onest',
      padding: '64px 72px',
    },
    children: [
      {
        type: 'div',
        props: {
          style: { display: 'flex', flexDirection: 'column', gap: 28 },
          children: [
            { type: 'div', props: { style: { width: 96, height: 16, background: ACCENT } } },
            {
              type: 'div',
              props: {
                style: {
                  fontFamily: 'JetBrains Mono',
                  fontSize: 22,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  color: MUTED,
                },
                children: kicker,
              },
            },
          ],
        },
      },
      {
        type: 'div',
        props: {
          style: {
            fontWeight: 800,
            fontSize: titleSize(title),
            lineHeight: 0.95,
            letterSpacing: -4,
            textTransform: 'uppercase',
          },
          children: title,
        },
      },
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: `4px solid ${INK}`,
            paddingTop: 24,
            fontFamily: 'JetBrains Mono',
            fontSize: 22,
            letterSpacing: 2,
            textTransform: 'uppercase',
            color: MUTED,
          },
          children: [
            { type: 'div', props: { children: 'yastremskyi.com' } },
            { type: 'div', props: { style: { color: ACCENT }, children: 'PHP · Laravel · Node' } },
          ],
        },
      },
    ],
  },
});

mkdirSync(OUT, { recursive: true });

for (const c of CARDS) {
  const svg = await satori(card(c), { width: 1200, height: 630, fonts });
  const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
  const path = join(OUT, `${c.file}.png`);
  writeFileSync(path, png);
  console.log(`${path.padEnd(44)} ${(png.length / 1024).toFixed(1)} KB`);
}

console.log(`\n${CARDS.length} Open Graph cards generated.`);
