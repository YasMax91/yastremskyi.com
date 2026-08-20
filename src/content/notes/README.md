# Notes

Adding a post is one file in this directory. Nothing else changes — the route,
the index, the sitemap entry and the navigation all follow from the collection.

```markdown
---
title: Why a zero-total tax document fails the whole batch
summary: A one-sentence reason to read this, shown on the index and in search results.
published: 2026-09-01
tags: [payments, laravel]
draft: false
---

The body is ordinary markdown.
```

While this directory holds no published post, `/notes` does not exist: the route
returns no paths, so there is no empty page and no dead entry in the sitemap. The
section appears the moment the first file lands.

Set `draft: true` to keep something out of the build while it is being written.

## One gotcha worth knowing

Astro keeps the content layer in `node_modules/.astro/data-store.json`, and a
**deleted** post is not removed from it by a normal build — the page keeps
appearing until the store is cleared. Verified here: removing a post and
rebuilding still produced its route. Adding one works immediately; removing one
needs:

```bash
npm run clean && npm run build
```
