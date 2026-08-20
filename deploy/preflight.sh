#!/usr/bin/env bash
# Pre-flight check, run ON THE SERVER before the first deploy.
#
#   scp deploy/preflight.sh "$DEPLOY_HOST":/tmp/ && ssh "$DEPLOY_HOST" bash /tmp/preflight.sh
#
# Reads only. It changes nothing — the point is to find out what is actually on
# the box before anything is written to it, because this server already serves
# something and a deploy that assumes otherwise takes that down.

set -uo pipefail

ok()   { printf '  \033[32mok\033[0m    %s\n' "$1"; }
warn() { printf '  \033[33mcheck\033[0m %s\n' "$1"; }
bad()  { printf '  \033[31mno\033[0m    %s\n' "$1"; }

echo "== host =="
echo "  $(uname -sr) · $(. /etc/os-release 2>/dev/null && echo "$PRETTY_NAME")"
echo "  uptime:$(uptime -p 2>/dev/null | sed 's/^up//')"
echo "  disk:  $(df -h / | awk 'NR==2 {print $4" free of "$2}')"
echo "  memory:$(free -h 2>/dev/null | awk 'NR==2 {print " "$7" available of "$2}')"

echo
echo "== caddy =="
if command -v caddy >/dev/null; then
  ok "$(caddy version | head -1)"
  if [[ -f /etc/caddy/Caddyfile ]]; then
    ok "/etc/caddy/Caddyfile exists — $(grep -c '{' /etc/caddy/Caddyfile) block openings"
    echo "     sites already configured:"
    grep -oE '^[a-z0-9.*-]+\.[a-z]{2,}[^{]*\{' /etc/caddy/Caddyfile 2>/dev/null | sed 's/[ {]*$//' | sed 's/^/       /' || echo "       (none matched)"
    if grep -q 'import .*conf\.d' /etc/caddy/Caddyfile; then
      ok "already imports conf.d — the site file will be picked up"
    else
      warn "no 'import /etc/caddy/conf.d/*.caddy' line — add it once, at the top"
    fi
  else
    warn "no /etc/caddy/Caddyfile"
  fi
  systemctl is-active --quiet caddy && ok "caddy service is active" || bad "caddy service is not active"
else
  bad "caddy is not installed"
fi

echo
echo "== node =="
if command -v node >/dev/null; then
  V=$(node -v); ok "$V at $(command -v node)"
  [[ "${V#v}" < "20" ]] && warn "the contact endpoint needs Node 18+ for global fetch"
else
  bad "node is not installed — the contact endpoint needs it"
fi

echo
echo "== users and paths =="
id www-data >/dev/null 2>&1 && ok "www-data exists" || warn "www-data does not exist — the systemd unit names it"
for d in /var/www/yastremskyi.com /srv/yastremskyi-contact /etc/yastremskyi; do
  [[ -d "$d" ]] && ok "$d exists" || warn "$d does not exist yet"
done
[[ -f /etc/systemd/system/contact.service ]] && warn "contact.service already present — it will be replaced" || ok "no existing contact.service"

echo
echo "== ports =="
if command -v ss >/dev/null; then
  ss -lntp 2>/dev/null | awk 'NR==1 || /:(80|443|8788) /' | sed 's/^/  /'
  ss -lnt 2>/dev/null | grep -q ':8788 ' && warn "something already listens on 8788" || ok "8788 is free"
fi

echo
echo "== dns as this box sees it =="
for name in yastremskyi.com www.yastremskyi.com; do
  A=$(getent ahostsv4 "$name" 2>/dev/null | awk 'NR==1{print $1}')
  [[ -n "$A" ]] && ok "$name -> $A" || warn "$name does not resolve yet"
done

echo
echo "nothing was changed."
