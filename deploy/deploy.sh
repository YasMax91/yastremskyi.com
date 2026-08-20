#!/usr/bin/env bash
# Deploy the built site and the contact endpoint to the VPS.
#
#   ./deploy/deploy.sh
#
# Expects SSH access as a user who can write to the target directories. It does
# not build for you: run `npm run verify` first, so nothing ships that has not
# passed the gates.
#
# rsync with --delete, into a directory that holds nothing but this site. The
# static output is disposable by definition — everything in it comes from the
# repository — so replacing it wholesale is safer than merging into it and
# leaving an orphaned file from three deploys ago.

set -euo pipefail

HOST="${DEPLOY_HOST:?set DEPLOY_HOST, e.g. deploy@yastremskyi.com}"
WEB_ROOT="${DEPLOY_WEB_ROOT:-/var/www/yastremskyi.com}"
APP_ROOT="${DEPLOY_APP_ROOT:-/srv/yastremskyi-contact}"
SITE="${DEPLOY_SITE:-yastremskyi.com}"

if [[ ! -d dist ]]; then
  echo "dist/ is missing — run 'npm run verify' first." >&2
  exit 1
fi

echo "→ static site to ${HOST}:${WEB_ROOT}"
rsync -az --delete --human-readable \
  --exclude '.DS_Store' \
  dist/ "${HOST}:${WEB_ROOT}/"

echo "→ contact endpoint to ${HOST}:${APP_ROOT}"
rsync -az --human-readable server/contact.mjs "${HOST}:${APP_ROOT}/"
ssh "${HOST}" "chown www-data:www-data ${APP_ROOT}/contact.mjs"

echo "→ restarting the endpoint"
ssh "${HOST}" 'systemctl restart contact && sleep 2 && systemctl is-active contact'

echo "→ checking the site answers"
# %{host} is not a curl write-out variable — curl 8.7 prints "unknown --write-out
# variable" and an empty host, so the line is built from ${SITE} instead.
curl -fsS -o /dev/null -w "  https://${SITE} %{http_code}\n" "https://${SITE}/"

echo "→ checking the endpoint validates"
# An empty submission is supposed to come back 422 with the field errors — that
# IS the passing case. So this check cannot use curl -f: -f turns any 4xx into
# exit 22 with no body, which made a healthy endpoint fail its own check.
endpoint_response="$(curl -sS -w '\n%{http_code}' "https://${SITE}/api/contact" -X POST \
  -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d '{"name":"","email":"","message":""}')"
endpoint_status="${endpoint_response##*$'\n'}"
endpoint_body="${endpoint_response%$'\n'*}"

if [[ "${endpoint_status}" == "422" && "${endpoint_body}" == *'"ok":false'* ]]; then
  echo "  endpoint answers ${endpoint_status} and validates"
else
  echo "  endpoint did not answer as expected: status ${endpoint_status}" >&2
  echo "  ${endpoint_body}" >&2
  exit 1
fi

echo "→ checking the site that shares this Caddy is still up"
curl -fsS -o /dev/null -w '  warmap %{http_code}\n' https://warmap.duckdns.org/ || {
  echo "  warmap.duckdns.org did not answer — check the Caddy config" >&2
  exit 1
}

echo "done"
