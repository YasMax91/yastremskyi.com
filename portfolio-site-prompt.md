# BRIEF: Personal engineering site for Max Yastremskyi

> Paste this whole document to the coding agent as the initial instruction.
> It is self-contained — do not assume the agent has any other context.

---

## 0. Your role

You are a senior product designer **and** front-end engineer building a personal
engineering site for one client: **Max Yastremskyi**, a Senior Backend Engineer / Tech Lead.

This site is not a template fill-in. It is a **portfolio piece for both of us**: its craft is
itself the argument that Max is a senior engineer. A hiring manager should be able to tell,
within eight seconds and without reading a word closely, that the person behind it operates at
a high level.

Work in the phases defined in §9. **Do not skip to code.** Stop at each phase gate and get
approval before continuing.

---

## 1. The quality bar (non-negotiable)

Treat every item as a release gate, not advice.

| Dimension | Bar |
|---|---|
| Lighthouse (mobile, throttled) | Performance ≥ 98, Accessibility 100, Best Practices 100, SEO 100 |
| Core Web Vitals | LCP < 1.2 s on 4G · CLS < 0.01 · INP < 100 ms |
| JS shipped to the browser | < 30 KB gzipped total for the home page; zero JS on routes that need none |
| Fonts | Self-hosted, subset, `font-display: swap`, max 2 families / 3 weights, preloaded |
| Accessibility | WCAG 2.2 AA. Full keyboard operation, visible focus rings, correct landmarks and heading order, `prefers-reduced-motion` respected, contrast ≥ 4.5:1 for body text |
| Responsive | Flawless 320 px → 2560 px. No horizontal scroll at any width. Real testing at 375, 768, 1440 |
| Dark / light | Both themes fully designed (not an inverted filter), honouring `prefers-color-scheme`, with a manual toggle |
| Print | `Cmd+P` on the home page produces a clean one-pager |
| Content | Every word is real. No lorem ipsum, ever — not even in the concept phase |
| Code | Typed, formatted, linted, componentised, commented where non-obvious. Someone should be able to read the repo as a work sample |

**If you cannot hit a bar, say so explicitly and propose the trade-off. Never silently miss one.**

---

## 2. Who Max is — the raw material

All facts below are verified. **Use only these.** Do not invent metrics, clients, testimonials,
job titles, or technologies. If you want a fact that is not here, ask.

### Identity

- **Name:** Max Yastremskyi
- **Title:** Senior Backend Engineer · Tech Lead
- **Core stack:** PHP 8.4 / Laravel 12 · Node / NestJS · MySQL 8 · Redis · Docker
- **Focus:** complex business domains, microservices, payments & fintech integrations, applied AI
- **Experience:** 6+ years
- **Location:** Ukraine (UTC+3) · open to remote worldwide and to relocation
- **Languages:** English B2 · Ukrainian native · Russian fluent
- **Email:** m.yastremskyj@gmail.com
- **Phone:** [redacted — see below]  
  <!-- Redacted before this repository could be made public. The number is real and is in
       the CV PDF, which is git-ignored for the same reason: /cv.pdf is served with
       X-Robots-Tag: noindex so the number stays out of search results, and committing it
       to a public repo would have made that header meaningless. -->
- **LinkedIn:** https://www.linkedin.com/in/maksym-yastremskyi-49b344212
- **Markets worked:** Israel and Ukraine (Hebrew/RTL products, Israeli fintech & accounting systems)

### The flagship: Groundwork (this is the hero of the site)

An **open-source (MIT)** AI spec-driven development platform — a Claude Code plugin that makes
verification part of the development process instead of leaving it to the human.

- Risk-based task classification **L0–L4** — process weight scales with risk (a typo fix and a
  change to financial calculations do not get the same ceremony)
- **5 specialised review agents:** impact map (what will this break) · blind-spot map (what did
  nobody think to ask) · external-API grounding researcher (what does the provider actually do,
  with a citation) · adversarial verifier (is the "it works" claim true) · conformance reviewer
  (does the diff satisfy the agreed acceptance criteria)
- **8 automated gates:** test suite, static analysis, locked shipped migrations, enforced runner,
  OpenAPI contract updates, sandbox-verified integrations, and more
