# Deployment

**Live: https://yastremskyi.com** — deployed 2026-08-20.

The site is static, on Max's own VPS, with one small Node service for the contact
form. What follows describes what actually runs, not a plan — every command here
was executed against the box and the results checked from outside.

## The shape of it, and why

The server is **not dedicated to this site**. It is a 1 GB DigitalOcean droplet
running three unrelated projects in Docker, and one of them — `tiles-web-1`, a
Caddy container serving `warmap.duckdns.org` — already owned ports 80 and 443.
There was no room for a second web server, so this site shares that Caddy.

| Piece            | Where                                                                                       | Served by                                       |
| ---------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| The site         | `/var/www/yastremskyi.com`, bind-mounted read-only into the container at `/srv/yastremskyi` | `tiles-web-1` (Caddy 2.11.4)                    |
| Contact endpoint | `/srv/yastremskyi-contact/contact.mjs`, systemd unit `contact`                              | Node 18 on the host, bound to `172.17.0.1:8788` |
| Status endpoint  | `/srv/yastremskyi-status/status.mjs`, systemd unit `status`                                 | Node 18 on the host, bound to `172.17.0.1:8789` |
| TLS              | Let's Encrypt, HTTP-01                                                                      | Caddy, automatic                                |
| CDN              | Cloudflare, proxied                                                                         | —                                               |

Three decisions worth stating, because each replaced something that looked
obviously right:

**The Caddyfile is mounted, not baked.** The tiles image `COPY`s its Caddyfile at
build time. Rebuilding it to add a site block would mean a `pnpm install` and a
Vite build on a box with 336 MB of free memory — a likely OOM. Mounting
`/opt/tiles/deploy/Caddyfile` into the container means the file the container
uses and the file that project's repository tracks are the same file: no rebuild,
and no baked copy quietly diverging.

**The endpoint binds to the docker bridge, not to loopback.** Loopback is correct
when the proxy runs on the host. Here the proxy is a container and arrives on
`172.17.0.1`, so loopback is unreachable from it — the first deploy returned 502
for exactly this reason. `BIND_ADDR` chooses the address explicitly rather than
listening on `0.0.0.0` and hoping the firewall holds. `ufw` allows
`172.16.0.0/12` to reach ports 8788 and 8789 and nothing else.

This paragraph was already here when the status endpoint was added, and the
status endpoint was still deployed on loopback and still answered 502. Both
halves — the bind address and the `ufw` rule — are now in the first-time block
below as commands rather than as prose, because a trap described in a paragraph
someone has to remember to re-read is a trap that is still armed.

**The host runs Node 18, and the build toolchain needs 22.** `package.json`
declares `engines.node >= 22.12.0`, which is what Astro 7 needs to _build_ the
site. Nothing built on the box: the services that run there are single files with
no dependencies, and both are checked against the host's actual Node before being
enabled. Anything added to `server/` has to stay inside Node 18 or the box needs
upgrading first — the two numbers disagreeing is not an oversight.

**`MemoryDenyWriteExecute` is not set on the service.** It was, and Node died at
startup with `Fatal javascript OOM in MemoryChunk allocation failed during
deserialization` — a message that names memory and means JIT. V8 needs pages that
are writable and executable. Confirmed by running the same binary under
`systemd-run` with the flag and without it. The same applies to any JVM or .NET
service.

## Cloudflare settings

Both records are proxied. SSL/TLS must be **Full (strict)** — Flexible leaves the
origin leg unencrypted and loops against Caddy's own 80→443 redirect.

The certificate was issued **through the proxy**, without taking Cloudflare out
of the path: Caddy's log shows `served key authentication` for both hostnames
from Cloudflare's own addresses. An earlier version of this document predicted a
bootstrap deadlock — that the proxy would block the HTTP-01 challenge and the
certificate could never be issued. It did not happen, and the prediction is
recorded here as wrong rather than quietly deleted. If it ever does bite on
another domain, the fix is to set the records to "DNS only" for a few minutes.

TLS-ALPN is disabled in the site block regardless: it validates over 443, which
Cloudflare terminates, and Caddy picks a challenge at random when several are
enabled — so leaving it on would mean roughly half of all renewals failing.

## The origin address is not written down here

Cloudflare proxies this domain, and one of the things that buys is that the
origin's address is not public: traffic that cannot find the server cannot go
around the CDN to reach it. Committing the IP to a public repository would hand
that back. `DEPLOY_HOST` carries it instead — an environment variable on the
machine doing the deploying.

## Deploying a change

```bash
npm run verify                      # nothing ships that has not passed the gates
DEPLOY_HOST=root@<origin-ip> ./deploy/deploy.sh
```

The web root is `/var/www/yastremskyi.com` on the host and `/srv/yastremskyi`
inside the Caddy container — one directory, bind-mounted read-only, so the two
paths in this repository are both correct rather than one of them being stale.
Confirmed on the box with `docker inspect tiles-web-1`.

