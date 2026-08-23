# Ukrainian review

Everything below is a draft written by the agent and **not yet on the site**. The
site renders English for every line that is not ticked here, so an unread
translation cannot reach a visitor.

Tick a line when the Ukrainian reads the way you would have written it. Change
the Ukrainian in place if it does not — editing the text here is the point of the
file, not a workaround. Then run:

```bash
npm run i18n
```

which records what you signed and regenerates the allow-list the site imports.
Rewritten lines are **reported, not applied** — it prints them and the agent
copies them into the dictionary, because a script that rewrites source files from
a markdown table is a script that will one day rewrite the wrong one.

Two things worth knowing. A line you tick is signed against **those exact
words**: if the English later changes, the tick comes off by itself and the line
comes back here, because the approval was for a sentence that no longer exists.
And a translation identical to its English — `Groundwork` — never appears here;
there is nothing for a native speaker to judge.

**Progress: 352 of 352 signed.**

---

- [x] `uk:about.career.label`
  - **EN** Career
  - **UK** Кар’єра

- [x] `uk:about.career.lead`
  - **EN** Employers are named. Clients are not — three of the four case studies sit under NDA, and none of them is tied to a period or a company here.
  - **UK** Роботодавці названі. Клієнти — ні: три з чотирьох кейсів під NDA, і жоден із них тут не прив’язаний ні до періоду, ні до компанії.

- [x] `uk:about.career.title`
  - **EN** Where the work happened
  - **UK** Де відбувалася робота

- [x] `uk:about.label`
  - **EN** About
  - **UK** Про мене

- [x] `uk:about.lang.label`
  - **EN** Languages
  - **UK** Мови

- [x] `uk:about.lang.note`
  - **EN** Working language on a team is English. Documentation, specs, commit messages and API contracts are written in English regardless of who is reading them, because the next person to open the repository may not share a first language with anyone currently on it.
  - **UK** Робоча мова в команді — англійська. Документація, специфікації, повідомлення комітів і контракти API пишуться англійською незалежно від того, хто їх читає: наступна людина, яка відкриє репозиторій, може не мати спільної рідної мови ні з ким із нинішньої команди.

- [x] `uk:about.lang.title`
  - **EN** How I communicate
  - **UK** Як я спілкуюся

- [x] `uk:about.lead.label`
  - **EN** Leading
  - **UK** Керування

- [x] `uk:about.lead.lead`
  - **EN** Mostly by making the standard checkable, so it survives the week I am not looking.
  - **UK** Здебільшого тим, що роблю стандарт перевірюваним — щоб він пережив тиждень, коли я не дивлюся.

- [x] `uk:about.lead.p1`
  - **EN** I set the engineering standards and the Definition of Done, and then I put them in tooling rather than in a wiki page. Groundwork exists because a review checklist that lives in somebody’s head is a checklist that gets skipped under deadline — and because an AI agent will report success with exactly the same confidence whether or not it succeeded.
  - **UK** Я задаю інженерні стандарти й визначення готовності, а потім кладу їх в інструменти, а не на сторінку у вікі. Groundwork існує тому, що чекліст перевірки, який живе в чиїйсь голові, — це чекліст, який пропускають під дедлайн, і тому, що AI-агент відзвітує про успіх з абсолютно тією самою впевненістю, незалежно від того, чи був той успіх.

- [x] `uk:about.lead.p2`
  - **EN** The part that took longest to learn is that the process has to scale down. A typo and a change to how VAT is calculated do not deserve the same ceremony, and applying the heavy version to everything is how a process stops being used at all.
  - **UK** Найдовше довелося вчитися того, що процес має вміти зменшуватися. Одруківка і зміна в нарахуванні ПДВ не заслуговують однакової церемонії, а застосування важкої версії до всього — це те, як процес перестають використовувати взагалі.

- [x] `uk:about.lead.title`
  - **EN** How I run a team
  - **UK** Як я веду команду

- [x] `uk:about.lede`
  - **EN** Six years of backend work, most of it on systems where a wrong answer costs somebody money.
  - **UK** Шість років бекенд-розробки, здебільшого в системах, де неправильна відповідь коштує комусь грошей.

- [x] `uk:about.markets.il`
  - **EN** The Israeli work meant Hebrew and right-to-left products, Israeli fintech and accounting systems, and telephony that has to speak to people rather than at them. Right-to-left is where most implementations quietly break: text has to be passed in logical order, because reordering happens per display line <em>after</em> wrapping — a paragraph reversed in advance reads bottom-up the moment it wraps.
  - **UK** Ізраїльська робота означала іврит і продукти з письмом справа наліво, ізраїльський фінтех і бухгалтерські системи, а також телефонію, яка має говорити з людьми, а не до них. Письмо справа наліво — саме те місце, де більшість реалізацій тихо ламається: текст треба передавати в логічному порядку, бо перевпорядкування відбувається порядково <em>після</em> перенесення. Абзац, розвернутий заздалегідь, читається знизу вгору тієї миті, як його перенесе.

- [x] `uk:about.markets.label`
  - **EN** Markets
  - **UK** Ринки

- [x] `uk:about.markets.lead`
  - **EN** Two markets with very different assumptions, which is most of why the work got interesting.
  - **UK** Два ринки з дуже різними припущеннями — здебільшого саме тому робота й стала цікавою.

- [x] `uk:about.markets.title`
  - **EN** Israel and Ukraine
  - **UK** Ізраїль та Україна

- [x] `uk:about.markets.ua`
  - **EN** The Ukrainian work was commerce and integration at volume: catalogue sync with an ERP, local payment and delivery providers, and platforms cloned per market without forking the codebase.
  - **UK** Українська робота — це комерція та інтеграції на обсязі: синхронізація каталогу з ERP, локальні платіжні служби й служби доставки, платформи, клоновані під кожен ринок без форку кодової бази.

- [x] `uk:about.meta`
  - **EN** Six years of backend work across the Israeli and Ukrainian markets — payments, order lifecycles, production workflows — and the tooling built to keep AI-assisted engineering honest.
  - **UK** Шість років бекенд-розробки на ізраїльському та українському ринках — платежі, життєвий цикл замовлень, виробничі процеси — і інструменти, які тримають AI-асистовану розробку чесною.

- [x] `uk:about.next.body`
  - **EN** Payments, order lifecycles, production workflows, applied AI that has to survive contact with production — those are the problems I am good at and the ones I want more of. Remote worldwide, or relocation. {notice}.
  - **UK** Платежі, життєвий цикл замовлень, виробничі процеси, прикладний AI, який має вижити при зустрічі з продакшном, — це задачі, у яких я добрий і яких хочу більше. Віддалено з будь-якої точки або релокація. {notice}.

- [x] `uk:about.next.label`
  - **EN** Next
  - **UK** Далі

- [x] `uk:about.next.lead`
  - **EN** A Senior Backend or Tech Lead role on a product with real domain weight.
  - **UK** Позиції Senior Backend або Tech Lead у продукті з реальною вагою домену.

- [x] `uk:about.next.title`
  - **EN** What I want next
  - **UK** Чого я хочу далі

- [x] `uk:about.readCv`
  - **EN** Read the CV
  - **UK** Прочитати резюме

- [x] `uk:about.title`
  - **EN** The person
  - **UK** Людина

- [x] `uk:cap.accountingandtaxexport`
  - **EN** Accounting and tax export
  - **UK** Бухгалтерський і податковий експорт

- [x] `uk:cap.adversarialverificatio`
  - **EN** Adversarial verification
  - **UK** Змагальна перевірка

- [x] `uk:cap.blastradiusdiscoverybe`
  - **EN** Blast-radius discovery before planning
  - **UK** Картографування радіуса ураження до планування

