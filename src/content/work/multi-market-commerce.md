---
order: 3
title: Multi-market commerce platform
summary: One codebase cloned per market — config-driven currency, locale and timezone — with a pricing engine, driver-abstracted payments and delivery, and an ERP catalogue sync.
context: |
  A headless commerce platform built once and deployed per market: a storefront
  JSON API covering catalogue, category trees, characteristics, cart, wishlist,
  search, checkout, orders and accounts, plus the back-office admin the client's
  own staff live in all day.
constraint: |
  "Per market" is where these platforms usually rot. Each new market brings its
  own currency, locale, timezone, payment providers and delivery carriers, and
  the tempting move is to fork — after which every fix has to be applied N times
  and eventually is not. Meanwhile the catalogue is not ours: it lives in the
  client's ERP, and it changes underneath us.
decision:
  chosen: |
    One codebase, cloned per market, with currency, locale and timezone driven by
    configuration rather than by conditionals. Payments and delivery sit behind
    driver interfaces, so a new market adds a driver instead of a branch. Retail
    and wholesale pricing are one engine with rules, not two code paths that
    drift apart.
  rejected: |
    A single multi-tenant deployment serving every market. It is more elegant on
    a diagram, and it makes one market's traffic spike, one market's migration
    and one market's outage everybody's problem.
  tradeoff: |
    Cloned deployments mean N places to deploy and N sets of configuration to
    keep honest. That cost is real, and it buys blast-radius isolation: a change
    that goes wrong goes wrong in one market.
subtle: |
  Catalogue sync from the ERP stages every product change as a typed DTO for a
  human to review before it applies. It would have been far less work to write
  the incoming data straight to the catalogue — and an import that applies itself
  is an import nobody can undo. When the ERP sends a bad price on ten thousand
  products, the difference between staging and applying is the difference between
  a rejected batch and a weekend.
outcome: |
  Live across markets, with buyer authentication over JWT, Google and Facebook
  OAuth and email OTP, SEO output including JSON-LD and sitemaps, and an admin
  home-page builder the client's team uses without us.
stack:
  - Laravel 12
  - JSON API
  - Job chains
  - Typed DTOs
  - JSON-LD
  - OAuth
ndaReviewed: false
---
