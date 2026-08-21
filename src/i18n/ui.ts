/**
 * Translation behaviour. The dictionaries themselves live in dictionaries.ts.
 */
import { REVIEWED } from './reviewed';
import { ui, LOCALES, DEFAULT_LOCALE, type Locale, type UIKey } from './dictionaries';

export { ui, LOCALES, DEFAULT_LOCALE };
export type { Locale, UIKey };

/**
 * Translate for a locale.
 *
 * Two fallbacks, and the second one is the point. A missing key falls back to
 * English rather than to a blank, as always. But a key that exists and has *not
 * been signed off* in docs/i18n-review.md also falls back to English: the
 * project's rule is that no Ukrainian reaches a visitor before Max has read it
 * as a native speaker, and a rule enforced by remembering is not enforced.
 *
 * So an unreviewed translation cannot render even if every check is skipped.
 * `npm run i18n:check` reports the same fact out loud; this is what makes it
 * true.
 */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey, vars?: Record<string, string | number>): string {
    const source =
      locale !== DEFAULT_LOCALE && !REVIEWED.has(`${locale}:${key}`)
        ? ui[DEFAULT_LOCALE][key]
        : (ui[locale][key] ?? ui[DEFAULT_LOCALE][key]);

    // `{name}` placeholders rather than split sentences. A sentence cut into
    // three keys so a number can sit between them is a sentence that cannot be
    // reordered, and Ukrainian word order is not English word order.
    if (!vars) return source;
    return source.replace(/\{(\w+)\}/g, (whole, name) =>
      name in vars ? String(vars[name]) : whole,
    );
  };
}

/** Build a path in the given locale. English lives at the root. */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean === '/' ? '' : clean}`;
}