- [x] `uk:cap.cielabcolourclassifica`
  - **EN** CIE-Lab colour classification
  - **UK** Класифікація кольору в CIE-Lab

- [x] `uk:cap.decimalmoneywithbcmath`
  - **EN** Decimal money with bcmath
  - **UK** Десяткові гроші через bcmath

- [x] `uk:cap.deliverystatuswebhooks`
  - **EN** Delivery-status webhooks
  - **UK** Вебхуки статусу доставки

- [x] `uk:cap.driverfallbackchains`
  - **EN** Driver fallback chains
  - **UK** Ланцюжки запасних драйверів

- [x] `uk:cap.ffmpegandimagickpipeli`
  - **EN** FFmpeg and Imagick pipelines
  - **UK** Конвеєри на FFmpeg та Imagick

- [x] `uk:cap.frontendwhenitisinthew`
  - **EN** Frontend when it is in the way: Vue, React, TypeScript
  - **UK** Фронтенд, коли він стоїть на шляху: Vue, React, TypeScript

- [x] `uk:cap.hebrewrtlandbidipdf`
  - **EN** Hebrew RTL and bidi PDF
  - **UK** Іврит, письмо справа наліво і двонапрямні PDF

- [x] `uk:cap.idempotencykeys`
  - **EN** Idempotency keys
  - **UK** Ключі ідемпотентності

- [x] `uk:cap.integrationhealthprobe`
  - **EN** Integration health-probe registry
  - **UK** Реєстр перевірок стану інтеграцій

- [x] `uk:cap.microservices`
  - **EN** Microservices
  - **UK** Мікросервіси

- [x] `uk:cap.multicurrencyandvat`
  - **EN** Multi-currency and VAT
  - **UK** Мультивалютність і ПДВ

- [x] `uk:cap.oauth2machinetomachine`
  - **EN** OAuth2 machine-to-machine
  - **UK** OAuth2 між сервісами

- [x] `uk:cap.ocrbymorphologicalgrid`
  - **EN** OCR by morphological grid extraction
  - **UK** OCR через морфологічне виділення сітки

- [x] `uk:cap.openapicontractskeptcu`
  - **EN** OpenAPI contracts kept current
  - **UK** Контракти OpenAPI, що не відстають

- [x] `uk:cap.pcicardtokenization`
  - **EN** PCI card tokenization
  - **UK** Токенізація карток за PCI

- [x] `uk:cap.percallcostaccounting`
  - **EN** Per-call cost accounting
  - **UK** Облік вартості кожного виклику

- [x] `uk:cap.promptinjectiondefence`
  - **EN** Prompt-injection defence
  - **UK** Захист від ін’єкцій у промпт

- [x] `uk:cap.providerabstractionand`
  - **EN** Provider abstraction and fallback
  - **UK** Абстракція провайдерів і запасний шлях

- [x] `uk:cap.queuedjobchains`
  - **EN** Queued job chains
  - **UK** Ланцюжки задач у черзі

- [x] `uk:cap.recurringbillingdirect`
  - **EN** Recurring billing, direct debit
  - **UK** Регулярні списання, прямий дебет

- [x] `uk:cap.responseregressiontest`
  - **EN** Response-regression tests
  - **UK** Регресійні тести відповідей

- [x] `uk:cap.schemaconstrainedextra`
  - **EN** Schema-constrained extraction
  - **UK** Вилучення, обмежене схемою

- [x] `uk:cap.serversiderbac`
  - **EN** Server-side RBAC
  - **UK** RBAC на боці сервера

- [x] `uk:cap.specdrivendevelopment`
  - **EN** Spec-driven development
  - **UK** Розробка від специфікації

- [x] `uk:cap.toolcallingwithoutauto`
  - **EN** Tool calling without auto-execution
  - **UK** Виклик інструментів без автовиконання

- [x] `uk:cap.typotolerantsearchandr`
  - **EN** Typo-tolerant search and ranking
  - **UK** Пошук і ранжування з допуском одруківок

- [x] `uk:caps.ai`
  - **EN** Applied AI in production
  - **UK** Прикладний AI у продакшні

- [x] `uk:caps.backend`
  - **EN** Backend & platform
  - **UK** Бекенд і платформа

- [x] `uk:caps.integration`
  - **EN** Integration & reliability
  - **UK** Інтеграції та надійність

- [x] `uk:caps.lead`
  - **EN** How I lead
  - **UK** Як я веду команду

- [x] `uk:caps.money`
  - **EN** Money & correctness
  - **UK** Гроші й коректність

- [x] `uk:caps.rendering`
  - **EN** Hard rendering & data
  - **UK** Складний рендеринг і дані

- [x] `uk:case.allFour`
  - **EN** All four decisions
  - **UK** Усі чотири рішення

- [x] `uk:case.chosen`
  - **EN** What was chosen
  - **UK** Що обрано

- [x] `uk:case.constraint`
  - **EN** The constraint
  - **UK** Обмеження

- [x] `uk:case.context`
  - **EN** Context
  - **UK** Контекст

- [x] `uk:case.decision`
  - **EN** The decision
  - **UK** Рішення

- [x] `uk:case.emailAbout`
  - **EN** Ask me about this one
  - **UK** Запитати мене про це

- [x] `uk:case.outcome`
  - **EN** Outcome
  - **UK** Результат

- [x] `uk:case.rejected`
  - **EN** What was rejected
  - **UK** Що відхилено

- [x] `uk:case.stack`
  - **EN** Stack
  - **UK** Стек

- [x] `uk:case.subtle`
  - **EN** The subtle part
  - **UK** Неочевидна частина

- [x] `uk:case.tradeoff`
  - **EN** The trade-off
  - **UK** Компроміс

- [x] `uk:content:notes/colour-space-ocr`
  - **File** `src/content/notes/uk/colour-space-ocr.md` — read it there and edit it there;
    it is 485 words of prose, not a table row.

- [x] `uk:content:work/multi-market-commerce`
  - **File** `src/content/work/uk/multi-market-commerce.md` — read it there and edit it there;
    it is 385 words of prose, not a table row.

- [x] `uk:content:work/payments-and-clearing`
  - **File** `src/content/work/uk/payments-and-clearing.md` — read it there and edit it there;
    it is 368 words of prose, not a table row.

- [x] `uk:content:work/voice-to-structured-data`
  - **File** `src/content/work/uk/voice-to-structured-data.md` — read it there and edit it there;
    it is 395 words of prose, not a table row.

- [x] `uk:content.englishOnly`
  - **EN** This piece has not been translated yet — the text below is in English.
  - **UK** Цей матеріал ще не перекладено — текст нижче англійською.

- [x] `uk:footer.source`
  - **EN** Source of this site
  - **UK** Вихідний код цього сайту

- [x] `uk:footer.status`
  - **EN** Status
  - **UK** Стан

- [x] `uk:form.email`
  - **EN** Email
  - **UK** Пошта

- [x] `uk:form.honeypot`
  - **EN** Company — leave this empty
  - **UK** Компанія — залиште порожнім

- [x] `uk:form.message`
  - **EN** Message
  - **UK** Повідомлення

- [x] `uk:form.name`
  - **EN** Your name
  - **UK** Ваше ім’я

- [x] `uk:form.networkError`
  - **EN** The message could not be sent — the network refused. Email me directly and I will see it.
  - **UK** Повідомлення не вдалося надіслати — мережа відмовила. Напишіть мені поштою, і я побачу.

- [x] `uk:form.orWrite`
  - **EN** Or write directly to
  - **UK** Або напишіть напряму на

