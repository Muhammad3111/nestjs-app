#!/bin/sh

# Optional DB import step for Docker Compose:
# - imports backup if a dump file exists
# - never blocks startup on missing/invalid dump

set +e

DB_HOST="${DB_HOST:-moneychange_db}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_NAME="${POSTGRES_DB:-postgres}"
DB_PASS="${POSTGRES_PASSWORD:-}"
DUMP_DIR="${DUMP_DIR:-/workspace}"

echo "[db-import] Optional import check started..."

if [ ! -d "$DUMP_DIR" ]; then
  echo "[db-import] Dump directory not found: $DUMP_DIR. Skipping."
  exit 0
fi

# Avoid duplicate imports: only restore when DB appears empty.
TABLE_COUNT="$(PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null)"

if [ -z "$TABLE_COUNT" ]; then
  echo "[db-import] Could not read DB state. Skipping optional import."
  exit 0
fi

case "$TABLE_COUNT" in
  *[!0-9]*)
    echo "[db-import] Unexpected table count: $TABLE_COUNT. Skipping."
    exit 0
    ;;
esac

if [ "$TABLE_COUNT" -gt 0 ]; then
  echo "[db-import] Database is not empty ($TABLE_COUNT tables). Skipping."
  exit 0
fi

DUMP_FILE=""
for candidate in \
  "$DUMP_DIR"/backup.dump \
  "$DUMP_DIR"/backup.backup \
  "$DUMP_DIR"/backup.sql \
  "$DUMP_DIR"/*.dump \
  "$DUMP_DIR"/*.backup \
  "$DUMP_DIR"/*.sql
do
  [ -f "$candidate" ] || continue
  DUMP_FILE="$candidate"
  break
done

if [ -z "$DUMP_FILE" ]; then
  echo "[db-import] No dump file found in $DUMP_DIR. Skipping."
  exit 0
fi

echo "[db-import] Found dump file: $DUMP_FILE"

if echo "$DUMP_FILE" | grep -Eq '\.sql$'; then
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"
  RESTORE_STATUS=$?
else
  PGPASSWORD="$DB_PASS" pg_restore -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" --no-owner --no-privileges "$DUMP_FILE"
  RESTORE_STATUS=$?
  if [ "$RESTORE_STATUS" -ne 0 ]; then
    echo "[db-import] pg_restore failed, trying psql fallback..."
    PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -f "$DUMP_FILE"
    RESTORE_STATUS=$?
  fi
fi

if [ "$RESTORE_STATUS" -ne 0 ]; then
  echo "[db-import] Restore failed (exit $RESTORE_STATUS). Continuing startup."
  exit 0
fi

echo "[db-import] Restore completed successfully."
exit 0
