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
      // native speaker. Announcing a locale that is not ready is worse than
      // shipping one language well.
      filter: (page) => !page.includes('/uk/'),
    }),
  ],

  // Tailwind 4 ships as a Vite plugin. The former @astrojs/tailwind integration
  // is deprecated — see the Astro styling guide.
  vite: {
    plugins: [tailwindcss()],
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
