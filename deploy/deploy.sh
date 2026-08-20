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

echo "→ restarting the endpoint"
ssh "${HOST}" 'sudo systemctl restart contact && sleep 1 && systemctl is-active contact'

echo "→ health check"
curl -fsS "https://${HOST#*@}/api/contact" -X POST \
  -H 'Accept: application/json' -H 'Content-Type: application/json' \
  -d '{"name":"","email":"","message":""}' \
  | grep -q '"ok":false' && echo "  endpoint answers and validates" || {
    echo "  endpoint did not answer as expected" >&2
    exit 1
  }

echo "done"
