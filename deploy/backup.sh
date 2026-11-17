#!/usr/bin/env bash
# Nightly backup of database + photos into ./backups (keeps 14 days).
# Run from the repo folder on the server; schedule with: crontab -e
#   15 3 * * * cd /opt/mivora && ./deploy/backup.sh >> backups/backup.log 2>&1
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p backups
stamp=$(date +%F)
docker compose -f deploy/compose.yml --env-file deploy/.env exec -T db pg_dump -U mivora -Fc mivora > "backups/db-$stamp.dump"
docker compose -f deploy/compose.yml --env-file deploy/.env exec -T app tar -C /app/storage -czf - . > "backups/photos-$stamp.tgz"
find backups -name 'db-*.dump' -mtime +14 -delete
find backups -name 'photos-*.tgz' -mtime +14 -delete
echo "$(date -Is) backup ok"