```

```

## Resend

The three DNS records are in place and verified. The API key is **not** in this
repository and was never pasted into a chat: `/etc/yastremskyi/contact.env` on
the server holds it, `root`-owned and mode 600. Until it is filled in, the form
validates and rejects correctly but cannot deliver — and says so to the visitor
rather than failing silently.

```bash
sudo nano /etc/yastremskyi/contact.env   # replace PASTE_THE_KEY_HERE
sudo systemctl restart contact
```

## The status service

A second endpoint, a second unit, a second port. It is separate from the contact
endpoint on purpose: the contact form is the only channel a recruiter has, and a
status page must not be able to take it down.

First time, on the box:

```bash
# The ingest token. Generated on the server so it is never in a shell history
# on a laptop, and never in this repository.
sudo mkdir -p /etc/yastremskyi
{
  printf 'STATUS_TOKEN=%s\n' "$(openssl rand -hex 32)"
  # NOT loopback. Caddy runs in a container and reaches the host over the docker
  # bridge, so a service on 127.0.0.1 is invisible to it — the symptom is a 502
  # from the edge while `curl` on the box works perfectly. The contact endpoint
  # binds the same address for the same reason.
  printf 'BIND_ADDR=172.17.0.1\n'
} | sudo tee /etc/yastremskyi/status.env >/dev/null
sudo chmod 600 /etc/yastremskyi/status.env
sudo chown root:root /etc/yastremskyi/status.env

sudo mkdir -p /srv/yastremskyi-status
sudo cp deploy/status.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now status
systemctl is-active status

# ufw allows the contact port from the docker bridges and nothing else. The
# status port needs the same, or the container's request times out and the edge
# answers 502 — a timeout rather than a refusal, which reads like the service is
# down when it is simply unreachable.
sudo ufw allow from 172.16.0.0/12 to any port 8789 proto tcp \
  comment 'yastremskyi status endpoint, docker bridges only'
```

Both of those cost a round trip each on the first install; neither is guessable
from the code, which is why they are here rather than in someone's memory.

Then the same token goes into the repository's Actions secrets as
`STATUS_INGEST_TOKEN` — the scheduled probe and the CI gate report both use it.
It is the one secret this feature has, and it only grants the right to write a
measurement; reading the snapshot needs nothing, because the page is public.

The Caddy block already routes `/api/status*` to `host.docker.internal:8789`;
adding it needs the same validate-then-reload as any other change to that file.

The store lives at `/var/lib/yastremskyi-status/status.json`, created by systemd
through `StateDirectory`. It holds thirty days of daily counts and a capped set
of latency samples — a few kilobytes, no personal data of any kind, and safe to
delete: the page will simply say it has no data until the next probe lands.

Two things worth knowing before the first deploy:

- Uptime only starts existing once the scheduled workflow has run. Before that
  the page says so rather than showing an empty bar as if it meant "up".
- The gate table fills in after the first green CI run on `main`, not at deploy
  time. A page built before either has happened is correct and honest; it is
  simply early.

## The CV is not in the repository

`public/cv.pdf` is git-ignored and deployed out of band. This repository is
public and the PDF carries a phone number that is deliberately kept off the
indexable web — `/cv.pdf` is served with `X-Robots-Tag: noindex, noarchive` for
that reason. Committing it would put the number on GitHub, indexed, permanent,
and still in the history after any later delete, at which point the header would
be protecting nothing.

`rsync --delete` in `deploy.sh` would remove a file the local `dist/` does not
have, so the build has to produce it. Keep the PDF at `public/cv.pdf` locally —
it is ignored by git, not by the build — and `npm run build` copies it into
`dist/` as it does any other static asset. If you deploy from a fresh clone,
put the file back first or the download link disappears: the `/cv` page renders
that button only when the file exists.

**Cloudflare caches it for four hours.** The origin sends `max-age=0,
must-revalidate`, and Cloudflare replaces that with `max-age=14400` for PDFs.
After replacing the CV, purge it in the dashboard or visitors keep the old one
for up to four hours.

## Rollback

```bash
# The site: the previous build is whatever is in git.
git checkout <sha> && npm run build && ./deploy/deploy.sh

# The Caddy change: backups were taken before the first edit.
ls /root/backups-yastremskyi/
cp /root/backups-yastremskyi/Caddyfile.<stamp> /opt/tiles/deploy/Caddyfile
docker exec tiles-web-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile

# The endpoint:
systemctl stop contact && systemctl disable contact
```

## What is deliberately not here

**No Docker for this site.** It is 35 static files and one dependency-free Node
script. A container would add an image to build, store and patch on a box that
was at 96% disk when this started.

**No brotli.** Caddy's standard build ships zstd and gzip; brotli needs a custom
build. `content-encoding: zstd` is what the site actually serves.