- [x] `uk:form.privacy`
  - **EN** The message goes to my own server and is sent on to my inbox. It is not stored, there is no tracking on this page, and nobody else sees it.
  - **UK** Повідомлення йде на мій власний сервер і пересилається до моєї поштової скриньки. Воно не зберігається, на цій сторінці немає жодного стеження, і ніхто інший його не бачить.

- [x] `uk:form.send`
  - **EN** Send
  - **UK** Надіслати

- [x] `uk:form.sending`
  - **EN** Sending…
  - **UK** Надсилаємо…

- [x] `uk:gs.access.gist`
  - **EN** Permissions, migrations, public contracts, financial visibility. Here the intent gets challenged, not only the code.
  - **UK** Права доступу, міграції, публічні контракти, видимість фінансових даних. Тут під сумнів ставлять намір, а не лише код.

- [x] `uk:gs.access.kind`
  - **EN** Access
  - **UK** Доступи

- [x] `uk:gs.access.level`
  - **EN** L3 — High risk
  - **UK** L3 — Високий ризик

- [x] `uk:gs.access.req1`
  - **EN** Spec, plan, requirements check, deployment notes
  - **UK** Специфікація, план, звірка вимог, нотатки до розгортання

- [x] `uk:gs.access.req2`
  - **EN** Up to 4 rounds of questions
  - **UK** До 4 раундів запитань

- [x] `uk:gs.access.req3`
  - **EN** An ADR when the decision is cross-cutting
  - **UK** ADR, коли рішення наскрізне

- [x] `uk:gs.access.task`
  - **EN** Change who can see supplier prices
  - **UK** Змінити, хто бачить закупівельні ціни

- [x] `uk:gs.bug.empty`
  - **EN** No agents — a targeted self-trace instead.
  - **UK** Без агентів — натомість точкове самотрасування.

- [x] `uk:gs.bug.gist`
  - **EN** A regression test that fails first, then one live exercise of the single thing fixed — not a sweep of every consumer.
  - **UK** Регресійний тест, який спершу падає, потім одна жива перевірка саме того, що виправлено, — а не обхід усіх споживачів.

- [x] `uk:gs.bug.kind`
  - **EN** Bug
  - **UK** Баг

- [x] `uk:gs.bug.level`
  - **EN** L1 — Small fix
  - **UK** L1 — Невелике виправлення

- [x] `uk:gs.bug.req1`
  - **EN** Short inline spec
  - **UK** Коротка вбудована специфікація

- [x] `uk:gs.bug.req2`
  - **EN** Fail-first regression test
  - **UK** Регресійний тест, який падає першим

- [x] `uk:gs.bug.req3`
  - **EN** Live check of the one thing fixed
  - **UK** Жива перевірка того єдиного, що виправлено

- [x] `uk:gs.bug.task`
  - **EN** Wrong subject line on a notification email
  - **UK** Неправильна тема в листі-сповіщенні

- [x] `uk:gs.chooseTask`
  - **EN** Choose a task
  - **UK** Оберіть задачу

- [x] `uk:gs.feature.gist`
  - **EN** Discovery fans out before anything is planned. The blast radius is mapped, not assumed, and nothing is written before the plan is agreed.
  - **UK** Дослідження розходиться вшир ще до планування. Радіус ураження картографують, а не припускають, і нічого не пишуть до узгодження плану.

- [x] `uk:gs.feature.kind`
  - **EN** Feature
  - **UK** Функціональність

- [x] `uk:gs.feature.level`
  - **EN** L2 — Feature
  - **UK** L2 — Функціональність

- [x] `uk:gs.feature.req1`
  - **EN** Spec, plan, approval
  - **UK** Специфікація, план, погодження

- [x] `uk:gs.feature.req2`
  - **EN** Up to 2 rounds of questions
  - **UK** До 2 раундів запитань

- [x] `uk:gs.feature.req3`
  - **EN** Tests written before the code
  - **UK** Тести, написані до коду

- [x] `uk:gs.feature.task`
  - **EN** Add an orders export endpoint
  - **UK** Додати ендпоінт експорту замовлень

- [x] `uk:gs.gate.analysis`
  - **EN** static analysis
  - **UK** статичний аналіз

- [x] `uk:gs.gate.contract`
  - **EN** agent contract
  - **UK** контракт агента

- [x] `uk:gs.gate.coverage`
  - **EN** coverage claim
  - **UK** заявлене покриття

- [x] `uk:gs.gate.edits`
  - **EN** edits locked in discovery
  - **UK** правки заблоковано під час дослідження

- [x] `uk:gs.gate.format`
  - **EN** format on edit
  - **UK** форматування при редагуванні

- [x] `uk:gs.gate.intent`
  - **EN** task intent
  - **UK** намір задачі

- [x] `uk:gs.gate.migrations`
  - **EN** migrations locked
  - **UK** міграції заблоковано

- [x] `uk:gs.gate.openapi`
  - **EN** OpenAPI contract
  - **UK** контракт OpenAPI

- [x] `uk:gs.gate.runner`
  - **EN** enforced runner
  - **UK** примусовий runner

- [x] `uk:gs.gate.tests`
  - **EN** test suite
  - **UK** набір тестів

- [x] `uk:gs.gate.unpushed`
  - **EN** unpushed work
  - **UK** незапушена робота

- [x] `uk:gs.gatesLabel`
  - **EN** Gates — armed at every level, including L0
  - **UK** Гейти — увімкнені на кожному рівні, зокрема на L0

- [x] `uk:gs.gatesNote`
  - **EN** Process weight scales with risk. The gates do not — that is the point.
  - **UK** Вага процесу росте з ризиком. Гейти — ні, і в цьому суть.

- [x] `uk:gs.money.gist`
  - **EN** Financial calculation, order lifecycle, the permission model, destructive migrations. Being approximately right here is being wrong.
  - **UK** Фінансові розрахунки, життєвий цикл замовлення, модель прав, руйнівні міграції. Бути приблизно правим тут означає бути неправим.

- [x] `uk:gs.money.kind`
  - **EN** Money
  - **UK** Гроші

- [x] `uk:gs.money.level`
  - **EN** L4 — Critical
  - **UK** L4 — Критично

- [x] `uk:gs.money.req1`
  - **EN** Everything L3 requires
  - **UK** Усе, що вимагає L3

- [x] `uk:gs.money.req2`
  - **EN** Rollback notes
  - **UK** Нотатки щодо відкату

- [x] `uk:gs.money.req3`
  - **EN** Human approval, always
  - **UK** Погодження людиною, завжди

- [x] `uk:gs.money.task`
  - **EN** Change how VAT is calculated on refunds
  - **UK** Змінити нарахування ПДВ при поверненнях

- [x] `uk:gs.role.blindspot`
  - **EN** what nobody thought to ask
  - **UK** про що ніхто не здогадався спитати

- [x] `uk:gs.role.break`
  - **EN** what will this break
  - **UK** що це зламає

- [x] `uk:gs.role.conformance`
  - **EN** does the diff satisfy the criteria
  - **UK** чи задовольняє diff критерії

- [x] `uk:gs.role.everythingL3`
  - **EN** Everything L3 engages
  - **UK** Усе, що вмикає L3

- [x] `uk:gs.role.grounded`
  - **EN** what the provider actually does, cited
  - **UK** що насправді робить провайдер, з посиланням

- [x] `uk:gs.role.panel`
  - **EN** An adversarial panel
  - **UK** Змагальна панель

- [x] `uk:gs.role.panelRole`
  - **EN** at least two independent skeptics on the riskiest claims
  - **UK** щонайменше двоє незалежних скептиків на найризикованіших твердженнях

- [x] `uk:gs.role.verify`
  - **EN** is “it works” true
  - **UK** чи правда, що «воно працює»

