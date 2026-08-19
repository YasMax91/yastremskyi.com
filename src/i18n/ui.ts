/**
 * UI dictionaries. Every user-facing string that is not page content lives
 * here, so adding a locale is a matter of adding a key set — not of hunting
 * through markup.
 *
 * English ships at launch. Ukrainian is written but not published until Max has
 * reviewed it as a native speaker; the entries below are drafts and are marked
 * as such in docs/i18n-review.md.
 */
export const LOCALES = ['en', 'uk'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/** Locales whose pages are actually generated. See the brief §10 deviation. */
export const PUBLISHED_LOCALES: readonly Locale[] = ['en'];

export const ui = {
  en: {
    'nav.groundwork': 'Groundwork',
    'nav.work': 'Work',
    'nav.about': 'About',
    'nav.cv': 'CV',
    'nav.primary': 'Primary',
    'skip.content': 'Skip to content',
    'theme.toggle': 'Theme',
    'theme.toLight': 'Light',
    'theme.toDark': 'Dark',
    'home.selectedWork': 'Selected work',
    'home.capabilities': 'Capability map',
    'home.howIWork': 'How I work',
    'home.contact': 'Contact',
    'case.context': 'Context',
    'case.constraint': 'The constraint',
    'case.decision': 'The decision',
    'case.chosen': 'What was chosen',
    'case.rejected': 'What was rejected',
    'case.tradeoff': 'The trade-off',
    'case.subtle': 'The subtle part',
    'case.outcome': 'Outcome',
    'case.stack': 'Stack',
    'meta.asOf': 'Approximate, as of August 2026',
    'footer.source': 'Source of this site',
  },
  uk: {
    'nav.groundwork': 'Groundwork',
    'nav.work': 'Роботи',
    'nav.about': 'Про мене',
    'nav.cv': 'Резюме',
    'nav.primary': 'Основна',
    'skip.content': 'Перейти до вмісту',
    'theme.toggle': 'Тема',
    'theme.toLight': 'Світла',
    'theme.toDark': 'Темна',
    'home.selectedWork': 'Вибрані роботи',
    'home.capabilities': 'Карта компетенцій',
    'home.howIWork': 'Як я працюю',
    'home.contact': 'Контакти',
    'case.context': 'Контекст',
    'case.constraint': 'Обмеження',
    'case.decision': 'Рішення',
    'case.chosen': 'Що обрано',
    'case.rejected': 'Що відхилено',
    'case.tradeoff': 'Компроміс',
    'case.subtle': 'Неочевидна частина',
    'case.outcome': 'Результат',
    'case.stack': 'Стек',
    'meta.asOf': 'Приблизно, станом на серпень 2026',
    'footer.source': 'Вихідний код цього сайту',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)['en'];

/** Translate for a locale, falling back to English rather than to a blank. */
export function useTranslations(locale: Locale) {
  return function t(key: UIKey): string {
    return ui[locale][key] ?? ui[DEFAULT_LOCALE][key];
  };
}

/** Build a path in the given locale. English lives at the root. */
export function localePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return locale === DEFAULT_LOCALE ? clean : `/${locale}${clean === '/' ? '' : clean}`;
}