- **11 workflow procedures**, a companion-plugin ecosystem, semver releases
- Adopted across **7 production codebases**, ~**340** procedure runs, ~**160** written specs,
  **27** auto-generated frontend API hand-offs
- Signature outcome: **~1 in 3 tasks is stopped before any code is written** — mis-scoped,
  conflicting with existing behaviour, or cheaper to solve without development

Design principle worth surfacing on the site: *"An agent will happily write plausible code and
just as happily report that it is done. Groundwork makes the checking part of the process."*

### Applied AI shipped to production

- **AI gateway microservice** — translates CRM conversation turns into *validated model intents*
  (tool-calling) **without auto-executing them**; OpenAI Whisper STT tuned with domain vocabulary
  (including Hebrew), pinned model versions, **per-call cost accounting**, shared-secret auth
- **Voice dictation assistant** — speech → client records: verbatim Hebrew transcription, tool
  loop, client lookup by any word order or phone digits, answers in the manager's language,
  PII-safe by design
- **Voice task intake** — Whisper STT → schema-constrained, temperature-0 extraction (relative
  time like "tomorrow at six" resolved to absolute, timezone-aware) → structured task; queued so
  HTTP answers instantly and the result arrives over WebSocket; provider mocked in CI; audit
  trail; 30-day retention
- **OCR / computer vision** — schedule images parsed via morphological grid extraction, cluster
  analysis and **CIE-Lab** colour classification (robust to messenger recompression, where RGB
  drifts); PDF parsing; real users on a Telegram bot
- **Voice debt collection** — synthesized Hebrew speech over telephony with hand-off to a live
  operator
- **Search & ranking** — typo-tolerant, morphology-aware search (Meilisearch / Algolia) with
  custom ranking weights, replacing `LIKE` queries
- Cross-cutting AI engineering: strict response schemas, prompt-injection defence, provider
  abstraction + fallback, cost control & caching, response-regression tests on model upgrades

### Domain & platform work (all under NDA — describe, never name)

- **Multi-market headless e-commerce platform** (Laravel 12) — storefront JSON API (catalogue,
  category trees, characteristics, cart, wishlist, search, checkout, orders, account) plus a
  back-office admin; cloned per market with config-driven currency, locale and timezone. Retail/
  wholesale **pricing & discount engine**, driver-abstracted payments (LiqPay, cash-on-delivery,
  Stripe) and delivery (Nova Poshta), buyer auth (JWT + Google/Facebook OAuth + email OTP), SEO
  (JSON-LD, sitemap, robots), admin home-page builder
- **1C (ERP) catalogue sync** — queued job chains staging per-product changes via typed DTOs for
  admin review and apply; image sync; Excel/PDF import-export
- **Payments & financial subsystems** — PCI card tokenization (tokens only, raw card data never
  stored or returned), hierarchical payment requests, idempotency-keyed clearing transactions,
  money as decimal strings with bcmath (never floats), multi-currency, VAT logic, accounting/tax
  document export, signed-webhook reconciliation, all-or-nothing document issuance, standing
  orders / recurring billing, direct-debit collection
- **Order-lifecycle & production-workflow systems** — multi-station barcode/scan movement
  tracking, quality control and supervisor approvals, staff attendance, weighted auto-assignment
  (priority ÷ load, backward planning from the deadline), centralised state-transition guards,
  server-side RBAC
- **Multi-channel messaging** — driver fallback chain (Twilio → WhAPI → WhatsApp Cloud API),
  delivery-status webhooks, language-aware templates (Hebrew / English / Spanish), stateful
  WhatsApp assistants with media handling
- **Hebrew RTL / bidi document rendering** — routing between PDF engines by content language,
  logical-order text handling, per-display-line reordering (a pre-reversed paragraph reads
  bottom-up once it wraps)
- **Media-processing microservice** — FFmpeg video + Imagick image conversion, S3/MinIO storage,
  Redis-queued jobs, webhook callbacks, OAuth2 client-credentials (machine-to-machine)
- **Integrations & reliability** — Google Calendar two-way sync, GraphQL scheduling APIs,
  real-time flight monitoring, and an **integration health-probe registry** with credential
  masking that reports degradation before users notice

### Career timeline

