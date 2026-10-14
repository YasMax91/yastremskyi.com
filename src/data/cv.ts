/**
 * The CV's own copy — what /cv says, and so what /cv.pdf says, since the PDF is
 * printed from the page.
 *
 * Source: Max's CV of October 2026, which he confirmed as a source of facts on
 * 2026-10-14 (docs/specs/2026-10-14-cv-rework.md). Without the phone number,
 * by his decision the same day — see the note in src/pages/cv.astro.
 *
 * English only: /cv is English in every locale. That is also why this file
 * exists apart from the timeline and capabilities in site.ts — those are i18n
 * keys shared with /about, the home page and /uk/, and every English edit there
 * unsigns a Ukrainian line.
 *
 * Every figure is read from site.ts, never typed: `npm run facts` keeps those in
 * step with the plugin, and a number typed here is a number nothing updates.
 * scripts/cv-content.test.mjs refuses one. Dates, role titles and employers come
 * from `site.timeline` for the same reason.
 *
 * `**text**` is emphasis, rendered as <strong>.
 */

import { site } from './site';
import { useTranslations, DEFAULT_LOCALE } from '../i18n/ui';

const gw = site.groundwork;
const stats = site.stats;
const t = useTranslations(DEFAULT_LOCALE);

/** Adoption figures are point-in-time and never stated without their date. */
const asOf = t('meta.asOf').replace(/^./, (c) => c.toLowerCase());

export interface CvRole {
  org: string;
  descriptor: string;
  intro?: string;
  highlights: string[];
  stack: string;
}

