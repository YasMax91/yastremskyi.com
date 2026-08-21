/**
 * The UI dictionaries — data only, and deliberately importing nothing.
 *
 * Split from ui.ts so that `scripts/i18n.mjs` can read the dictionaries without
 * pulling in the generated allow-list that the same script writes. That cycle is
 * not hypothetical: it broke the review gate the first time, and on a fresh
 * clone it would break the build before the file that fixes it could be made.
 *
 * English ships. Ukrainian is drafted here and rendered only once Max has signed
 * it off in docs/i18n-review.md — see useTranslations in ui.ts.
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
    'nav.language': 'Language',
    'nav.inEnglish': 'This page is in English',
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
    'content.englishOnly': 'This piece has not been translated yet — the text below is in English.',
    'meta.asOf': 'Approximate, as of August 2026',
    'thanks.title': 'Message sent',
    'thanks.meta': 'Your message reached me.',
    'thanks.label': 'Sent',
    'thanks.heading': 'Thank you',
    'thanks.lede':
      'Your message reached my inbox. I answer everything that is not a mass mailing, usually within a day or two.',
    'thanks.home': 'Back to the start',
    'thanks.work': 'Selected work',
    'footer.source': 'Source of this site',
    'footer.status': 'Status',
  },
  uk: {
    'nav.groundwork': 'Groundwork',
    'nav.work': 'Роботи',
    'nav.about': 'Про мене',
    'nav.cv': 'Резюме',
    'nav.primary': 'Основна',
    'nav.language': 'Мова',
    'nav.inEnglish': 'Ця сторінка англійською',
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
    'content.englishOnly': 'Цей матеріал ще не перекладено — текст нижче англійською.',
    'meta.asOf': 'Приблизно, станом на серпень 2026',
    'thanks.title': 'Повідомлення надіслано',
    'thanks.meta': 'Ваше повідомлення дійшло.',
    'thanks.label': 'Надіслано',
    'thanks.heading': 'Дякую',
    'thanks.lede':
      'Повідомлення дійшло до поштової скриньки. Відповідь приходить на все, що не є масовою розсилкою, зазвичай протягом одного-двох днів.',
    'thanks.home': 'На початок',
    'thanks.work': 'Вибрані роботи',
    'footer.source': 'Вихідний код цього сайту',
    'footer.status': 'Стан',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UIKey = keyof (typeof ui)['en'];
