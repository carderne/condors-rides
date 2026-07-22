#!/usr/bin/env bash
#
# Data-only Postgres migration from OLD_DATABASE_URL to NEW_DATABASE_URL.
#
# Assumes the schema (Drizzle migrations) is already applied on the new DB.
# Truncates all known tables on the new DB, then dumps + restores data only.
#
# Usage:
#   OLD_DATABASE_URL=postgres://... NEW_DATABASE_URL=postgres://... ./scripts/migrate-db.sh
#
# Optional flags:
#   --no-truncate    Skip the TRUNCATE step (use if new DB is already empty)
#   --keep-dump      Don't delete the dump file after restore
#   --dry-run        Print what would happen, don't touch the new DB
#
set -euo pipefail

NO_TRUNCATE=0
KEEP_DUMP=0
DRY_RUN=0
for arg in "$@"; do
  case "$arg" in
    --no-truncate) NO_TRUNCATE=1 ;;
    --keep-dump)   KEEP_DUMP=1 ;;
    --dry-run)     DRY_RUN=1 ;;
    -h|--help)
      sed -n '2,20p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown arg: $arg" >&2
      exit 2
      ;;
  esac
done

: "${OLD_DATABASE_URL:?OLD_DATABASE_URL is required}"
: "${NEW_DATABASE_URL:?NEW_DATABASE_URL is required}"

if ! command -v pg_dump >/dev/null || ! command -v pg_restore >/dev/null || ! command -v psql >/dev/null; then
  echo "pg_dump, pg_restore, and psql must be on PATH" >&2
  exit 1
fi

# Tables in dependency order (children first) for TRUNCATE.
# CASCADE handles the rest, but listing them keeps intent obvious.
TABLES=(
  comment_reaction
  comment
  ride_view
  ride_change
  ride_member
  ride
  route_vote
  route
  sub
  token
  verification
  account
  session
  "\"user\""
)

# Build a `SELECT 'tbl', count(*) FROM tbl UNION ALL ...` query for real counts.
build_count_query() {
  local first=1
  for t in "${TABLES[@]}"; do
    # Strip surrounding quotes for the label, keep them for the FROM.
    local label="${t//\"/}"
    if [[ $first -eq 1 ]]; then
      printf "SELECT '%s' AS tbl, count(*)::bigint AS rows FROM %s" "$label" "$t"
      first=0
    else
      printf "\nUNION ALL SELECT '%s', count(*) FROM %s" "$label" "$t"
    fi
  done
  printf "\nORDER BY tbl;\n"
}

print_counts() {
  local url="$1"
  psql "$url" -v ON_ERROR_STOP=1 -At -F '  ' -c "$(build_count_query)" \
    | awk '{ printf "  %-20s %s\n", $1, $2 }'
}

DUMP_FILE="${DUMP_FILE:-condors-data-$(date +%Y%m%d-%H%M%S).dump}"

echo "==> Source: $(echo "$OLD_DATABASE_URL" | sed -E 's#(://[^:]+):[^@]+@#\1:***@#')"
echo "==> Target: $(echo "$NEW_DATABASE_URL" | sed -E 's#(://[^:]+):[^@]+@#\1:***@#')"
echo "==> Dump file: $DUMP_FILE"

# ----- Pre-flight: row counts on source -----
echo
echo "==> Source row counts:"
print_counts "$OLD_DATABASE_URL"

# ----- Dump -----
echo
echo "==> Dumping data from source..."
pg_dump \
  --data-only \
  --no-owner \
  --no-privileges \
  --disable-triggers \
  --format=custom \
  --file="$DUMP_FILE" \
  "$OLD_DATABASE_URL"

DUMP_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
echo "    wrote $DUMP_FILE ($DUMP_SIZE)"

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo
  echo "==> Dry run, stopping before touching target."
  exit 0
fi

# ----- Truncate target -----
if [[ "$NO_TRUNCATE" -eq 0 ]]; then
  echo
  echo "==> Truncating target tables..."
  TRUNCATE_LIST=$(IFS=, ; echo "${TABLES[*]}")
  psql "$NEW_DATABASE_URL" -v ON_ERROR_STOP=1 -c "TRUNCATE TABLE $TRUNCATE_LIST RESTART IDENTITY CASCADE;"
else
  echo
  echo "==> Skipping truncate (--no-truncate)"
fi

# ----- Restore -----
echo
echo "==> Restoring into target..."
pg_restore \
  --data-only \
  --disable-triggers \
  --no-owner \
  --no-privileges \
  --single-transaction \
  --dbname="$NEW_DATABASE_URL" \
  "$DUMP_FILE"

# ----- Post-flight: row counts on target -----
echo
echo "==> Target row counts:"
print_counts "$NEW_DATABASE_URL"

if [[ "$KEEP_DUMP" -eq 0 ]]; then
  rm -f "$DUMP_FILE"
  echo
  echo "==> Removed $DUMP_FILE (use --keep-dump to retain)"
fi

echo
echo "==> Done."
