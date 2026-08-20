# Hand-off

Phase 5 of the brief. What is finished, what is waiting on you, what I could not
finish and why, and where I would spend the next day.

---

## 1. What is done

Ten routes, built and measured: `/` · `/groundwork` · `/work` and three case
studies · `/about` · `/cv` · `/thanks` · a designed 404. The notes section is
built and correctly invisible while empty.

**100 / 100 / 100 / 100** on Lighthouse mobile and desktop for every route, with
the reports committed in `docs/evidence/`. CLS 0.000. Zero blocking time. 534
bytes of gzipped JavaScript per page, 1094 on the home page, and no separate
`.js` file at all.

The gate simulator — the one signature element — ships **no JavaScript**. It is
radio inputs and CSS, keyboard-operable natively, and it works with scripting
turned off.

The contact endpoint is written, tested (27 tests) and documented, with a Caddy
config, a hardened systemd unit and a deploy script.

## 2. Waiting on you

| What                                                    | Why it is blocking                                                                                                        | Effort                               |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| **Register `yastremskyi.com`** and point DNS at the VPS | Nothing below can happen without it. Checked free on 2026-08-19; not reserved                                             | minutes                              |
| **Resend account + three DNS records**                  | The contact form cannot send until the sending domain is verified. Records are in `deploy/contact.env.example`            | ~20 minutes                          |
| **Run `deploy/deploy.sh` once**                         | I have no access to the box. Everything it needs is in `deploy/`                                                          | ~30 minutes for the first-time setup |
| **Push Groundwork to 0.27.1 with tags**                 | The site says "semantic versioning" and links the repository. Today it shows one release, `v0.20.0`, while you run 0.27.1 | minutes                              |
| **Clear each case study against your NDAs**             | You chose to vet every one personally. Set `ndaReviewed: true` in the frontmatter as you go                               | ~30 minutes                          |

### What I could not verify, and would not claim

- **The form has never delivered an email.** Every path around delivery is
  tested, including failure, but Resend has never been called — there is no
  verified domain to call it from. The first real send is your test, not mine.
- **The Caddy config has never been loaded by Caddy.** It is written against the
  documented directive syntax; `caddy validate` is the first line of
  `deploy/README.md` for that reason.
- **Nothing has been measured from a real network.** Every number here is
  Lighthouse's simulated mobile connection against localhost. Field performance
  from Tel Aviv or São Paulo is a different question, and the Cloudflare proxy in
  front of the origin is the answer to it.

## 3. For you as a native Ukrainian speaker

Nothing yet — and that is deliberate. You chose English at launch with Ukrainian
after, so no Ukrainian copy has been written for review. What is ready for it:

- The routing (`/uk/`), the dictionary (`src/i18n/ui.ts`) and the font subsets
  all cover Ukrainian already. The Cyrillic glyphs are in the shipped fonts.
- `src/i18n/ui.ts` contains **draft Ukrainian UI strings** — around twenty short
  labels. Those are mine, not a native speaker's, and every one needs your eyes
  before `/uk/` is published.
- The display face was changed from Archivo to Onest specifically because Archivo
  has no Cyrillic at all. Had that gone unnoticed, every Ukrainian heading would
  have silently fallen back to a system font.

When you want the locale: the case studies are the long texts, roughly 2,500
words in total.

## 4. The three highest-value things to do next

**One — put Cloudflare in front and measure the field.** Every performance number
in this repository is a lab simulation. The people you want reading this site are
in Israel, western Europe and North America, and a single origin serves them at
whatever distance it happens to be. The proxy is free, the DNS move is one step,
and it converts a lab claim into a real one.

**Two — make the Groundwork repository look like what the site says it is.** The
site's strongest claim points at a repository showing one release and no tags.
Pushing the versions you have already shipped costs you an hour and is the
single highest-leverage change available — it makes the flagship's public face
match the flagship.

**Three — write the first note.** The section is built and hidden, and one file
brings it into existence. The subjects are already sitting in your case studies:
why a zero-total tax document fails an entire batch, why CIE-Lab beats RGB when
a messenger has recompressed the image, why one task in three should never reach
code. Each is a paragraph you have effectively written twice already, and each is
the kind of thing an engineer links to.

## 5. Decisions I made without asking

Listed because they change what a reader sees, and each is one line to reverse.

| Decision                                                                                                                                                                                              | Reverse it by                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| Frontend skills (Vue, React, TypeScript) appear as one line under "How I lead" rather than as their own group — a full frontend block beside payments dilutes a Senior Backend claim                  | "Frontend as its own group"      |
| The star count is not shown — it is zero, and the numbers that carry the argument are adoption and runs                                                                                               | "Show stars"                     |
| `/groundwork` **is** case study #1; there is no separate `/work/groundwork`                                                                                                                           | "Two pages"                      |
| Case studies are never tied to an employer or a period, although employers are named in the timeline — the studio has a public client list, and joining the two would give a reader a key to a client | "Tie the cases to periods"       |
| Every figure renders with "as of August 2026" beside it                                                                                                                                               | "Drop the date"                  |
| The Lighthouse gate is set at LCP 1250 ms, not the brief's 1200 ms, for the measured reasons in the README                                                                                            | "Set it at 1200 and let it fail" |

## 6. Where the evidence lives

- `docs/evidence/` — raw Lighthouse reports, one per route, plus a summary
- `docs/concepts/` — the three Phase 1 concepts and why each was chosen or not
- `docs/design/` — the design system, the contrast harness, the display-face
  comparison that caught the Cyrillic problem
- `npm run verify` — reproduces every check on any machine with Node 22
