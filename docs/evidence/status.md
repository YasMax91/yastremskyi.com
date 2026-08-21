# Evidence — the status page in production

Measured 2026-08-21 against the live site, after the ingest token was configured.

## The chain works end to end

| Step                                      | Result                                                                                                             |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Scheduled probe (GitHub Actions)          | `probe: {"kind":"uptime","ok":true,"ms":285,"status":200,"tlsDaysRemaining":88}` → `ingest accepted the probe`     |
| CI gate report, green run on `main`       | 7 routes posted, `ingest answered 202`                                                                             |
| `GET https://yastremskyi.com/api/status`  | 200, **1 044 bytes** against a 4 096 budget, `cache-control: public, max-age=60`                                   |
| Ingest without a token / with a wrong one | 401, identical body for both                                                                                       |
| `/status` in a browser                    | availability 100.00%, p50 285 ms, contact answering, TLS 88 days, Node 18.20.8, 7 gate rows, commit link resolving |
| The 30-day bar                            | 1 day up, 29 blank — a day nobody probed is blank, never green                                                     |

## Lighthouse, against production rather than a preview

|           | Perf | A11y | BP  | SEO | LCP      | CLS | TBT |
| --------- | ---- | ---- | --- | --- | -------- | --- | --- |
| `/status` | 99   | 100  | 100 | 100 | 1 105 ms | 0   | 0   |

`No browser errors logged to the console`. Performance 99 rather than 100 is real
network variance against a real edge; the bar is 98.

## Two defects the live page found, that no local run could

**The contact health check reported a healthy endpoint as down.** It was
hard-coded to loopback, and both services bind the docker bridge because the
reverse proxy is a container. That is the worst thing this page could be wrong
about — the contact form is the only channel on the site that can fail quietly.
The default now follows the service's own bind address.

**Caddy concatenated its own cache header onto the API's.** The site-wide
`Cache-Control` matcher applied to proxied responses too, so the endpoint
answered `public, max-age=0, must-revalidate, public, max-age=60`. `/api/*` is
excluded from that matcher now.

## And one the CI log could not explain by itself

The probe job aborted before printing anything, on a run where `curl` had
succeeded. `read a b < <(curl -w '...')` returns non-zero because `-w` emits no
trailing newline, and GitHub runs every step under `bash -e`. Reproduced locally
under the same flags before changing anything — the reproduction is what turned
an empty log into a one-line fix.
