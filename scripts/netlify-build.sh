#!/usr/bin/env bash
#
# Netlify build — an ALLOW-LIST of what this site serves.
#
# netlify.toml previously used `publish = "."`, which serves the repository
# itself. That put the database migrations and internal notes on the public web:
#
#   /supabase/migrations/0001_init.sql
#   /supabase/migrations/0002_security.sql
#   /BACKEND.md
#   /README.md
#
# 0002_security.sql in particular describes the row-level security rules — a map
# of the access controls, published to anyone who asks for it.
#
# An allow-list rather than a deny-list: a deny-list fails open the next time a
# directory is added. Anything new stays unpublished until it is added here.

set -euo pipefail

OUT="${1:-dist}"
rm -rf "$OUT"
mkdir -p "$OUT"

# Web assets only, preserving directory structure so every existing URL keeps
# working (/assets/app.js, /assets/icons/icon-192.png, and the rest).
find . -path ./.git -prune -o -path "./$OUT" -prune -o -type f \
  \( -name '*.html' -o -name '*.css' -o -name '*.js' -o -name '*.mjs' \
     -o -name '*.png' -o -name '*.jpg' -o -name '*.jpeg' -o -name '*.gif' \
     -o -name '*.webp' -o -name '*.svg' -o -name '*.ico' \
     -o -name '*.woff' -o -name '*.woff2' -o -name '*.ttf' \
     -o -name '*.xml' -o -name '*.txt' -o -name '*.webmanifest' -o -name '*.pdf' \) \
  -print0 |
while IFS= read -r -d '' f; do
  rel="${f#./}"
  mkdir -p "$OUT/$(dirname "$rel")"
  cp "$f" "$OUT/$rel"
done

LEAKED="$(find "$OUT" -type f \( -name '*.sql' -o -name '*.ts' -o -name '*.md' -o -name '*.sh' -o -name '.env*' \) -print)"
if [ -n "$LEAKED" ]; then
  echo "BUILD FAILED — these must not be published:" >&2
  echo "$LEAKED" >&2
  exit 1
fi

echo "Published $(find "$OUT" -type f | wc -l | tr -d ' ') files to $OUT"
