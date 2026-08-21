// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { LOCALES, DEFAULT_LOCALE } from './src/i18n/dictionaries.ts';
import { COMPLETE_LOCALES } from './src/i18n/reviewed.ts';

// The canonical origin. Every absolute URL on the site — canonical tags,
// hreflang alternates, Open Graph images, the sitemap — derives from this one
// value, so moving the site is a one-line change.
const SITE = 'https://yastremskyi.com';

export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'never',

  // English is served from the root and Ukrainian from /uk/. The layer exists
  // now even though Ukrainian copy ships after launch: a third locale must be a
  // content addition, and that claim is only true if the routing was built for
  // it from the start.
  i18n: {
    locales: ['en', 'uk'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },

  integrations: [
    sitemap({
      // A locale enters the sitemap when its review is finished, and not before:
      // announcing a language nobody has read is worse than shipping one well.
      // The list is derived from the review file rather than declared here, so
      // there is no flag anyone has to remember to flip — see scripts/i18n.mjs.
      //
      // /thanks is excluded in every language because it is a destination after
      // a form submit, not something anyone should reach from a search result.
      filter: (page) => {
        const draft = LOCALES.filter((l) => l !== DEFAULT_LOCALE && !COMPLETE_LOCALES.includes(l));
        if (draft.some((l) => page.includes(`/${l}/`))) return false;
        return !page.endsWith('/thanks');
      },
    }),
  ],

  build: {
    // Inlining trades render-blocking round trips for a larger document, which
    // on a throttled mobile connection is the better half of the deal. It also
    // means the document is the stylesheet, so its size sits directly on the
    // critical path: the home page has to stay inside the initial congestion
    // window (~14.6 KB) or it pays a whole extra round trip. Measured, with the
    // numbers, in docs/evidence/motion.md.
    inlineStylesheets: 'always',
  },
});