- [x] `uk:gs.sub`
  - **EN** Zero JavaScript — radio inputs and CSS. Keyboard: Tab into the group, then arrow keys. Works with scripting disabled.
  - **UK** Нуль JavaScript — radio-поля і CSS. З клавіатури: Tab у групу, далі стрілки. Працює з вимкненими скриптами.

- [x] `uk:gs.title`
  - **EN** Pick a task. Watch the process resize.
  - **UK** Оберіть задачу. Подивіться, як змінюється процес.

- [x] `uk:gs.typo.empty`
  - **EN** Nobody — and that is deliberate.
  - **UK** Ніхто — і це навмисно.

- [x] `uk:gs.typo.gist`
  - **EN** No spec. No plan. No review agents. No approval. The automatic gates are the entire Definition of Done.
  - **UK** Без специфікації. Без плану. Без review-агентів. Без погодження. Автоматичні гейти і є повне визначення готовності.

- [x] `uk:gs.typo.kind`
  - **EN** Typo
  - **UK** Одруківка

- [x] `uk:gs.typo.level`
  - **EN** L0 — Tiny
  - **UK** L0 — Дрібниця

- [x] `uk:gs.typo.req1`
  - **EN** The gates that fire on their own
  - **UK** Гейти, які спрацьовують самі

- [x] `uk:gs.typo.task`
  - **EN** Fix a typo in a code comment
  - **UK** Виправити одруківку в коментарі до коду

- [x] `uk:gs.whatRequired`
  - **EN** What is required
  - **UK** Що потрібно

- [x] `uk:gs.whoReviews`
  - **EN** Who reviews
  - **UK** Хто перевіряє

- [x] `uk:gw.a1.body`
  - **EN** What will this break? Traces outward from every touched symbol — callers, events, listeners, jobs, scheduled commands, policies, cascade relationships, and the tests covering any of it.
  - **UK** Що це зламає? Трасує назовні від кожного зачепленого символа — ті, хто викликає, події, слухачі, задачі, заплановані команди, політики, каскадні зв’язки і тести, які це покривають.

- [x] `uk:gw.a2.body`
  - **EN** What did nobody think to ask? Predicts the omitted dimension rather than the existing coupling: unintended consequences, missing requirements, the domain angle the requester is not the expert in.
  - **UK** Про що ніхто не здогадався спитати? Передбачає пропущений вимір, а не наявний зв’язок: неочікувані наслідки, відсутні вимоги, доменний кут, у якому замовник не є експертом.

- [x] `uk:gw.a3.body`
  - **EN** What does the provider actually do? Reads the official documentation and returns findings that each carry a source, or are marked unknown. It is not allowed to guess instead of check.
  - **UK** Що насправді робить провайдер? Читає офіційну документацію і повертає висновки, кожен із джерелом або позначений як невідомий. Йому не дозволено вгадувати замість перевіряти.

- [x] `uk:gw.a4.body`
  - **EN** Is the “it works” claim true? Tries to refute it against real code, official docs and sandbox results. Defaults to skeptical.
  - **UK** Чи правдиве твердження «воно працює»? Намагається спростувати його на реальному коді, офіційній документації та результатах у пісочниці. За замовчуванням налаштований скептично.

- [x] `uk:gw.a5.body`
  - **EN** Does the diff satisfy the acceptance criteria that were agreed? Judges implementation against spec in a fresh context, and reports gaps rather than style.
  - **UK** Чи задовольняє diff узгоджені критерії приймання? Оцінює реалізацію проти специфікації у свіжому контексті й повідомляє про прогалини, а не про стиль.

- [x] `uk:gw.adoption.label`
  - **EN** Adoption
  - **UK** Використання

- [x] `uk:gw.adoption.lead`
  - **EN** Numbers are approximate and point-in-time, which is why they carry a date.
  - **UK** Числа приблизні й на момент часу — саме тому вони мають дату.

- [x] `uk:gw.adoption.title`
  - **EN** In daily use, not in a demo
  - **UK** У щоденній роботі, а не в демо

- [x] `uk:gw.askAbout`
  - **EN** Ask me about it
  - **UK** Запитати мене про це

- [x] `uk:gw.author`
  - **EN** Author
  - **UK** Автор

- [x] `uk:gw.design.label`
  - **EN** The design
  - **UK** Будова

- [x] `uk:gw.design.lead`
  - **EN** A typo and a change to how VAT is calculated do not deserve the same ceremony. Applying the full process to everything is how a process stops being used — so the level decides what runs.
  - **UK** Одруківка і зміна в нарахуванні ПДВ не заслуговують однакової церемонії. Застосування повного процесу до всього — це те, як процес перестають використовувати, тож рівень вирішує, що саме запускається.

- [x] `uk:gw.design.title`
  - **EN** Weight scales with risk
  - **UK** Вага зростає з ризиком

- [x] `uk:gw.heroA`
  - **EN** An agent that is
  - **UK** Агент, якому

- [x] `uk:gw.heroB`
  - **EN** not allowed to say “done”
  - **UK** не дозволено сказати «готово»

- [x] `uk:gw.heroC`
  - **EN** until the work has been checked.
  - **UK** доки роботу не перевірено.

- [x] `uk:gw.install.label`
  - **EN** Install
  - **UK** Встановлення

- [x] `uk:gw.install.lead`
  - **EN** `init` derives thin, domain-only contracts from the code itself and labels anything it had to assume.
  - **UK** `init` виводить тонкі, суто доменні контракти з самого коду й позначає все, що довелося припустити.

- [x] `uk:gw.install.title`
  - **EN** Three lines
  - **UK** Три рядки

- [x] `uk:gw.l0.agents`
  - **EN** None
  - **UK** Немає

- [x] `uk:gw.l0.approval`
  - **EN** Not required
  - **UK** Не потрібне

- [x] `uk:gw.l0.covers`
  - **EN** Typo, comment, documentation
  - **UK** Одруківка, коментар, документація

- [x] `uk:gw.l1.agents`
  - **EN** None — a targeted self-trace
  - **UK** Немає — точкове самотрасування

- [x] `uk:gw.l1.approval`
  - **EN** Unless told to apply now
  - **UK** Якщо не сказано застосувати одразу

- [x] `uk:gw.l1.covers`
  - **EN** Small bug fix
  - **UK** Невелике виправлення бага

- [x] `uk:gw.l2.agents`
  - **EN** Impact map, conformance
  - **UK** Карта впливу, відповідність

- [x] `uk:gw.l2.approval`
  - **EN** Required
  - **UK** Потрібне

- [x] `uk:gw.l2.covers`
  - **EN** Normal feature
  - **UK** Звичайна функціональність

- [x] `uk:gw.l3.agents`
  - **EN** All five
  - **UK** Усі п’ять

- [x] `uk:gw.l3.approval`
  - **EN** Required
  - **UK** Потрібне

- [x] `uk:gw.l3.covers`
  - **EN** Permissions, migrations, public contracts, financial visibility
  - **UK** Права доступу, міграції, публічні контракти, видимість фінансових даних

- [x] `uk:gw.l4.agents`
  - **EN** All five, plus an adversarial panel
  - **UK** Усі п’ять і змагальна панель

- [x] `uk:gw.l4.approval`
  - **EN** Human, always
  - **UK** Людиною, завжди

- [x] `uk:gw.l4.covers`
  - **EN** Financial calculation, order lifecycle, the permission model, destructive migrations
  - **UK** Фінансові розрахунки, життєвий цикл замовлення, модель прав, руйнівні міграції

- [x] `uk:gw.licence`
  - **EN** Licence
  - **UK** Ліцензія

- [x] `uk:gw.meta`
  - **EN** An open-source Claude Code plugin that makes verification part of the development process: risk-based task classification L0–L4, five specialised review agents, and eleven gates.
  - **UK** Плагін для Claude Code з відкритим кодом, який робить перевірку частиною процесу розробки: класифікація задач за ризиком L0–L4, п’ять спеціалізованих review-агентів і одинадцять гейтів.

