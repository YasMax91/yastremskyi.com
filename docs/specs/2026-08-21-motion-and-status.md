# Spec — motion pass, and a public /status surface

- **Date:** 2026-08-21
- **Level:** L3
- **State:** motion DELIVERED and measured (docs/evidence/motion.md); /status not started
- **Delivery order:** (1) motion, (2) /status. Motion ships first because it touches no server.

---

## 1. Why

The site argues that this engineer measures rather than claims, and it currently proves that with
static evidence in a README. Two additions strengthen the argument without weakening it:

1. **Motion** — the craft signal. It must cost nothing measurable, or it contradicts the argument
   it is meant to support.
2. **`/status`** — the backend is already real (a dependency-free contact endpoint under a hardened
   systemd unit) and completely invisible. A status page makes it visible, and makes every quality
   number on the site checkable against a live source instead of a screenshot.

## 2. Grounding (verified 2026-08-21)

Source: MDN `browser-compat-data`, branch `main`, fetched from the raw GitHub endpoint.

| Feature                                          | Chrome / Edge | Safari | Firefox           |
| ------------------------------------------------ | ------------- | ------ | ----------------- |
| `@view-transition` (cross-document)              | 126           | 18.2   | **not supported** |
| `animation-timeline` incl. `view()` / `scroll()` | 115           | 26     | **preview only**  |
| `@starting-style`                                | 117           | 17.5   | 129               |

Consequence, and the rule the whole motion layer is built on: **Firefox gets no scroll-driven
reveals and no page transitions.** Therefore the base state of every animated element is the
finished state, and motion is applied only inside `@supports`. An element must never be able to get
stuck invisible.

Second grounded fact — Chromium excludes elements at `opacity: 0` from LCP candidacy
(<https://web.dev/articles/lcp>, corroborated by
<https://www.debugbear.com/blog/opacity-animation-poor-lcp>). An entrance fade on the hero heading
would therefore delay LCP by the animation's own duration. Measured headroom before this change is
97 ms (LCP 1203 ms against a 1300 ms bar), so the hero heading is not animated at all.

## 3. Scope

### In

- A motion layer: scroll-driven reveals below the fold, rules that draw in, restrained
  cross-document view transitions, an animated state change in the gate simulator.
- A CI barrier that fails the build when the motion rules above are broken.
- `/status`, fed by a service on the VPS plus an external prober.

### Out

- Any JavaScript for motion. Any animation on the hero heading. Any second signature element
  (CRD §6 permits exactly one, and it is the gate simulator). Any analytics or visitor metric.
  Any Ukrainian copy — `/uk` is still unpublished by prior decision.

## 4. Acceptance criteria

### Motion

| #   | Criterion                                                                              | How it is proven                                          |
| --- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| M1  | Performance ≥ 98, LCP < 1300 ms, CLS < 0.01, TBT < 100 ms on every route               | `npm run lighthouse`, reports kept in `docs/evidence/`    |
| M2  | No external JS file in `dist/`; inline JS on `/` does not grow                         | `scripts/check-motion.mjs`                                |
| M3  | Every `@keyframes`-driven animation is disabled under `prefers-reduced-motion: reduce` | `scripts/check-motion.mjs`                                |
| M4  | No animation targets the hero heading                                                  | `scripts/check-motion.mjs`                                |
| M5  | Without `animation-timeline` support, all content is visible immediately               | base state is the finished state; asserted by the barrier |
| M6  | Keyboard operation, focus visibility and landmarks unchanged                           | `npm run audit`                                           |
| M7  | Print output unchanged                                                                 | motion layer is excluded under `@media print`             |

### /status

| #   | Criterion                                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| S1  | `GET /api/status` returns valid JSON under 4 KB                                                                                                |
| S2  | `POST /api/status/probe` → 401 without a token, 401 on a wrong token (constant-time compare), 422 on a malformed body, 429 over the rate limit |
| S3  | The store survives a crash mid-write (atomic replace), a missing file and a corrupt file                                                       |
| S4  | `/status` without JavaScript shows a build-time snapshot, honestly dated                                                                       |
| S5  | Stale prober data is labelled stale, never presented as current                                                                                |
| S6  | `/status` holds the same Lighthouse bars as every other route                                                                                  |
| S7  | The status service cannot take down the contact endpoint — separate unit, separate port                                                        |

## 5. Design

### 5.1 Motion layer

`src/styles/motion.css`, imported by `global.css`. Three primitives, no more:

- `.reveal` — enters on a `view()` timeline: `translateY` plus opacity, `--dur-enter`, `--ease-out`.
  Staggered by a `--i` custom property where a group enters together.
- `.rule-draw` — a hairline that scales from the left as it comes into view. This is the "drafting"
  character: the page draws itself the way a technical drawing is drawn.
- Gate-simulator panel change — `transform` only, never opacity, so the element is a full-opacity
  LCP candidate from the first frame.

Cross-document transitions: `@view-transition { navigation: auto }`, with `view-transition-name` on
the header and footer so they stay put instead of crossfading. Disabled under reduced motion.

### 5.2 /status

- `server/status.mjs` — separate service, zero dependencies, loopback, port 8789.
  `GET /api/status` reads the store; `POST /api/status/probe` ingests a prober measurement behind a
  bearer token compared in constant time, rate-limited, schema-validated.
- Store: a JSON ring buffer, 30 days of daily aggregates, written temp-then-rename.
- `.github/workflows/probe.yml` — cron every 10 minutes: measure the site from outside, POST the
  result. CI publishes gate results through the same ingest after a green run on `main`.
- `src/pages/status.astro` — build-time snapshot, progressively refreshed by one fetch (~1 KB
  inline module, the same pattern as `ContactForm`). The 30-day bar is pure CSS.
- Caddy: `handle /api/status*` → `host.docker.internal:8789`. New `status.service` unit reusing the
  contact unit's hardening.
- Footer link only. The five-item main nav stays as CRD §4 requires.

## 6. Decisions taken without asking (and their cost)

| Decision                                               | Reason                                                              | Cost if wrong                                                                 |
| ------------------------------------------------------ | ------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Separate service, not an extension of `contact.mjs`    | A status fault must not take down the only channel to a recruiter   | One more systemd unit                                                         |
| Prober every 10 minutes                                | GitHub Actions cron is imprecise and floors at 5 minutes            | An outage shorter than 10 minutes may be missed; the page states the interval |
| 30-day retention, daily aggregate                      | Exactly what the bar renders                                        | No long history                                                               |
| English only                                           | Matches the standing locale decision                                | None until `/uk` ships                                                        |
| `/status` indexed and in the sitemap                   | It is a showcase, not an internal page                              | It appears in search results                                                  |
| Token as a GitHub secret plus a 0600 `EnvironmentFile` | The public repository must know neither the token nor the origin IP | —                                                                             |
| Stale data is labelled, not hidden                     | The page's whole value is that it is honest                         | —                                                                             |

## 7. Risks

- **Highest:** a scroll-driven reveal that leaves content invisible where unsupported. Mitigated by
  making the visible state the base state and gating all motion behind `@supports`; enforced by the
  barrier, not by review.
- The Caddy instance is shared with another project (`tiles-web-1`). `caddy validate` runs before
  any reload, and each step touching it is confirmed with the owner first.
- Repo/reality drift: web root is `/srv/yastremskyi` in the Caddy block but
  `/var/www/yastremskyi.com` in `deploy.sh`'s default. Reconcile before the next deploy.
