#!/bin/bash
# Kolamba Database Backup Script
#
# Usage:
#   Local:      ./scripts/backup-db.sh
#   Railway:    ./scripts/backup-db.sh --railway
#
# Environment variables:
#   DATABASE_URL  - PostgreSQL connection string (required for --railway)
#
# Backups are saved to: backend/backups/<timestamp>.sql.gz

set -euo pipefail

# Add PostgreSQL bin to PATH if not already available
for pg_path in /opt/homebrew/opt/postgresql@15/bin /opt/homebrew/opt/postgresql@16/bin /usr/local/opt/postgresql@15/bin; do
    [ -d "$pg_path" ] && export PATH="$pg_path:$PATH" && break
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$SCRIPT_DIR/../backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

mkdir -p "$BACKUP_DIR"

if [ "${1:-}" = "--railway" ]; then
    if [ -z "${DATABASE_URL:-}" ]; then
        echo "ERROR: DATABASE_URL environment variable is required for Railway backups."
        echo "  Export it from Railway dashboard or use:"
        echo "  railway run ./scripts/backup-db.sh --railway"
        exit 1
    fi
    # Convert asyncpg URL to psycopg2 format if needed
    PG_URL=$(echo "$DATABASE_URL" | sed 's|postgresql+asyncpg://|postgresql://|')
    BACKUP_FILE="$BACKUP_DIR/railway_${TIMESTAMP}.sql.gz"
    echo "Backing up Railway database..."
    pg_dump "$PG_URL" | gzip > "$BACKUP_FILE"
else
    BACKUP_FILE="$BACKUP_DIR/local_${TIMESTAMP}.sql.gz"
    echo "Backing up local database (kolamba)..."
    pg_dump -U postgres kolamba | gzip > "$BACKUP_FILE"
fi

SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
echo "Backup saved: $BACKUP_FILE ($SIZE)"

# Keep only last 10 backups per type
PREFIX=$(basename "$BACKUP_FILE" | cut -d'_' -f1)
ls -t "$BACKUP_DIR/${PREFIX}_"*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm
echo "Cleanup: kept last 10 ${PREFIX} backups."