- [x] `uk:gw.numberBody`
  - **EN** Roughly one task in three never reaches code. Not because the tooling refused, but because writing the specification showed the request was mis-scoped, already solved elsewhere, or cheaper to handle without development at all.
  - **UK** Приблизно кожна третя задача не доходить до коду. Не тому, що інструмент відмовив, а тому, що написання специфікації показало: запит неправильно окреслений, уже вирішений деінде або дешевший у розв’язанні без розробки взагалі.

- [x] `uk:gw.numberTitle`
  - **EN** The number worth arguing about
  - **UK** Цифра, про яку варто сперечатися

- [x] `uk:gw.p1.body`
  - **EN** An agent asked what a payment provider returns will produce a confident, well-formatted, entirely invented answer. Groundwork requires a citation from official documentation, or a sandbox result — anything else is recorded as unknown rather than assumed.
  - **UK** Агент, у якого спитали, що повертає платіжний провайдер, видасть упевнену, добре відформатовану й цілком вигадану відповідь. Groundwork вимагає посилання на офіційну документацію або результат із пісочниці — усе інше записується як невідоме, а не як припущення.

- [x] `uk:gw.p1.title`
  - **EN** It guesses about other people’s APIs
  - **UK** Він вгадує щодо чужих API

- [x] `uk:gw.p2.body`
  - **EN** The change looks contained because nobody looked outward. Discovery maps the blast radius first — callers, events, jobs, policies, cascade relationships, the tests that cover any of it — so the plan is built on connections rather than on the three files in the prompt.
  - **UK** Зміна виглядає локальною, бо ніхто не подивився назовні. Дослідження спершу картографує радіус ураження — тих, хто викликає, події, задачі, політики, каскадні зв’язки, тести, які це покривають, — тож план будується на зв’язках, а не на трьох файлах із промпту.

- [x] `uk:gw.p2.title`
  - **EN** It plans from the files it was shown
  - **UK** Він планує за тими файлами, які йому показали

- [x] `uk:gw.p3.body`
  - **EN** Which is not always the question worth answering. A separate pass predicts what nobody thought to ask, and the interview puts those decisions back to the person who owns them instead of settling them quietly.
  - **UK** А це не завжди те запитання, на яке варто відповідати. Окремий прохід передбачає те, про що ніхто не здогадався спитати, а інтерв’ю повертає ці рішення тому, кому вони належать, замість вирішувати їх тихцем.

- [x] `uk:gw.p3.title`
  - **EN** It answers the question it was asked
  - **UK** Він відповідає на поставлене запитання

- [x] `uk:gw.p4.body`
  - **EN** “It works” is a claim, and a claim is not evidence. A reviewer whose only job is to refute the claim gets to look before it is believed.
  - **UK** «Воно працює» — це твердження, а твердження не є доказом. Рецензент, єдине завдання якого — спростувати твердження, отримує право подивитися до того, як у нього повірять.

- [x] `uk:gw.p4.title`
  - **EN** It reports success
  - **UK** Він звітує про успіх

- [x] `uk:gw.problem.label`
  - **EN** The problem
  - **UK** Проблема

- [x] `uk:gw.problem.lead`
  - **EN** The design principle the plugin is built on
  - **UK** Принцип, на якому побудовано плагін

- [x] `uk:gw.problem.leadFull`
  - **EN** Every safeguard below exists because the failure it prevents happened first.
  - **UK** Кожен запобіжник нижче існує тому, що збій, який він відвертає, уже стався.

- [x] `uk:gw.problem.title`
  - **EN** Plausible is not the same as correct
  - **UK** Правдоподібне — не те саме, що правильне

- [x] `uk:gw.readSource`
  - **EN** Read the source
  - **UK** Подивитися вихідний код

- [x] `uk:gw.review.label`
  - **EN** Review
  - **UK** Перевірка

- [x] `uk:gw.review.lead`
  - **EN** Each runs in a fresh context, so the reasoning that produced a mistake cannot quietly reproduce it.
  - **UK** Кожен працює у свіжому контексті, тож міркування, які призвели до помилки, не можуть тихо її відтворити.

- [x] `uk:gw.review.title`
  - **EN** Five specialists, one job each
  - **UK** П’ять спеціалістів, по одному завданню

- [x] `uk:gw.runsIn`
  - **EN** Runs in
  - **UK** Працює в

- [x] `uk:gw.table.agents`
  - **EN** Review agents
  - **UK** Review-агенти

- [x] `uk:gw.table.approval`
  - **EN** Approval
  - **UK** Погодження

- [x] `uk:gw.table.covers`
  - **EN** What it covers
  - **UK** Що охоплює

- [x] `uk:gw.table.level`
  - **EN** Level
  - **UK** Рівень

- [x] `uk:gw.tableCaption`
  - **EN** Task classification L0–L4
  - **UK** Класифікація задач L0–L4

- [x] `uk:gw.targets`
  - **EN** Targets
  - **UK** Ціль

- [x] `uk:gw.targetsValue`
  - **EN** Laravel backends
  - **UK** Laravel-бекенди

- [x] `uk:home.capabilities`
  - **EN** Capability map
  - **UK** Карта компетенцій

- [x] `uk:home.caps.prose`
  - **EN** Grouped honestly. No percentages — a bar chart of skills tells a reader nothing they can verify.
  - **UK** Згруповано чесно. Без відсотків — стовпчик «навички на 80%» не каже читачеві нічого, що він міг би перевірити.

- [x] `uk:home.caps.title`
  - **EN** What I do
  - **UK** Що я роблю

- [x] `uk:home.contact`
  - **EN** Contact
  - **UK** Контакти

- [x] `uk:home.contact.prose`
  - **EN** Open to Senior Backend and Tech Lead roles — {availability}. I have worked the Israeli and Ukrainian markets, including Hebrew and right-to-left products.
  - **UK** Розглядаю позиції Senior Backend і Tech Lead — {availability}. Працював на ізраїльському та українському ринках, зокрема з івритом і продуктами з письмом справа наліво.

- [x] `uk:home.contact.title`
  - **EN** Available
  - **UK** Відкритий до роботи

- [x] `uk:home.cta.email`
  - **EN** Email me
  - **UK** Написати мені

- [x] `uk:home.cta.repo`
  - **EN** Groundwork on GitHub
  - **UK** Groundwork на GitHub

- [x] `uk:home.elsewhere`
  - **EN** Elsewhere
  - **UK** Де ще

- [x] `uk:home.facts`
  - **EN** Facts
  - **UK** Факти

- [x] `uk:home.facts.based`
  - **EN** Based
  - **UK** Локація

- [x] `uk:home.facts.data`
  - **EN** Data
  - **UK** Дані

- [x] `uk:home.facts.languages`
  - **EN** Languages
  - **UK** Мови

- [x] `uk:home.facts.markets`
  - **EN** Markets
  - **UK** Ринки

- [x] `uk:home.facts.openTo`
  - **EN** Open to
  - **UK** Відкритий до

- [x] `uk:home.facts.stack`
  - **EN** Stack
  - **UK** Стек

- [x] `uk:home.gw.label`
  - **EN** Open source · {licence} · the flagship
  - **UK** Відкритий код · {licence} · флагман

- [x] `uk:home.gw.prose`
  - **EN** A Claude Code plugin that makes verification part of the development process instead of leaving it to the human.
  - **UK** Плагін для Claude Code, який робить перевірку частиною процесу розробки, а не залишає її людині.

