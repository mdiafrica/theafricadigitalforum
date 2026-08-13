#!/usr/bin/env bash
# Deploy the latest pushed code. Runs ON the server:
#   ssh tadf-vm '/opt/tadf/app/deploy/deploy.sh [branch]'
set -euo pipefail

APP_DIR=/opt/tadf/app
BRANCH="${1:-rebuild}"

cd "$APP_DIR"
git fetch origin "$BRANCH"
git checkout -B "$BRANCH" "origin/$BRANCH"

pnpm install --frozen-lockfile
pnpm db:migrate
pnpm build

# Reload under pm2 (start on first run).
pm2 startOrReload deploy/ecosystem.config.cjs --update-env
pm2 save

echo "deployed $(git rev-parse --short HEAD) on $BRANCH"
