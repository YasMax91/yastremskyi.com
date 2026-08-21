/**
 * Reading a bilingual collection.
 *
 * The language of a piece of content is its directory — `work/en/…`, `work/uk/…`
 * — rather than a frontmatter field. A field can disagree with where the file
 * actually is; a directory cannot. It also means a translator adds a file
 * instead of editing one, and the English original is never at risk from a
 * translation going in.
 *
 * Parity is deliberately not enforced (see the spec): a case study or a note may
 * exist in one language only. So every lookup here falls back to the default
 * locale and says whether it fell back, and the page prints a line in the
 * reader's language saying the body is not in it. Silence would be the failure —
 * a Ukrainian heading over English prose with nothing to explain it.
 */
import type { CollectionEntry } from 'astro:content';
import { DEFAULT_LOCALE, type Locale } from './dictionaries';
import { REVIEWED } from './reviewed';

type Bilingual = CollectionEntry<'work'> | CollectionEntry<'notes'>;

/** `work/en/payments-and-clearing` → `work`. The collection a review id names. */
function collectionOf(entry: Bilingual): string {
  return entry.collection;
}

/** `work/en/payments-and-clearing` → `en`. */
export function entryLocale(entry: Bilingual): string {
  return entry.id.split('/')[0] ?? DEFAULT_LOCALE;
}

/** `work/en/payments-and-clearing` → `payments-and-clearing`. The slug is shared
 *  by both languages, which is what lets one URL become the other by prefix. */
export function entrySlug(entry: Bilingual): string {
  const parts = entry.id.split('/');
  return parts.length > 1 ? parts.slice(1).join('/') : entry.id;
}

/**
 * One entry per slug, in the requested language where it exists and in the
 * default language where it does not.
 *
 * `translated` is the thing the page needs and the thing that is easy to lose:
 * it is false exactly when the reader is about to be shown a language they did
 * not ask for.
 */
export function forLocale<T extends Bilingual>(
  entries: T[],
  locale: Locale,
): { entry: T; slug: string; translated: boolean }[] {
  const bySlug = new Map<string, Map<string, T>>();
  for (const entry of entries) {
    const slug = entrySlug(entry);
    if (!bySlug.has(slug)) bySlug.set(slug, new Map());
    bySlug.get(slug)!.set(entryLocale(entry), entry);
  }

  const out: { entry: T; slug: string; translated: boolean }[] = [];
  for (const [slug, byLocale] of bySlug) {
    const candidate = byLocale.get(locale);
    // The same rule the dictionary follows: an unreviewed translation does not
    // render. This was missed the first time — the gate held every UI string
    // while a translated case study went straight to the page — so it is
    // enforced here, at the only place content is chosen.
    const wanted =
      candidate &&
      (locale === DEFAULT_LOCALE ||
        REVIEWED.has(`${locale}:content:${collectionOf(candidate)}/${slug}`))
        ? candidate
        : undefined;
    const fallback = byLocale.get(DEFAULT_LOCALE);
    const entry = wanted ?? fallback;
    // A slug that exists in neither the requested nor the default locale is a
    // file in a directory nobody reads. Skipping it silently would hide that.
    if (!entry) continue;
    out.push({ entry, slug, translated: Boolean(wanted) });
  }
  return out;
}