- [x] `uk:home.gw.quote`
  - **EN** “An agent will happily write plausible code and just as happily report that it is done. Groundwork makes the checking part of the process.”
  - **UK** «Агент охоче напише правдоподібний код і так само охоче відзвітує, що все готово. Groundwork робить перевірку частиною процесу.»

- [x] `uk:home.how.prose`
  - **EN** They are not aspirations. They are what the tooling enforces.
  - **UK** Це не наміри. Це те, що примусово перевіряють інструменти.

- [x] `uk:home.how.title`
  - **EN** Three rules
  - **UK** Три правила

- [x] `uk:home.howIWork`
  - **EN** How I work
  - **UK** Як я працюю

- [x] `uk:home.lede`
  - **EN** I own the parts of a system that <b>must not be approximately right</b> — money, orders, production workflows — and I build the tooling that proves the work was actually done.
  - **UK** За мною ті частини системи, які <b>не можна зробити приблизно правильно</b> — гроші, замовлення, виробничі процеси, — і я будую інструменти, які доводять, що роботу справді зроблено.

- [x] `uk:home.meta`
  - **EN** Senior backend engineer and tech lead. Payments, order lifecycles and production workflows — plus Groundwork, an open-source platform that makes AI-assisted engineering verifiable.
  - **UK** Senior backend engineer і tech lead. Платежі, життєвий цикл замовлень і виробничі процеси — а також Groundwork, платформа з відкритим кодом, яка робить AI-асистовану розробку перевірюваною.

- [x] `uk:home.positioning`
  - **EN** Positioning
  - **UK** Позиціювання

- [x] `uk:home.selectedWork`
  - **EN** Selected work
  - **UK** Вибрані роботи

- [x] `uk:home.stats.codebases`
  - **EN** production codebases
  - **UK** кодових баз у продакшні

- [x] `uk:home.stats.handoffs`
  - **EN** frontend hand-offs
  - **UK** передач фронтенду

- [x] `uk:home.stats.runs`
  - **EN** procedure runs
  - **UK** запусків процедур

- [x] `uk:home.stats.specs`
  - **EN** written specs
  - **UK** написаних специфікацій

- [x] `uk:home.stats.stopped`
  - **EN** stopped before code
  - **UK** зупинено до коду

- [x] `uk:home.subtle`
  - **EN** The subtle part
  - **UK** Неочевидна частина

- [x] `uk:home.work.gwSubtle`
  - **EN** Roughly one task in three is stopped before any code is written — mis-scoped, conflicting with existing behaviour, or cheaper to solve without development.
  - **UK** Приблизно кожну третю задачу зупиняють до того, як написано хоч рядок коду: неправильно окреслена, конфліктує з наявною поведінкою або дешевше вирішується без розробки.

- [x] `uk:home.work.gwSummary`
  - **EN** Risk-based task classification L0–L4, {agents} specialised review agents, {gates} automated gates and {procedures} workflow procedures, shipped under {licence}.
  - **UK** Класифікація задач за ризиком L0–L4, {agents} спеціалізованих review-агентів, {gates} автоматичних гейтів і {procedures} процедур робочого процесу, під ліцензією {licence}.

- [x] `uk:home.work.prose`
  - **EN** Not feature lists. Each records the constraint, what was chosen over what, and the detail a mid-level engineer would have got wrong.
  - **UK** Не переліки можливостей. Кожен запис фіксує обмеження, що обрано замість чого, і ту деталь, яку middle-інженер зробив би неправильно.

- [x] `uk:home.work.title`
  - **EN** Four decisions
  - **UK** Чотири рішення

- [x] `uk:lang.english`
  - **EN** English
  - **UK** Англійська

- [x] `uk:lang.level.fluent`
  - **EN** Fluent
  - **UK** Вільно

- [x] `uk:lang.level.native`
  - **EN** Native
  - **UK** Рідна

- [x] `uk:lang.russian`
  - **EN** Russian
  - **UK** Російська

- [x] `uk:lang.ukrainian`
  - **EN** Ukrainian
  - **UK** Українська

- [x] `uk:meta.asOf`
  - **EN** Approximate, as of August 2026
  - **UK** Приблизно, станом на серпень 2026

- [x] `uk:nav.about`
  - **EN** About
  - **UK** Про мене

- [x] `uk:nav.cv`
  - **EN** CV
  - **UK** Резюме

- [x] `uk:nav.inEnglish`
  - **EN** This page is in English
  - **UK** Ця сторінка англійською

- [x] `uk:nav.language`
  - **EN** Language
  - **UK** Мова

- [x] `uk:nav.primary`
  - **EN** Primary
  - **UK** Основна

- [x] `uk:nav.work`
  - **EN** Work
  - **UK** Роботи

- [x] `uk:notes.label`
  - **EN** Notes
  - **UK** Нотатки

- [x] `uk:notes.meta`
  - **EN** Occasional writing on backend engineering, verification and applied AI.
  - **UK** Нечасті тексти про бекенд-розробку, перевірку та прикладний AI.

- [x] `uk:notes.title`
  - **EN** Writing
  - **UK** Тексти

- [x] `uk:principle.claim.body`
  - **EN** Tests, static analysis and contract checks run as gates rather than as good intentions. “It works” gets challenged by a reviewer whose only job is to try to refute it.
  - **UK** Тести, статичний аналіз і перевірки контрактів працюють як гейти, а не як добрі наміри. «Воно працює» перевіряє рецензент, єдине завдання якого — спробувати це спростувати.

- [x] `uk:principle.claim.title`
  - **EN** A claim is not evidence.
  - **UK** Твердження — це не доказ.

- [x] `uk:principle.ground.body`
  - **EN** What an external provider does is confirmed against its official documentation with a citation, or marked unknown and proven in a sandbox. A plausible answer about someone else’s API is the most expensive kind of wrong.
  - **UK** Те, що робить зовнішній сервіс, підтверджується його офіційною документацією з посиланням — або позначається як невідоме й доводиться в пісочниці. Правдоподібна відповідь про чужий API — найдорожчий різновид помилки.

- [x] `uk:principle.ground.title`
  - **EN** Ground it, don’t guess it.
  - **UK** Заземлюй, а не вгадуй.

- [x] `uk:principle.spec.body`
  - **EN** Discovery is wide; the change is narrow. One task in three never reaches code because the discussion showed it was mis-scoped, already solved, or cheaper without development.
  - **UK** Дослідження широке; зміна вузька. Кожна третя задача не доходить до коду, бо обговорення показало: вона неправильно окреслена, вже вирішена або дешевша без розробки.

- [x] `uk:principle.spec.title`
  - **EN** The spec is the cheap place to be wrong.
  - **UK** Специфікація — дешеве місце помилитися.

- [x] `uk:site.availability`
  - **EN** Remote worldwide · relocation · available at two weeks’ notice
  - **UK** Віддалено з будь-якої точки · релокація · готовий вийти за два тижні

- [x] `uk:site.experience`
  - **EN** 6+ years
  - **UK** 6+ років

- [x] `uk:site.languages`
  - **EN** English B2 · Ukrainian Native · Russian Fluent
  - **UK** Англійська B2 · українська рідна · російська вільно

- [x] `uk:site.location`
  - **EN** Ukraine
  - **UK** Україна

- [x] `uk:site.markets`
  - **EN** Israel · Ukraine
  - **UK** Ізраїль · Україна

- [x] `uk:site.name`
  - **EN** Max Yastremskyi
  - **UK** Макс Ястремський

- [x] `uk:site.nameFirst`
  - **EN** Max
  - **UK** Макс

- [x] `uk:site.nameLast`
  - **EN** Yastremskyi
  - **UK** Ястремський

- [x] `uk:site.oneInThree`
  - **EN** 1 in 3
  - **UK** 1 з 3

