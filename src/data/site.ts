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
    { nameKey: 'lang.english', levelKey: 'lang.level.b2', name: 'English' },
    { nameKey: 'lang.ukrainian', levelKey: 'lang.level.native', name: 'Ukrainian' },
    { nameKey: 'lang.russian', levelKey: 'lang.level.fluent', name: 'Russian' },
  ],

  /**
   * This site's own source. The footer renders the link only when this is set,
   * because a dead "source of this site" link is worse than no link — it is a
   * claim about craft that fails on the first click, and it shipped broken for a
   * few hours before a link check caught it.
   */
  repo: 'https://github.com/YasMax91/yastremskyi.com' as string | null,

  contact: {
    email: 'm.yastremskyj@gmail.com',
    emailSubject: 'Senior Backend role',
    linkedin: 'https://www.linkedin.com/in/yastremskyi',
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
      from: '2024-04',
      to: 'present',
      role: 'Senior Backend Engineer · Tech Lead',
      org: 'RaDevs',
      noteKey: 'tl.radevs.note',
      note: 'Laravel platforms and the studio’s AI engineering practice.',
      highlights: [
        'tl.radevs.h1',
        'tl.radevs.h2',
        'tl.radevs.h3',
        'tl.radevs.h4',
        'tl.radevs.h5',
        'tl.radevs.h6',
      ],
    },
    {
      from: '2022-08',
      to: '2024-04',
      role: 'Full-Stack PHP Engineer',
      org: 'TerraForce Software',
      noteKey: 'tl.terraforce.note',
      note: 'E-commerce, admin and CRM platforms, mobile app APIs.',
      highlights: [
        'tl.terraforce.h1',
        'tl.terraforce.h2',
        'tl.terraforce.h3',
        'tl.terraforce.h4',
        'tl.terraforce.h5',
      ],
    },
    {
      from: '2020-06',
      to: '2022-08',
      role: 'PHP Engineer',
      org: 'Imrev',
      noteKey: 'tl.imrev.note',
      note: 'E-commerce and corporate platforms, integrations.',
      highlights: ['tl.imrev.h1', 'tl.imrev.h2', 'tl.imrev.h3'],
    },
    {
      from: '2020-01',
      to: '2020-06',
      role: 'Junior Engineer (C++ / .NET)',
      org: 'YUKS++',
      noteKey: 'tl.yuks.note',
      note: 'Legacy desktop maintenance and a WinForms migration.',
      highlights: ['tl.yuks.h1'],
    },
  ],

  /** Grouped honestly. No percentages — a skill bar tells a reader nothing. */
  capabilities: [
    {
      group: 'Backend & platform',
      key: 'caps.backend',
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
      key: 'caps.money',
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
      key: 'caps.ai',
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
      key: 'caps.integration',
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
      key: 'caps.rendering',
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
      key: 'caps.lead',
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
      titleKey: 'principle.ground.title',
      bodyKey: 'principle.ground.body',
      title: 'Ground it, don’t guess it.',
      body: 'What an external provider does is confirmed against its official documentation with a citation, or marked unknown and proven in a sandbox. A plausible answer about someone else’s API is the most expensive kind of wrong.',
    },
    {
      titleKey: 'principle.spec.title',
      bodyKey: 'principle.spec.body',
      title: 'The spec is the cheap place to be wrong.',
      body: 'Discovery is wide; the change is narrow. One task in three never reaches code because the discussion showed it was mis-scoped, already solved, or cheaper without development.',
    },
    {
      titleKey: 'principle.claim.title',
      bodyKey: 'principle.claim.body',
      title: 'A claim is not evidence.',
      body: 'Tests, static analysis and contract checks run as gates rather than as good intentions. “It works” gets challenged by a reviewer whose only job is to try to refute it.',
    },
  ],
} as const;

export type Site = typeof site;