export const cv = {
  headline: `${site.title} — PHP / Laravel · Node / NestJS · AI-Assisted Development & Applied AI`,
  openTo: 'Open to remote & relocation',

  summary: `Senior Backend Engineer and Tech Lead with **${site.experience}** building production Laravel platforms for CRM, e-commerce, manufacturing and premium-services businesses, many of them from an empty repository. I own the domains that must not be approximately right — order lifecycles, multi-station production workflows, payments, clearing and accounting — on the latest stack (**PHP 8.4, Laravel 12**), and integrate payment, messaging, calendar and logistics providers with sandbox-verified reliability. I authored **Groundwork**, an open-source (MIT) multi-agent platform for spec-driven development adopted across ${stats.codebases} codebases, ship **applied-AI features in production** and have **mentored 5 engineers**.`,

  achievements: [
    `Authored and open-sourced (MIT) **Groundwork** — an AI spec-driven development platform (Claude Code plugin): ${gw.agents} specialized review agents, ${gw.gates} automated gates, ${gw.versions} releases since June 2026 with ${gw.tests} hook tests in CI — adopted across **${stats.codebases} production codebases** (${stats.procedureRuns} procedure runs, ${stats.specsWritten} specs, ${stats.frontendHandoffs} auto-generated frontend hand-offs; ${asOf}); **${stats.stoppedBeforeCode} tasks is stopped before code** as mis-scoped.`,
    'Shipped **applied AI in production**: voice intake (Whisper STT → schema-constrained, temperature-0 LLM extraction → structured actions) behind real-time WebSocket delivery, an intent gateway that validates model output instead of auto-executing it, and OCR/computer-vision document parsing — with provider fallback, prompt-injection defenses and response-regression tests.',
    'Built **payment & financial subsystems** where mistakes are irreversible — PCI tokenization, idempotent clearing, multi-currency money, accounting/tax export and signed-webhook reconciliation.',
    'Built a reusable **multi-market headless e-commerce platform** (Laravel 12): one codebase cloned per market, with storefront API, back-office admin, retail/wholesale pricing engine, pluggable payments and delivery, and staged 1C (ERP) catalogue sync.',
    'Delivered multiple **order-lifecycle & production-workflow platforms** (multi-station scan/barcode tracking, QC, weighted auto-assignment) with server-side RBAC, Hebrew/RTL document rendering and multi-channel messaging.',
  ],

  /** Keyed by `site.timeline[].org`, which supplies the dates and the role title. */
  roles: {
    RaDevs: {
      org: 'RaDevs',
      descriptor: 'Product studio — Laravel back-ends & AI tooling',
      intro:
        'Architecture, delivery and technical leadership across multiple production Laravel platforms (e-commerce, CRM, manufacturing, premium services) plus the studio’s AI-assisted development platform.',
      highlights: [
        `Authored **Groundwork** — an open-source (MIT) AI spec-driven development platform (Claude Code plugin): risk-based task classification (L0–L4), ${gw.agents} review agents (impact map, blind-spot map, grounded external-API research, adversarial verification, conformance), ${gw.gates} automated gates (format, static analysis, tests, OpenAPI contract, defect scan, migration locks, full suite before push) and a companion-plugin ecosystem. Adopted across ${stats.codebases} production codebases; ${stats.stoppedBeforeCode} tasks is stopped before code as mis-scoped.`,
        'Built delivery management into Groundwork: **estimates quoted from a ledger of measured agent time** (median and sample size), **client-facing scope documents** generated in English with a Russian mirror, and **live verification against the running app** before a task can close.',
        'Built and maintain a reusable, **multi-market headless e-commerce platform** (Laravel 12): a storefront JSON API (catalogue, category trees, characteristics, cart, wishlist, search, checkout, orders, account) plus a back-office admin panel — cloned per market with config-driven currency, locale and timezone.',
        'Implemented the **commerce core**: a retail/wholesale **pricing & discount engine** (per-channel product/category rules, discount cascade, promo pricing), driver-abstracted **payments** (LiqPay online + cash-on-delivery; Stripe) and **delivery** (Nova Poshta), buyer auth (JWT + Google/Facebook OAuth + email OTP), queued transactional email, SEO (JSON-LD, sitemap/robots) and an admin home-page builder.',
        'Built a staged **1C (ERP) catalogue sync** — queued job chains staging per-product changes via typed DTOs for admin review/apply — with Excel/PDF import-export and image sync.',
        'Built a production **AI gateway microservice** that translates CRM conversation turns into validated model **intents (tool-calling)** without auto-executing them — OpenAI Whisper speech-to-text tuned with domain vocabulary (incl. Hebrew), pinned models, per-call **cost accounting** and shared-secret auth.',
        'Shipped **LLM features in production** — a voice **dictation assistant** creating/updating client records from speech (verbatim Hebrew transcription, tool-loop, PII-safe) and voice task intake (Whisper → schema-constrained / temperature-0 extraction) behind WebSocket delivery, with provider-mocked CI, audit and prompt-injection defenses; plus **OCR / computer-vision** (Tesseract, OpenCV) and typo-tolerant **search & ranking** (Meilisearch/Algolia).',
        'Automated **voice debt-collection** for a community-management platform — synthesized Hebrew **speech over telephony** with live-operator handoff — with recurring **standing-order billing** (Grow) and Masav direct-debit collection.',
        'Architected **order-lifecycle & production-workflow systems**: multi-station barcode/scan movement tracking, quality-control and supervisor approvals, staff attendance and weighted auto-assignment — with centralized state-transition guards and server-side RBAC.',
        'Engineered **payment & financial subsystems**: card tokenization (PCI — tokens only), hierarchical payment requests, idempotency-keyed clearing, multi-currency decimal-string money (bcmath), clearing-gateway integrations and **accounting/tax export**, with signed-webhook reconciliation and all-or-nothing document issuance.',
        'Delivered **multi-channel messaging** with driver fallback chains (Twilio → WhAPI → WhatsApp Cloud API), delivery-status webhooks and language-aware templates (Hebrew/English/Spanish), plus **Hebrew RTL/bidi document rendering** (mPDF/dompdf routing) for correct invoices and tickets.',
        'Built an async **media-processing microservice** (FFmpeg + Imagick, S3/MinIO, Redis-queued jobs, webhooks, OAuth2 client-credentials), integrated calendar (Google Calendar two-way sync), scheduling (Boulevard GraphQL) and **real-time flight monitoring**, and added an **integration health-probe registry** (credential masking) to catch silent failures before users.',
        'Designed **microservice architectures** with versioned REST APIs documented via OpenAPI (l5-swagger), whitelisted query filtering, event/job-driven side effects, and realtime channels over WebSockets (Pusher protocol / Soketi / Reverb).',
        'Set the team’s engineering standards and Definition of Done — **test-first (TDD)**, static analysis (PHPStan/Larastan), Pint, OpenAPI contracts and auto-generated frontend hand-offs — and **mentored 5 engineers** through code review, the review agents and architecture decisions.',
      ],
      stack:
        'PHP 8.4 (8.2–8.4), Laravel 12, MySQL 8, Redis/Horizon, JWT · Sanctum · Passport (M2M), Socialite (Google/Facebook), Soketi/Pusher/Reverb, spatie (permission/translatable/sluggable), LiqPay, Nova Poshta, 1C (ERP), Resend, FFmpeg, Imagick/Intervention, AWS S3 · MinIO, Twilio & WhatsApp Cloud API, Google Calendar, Boulevard (GraphQL), OpenAI (Whisper, GPT-4o-mini) & Anthropic Claude, Meilisearch/Algolia, Docker, GitHub Actions, l5-swagger/OpenAPI, PHPStan/Larastan, Pint.',
    },
    'TerraForce Software': {
      org: 'TerraForce Software',
      descriptor: 'E-commerce, admin & mobile backends',
      intro:
        'Back-end work across e-commerce, admin/CRM platforms and mobile app APIs, with third-party payments, search and messaging integrations.',
      highlights: [
        'Built and maintained **e-commerce backends**: Stripe/Cashier subscriptions and payments, WayForPay + Nova Poshta for local checkout and delivery, shopping cart, wishlist, multi-language storefronts, SEO (sitemaps/redirects) and response/query caching.',
        'Developed **Laravel Nova admin panels** with custom tools, cards, fields and dashboards — including a leads-management CRM (intake, lead actions, reporting) with rich-text editing and invoicing/PDF generation.',
        'Integrated **OpenAI (GPT)** for content generation — an early LLM integration — alongside Google APIs and web-scraping/parsing pipelines.',
        'Built **API-first mobile app backends** (JWT, FCM push, Google 2FA, PDF/Word/Excel generation on S3) and **search-driven features** (Elasticsearch, Meilisearch/Scout), GeoIP targeting, Twilio SMS / Telegram notifications and real-time WebSockets.',
        'Integrated **marketplaces, domain registrars and third-party ecosystems** (Amazon SP-API, Namecheap/GoDaddy, Google APIs, Facebook, Strava) behind a unified layer with retry/backoff and idempotency.',
      ],
      stack:
        'Laravel 8–10, PHP 8.1, Laravel Nova, MySQL, Redis, Stripe/Cashier, WayForPay, Nova Poshta, Amazon SP-API, Namecheap/GoDaddy, Google APIs, Elasticsearch/Meilisearch, Twilio, Firebase FCM, AWS S3, OpenAI.',
    },
    Imrev: {
      org: 'Imrev',
      descriptor: 'Digital agency',
      highlights: [
        'Built e-commerce and corporate web platforms end to end (custom Laravel modules, admin panels, storefronts) across concurrent client projects.',
        'Integrated payment, shipping and analytics providers, replacing manual client workflows with automated order flows.',
        'Optimized page, catalog and search performance (query tuning, indexing, caching) and owned post-production incident handling.',
      ],
      stack: 'PHP, Laravel, MySQL, JavaScript, Redis, REST integrations.',
    },
    'YUKS++': {
      org: 'YUKS++',
      descriptor: 'Desktop software',
      highlights: [
        'Maintained and extended legacy C++/.NET modules, contributed to a VB.NET → WinForms migration and resolved pre-release defects during QA/hardening cycles.',
      ],
      stack: 'C++, C#/.NET, VB.NET, WinForms.',
    },
  } satisfies Record<string, CvRole>,

  sideProjects: [
    '**Telegram forum-moderation bot** (Python, aiogram 3, Clean Architecture) — captcha onboarding, pattern-based anti-spam, user trust scoring, tiered plans, EN/RU/UK i18n; 80 pytest tests, with QA and fix agents that verify the bot against its own suite.',
    '**Telegram scheduling bot** (Python, aiogram 3, APScheduler, Docker) — built end to end by a coding agent from a single written spec.',
    '**Technical pre-sales (concept)** — designed an LLM order-intake architecture for a B2B distributor: schema-constrained extraction from email, Excel and messenger orders, deterministic validation, Telegram human-in-the-loop approval, and unposted drafts written to 1C/BAS through an ERP-agnostic adapter.',
  ],

  /** `wide` groups span the full measure; the rest sit in two columns, in this order. */
  skills: [
    {
      label: 'AI-Assisted Development',
      wide: true,
      text: `authored & open-sourced (MIT) **Groundwork**, a Claude Code plugin for spec-driven development: multi-agent review (impact / blind-spot / grounded research / adversarial verification / conformance), risk-based task classification, ${gw.gates} automated gates, live verification, measured estimates, auto-generated API contracts, companion-plugin ecosystem; custom subagents and skills (UI/UX audit, QA and fix agents, PHPDoc generation); MCP; local speech-to-text (whisper.cpp) for task intake.`,
    },
    {
      label: 'AI / LLM Engineering',
      wide: true,
      text: 'OpenAI (Whisper, GPT-4o-mini, JSON-schema / structured outputs, temperature-0 extraction) & Anthropic Claude; production LLM pipelines (STT → structured extraction → action), tool-calling intent gateway, human-in-the-loop approval, prompt-injection defense, provider fallback, cost accounting, response-regression tests; TTS telephony (Hebrew), Tesseract OCR, OpenCV, Meilisearch / Algolia.',
    },
    {
      label: 'Backend',
      text: 'PHP 8.2–8.4 (Laravel 12, Octane; latest 13 / PHP 8.5), NestJS/Node, REST + OpenAPI/Swagger, WebSockets, queues (Redis/Horizon), JWT · Sanctum · Passport (M2M), microservices, DDD, Spatie ecosystem.',
    },
    {
      label: 'Payments & Accounting',
      text: 'Stripe (Cashier), PayPal, Green Invoice/Morning (tokenization + clearing), Meshulam, Grow (Bit), Cardcom, LiqPay, WayForPay, 2Checkout, MIGS, Masav/Nedarim Plus; SUMIT, Rivhit; PCI tokenization, idempotency, webhook reconciliation, standing orders / recurring billing, direct debit, multi-currency (bcmath).',
    },
    {
      label: 'Python',
      text: 'aiogram 3, APScheduler, pytest, Flet, SQLite, Clean Architecture (side projects).',
    },
    {
      label: 'Data & Storage',
      text: 'MySQL 8 (profiling, indexing), PostgreSQL, Redis, AWS S3 / MinIO, Meilisearch / Algolia.',
    },
    {
      label: 'Messaging & Integrations',
      text: 'Twilio (WhatsApp Business API, SMS), WhatsApp Cloud API, WhAPI, Telegram Bot API, Resend/Mailgun/Postmark; Google Calendar/Gmail, Boulevard (GraphQL); Nova Poshta, Ukrposhta, CountryStateCity.',
    },
    {
      label: 'Cloud & DevOps',
      text: 'Docker (Nginx/PHP-FPM/Supervisor, Traefik, Let’s Encrypt), AWS (S3/CloudFront/EC2/SQS), GitHub Actions, Horizon, Sentry, Cloudflare Tunnel, health-probe monitoring.',
    },
    {
      label: 'Frontend & Leadership',
      text: 'Vue 2/3, React, TypeScript/JS · authored team AI-development methodology & standards, multi-agent code review, mentored 5 engineers, stakeholder communication, prioritization, architecture & ADRs.',
    },
    {
      label: 'Quality',
      text: 'test-first (TDD), PHPUnit/Pest, PHPStan/Larastan/Psalm, Pint, feature flags, canary releases, spec-driven development, OpenAPI contracts.',
    },
  ],

  languages: [
    { name: 'English', level: 'B2 (Upper-Intermediate)' },
    { name: 'Ukrainian', level: 'Native' },
    { name: 'Russian', level: 'Fluent' },
  ],
  availability: 'Remote worldwide · Relocation-ready · Available at 2 weeks’ notice',
};
