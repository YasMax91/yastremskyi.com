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
import subsetFont from 'subset-font';
import sharp from 'sharp';

const FONTS = 'scripts/font-sources';
const OUT = 'public/og';

/** Latin, Cyrillic and the punctuation a title might reach for. */
const ALL_GLYPHS =
  Array.from({ length: 95 }, (_, i) => String.fromCharCode(32 + i)).join('') +
  '“”‘’«»—–…·•±×÷≥≤≈°§¶©®™€£₴¥№ ' +
  'АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ' +
  'абвгґдеєжзиіїйклмнопрстуфхцчшщьюя';

const ACCENT = '#ff3b00';
const INK = '#ffffff';
const MUTED = '#a6a6a6';
const SURFACE = '#000000';

/**
 * Satori needs static instances, and Onest ships as one variable file. Rather
 * than committing the same typeface twice — once for the browser, once for this
 * script, with only one of them ever getting updated — the weights are instanced
 * here from the single source the web subsets also use.
 *
 * Not subset to a character set: a card's text is whatever a route's title
 * happens to be, in either language, and a missing glyph on an Open Graph image
 * is a black box in a link preview that nobody sees until it is public.
 */
const onest = readFileSync(join(FONTS, 'onest-variable.ttf'));

const instance = (buffer, wght) =>
  subsetFont(buffer, ALL_GLYPHS, { targetFormat: 'sfnt', variationAxes: { wght } });

const fonts = [
  { name: 'Onest', data: await instance(onest, 400), weight: 400, style: 'normal' },
  { name: 'Onest', data: await instance(onest, 800), weight: 800, style: 'normal' },
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
  { file: 'status', kicker: 'Status · measured, not asserted', title: 'Is it up' },
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

  // Ukrainian. A link shared from /uk should preview in the language of the page
  // it points at — an English card under a Ukrainian headline is the seam a
  // reader notices first, because it is the part that travels.
  { file: 'uk-default', kicker: 'Senior Backend Engineer · Tech Lead', title: 'Макс Ястремський' },
  { file: 'uk-groundwork', kicker: 'Відкритий код · MIT · флагман', title: 'Groundwork' },
  { file: 'uk-work', kicker: 'Вибрані роботи', title: 'Чотири рішення' },
  { file: 'uk-about', kicker: 'Про мене', title: 'Людина' },
  { file: 'uk-status', kicker: 'Стан · виміряно, не заявлено', title: 'Чи працює' },
  {
    file: 'uk-work-voice-to-structured-data',
    kicker: 'Кейс · прикладний AI',
    title: 'Голос у структуровані дані',
  },
  {
    file: 'uk-work-payments-and-clearing',
    kicker: 'Кейс · гроші',
    title: 'Платежі, кліринг і податкові документи',
  },
  {
    file: 'uk-work-multi-market-commerce',
    kicker: 'Кейс · платформа',
    title: 'Мультиринкова e-commerce платформа',
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
