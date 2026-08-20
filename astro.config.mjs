// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

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
      // Ukrainian pages are excluded until the copy has been reviewed by a
      // native speaker: announcing a locale that is not ready is worse than
      // shipping one language well. /thanks is excluded because it is a
      // destination after a form submit, not something anyone should reach from
      // a search result.
      filter: (page) => !page.includes('/uk/') && !page.endsWith('/thanks'),
    }),
  ],

  // Tailwind 4 ships as a Vite plugin. The former @astrojs/tailwind integration
  // is deprecated — see the Astro styling guide.
  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    // The whole site's CSS is about 8 KB gzipped, split across a handful of
    // component files. Inlining it trades three render-blocking round trips for
    // a slightly larger document, which on a throttled mobile connection is the
    // better half of the deal — measured, not assumed.
    inlineStylesheets: 'always',
  },
});