| Period | Role | Focus |
|---|---|---|
| Apr 2024 – present | Senior Backend Engineer · Tech Lead, product studio | Laravel platforms + the studio's AI engineering practice |
| Aug 2022 – Apr 2024 | Full-Stack PHP Engineer | E-commerce, admin/CRM platforms, mobile app APIs |
| Jun 2020 – Aug 2022 | PHP Engineer, digital agency | E-commerce and corporate platforms, integrations |
| Jan 2020 – Jun 2020 | Junior Engineer (C++/.NET) | Legacy desktop maintenance and migration |

---

## 3. Positioning & narrative

**Primary audience:** hiring managers, CTOs and technical recruiters at international product
companies and studios, evaluating Max for a Senior Backend / Tech Lead role — remote or relocation.
**Secondary:** engineers who arrive from the Groundwork repository.

**The one sentence the site must land:**
> A senior backend engineer who owns hard domains end-to-end — money, orders, production
> workflows — and who has built the tooling that makes AI-assisted engineering trustworthy.

**Three differentiators, in priority order.** Everything on the site should serve one of them:

1. **He builds the tools that verify the work.** Groundwork is not a side project — it is an
   opinion about how software should be built, shipped as open source and adopted across seven
   production codebases. Very few backend engineers have this.
2. **He ships AI that survives contact with production.** Not demos: cost accounting, provider
   fallback, schema-constrained extraction, prompt-injection defence, PII discipline, tests that
   do not call a paid API.
3. **He is trusted with money and irreversible operations.** Payments, clearing, tax documents,
   PCI tokenization, idempotency — the work where being approximately right is being wrong.

**Voice:** precise, senior, evidence-first, quietly confident. Short declarative sentences.
Specific nouns. A dry technical wit is welcome; salesmanship is not.

**Forbidden copy** — reject on sight: "passionate about code", "I craft beautiful digital
experiences", "10x", "ninja/rockstar/guru", "let's build something amazing together", skill
percentage bars, generic stock developer illustrations, decorative code screenshots of code that
does nothing.

---

## 4. Information architecture

Keep it small and deliberate. Five routes, no more.

1. **`/` — Home.** The whole argument on one page, skimmable in 30 seconds, rewarding for 5 minutes.
   - Hero: name, one-line positioning, primary CTA (email / CV), secondary (Groundwork)
   - Groundwork feature block — the flagship, with its real numbers
   - Selected work — 3–4 case cards (see §5)
   - Capability map — grouped, honest, no percentages
   - Short "how I work" — the engineering principles (test-first, grounding, specs before code)
   - Contact
2. **`/work` — Case studies index**, and `/work/<slug>` for each.
3. **`/groundwork` — Deep-dive on the OSS project.** Problem → design → gates → adoption → install.
4. **`/about` — The person.** Career narrative, markets, languages, how he leads, what he wants next.
5. **`/cv` — CV.** Rendered on-page as HTML *and* downloadable as PDF.

Blog/notes: **build the structure, ship it empty or hidden.** An empty blog is worse than none;
a missing one is a missed opportunity. Make adding a post a one-file operation.

---

## 5. Case studies — the format that proves seniority

This is the most important content decision in the brief. Do not write feature lists. Write
**engineering decision records**, because that is what senior readers actually evaluate.

Each case study follows a fixed spine:

1. **Context** — the domain, in one honest paragraph. Unnamed (NDA), but concrete:
   *"A made-to-order manufacturing CRM for the Israeli market, multi-currency, staff on stations."*
2. **The constraint** — what made it hard. The real one, not a generic one.
3. **The decision** — what was chosen, what was rejected, and *why*. Include the trade-off.
4. **The subtle part** — one detail a mid-level engineer would have got wrong. This is the
   section that wins the interview. Examples available from §2: bidi text must be passed in
   logical order because reordering happens per display line *after* wrapping; colour
   classification in CIE-Lab rather than RGB because messenger recompression drifts RGB;
   idempotency-keyed clearing because a payment attempt is not repeatable; a zero-total tax
   document is rejected by the provider so those items must close locally.
5. **Outcome** — what it does in production now.
6. **Stack** — as chips/tags, not prose.

Build **4 case studies**: (1) Groundwork, (2) applied-AI voice→structured-data pipeline,
(3) payments/clearing & accounting integration, (4) multi-market e-commerce platform.

