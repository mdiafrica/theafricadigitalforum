#!/usr/bin/env bash
set -euo pipefail

HOST="${DEPLOY_HOST:-tadf-vm}"

git push origin HEAD
ssh "$HOST" 'cd /opt/tadf/app && bash deploy/deploy.sh'
