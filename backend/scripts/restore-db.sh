#!/bin/bash
# Kolamba Database Restore Script
#
# Usage:
#   ./scripts/restore-db.sh <backup-file.sql.gz>
#   ./scripts/restore-db.sh --railway <backup-file.sql.gz>
#
# WARNING: This will DROP and recreate the target database.

set -euo pipefail

# Add PostgreSQL bin to PATH if not already available
for pg_path in /opt/homebrew/opt/postgresql@15/bin /opt/homebrew/opt/postgresql@16/bin /usr/local/opt/postgresql@15/bin; do
    [ -d "$pg_path" ] && export PATH="$pg_path:$PATH" && break
done

if [ $# -lt 1 ]; then
    echo "Usage: $0 [--railway] <backup-file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh "$(dirname "${BASH_SOURCE[0]}")/../backups/"*.sql.gz 2>/dev/null || echo "  (none)"
    exit 1
fi

RAILWAY=false
if [ "$1" = "--railway" ]; then
    RAILWAY=true
    shift
fi

BACKUP_FILE="$1"
if [ ! -f "$BACKUP_FILE" ]; then
    echo "ERROR: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "WARNING: This will overwrite the target database with the backup."
read -p "Are you sure? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Aborted."
    exit 0
fi

if [ "$RAILWAY" = true ]; then
    if [ -z "${DATABASE_URL:-}" ]; then
        echo "ERROR: DATABASE_URL required for Railway restore."
        exit 1
    fi
    PG_URL=$(echo "$DATABASE_URL" | sed 's|postgresql+asyncpg://|postgresql://|')
    echo "Restoring to Railway database..."
    gunzip -c "$BACKUP_FILE" | psql "$PG_URL"
else
    echo "Restoring to local database (kolamba)..."
    dropdb -U postgres --if-exists kolamba
    createdb -U postgres kolamba
    gunzip -c "$BACKUP_FILE" | psql -U postgres kolamba
fi

echo "Restore complete from: $BACKUP_FILE"
