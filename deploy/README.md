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

The endpoint listens on loopback only. The single route into it is Caddy's
`reverse_proxy`, which also supplies the `X-Forwarded-For` the rate limiter uses.

## First-time setup

```bash
# 1. Point DNS at the box, then let Cloudflare proxy it.
# 2. Web root and app directory
sudo mkdir -p /var/www/yastremskyi.com /srv/yastremskyi-contact /etc/yastremskyi
sudo chown -R www-data:www-data /var/www/yastremskyi.com /srv/yastremskyi-contact

# 3. Secrets — never in the repository
sudo cp deploy/contact.env.example /etc/yastremskyi/contact.env
sudo $EDITOR /etc/yastremskyi/contact.env
sudo chown root:root /etc/yastremskyi/contact.env && sudo chmod 600 /etc/yastremskyi/contact.env

# 4. The service
sudo cp deploy/contact.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now contact

# 5. Caddy
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## Every deploy after that

```bash
npm run verify          # nothing ships that has not passed the gates
DEPLOY_HOST=deploy@yastremskyi.com ./deploy/deploy.sh
```

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
