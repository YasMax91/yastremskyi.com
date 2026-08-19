---
order: 2
title: Payments, clearing and tax documents
summary: Card tokenization, idempotency-keyed clearing and accounting export, in a domain where being approximately right is being wrong.
context: |
  A financial subsystem inside a business platform: it takes card payments,
  clears them against a provider, issues the accounting and tax documents that
  follow, and reconciles everything back when the provider's webhooks arrive.
  Multi-currency, with VAT rules that depend on what was sold and to whom.
constraint: |
  None of it is repeatable. A payment attempt that times out has either taken the
  customer's money or not, and the client's browser cannot tell you which. A tax
  document, once issued, exists in someone's accounting for a year. And money in
  a floating-point column is a rounding error that compounds quietly until an
  accountant finds it.
decision:
  chosen: |
    Money as decimal strings with bcmath, never floats. Every clearing
    transaction carries an idempotency key, so a retry is provably the same
    operation rather than a second one. Card data is tokenized — tokens are
    stored and returned, raw card numbers never are. Document issuance is
    all-or-nothing, and reconciliation runs off signed webhooks rather than off
    optimism.
  rejected: |
    Trusting the provider's response as the source of truth and treating the
    webhook as a notification. It is simpler, and it works until the response is
    lost in transit — at which point the local record and the provider's record
    disagree, and only one of them is holding the customer's money.
  tradeoff: |
    Idempotency keys and signed reconciliation add state that has to be stored,
    expired and reasoned about, and they make a simple charge a multi-step flow.
    That is the cost of being able to answer "did this actually happen?" without
    phoning anyone.
subtle: |
  A tax document with a zero total is rejected outright by the provider. That
  sounds like an edge case until a discount, a refund or a fully-covered line
  produces one in the middle of an otherwise valid batch — and because issuance
  is all-or-nothing, the whole batch fails and nobody's invoices go out. Those
  items have to be recognised and closed locally instead, so the zero never
  reaches the provider at all.
outcome: |
  Running in production, with recurring billing and direct-debit collection built
  on the same foundation, and reconciliation that closes the loop without manual
  intervention.
stack:
  - Laravel
  - bcmath
  - Idempotency keys
  - PCI tokenization
  - Signed webhooks
  - VAT
ndaReviewed: false
---
