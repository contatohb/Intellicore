#!/bin/bash
set -euo pipefail

# Script para sincronizar um secret do 1Password para GitHub Secrets
# Uso: ./sync_1password_item_to_github.sh --item-id ITEM_ID --field FIELD --secret-name SECRET_NAME --repo owner/repo [--validate-url URL]

VAULT="Intellicore Ops"
ITEM_ID=""
FIELD=""
SECRET_NAME=""
REPO=""
VALIDATE_URL=""

usage() {
  cat <<EOF
Usage: $0 --item-id ITEM_ID --field FIELD --secret-name SECRET_NAME --repo owner/repo [--validate-url URL]

Options:
  --item-id ID         1Password item ID or title to fetch
  --field FIELD        Field name to extract (e.g., 'password', 'notesPlain', 'api_key')
  --secret-name NAME   GitHub Secret name to publish (e.g., 'RENDER_API_KEY')
  --repo REPO          GitHub repository (owner/repo)
  --validate-url URL   Optional: HTTP endpoint to validate the secret (expects 200/401)
  --vault VAULT        1Password vault name (default: "Intellicore Ops")
  -h, --help           Show this help

Examples:
  # Sync Render API key from notes field
  $0 --item-id "Automated secrets Render API" --field notesPlain --secret-name RENDER_API_KEY --repo contatohb/Intellicore --validate-url https://api.render.com/v1/services

  # Sync Supabase service role key from password field
  $0 --item-id "Supabase Service Role" --field password --secret-name SUPABASE_SERVICE_ROLE_KEY --repo contatohb/Intellicore
EOF
  exit 1
}

while [[ $# -gt 0 ]]; do
  case $1 in
    --item-id) ITEM_ID="$2"; shift 2 ;;
    --field) FIELD="$2"; shift 2 ;;
    --secret-name) SECRET_NAME="$2"; shift 2 ;;
    --repo) REPO="$2"; shift 2 ;;
    --validate-url) VALIDATE_URL="$2"; shift 2 ;;
    --vault) VAULT="$2"; shift 2 ;;
    -h|--help) usage ;;
    *) echo "Unknown arg: $1"; usage ;;
  esac
done

[[ -z "$ITEM_ID" || -z "$FIELD" || -z "$SECRET_NAME" || -z "$REPO" ]] && usage

echo "🔐 Syncing 1Password → GitHub Secrets"
echo "  Item: $ITEM_ID"
echo "  Field: $FIELD"
echo "  Secret: $SECRET_NAME"
echo "  Repo: $REPO"

# Note: If using 1Password Connect (OP_CONNECT_*), keep those vars
# If using Service Account (OP_SERVICE_ACCOUNT_TOKEN), it will be used automatically
# Only unset Connect vars if not in CI/CD environment
if [[ -z "$GITHUB_ACTIONS" ]]; then
  # Local execution: prefer op CLI over Connect
  unset OP_CONNECT_HOST OP_CONNECT_TOKEN 2>/dev/null || true
fi

# Resolve item: allow passing title or UUID; prefer UUID for reliability
RESOLVED_ITEM_ID="$ITEM_ID"
if [[ ! "$ITEM_ID" =~ ^[a-z0-9]{26}$ ]]; then
  echo "  → Resolving item ID by title in vault '$VAULT'..."
  RESOLVED_ITEM_ID=$(op item list --vault "$VAULT" --format json \
    | jq -r --arg title "$ITEM_ID" '.[] | select(.title == $title) | .id' | head -1)
  if [[ -z "$RESOLVED_ITEM_ID" || "$RESOLVED_ITEM_ID" == "null" ]]; then
    echo "❌ Item with title '$ITEM_ID' not found in vault '$VAULT'"
    # Optional debugging: list titles (safe, no values)
    if [[ "${OP_DEBUG:-}" == "1" ]]; then
      echo "Available item titles in '$VAULT':"
      op item list --vault "$VAULT" --format json | jq -r '.[].title' | sed 's/^/  - /'
    fi
    exit 1
  fi
  echo "  ✓ Resolved item id: $RESOLVED_ITEM_ID"
fi

# Fetch secret from 1Password (show helpful error if fails)
echo "  → Fetching field '$FIELD' from 1Password item..."
if ! SECRET_VALUE=$(op item get "$RESOLVED_ITEM_ID" --vault "$VAULT" --fields "$FIELD"); then
  echo "❌ op CLI failed to read field '$FIELD' from item '$ITEM_ID' (id: $RESOLVED_ITEM_ID)"
  echo "   Ensure the Service Account has 'View items' permission on vault '$VAULT'"
  exit 1
fi

if [[ -z "$SECRET_VALUE" ]]; then
  echo "❌ Failed to extract field '$FIELD' from item '$ITEM_ID'"
  exit 1
fi

# If field is notesPlain, extract lines starting with known prefixes
if [[ "$FIELD" == "notesPlain" ]]; then
  # Try to extract API key patterns (rnd_, sk_, eyJ, etc.)
  EXTRACTED=$(echo "$SECRET_VALUE" | grep -E '^(rnd_|sk_|eyJ|sb-|key-|api_)' | tail -1 || true)
  if [[ -n "$EXTRACTED" ]]; then
    SECRET_VALUE="$EXTRACTED"
  fi
fi

SECRET_LENGTH=${#SECRET_VALUE}
SECRET_PREFIX="${SECRET_VALUE:0:8}"

echo "  → Secret extracted (length: $SECRET_LENGTH, prefix: ${SECRET_PREFIX}...)"

# Optional: Validate secret against an API endpoint
if [[ -n "$VALIDATE_URL" ]]; then
  echo "  → Validating against $VALIDATE_URL..."
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $SECRET_VALUE" "$VALIDATE_URL" || echo "000")
  
  if [[ "$HTTP_CODE" == "200" ]]; then
    echo "  ✓ Valid secret (HTTP 200)"
  elif [[ "$HTTP_CODE" == "401" || "$HTTP_CODE" == "403" ]]; then
    echo "  ❌ Invalid secret (HTTP $HTTP_CODE - Unauthorized)"
    exit 2
  else
    echo "  ⚠️  Warning: Unexpected HTTP code $HTTP_CODE (proceeding anyway)"
  fi
fi

# Publish to GitHub Secrets
echo "  → Publishing to GitHub Secrets..."
echo "$SECRET_VALUE" | gh secret set "$SECRET_NAME" --repo "$REPO"

if [[ $? -eq 0 ]]; then
  echo "✅ Successfully synced $SECRET_NAME to $REPO"
else
  echo "❌ Failed to publish secret to GitHub"
  exit 3
fi
