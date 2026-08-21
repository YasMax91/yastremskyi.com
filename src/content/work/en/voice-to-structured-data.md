---
order: 1
title: Voice to structured data
summary: Speech becomes a validated task rather than a guess — domain-tuned transcription, schema-constrained extraction, and a human in front of every action.
context: |
  A CRM used by managers who are driving, standing on a shop floor, or between
  appointments. Typing a task costs them more attention than they have, so the
  input is a voice note — in Hebrew, in Ukrainian, or in whatever the manager
  actually speaks — and the system has to turn it into a real record with a
  deadline, an owner and a client attached.
constraint: |
  A speech-to-text model is confident about words it did not hear, and a language
  model is confident about fields it invented. Both failures look identical to a
  correct answer: fluent, well-formed, and wrong. On top of that the same words
  mean different things at different hours — "tomorrow at six" is not a value a
  database can hold — and the manager is waiting, so the request cannot sit open
  while a paid provider takes its time.
decision:
  chosen: |
    Transcription tuned with the domain's own vocabulary, then extraction that is
    schema-constrained at temperature zero, so the model chooses between fields
    that exist rather than describing what it heard. Relative time is resolved to
    an absolute, timezone-aware instant at extraction, not at display. The work is
    queued: HTTP answers immediately and the finished task arrives over WebSocket.
  rejected: |
    Letting the model call tools directly and act on its own output. It is faster
    to build and demonstrates beautifully. It also means the first
    misheard client name becomes a real record assigned to a real person.
  tradeoff: |
    A confirmation step costs the manager a tap and costs us a UI state that
    would not otherwise exist. In exchange, nothing reaches the database that a
    human did not look at, and a bad transcription is a shrug rather than an
    incident.
subtle: |
  The tests must never call the provider. It is not about the invoice — a suite
  that depends on a remote model is a suite that fails for reasons unrelated to
  the change under test, and a team learns to ignore it within a fortnight. The
  provider is mocked in CI, and model upgrades are caught by response-regression
  tests that compare structured output against fixed cases, so a silently
  retrained model is caught by the suite instead of by a user.
outcome: |
  In production with real managers. Every intake carries an audit trail, personal
  data is kept out of the prompt by design, and transcripts fall out of retention
  after thirty days.
stack:
  - Whisper STT
  - Schema-constrained extraction
  - Tool calling
  - Queues
  - WebSocket
  - Hebrew
ndaReviewed: false
---