**NDA rule, absolute:** no client names, no product names, no logos, no screenshots of client
UIs, no repository links to private code. Describe the domain generically. Groundwork is the
exception — it is public and should be named and linked everywhere.

---

## 6. Art direction

### Phase 1 deliverable: three concepts

Produce **three genuinely distinct** home-page concepts — not three colour variations. Each as a
real, styled HTML page with real copy, viewable side by side. For each, write a 3-sentence
rationale explaining who it appeals to and what it risks.

- **Concept A — "Editorial".** Typography-first, generous whitespace, restrained accent colour,
  strong vertical rhythm, magazine-grade hierarchy. Reads as senior, mature, timeless.
- **Concept B — "Instrument".** Dark, technical, precise. Monospace accents, hairline rules,
  data-dense blocks, subtle grid. Feels like a well-designed developer tool — on-brand for the
  AI-tooling story.
- **Concept C — "Structural".** Swiss/brutalist grid, oversized type, hard edges, high contrast,
  one bold accent. Maximum memorability; higher risk.

Max's existing CV uses a warm amber/rust accent (`#c4520a`) on near-black text — carrying a
thread of that into at least one concept is a plus, but you are not bound to it.

### Rules that apply to whichever concept wins

- **Type:** one excellent text face, optionally one mono for technical detail. Fluid type scale
  with `clamp()`. Optical sizing, tight tracking on display sizes, `text-wrap: balance` on
  headings, measure of 60–75 characters for body.
- **Colour:** a real system — semantic tokens (surface, muted, border, accent, on-accent),
  defined for both themes, contrast-checked. One accent, used sparingly enough that it means
  something.
- **Space:** a spacing scale, honoured everywhere. Vertical rhythm consistent across sections.
- **Motion:** purposeful only — entrance reveals no longer than 400 ms, easing that is not
  `linear`, staggered where it clarifies structure. Everything wrapped in
  `@media (prefers-reduced-motion: reduce)`. No parallax, no scroll-jacking, no autoplay.
- **Imagery:** no stock photography. If Max supplies a portrait, treat it well (duotone or
  refined crop). Otherwise, build visual interest from typography, rules, and one or two
  purpose-drawn diagrams — never from decoration.
- **Detail work that separates good from excellent:** proper `::selection` colour, styled focus
  rings, custom scrollbar restraint, tabular numerals in stats, hanging punctuation where
  supported, a favicon and OG image that are actually designed, and a 404 page that is not an
  afterthought.

### One signature element (choose exactly one, execute perfectly)

Not a gimmick — a piece of interaction that *demonstrates* the thinking. Strongest candidates:

