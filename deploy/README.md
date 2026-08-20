# Deployment

The site is static and runs on Max's own VPS behind Caddy, with one small Node
service for the contact form. There is no platform in the middle, which is why
everything needed to reproduce the server is in this directory rather than in
somebody's dashboard.

## What runs where

| Piece            | Where                      | What serves it                                |
| ---------------- | -------------------------- | --------------------------------------------- |
| The site         | `/var/www/yastremskyi.com` | Caddy, static files                           |
| Contact endpoint | `/srv/yastremskyi-contact` | Node under systemd, bound to `127.0.0.1:8788` |
| TLS              | —                          | Caddy, provisioned and renewed automatically  |
| CDN              | —                          | Cloudflare in front of the origin, free tier  |

The endpoint listens on loopback only; Caddy's `reverse_proxy` is the single
route into it. Headers pass through untouched so the endpoint can read
`CF-Connecting-IP` — behind the Cloudflare proxy that is the only header
carrying the visitor's real address, and the rate limiter is useless without it.

## Before anything: find out what is on the box

The server is **not empty**. Probed from outside on 2026-08-20 it answers
`Server: Caddy` and already redirects 80 to 443, which means there is a working
Caddy configuration serving something. Nothing here replaces it.

```bash
scp deploy/preflight.sh deploy@[origin-ip]:/tmp/
ssh deploy@[origin-ip] bash /tmp/preflight.sh
```

It reads and changes nothing: Caddy version, which sites are already configured,
whether `conf.d` is imported, Node version, users, free ports, and what DNS looks
like from the box. Read it before running anything below.

## DNS, in Cloudflare

The zone is live on Cloudflare nameservers but has **no A record yet**, so the
domain currently resolves to nothing.

| Type  | Name              | Content           | Proxy   |
| ----- | ----------------- | ----------------- | ------- |
| A     | `yastremskyi.com` | `[origin-ip]`     | Proxied |
| CNAME | `www`             | `yastremskyi.com` | Proxied |

Then the three Resend records from `contact.env.example`, all **DNS only** — mail
records must not be proxied.

## First-time setup

```bash
# 1. Directories. The web root is created empty; the deploy fills it.
sudo mkdir -p /var/www/yastremskyi.com /srv/yastremskyi-contact /etc/yastremskyi /etc/caddy/conf.d
sudo chown -R www-data:www-data /var/www/yastremskyi.com /srv/yastremskyi-contact

# 2. Secrets — never in the repository
sudo cp deploy/contact.env.example /etc/yastremskyi/contact.env
sudo $EDITOR /etc/yastremskyi/contact.env
sudo chown root:root /etc/yastremskyi/contact.env && sudo chmod 600 /etc/yastremskyi/contact.env

# 3. The contact service
sudo cp deploy/contact.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now contact
systemctl is-active contact

# 4. The site block — ADDED, never over the existing Caddyfile
sudo cp deploy/yastremskyi.com.caddy /etc/caddy/conf.d/
#    Once only, as the FIRST line of /etc/caddy/Caddyfile:
#      import /etc/caddy/conf.d/*.caddy
sudo caddy validate --config /etc/caddy/Caddyfile   # must pass before reloading
sudo systemctl reload caddy
```

If `caddy validate` fails, nothing has been reloaded and the site that was
already running is still running. That is the whole reason for the conf.d split.

## The first certificate — the one order that matters

There is a bootstrap trap here, and it is worth understanding before hitting it.

With the proxy on and SSL/TLS set to Full (strict), Cloudflare reaches the origin
**over HTTPS**. Until Caddy holds a certificate for `yastremskyi.com` it answers
the handshake with `no peer certificate available`, so Cloudflare has nothing to
talk to and returns **525**. That includes the ACME challenge — so the
certificate that would fix it can never be issued while the proxy is in front.
Observed on 2026-08-20: `525` through Cloudflare, and a TLS alert direct to the
origin.

Break the loop by taking Cloudflare out of the path for a few minutes:

```bash
# 1. Install the site block first, so Caddy has a site for this hostname at all
sudo cp deploy/yastremskyi.com.caddy /etc/caddy/conf.d/
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

# 2. In Cloudflare, set BOTH records to "DNS only" (grey cloud):
#      A     yastremskyi.com  [origin-ip]
#      CNAME www              yastremskyi.com
#    Let's Encrypt now reaches the origin directly on port 80.

# 3. Caddy issues on its own within a minute or two. Watch it:
sudo journalctl -u caddy -f | grep -i 'certificate\|acme\|obtain'

# 4. Confirm the origin actually holds the certificate
echo | openssl s_client -connect [origin-ip]:443 -servername yastremskyi.com 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# 5. Only then: proxy back on (orange cloud), SSL/TLS -> Full (strict),
#    "Always Use HTTPS" -> off.
```

Renewals afterwards do **not** need this dance. Caddy renews about thirty days
before expiry, and by then a valid certificate exists — so Cloudflare can reach
the origin over HTTPS and the challenge, which Let's Encrypt follows through the
redirect, arrives normally. Only the first issuance is chicken-and-egg.

## Every deploy after that

```bash
npm run verify          # nothing ships that has not passed the gates
DEPLOY_HOST=deploy@yastremskyi.com ./deploy/deploy.sh
```

## Cloudflare settings that are not optional

The proxy in front of the origin changes two things, and getting either wrong
produces a site that looks broken in a way the logs do not explain.

**SSL/TLS mode must be Full (strict).** Flexible means, in Cloudflare's own
words, that "traffic from Cloudflare to the origin server is not" encrypted —
and with Caddy redirecting 80 to 443 on the origin, that produces a redirect
loop. Full (strict) validates the origin certificate, which Caddy provides from
Let's Encrypt.

**"Always Use HTTPS" must stay OFF.** It redirects `/.well-known/acme-challenge/`
along with everything else, so Caddy can never complete the HTTP-01 challenge and
the certificate is never issued or renewed. Cloudflare's documented alternative
is a redirect rule that forces HTTPS for everything _except_ that path. Caddy
already redirects 80 to 443 at the origin, so the site is HTTPS either way.

**The TLS-ALPN challenge is disabled** in the Caddyfile for the same reason: it
validates over port 443, which Cloudflare terminates, so it can never succeed
behind the proxy. Caddy picks a challenge at random when several are enabled,
which would mean about half of all issuance attempts failing.

## Resend

Sending needs a verified domain — three DNS records, listed in
`contact.env.example`. The free tier is 100 emails a day and 3,000 a month, which
is far more than a contact form on a personal site will ever use.

## What is deliberately not here

**No Docker.** One static directory and one 260-line Node file with no
dependencies. A container would add a build step, an image registry and a runtime
to keep patched, in exchange for isolating a process that already runs as
`www-data` with `ProtectSystem=strict`.

**No brotli.** Caddy's standard build ships zstd and gzip; brotli needs a custom
build with a third-party module. Not worth maintaining for a few kilobytes on a
site whose largest document is 15 KB compressed.
