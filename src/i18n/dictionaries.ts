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
    'site.name': 'Max Yastremskyi',
    'site.nameFirst': 'Max',
    'site.nameLast': 'Yastremskyi',
    'site.location': 'Ukraine',
    'site.experience': '6+ years',
    'site.markets': 'Israel · Ukraine',
    'home.caps.title': 'What I do',
    'home.caps.prose':
      'Grouped honestly. No percentages — a bar chart of skills tells a reader nothing they can verify.',
    'home.how.title': 'Three rules',
    'home.how.prose': 'They are not aspirations. They are what the tooling enforces.',
    'home.contact.title': 'Available',
    'home.contact.prose':
      'Open to Senior Backend and Tech Lead roles — {availability}. I have worked the Israeli and Ukrainian markets, including Hebrew and right-to-left products.',
    'home.elsewhere': 'Elsewhere',
    'site.availability': 'Remote worldwide · relocation · available at two weeks’ notice',
    'caps.backend': 'Backend & platform',
    'caps.money': 'Money & correctness',
    'caps.ai': 'Applied AI in production',
    'caps.integration': 'Integration & reliability',
    'caps.rendering': 'Hard rendering & data',
    'caps.lead': 'How I lead',
    'principle.ground.title': 'Ground it, don’t guess it.',
    'principle.ground.body':
      'What an external provider does is confirmed against its official documentation with a citation, or marked unknown and proven in a sandbox. A plausible answer about someone else’s API is the most expensive kind of wrong.',
    'principle.spec.title': 'The spec is the cheap place to be wrong.',
    'principle.spec.body':
      'Discovery is wide; the change is narrow. One task in three never reaches code because the discussion showed it was mis-scoped, already solved, or cheaper without development.',
    'principle.claim.title': 'A claim is not evidence.',
    'principle.claim.body':
      'Tests, static analysis and contract checks run as gates rather than as good intentions. “It works” gets challenged by a reviewer whose only job is to try to refute it.',
    'home.meta':
      'Senior backend engineer and tech lead. Payments, order lifecycles and production workflows — plus Groundwork, an open-source platform that makes AI-assisted engineering verifiable.',
    'home.positioning': 'Positioning',
    'home.lede':
      'I own the parts of a system that <b>must not be approximately right</b> — money, orders, production workflows — and I build the tooling that proves the work was actually done.',
    'home.facts': 'Facts',
    'home.facts.stack': 'Stack',
    'home.facts.data': 'Data',
    'home.facts.based': 'Based',
    'home.facts.openTo': 'Open to',
    'home.facts.markets': 'Markets',
    'home.facts.languages': 'Languages',
    'home.cta.email': 'Email me',
    'home.cta.repo': 'Groundwork on GitHub',
    'home.gw.label': 'Open source · {licence} · the flagship',
    'home.gw.prose':
      'A Claude Code plugin that makes verification part of the development process instead of leaving it to the human.',
    'home.gw.quote':
      '“An agent will happily write plausible code and just as happily report that it is done. Groundwork makes the checking part of the process.”',
    'home.stats.codebases': 'production codebases',
    'home.stats.runs': 'procedure runs',
    'home.stats.specs': 'written specs',
    'home.stats.handoffs': 'frontend hand-offs',
    'home.stats.stopped': 'stopped before code',
    'home.work.title': 'Four decisions',
    'home.work.prose':
      'Not feature lists. Each records the constraint, what was chosen over what, and the detail a mid-level engineer would have got wrong.',
    'home.work.gwSummary':
      'Risk-based task classification L0–L4, {agents} specialised review agents, {gates} automated gates and {procedures} workflow procedures, shipped under {licence}.',
    'home.work.gwSubtle':
      'Roughly one task in three is stopped before any code is written — mis-scoped, conflicting with existing behaviour, or cheaper to solve without development.',
    'home.subtle': 'The subtle part',
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
    'site.name': 'Макс Ястремський',
    'site.nameFirst': 'Макс',
    'site.nameLast': 'Ястремський',
    'site.location': 'Україна',
    'site.experience': '6+ років',
    'site.markets': 'Ізраїль · Україна',
    'home.caps.title': 'Що я роблю',
    'home.caps.prose':
      'Згруповано чесно. Без відсотків — стовпчик «навички на 80%» не каже читачеві нічого, що він міг би перевірити.',
    'home.how.title': 'Три правила',
    'home.how.prose': 'Це не наміри. Це те, що примусово перевіряють інструменти.',
    'home.contact.title': 'Відкритий до роботи',
    'home.contact.prose':
      'Розглядаю позиції Senior Backend і Tech Lead — {availability}. Працював на ізраїльському та українському ринках, зокрема з івритом і продуктами з письмом справа наліво.',
    'home.elsewhere': 'Де ще',
    'site.availability': 'Віддалено з будь-якої точки · релокація · готовий вийти за два тижні',
    'caps.backend': 'Бекенд і платформа',
    'caps.money': 'Гроші й коректність',
    'caps.ai': 'Прикладний AI у продакшні',
    'caps.integration': 'Інтеграції та надійність',
    'caps.rendering': 'Складний рендеринг і дані',
    'caps.lead': 'Як я веду команду',
    'principle.ground.title': 'Заземлюй, а не вгадуй.',
    'principle.ground.body':
      'Те, що робить зовнішній сервіс, підтверджується його офіційною документацією з посиланням — або позначається як невідоме й доводиться в пісочниці. Правдоподібна відповідь про чужий API — найдорожчий різновид помилки.',
    'principle.spec.title': 'Специфікація — дешеве місце помилитися.',
    'principle.spec.body':
      'Дослідження широке; зміна вузька. Кожна третя задача не доходить до коду, бо обговорення показало: вона неправильно окреслена, вже вирішена або дешевша без розробки.',
    'principle.claim.title': 'Твердження — це не доказ.',
    'principle.claim.body':
      'Тести, статичний аналіз і перевірки контрактів працюють як гейти, а не як добрі наміри. «Воно працює» перевіряє рецензент, єдине завдання якого — спробувати це спростувати.',
    'home.meta':
      'Senior backend engineer і tech lead. Платежі, життєвий цикл замовлень і виробничі процеси — а також Groundwork, платформа з відкритим кодом, яка робить AI-асистовану розробку перевірюваною.',
    'home.positioning': 'Позиціювання',
    'home.lede':
      'За мною ті частини системи, які <b>не можна зробити приблизно правильно</b> — гроші, замовлення, виробничі процеси, — і я будую інструменти, які доводять, що роботу справді зроблено.',
    'home.facts': 'Факти',
    'home.facts.stack': 'Стек',
    'home.facts.data': 'Дані',
    'home.facts.based': 'Локація',
    'home.facts.openTo': 'Відкритий до',
    'home.facts.markets': 'Ринки',
    'home.facts.languages': 'Мови',
    'home.cta.email': 'Написати мені',
    'home.cta.repo': 'Groundwork на GitHub',
    'home.gw.label': 'Відкритий код · {licence} · флагман',
    'home.gw.prose':
      'Плагін для Claude Code, який робить перевірку частиною процесу розробки, а не залишає її людині.',
    'home.gw.quote':
      '«Агент охоче напише правдоподібний код і так само охоче відзвітує, що все готово. Groundwork робить перевірку частиною процесу.»',
    'home.stats.codebases': 'кодових баз у продакшні',
    'home.stats.runs': 'запусків процедур',
    'home.stats.specs': 'написаних специфікацій',
    'home.stats.handoffs': 'передач фронтенду',
    'home.stats.stopped': 'зупинено до коду',
    'home.work.title': 'Чотири рішення',
    'home.work.prose':
      'Не переліки можливостей. Кожен запис фіксує обмеження, що обрано замість чого, і ту деталь, яку middle-інженер зробив би неправильно.',
    'home.work.gwSummary':
      'Класифікація задач за ризиком L0–L4, {agents} спеціалізованих review-агентів, {gates} автоматичних гейтів і {procedures} процедур робочого процесу, під ліцензією {licence}.',
    'home.work.gwSubtle':
      'Приблизно кожну третю задачу зупиняють до того, як написано хоч рядок коду: неправильно окреслена, конфліктує з наявною поведінкою або дешевше вирішується без розробки.',
    'home.subtle': 'Неочевидна частина',
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
