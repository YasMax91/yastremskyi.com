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
        'cap.php84laravel12',
        'cap.nodenestjs',
        'cap.mysql8postgresql',
        'cap.redis',
        'cap.docker',
        'cap.microservices',
      ],
    },
    {
      group: 'Money & correctness',
      key: 'caps.money',
      items: [
        'cap.pcicardtokenization',
        'cap.idempotencykeys',
        'cap.decimalmoneywithbcmath',
        'cap.multicurrencyandvat',
        'cap.accountingandtaxexport',
        'cap.recurringbillingdirect',
      ],
    },
    {
      group: 'Applied AI in production',
      key: 'caps.ai',
      items: [
        'cap.schemaconstrainedextra',
        'cap.toolcallingwithoutauto',
        'cap.percallcostaccounting',
        'cap.providerabstractionand',
        'cap.promptinjectiondefence',
        'cap.responseregressiontest',
      ],
    },
    {
      group: 'Integration & reliability',
      key: 'caps.integration',
      items: [
        'cap.driverfallbackchains',
        'cap.deliverystatuswebhooks',
        'cap.integrationhealthprobe',
        'cap.queuedjobchains',
        'cap.oauth2machinetomachine',
      ],
    },
    {
      group: 'Hard rendering & data',
      key: 'caps.rendering',
      items: [
        'cap.hebrewrtlandbidipdf',
        'cap.ocrbymorphologicalgrid',
        'cap.cielabcolourclassifica',
        'cap.typotolerantsearchandr',
        'cap.ffmpegandimagickpipeli',
      ],
    },
    {
      group: 'How I lead',
      key: 'caps.lead',
      items: [
        'cap.specdrivendevelopment',
        'cap.blastradiusdiscoverybe',
        'cap.adversarialverificatio',
        'cap.openapicontractskeptcu',
        'cap.serversiderbac',
        'cap.frontendwhenitisinthew',
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