- [x] `uk:skip.content`
  - **EN** Skip to content
  - **UK** Перейти до вмісту

- [x] `uk:st.answering`
  - **EN** answering
  - **UK** відповідає

- [x] `uk:st.avail.label`
  - **EN** Availability
  - **UK** Доступність

- [x] `uk:st.avail.lead`
  - **EN** One column per day. A day with no probe is blank rather than green — an unknown is not a success.
  - **UK** Один стовпчик на день. День без перевірки лишається порожнім, а не зеленим: невідоме — це не успіх.

- [x] `uk:st.avail.title`
  - **EN** Thirty days
  - **UK** Тридцять днів

- [x] `uk:st.barAlt`
  - **EN** Daily availability for the last thirty days
  - **UK** Щоденна доступність за останні тридцять днів

- [x] `uk:st.ci.passing`
  - **EN** passing
  - **UK** пройдено

- [x] `uk:st.commit`
  - **EN** Commit
  - **UK** Коміт

- [x] `uk:st.contactEndpoint`
  - **EN** Contact endpoint
  - **UK** Контактний ендпоінт

- [x] `uk:st.dayLabel`
  - **EN** {date}: {checks} checks, {failures} failed
  - **UK** {date}: перевірок {checks}, невдалих {failures}

- [x] `uk:st.daysRemaining`
  - **EN** {days} days remaining
  - **UK** залишилося днів: {days}

- [x] `uk:st.gates.empty`
  - **EN** No gate report yet. CI posts one after each green run on main.
  - **UK** Звіту про гейти ще немає. CI надсилає його після кожного зеленого прогону на main.

- [x] `uk:st.gates.label`
  - **EN** Quality gates
  - **UK** Гейти якості

- [x] `uk:st.gates.lead`
  - **EN** These are the numbers CI measured on the commit currently in production, not numbers from a screenshot in a README.
  - **UK** Це числа, які CI виміряв на коміті, що зараз у продакшні, а не числа зі скриншота в README.

- [x] `uk:st.gates.title`
  - **EN** What the last commit had to pass
  - **UK** Що мав пройти останній коміт

- [x] `uk:st.label`
  - **EN** Status
  - **UK** Стан

- [x] `uk:st.lede`
  - **EN** Availability and response time for this site, and the result of the gates its last commit had to pass. Everything on this page is measured; nothing is asserted.
  - **UK** Доступність і час відповіді цього сайту, а також результат гейтів, які мав пройти його останній коміт. Усе на цій сторінці виміряно; нічого не стверджується на слово.

- [x] `uk:st.live`
  - **EN** Live as of {at}. Probed every {minutes} minutes.
  - **UK** Наживо станом на {at}. Перевірка кожні {minutes} хвилин.

- [x] `uk:st.meta`
  - **EN** Live availability, response time and quality gates for this site — measured from outside the server, because a service cannot report its own downtime.
  - **UK** Жива доступність, час відповіді та гейти якості цього сайту — виміряні ззовні сервера, бо сервіс не може відзвітувати про власне падіння.

- [x] `uk:st.noData`
  - **EN** No probe data yet. The page will fill in once the scheduled check has run.
  - **UK** Даних перевірок ще немає. Сторінка заповниться, щойно відпрацює заплановане завдання.

- [x] `uk:st.noDay`
  - **EN** No data
  - **UK** Даних немає

- [x] `uk:st.notAnswering`
  - **EN** not answering
  - **UK** не відповідає

- [x] `uk:st.note`
  - **EN** Uptime is measured <strong>from outside</strong>, by a scheduled job that requests the public URL every ten minutes and posts what it saw. That indirection is the point: a service cannot report its own downtime, so a page fed only by the server would be a page that is always up. Nothing here counts visitors — the site runs no analytics, and a status page is not a side door for adding some.
  - **UK** Аптайм вимірюється <strong>ззовні</strong> — запланованим завданням, яке кожні десять хвилин запитує публічну адресу й надсилає те, що побачило. Ця непрямість і є суттю: сервіс не може відзвітувати про власне падіння, тож сторінка, яку живить лише сервер, була б сторінкою, де завжди все добре. Тут не рахують відвідувачів — на сайті немає жодної аналітики, і сторінка стану не є чорним ходом, щоб її додати.

- [x] `uk:st.performance`
  - **EN** Performance
  - **UK** Швидкодія

- [x] `uk:st.private`
  - **EN** private
  - **UK** приватний

- [x] `uk:st.route`
  - **EN** Route
  - **UK** Маршрут

- [x] `uk:st.services.label`
  - **EN** Services
  - **UK** Сервіси

- [x] `uk:st.services.lead`
  - **EN** The contact endpoint is the one that matters: it is the only channel on this site that can fail quietly.
  - **UK** Контактний ендпоінт — той, що має значення: це єдиний канал на цьому сайті, який може відмовити тихо.

- [x] `uk:st.services.title`
  - **EN** What is running
  - **UK** Що працює

- [x] `uk:st.snapshot`
  - **EN** Snapshot taken at build time, {at}. Probed every 10 minutes.
  - **UK** Знімок зроблено під час збірки, {at}. Перевірка кожні 10 хвилин.

- [x] `uk:st.source`
  - **EN** Source
  - **UK** Вихідний код

- [x] `uk:st.sourceLink`
  - **EN** the code behind this page
  - **UK** код, який стоїть за цією сторінкою

- [x] `uk:st.stale`
  - **EN** No probe since {at} — this data is stale, not current.
  - **UK** Перевірок не було з {at} — ці дані застарілі, а не поточні.

- [x] `uk:st.stat.availability`
  - **EN** availability, 30 days
  - **UK** доступність, 30 днів

- [x] `uk:st.stat.checks`
  - **EN** checks recorded
  - **UK** зафіксованих перевірок

- [x] `uk:st.stat.failures`
  - **EN** failed checks
  - **UK** невдалих перевірок

- [x] `uk:st.stat.p50`
  - **EN** response, median
  - **UK** відповідь, медіана

- [x] `uk:st.stat.p95`
  - **EN** response, 95th
  - **UK** відповідь, 95-й перцентиль

- [x] `uk:st.title`
  - **EN** Is it up
  - **UK** Чи працює

- [x] `uk:st.tls`
  - **EN** TLS certificate
  - **UK** Сертифікат TLS

- [x] `uk:thanks.heading`
  - **EN** Thank you
  - **UK** Дякую

- [x] `uk:thanks.home`
  - **EN** Back to the start
  - **UK** На початок

- [x] `uk:thanks.label`
  - **EN** Sent
  - **UK** Надіслано

- [x] `uk:thanks.lede`
  - **EN** Your message reached my inbox. I answer everything that is not a mass mailing, usually within a day or two.
  - **UK** Повідомлення дійшло до поштової скриньки. Відповідь приходить на все, що не є масовою розсилкою, зазвичай протягом одного-двох днів.

- [x] `uk:thanks.meta`
  - **EN** Your message reached me.
  - **UK** Ваше повідомлення дійшло.

- [x] `uk:thanks.title`
  - **EN** Message sent
  - **UK** Повідомлення надіслано

- [x] `uk:thanks.work`
  - **EN** Selected work
  - **UK** Вибрані роботи

- [x] `uk:theme.toDark`
  - **EN** Dark
  - **UK** Темна

- [x] `uk:theme.toggle`
  - **EN** Theme
  - **UK** Тема

- [x] `uk:theme.toLight`
  - **EN** Light
  - **UK** Світла

- [x] `uk:tl.imrev.h1`
  - **EN** Built e-commerce and corporate platforms end to end — custom modules, admin panels and storefronts — across concurrent client projects.
  - **UK** Будував e-commerce і корпоративні платформи від початку до кінця — власні модулі, адмінпанелі та вітрини — на паралельних клієнтських проєктах.

