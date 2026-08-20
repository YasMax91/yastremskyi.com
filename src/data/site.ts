/**
 * Every fact the site states about Max, in one typed place.
 *
 * Two sources are permitted and no others: `portfolio-site-prompt.md` §2 (the
 * brief) and Max's own CV, which he approved as a source on 2026-08-19. If a
 * claim cannot be traced to one of them it does not belong here — the site's
 * whole argument is that its author does not invent things.
 *
 * The phone number is deliberately absent. It appears only in the downloadable
 * PDF, which is served with `X-Robots-Tag: noindex`, so it never enters a search
 * index or a scraper's contact list.
 */

export const site = {
  name: 'Max Yastremskyi',
  title: 'Senior Backend Engineer · Tech Lead',
  origin: 'https://yastremskyi.com',

  /** The one sentence the site must land (brief §3, wording chosen 2026-08-19). */
  positioning:
    'I own the parts of a system that must not be approximately right — money, orders, production workflows — and I build the tooling that proves the work was actually done.',

  location: 'Ukraine',
  timezone: 'UTC+3',
  availability: 'Remote worldwide · relocation · available at two weeks’ notice',
  experience: '6+ years',
  markets: ['Israel', 'Ukraine'],

  languages: [
    { name: 'English', level: 'B2' },
    { name: 'Ukrainian', level: 'Native' },
    { name: 'Russian', level: 'Fluent' },
  ],

  /**
   * This site's own source, once it is public. Left null until the repository
   * actually exists: the footer renders the link only when this is set, because
   * a dead "source of this site" link is worse than no link — it is a claim
   * about craft that fails on the first click. It shipped broken for a few
   * hours before a link check caught it.
   */
  repo: null as string | null,

  contact: {
    email: 'm.yastremskyj@gmail.com',
    emailSubject: 'Senior Backend role',
    linkedin: 'https://www.linkedin.com/in/max-yastremskyi-49b344212',
    github: 'https://github.com/YasMax91',
  },

  groundwork: {
    repo: 'https://github.com/YasMax91/groundwork',
    licence: 'MIT',
    /**
     * Read from the installed plugin at v0.27.1, not from the brief — the brief
     * quotes 11 procedures and 8 gates, which were true at v0.20 and are now
     * stale. Publishing a number a reader can check and find wrong is the one
     * mistake this site cannot afford.
     */
    agents: 5,
    gates: 11,
    procedures: 14,
  },

  /**
   * Adoption figures from brief §2. Point-in-time by nature, so they are never
   * rendered without `asOf` beside them.
   */
  stats: {
    asOf: 'August 2026',
    codebases: 7,
    procedureRuns: 340,
    specsWritten: 160,
    frontendHandoffs: 27,
    stoppedBeforeCode: '1 in 3',
  },

  /**
   * Employers are named here because Max cleared it on 2026-08-19 and his own
   * CV names them. Case studies are deliberately NOT tied to any employer or
   * period: the studio has a public client list, and joining the two would give
   * a reader a key to a client the NDA protects.
   */
  timeline: [
    {
      from: 'Apr 2024',
      to: 'Present',
      role: 'Senior Backend Engineer · Tech Lead',
      org: 'RaDevs',
      note: 'Laravel platforms and the studio’s AI engineering practice.',
      highlights: [
        'Authored and open-sourced Groundwork, and set the team’s engineering standards and Definition of Done around it.',
        'Built a reusable multi-market headless commerce platform: storefront JSON API, back-office admin, retail and wholesale pricing engine, driver-abstracted payments and delivery.',
        'Shipped applied AI to production — an intent gateway that validates model output instead of executing it, voice intake behind schema-constrained extraction, OCR and computer-vision pipelines.',
        'Engineered the payment and financial subsystems: card tokenization, idempotency-keyed clearing, decimal money with bcmath, accounting and tax export, signed-webhook reconciliation.',
        'Architected order-lifecycle and production-workflow systems with multi-station scan tracking, quality control, weighted auto-assignment and centralised state-transition guards.',
        'Mentored engineers through review agents and architecture decisions.',
      ],
    },
    {
      from: 'Aug 2022',
      to: 'Apr 2024',
      role: 'Full-Stack PHP Engineer',
      org: 'TerraForce Software',
      note: 'E-commerce, admin and CRM platforms, mobile app APIs.',
      highlights: [
        'Built and maintained e-commerce backends with subscription payments, local checkout and delivery, multi-language storefronts and response-query caching.',
        'Developed admin panels with custom tools, cards, fields and dashboards, including a leads-management CRM with rich-text editing and invoice generation.',
        'Built API-first mobile app backends: JWT auth, push notifications, QR codes, two-factor auth, and PDF/Word/Excel document generation.',
        'Delivered search-driven features — full-text search, geo-targeting, SMS and messenger notifications, real-time sockets, social login.',
        'Integrated an early LLM alongside Google APIs and web-scraping pipelines for content generation.',
      ],
    },
    {
      from: 'Jun 2020',
      to: 'Aug 2022',
      role: 'PHP Engineer',
      org: 'Imrev',
      note: 'E-commerce and corporate platforms, integrations.',
      highlights: [
        'Built e-commerce and corporate platforms end to end — custom modules, admin panels and storefronts — across concurrent client projects.',
        'Integrated payment, shipping and analytics providers, replacing manual client workflows with automated order flows.',
        'Optimised page, catalogue and search performance through query tuning, indexing and caching, and owned post-production incident handling.',
      ],
    },
    {
      from: 'Jan 2020',
      to: 'Jun 2020',
      role: 'Junior Engineer (C++ / .NET)',
      org: 'YUKS++',
      note: 'Legacy desktop maintenance and a WinForms migration.',
      highlights: [
        'Maintained and extended legacy modules, contributed to a migration to WinForms, and resolved pre-release defects during QA and hardening cycles.',
      ],
    },
  ],

  /** Grouped honestly. No percentages — a skill bar tells a reader nothing. */
  capabilities: [
    {
      group: 'Backend & platform',
      items: [
        'PHP 8.4, Laravel 12',
        'Node, NestJS',
        'MySQL 8, PostgreSQL',
        'Redis',
        'Docker',
        'Microservices',
      ],
    },
    {
      group: 'Money & correctness',
      items: [
        'PCI card tokenization',
        'Idempotency keys',
        'Decimal money with bcmath',
        'Multi-currency and VAT',
        'Accounting and tax export',
        'Recurring billing, direct debit',
      ],
    },
    {
      group: 'Applied AI in production',
      items: [
        'Schema-constrained extraction',
        'Tool calling without auto-execution',
        'Per-call cost accounting',
        'Provider abstraction and fallback',
        'Prompt-injection defence',
        'Response-regression tests',
      ],
    },
    {
      group: 'Integration & reliability',
      items: [
        'Driver fallback chains',
        'Delivery-status webhooks',
        'Integration health-probe registry',
        'Queued job chains',
        'OAuth2 machine-to-machine',
      ],
    },
    {
      group: 'Hard rendering & data',
      items: [
        'Hebrew RTL and bidi PDF',
        'OCR by morphological grid extraction',
        'CIE-Lab colour classification',
        'Typo-tolerant search and ranking',
        'FFmpeg and Imagick pipelines',
      ],
    },
    {
      group: 'How I lead',
      items: [
        'Spec-driven development',
        'Blast-radius discovery before planning',
        'Adversarial verification',
        'OpenAPI contracts kept current',
        'Server-side RBAC',
        'Frontend when it is in the way: Vue, React, TypeScript',
      ],
    },
  ],

  principles: [
    {
      title: 'Ground it, don’t guess it.',
      body: 'What an external provider does is confirmed against its official documentation with a citation, or marked unknown and proven in a sandbox. A plausible answer about someone else’s API is the most expensive kind of wrong.',
    },
    {
      title: 'The spec is the cheap place to be wrong.',
      body: 'Discovery is wide; the change is narrow. One task in three never reaches code because the discussion showed it was mis-scoped, already solved, or cheaper without development.',
    },
    {
      title: 'A claim is not evidence.',
      body: 'Tests, static analysis and contract checks run as gates rather than as good intentions. “It works” gets challenged by a reviewer whose only job is to try to refute it.',
    },
  ],
} as const;

export type Site = typeof site;