- **The Groundwork gate simulator.** The visitor picks a task ("fix a typo" → "change how VAT is
  calculated") and sees the L0–L4 classification and exactly which review agents and gates
  engage. Pure client-side, keyboard-accessible, < 5 KB of JS. It teaches Max's core idea in ten
  seconds and is impossible to fake.
- **An animated architecture diagram** of the voice→intent pipeline (audio → STT with domain
  vocabulary → schema-constrained extraction → validated intent → human approval → action),
  revealed on scroll, showing where the guard rails sit.

Pick one. A second one dilutes both.

---

## 7. Technical specification

- **Framework:** **Astro** (latest stable) with **Tailwind CSS** and **TypeScript** (strict).
  Content collections with Zod schemas for case studies and future posts. Islands only where
  interactivity genuinely exists.
- **i18n:** **English (default, `/`) and Ukrainian (`/uk/`)**. Real translation, not machine
  output left unreviewed — flag anything you are unsure of for Max to check, as he is a native
  Ukrainian speaker. Correct `lang` attributes, `hreflang` alternates, a switcher that preserves
  the current route, and localized metadata. Architect the i18n layer so a third locale is a
  content addition, not a refactor.
- **Content model:** all copy lives in typed content files / i18n dictionaries — never hard-coded
  in components. Max must be able to edit text without touching markup.
- **SEO:** per-page title/description, canonical URLs, Open Graph + Twitter cards with a
  **generated** OG image per route, `sitemap.xml`, `robots.txt`, and JSON-LD (`Person`,
  `WebSite`, plus `SoftwareSourceCode` for Groundwork).
- **Performance:** static output. Images via Astro's pipeline → AVIF/WebP with explicit
  dimensions. No web-font FOUT/FOIT. No render-blocking third-party scripts.
- **Analytics:** privacy-first and cookieless (Plausible or Umami), self-hosted or hosted, loaded
  without blocking. No cookie banner should be necessary — and if that changes, say so.
- **Contact:** a `mailto:` with a pre-filled subject **plus** a real form via a serverless
  endpoint (Formspree/Web3Forms/Resend — your call, justify it), with honeypot + rate limiting,
  proper `aria-live` validation messages, and success/error states designed, not `alert()`.
- **CV:** the PDF served from `/cv.pdf`, and an HTML rendering that stays in sync via the same
  content source where practical.
- **Repo hygiene:** conventional commits, a README explaining architecture and how to add a case
  study, ESLint + Prettier, a GitHub Action running build + Lighthouse CI on PRs.
- **Deployment:** Cloudflare Pages, Netlify or Vercel — recommend one and explain why. Custom
  domain ready. Ship a preview URL.

---

## 8. Constraints & integrity rules

- **Never invent facts.** No fabricated metrics, no invented client names, no made-up
  testimonials or endorsements, no logos of companies Max did not work with. If a section feels
  empty without social proof, leave it out rather than fake it — and tell Max what real proof
  would fill it.
- **Respect the NDA** per §5.
- **No dark patterns**, no fake urgency, no newsletter modal on arrival.
- Do not add a technology to the site's stack list that the site does not actually use.
- Everything must degrade gracefully with JavaScript disabled: content is readable, navigation
  works, contact details are reachable.

---

## 9. How to work (phase gates)

**Phase 1 — Direction.** Restate the brief in your own words, flag ambiguities, ask your
questions in one batch. Deliver a sitemap, the content outline, and the **three home-page
concepts** (§6) as real HTML with real copy. **Stop. Get a concept selected.**

**Phase 2 — Design system.** From the chosen concept, produce the token set (colour for both
themes, type scale, spacing, radii, shadows, motion), the component inventory, and one fully
designed page as reference. **Stop for approval.**

**Phase 3 — Build.** Implement the full site: all routes, both locales, content model, forms,
SEO, OG generation. Commit in logical increments.

**Phase 4 — Verification.** Run the §1 gates and report actual numbers, not claims: Lighthouse
scores per route, axe-core results, bundle sizes, screenshots at 375/768/1440 in both themes.
Fix everything that fails. **Report anything you could not fix and why.**

**Phase 5 — Hand-off.** Deploy, provide the URL, write the README, and list: (a) what Max should
review as a native Ukrainian speaker, (b) what needs his real data (portrait, Groundwork repo
URL, domain), (c) the three highest-value improvements you would make next.

---

## 10. Definition of Done

Ship only when every line is true:

- [ ] All §1 quality bars met, with measured evidence attached
- [ ] Both locales complete; no untranslated or machine-rough strings left unflagged
- [ ] Every word of copy is real, specific, and traceable to §2
- [ ] Four case studies written in the §5 spine, including the "subtle part" for each
- [ ] Groundwork is unmistakably the flagship and is linked from every page
- [ ] Light and dark themes both fully designed and contrast-verified
- [ ] Keyboard-only pass completed on every route; focus order sane; skip-link present
- [ ] Zero console errors or warnings; zero broken links; 404 page designed
- [ ] Contact path tested end-to-end (form delivers, mailto works)
- [ ] Repo readable as a work sample; README explains how to add a case study
- [ ] Deployed, with a live URL

---

## 11. First message back to Max

Do **not** start building. Reply with:

1. Your understanding of the positioning in 3 sentences
2. Any assumption you had to make, and the questions you need answered (batched, each with your
   recommended default so he can approve quickly)
3. Your proposed sitemap and content outline
4. Then, on approval, the three concepts

---

### Appendix — assets Max still needs to supply

- Groundwork repository / marketplace URL (and star count if he wants it shown)
- Professional portrait, if he wants one used
- Preferred domain name
- Confirmation of which case-study details are safe to publish under his NDAs
- GitHub profile URL, if it should be linked