- [x] `uk:tl.imrev.h2`
  - **EN** Integrated payment, shipping and analytics providers, replacing manual client workflows with automated order flows.
  - **UK** Інтегрував платіжні, логістичні та аналітичні сервіси, замінивши ручні процеси клієнта автоматизованими потоками замовлень.

- [x] `uk:tl.imrev.h3`
  - **EN** Optimised page, catalogue and search performance through query tuning, indexing and caching, and owned post-production incident handling.
  - **UK** Оптимізував швидкодію сторінок, каталогу й пошуку через налаштування запитів, індексацію та кешування, і відповідав за розбір інцидентів після релізу.

- [x] `uk:tl.imrev.note`
  - **EN** E-commerce and corporate platforms, integrations.
  - **UK** E-commerce та корпоративні платформи, інтеграції.

- [x] `uk:tl.present`
  - **EN** Present
  - **UK** Дотепер

- [x] `uk:tl.radevs.h1`
  - **EN** Authored and open-sourced Groundwork, and set the team’s engineering standards and Definition of Done around it.
  - **UK** Створив і відкрив код Groundwork, побудувавши навколо нього інженерні стандарти команди та визначення готовності.

- [x] `uk:tl.radevs.h2`
  - **EN** Built a reusable multi-market headless commerce platform: storefront JSON API, back-office admin, retail and wholesale pricing engine, driver-abstracted payments and delivery.
  - **UK** Побудував багаторазову мультиринкову headless-платформу e-commerce: JSON API вітрини, адміністративну частину, рушій роздрібних і оптових цін, платежі та доставку за драйверами.

- [x] `uk:tl.radevs.h3`
  - **EN** Shipped applied AI to production — an intent gateway that validates model output instead of executing it, voice intake behind schema-constrained extraction, OCR and computer-vision pipelines.
  - **UK** Вивів прикладний AI у продакшн — шлюз намірів, який перевіряє вихід моделі замість того, щоб його виконувати, голосовий вхід за схемо-обмеженим вилученням, конвеєри OCR і комп’ютерного зору.

- [x] `uk:tl.radevs.h4`
  - **EN** Engineered the payment and financial subsystems: card tokenization, idempotency-keyed clearing, decimal money with bcmath, accounting and tax export, signed-webhook reconciliation.
  - **UK** Спроєктував платіжну й фінансову підсистеми: токенізацію карток, кліринг із ключами ідемпотентності, десяткові гроші через bcmath, бухгалтерський і податковий експорт, звірку за підписаними вебхуками.

- [x] `uk:tl.radevs.h5`
  - **EN** Architected order-lifecycle and production-workflow systems with multi-station scan tracking, quality control, weighted auto-assignment and centralised state-transition guards.
  - **UK** Спроєктував системи життєвого циклу замовлень і виробничих процесів зі скануванням на кількох станціях, контролем якості, зваженим автопризначенням і централізованими перевірками переходів станів.

- [x] `uk:tl.radevs.h6`
  - **EN** Mentored engineers through review agents and architecture decisions.
  - **UK** Менторив інженерів через review-агентів та архітектурні рішення.

- [x] `uk:tl.radevs.note`
  - **EN** Laravel platforms and the studio’s AI engineering practice.
  - **UK** Laravel-платформи та практика AI-інженерії студії.

- [x] `uk:tl.terraforce.h1`
  - **EN** Built and maintained e-commerce backends with subscription payments, local checkout and delivery, multi-language storefronts and response-query caching.
  - **UK** Будував і підтримував бекенди e-commerce з підписковими платежами, локальним оформленням і доставкою, багатомовними вітринами й кешуванням відповідей на запити.

- [x] `uk:tl.terraforce.h2`
  - **EN** Developed admin panels with custom tools, cards, fields and dashboards, including a leads-management CRM with rich-text editing and invoice generation.
  - **UK** Розробляв адмінпанелі з власними інструментами, картками, полями та дашбордами, зокрема CRM для управління лідами з форматованим редактором і генерацією рахунків.

- [x] `uk:tl.terraforce.h3`
  - **EN** Built API-first mobile app backends: JWT auth, push notifications, QR codes, two-factor auth, and PDF/Word/Excel document generation.
  - **UK** Будував API-first бекенди для мобільних застосунків: JWT-автентифікація, пуш-сповіщення, QR-коди, двофакторна автентифікація, генерація документів PDF/Word/Excel.

- [x] `uk:tl.terraforce.h4`
  - **EN** Delivered search-driven features — full-text search, geo-targeting, SMS and messenger notifications, real-time sockets, social login.
  - **UK** Реалізував пошукові можливості — повнотекстовий пошук, геотаргетинг, сповіщення через SMS і месенджери, сокети в реальному часі, вхід через соцмережі.

- [x] `uk:tl.terraforce.h5`
  - **EN** Integrated an early LLM alongside Google APIs and web-scraping pipelines for content generation.
  - **UK** Інтегрував ранню LLM разом із Google API та конвеєрами вебскрапінгу для генерації контенту.

- [x] `uk:tl.terraforce.note`
  - **EN** E-commerce, admin and CRM platforms, mobile app APIs.
  - **UK** E-commerce, адмін- і CRM-платформи, API для мобільних застосунків.

- [x] `uk:tl.yuks.h1`
  - **EN** Maintained and extended legacy modules, contributed to a migration to WinForms, and resolved pre-release defects during QA and hardening cycles.
  - **UK** Підтримував і розширював легасі-модулі, брав участь у міграції на WinForms і виправляв передрелізні дефекти під час циклів QA та стабілізації.

- [x] `uk:tl.yuks.note`
  - **EN** Legacy desktop maintenance and a WinForms migration.
  - **UK** Підтримка легасі-десктопу та міграція на WinForms.

- [x] `uk:work.caseLabel`
  - **EN** Case study · under NDA, described generically
  - **UK** Кейс · під NDA, описано узагальнено

- [x] `uk:work.gwChip.analysis`
  - **EN** Static analysis
  - **UK** Статичний аналіз

- [x] `uk:work.gwSummary`
  - **EN** Risk-based task classification L0–L4, {agents} specialised review agents, {gates} automated gates and {procedures} workflow procedures, shipped under {licence} with semantic versioning.
  - **UK** Класифікація задач за ризиком L0–L4, {agents} спеціалізованих review-агентів, {gates} автоматичних гейтів і {procedures} процедур робочого процесу, під ліцензією {licence} із семантичним версіюванням.

- [x] `uk:work.lede`
  - **EN** Not feature lists. Each one records the constraint, what was chosen over what, and the detail a mid-level engineer would have got wrong — because that is what a senior reader actually evaluates.
  - **UK** Не переліки можливостей. Кожен запис фіксує обмеження, що обрано замість чого, і ту деталь, яку middle-інженер зробив би неправильно, — бо саме це оцінює досвідчений читач.

- [x] `uk:work.meta`
  - **EN** Four engineering decision records: Groundwork, a voice-to-structured-data pipeline, payments and clearing, and a multi-market commerce platform.
  - **UK** Чотири інженерні рішення, зафіксовані як записи: Groundwork, конвеєр «голос → структуровані дані», платежі й кліринг, мультиринкова e-commerce платформа.

- [x] `uk:work.nda`
  - **EN** Three of the four are under NDA. The domains are described concretely and the clients are not named, which is the whole of the compromise: no logos, no product names, no screenshots. Groundwork is the exception — it is public, and it is linked.
  - **UK** Три з чотирьох — під NDA. Домени описані конкретно, клієнти не названі, і в цьому весь компроміс: без логотипів, без назв продуктів, без скриншотів. Groundwork — виняток: він публічний, і на нього є посилання.
