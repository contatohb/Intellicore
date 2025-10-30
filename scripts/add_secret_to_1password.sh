#!/bin/bash
set -euo pipefail

# Helper script para adicionar secrets ao 1Password de forma interativa
# Uso: ./add_secret_to_1password.sh

VAULT="Intellicore Ops"

echo "🔐 Add Secret to 1Password"
echo "=========================="
echo ""

# Provider selection
echo "Select provider:"
echo "  1) Render"
echo "  2) Supabase"
echo "  3) Mailgun"
echo "  4) Google Workspace"
echo "  5) Mercado Pago"
echo "  6) Other (custom)"
echo ""
read -p "Choice (1-6): " PROVIDER_CHOICE

case $PROVIDER_CHOICE in
  1) PROVIDER="Render"; ITEM_TITLE="Automated secrets Render API"; FIELD="notesPlain" ;;
  2) PROVIDER="Supabase"; ITEM_TITLE="Automated secrets Supabase"; FIELD="password" ;;
  3) PROVIDER="Mailgun"; ITEM_TITLE="Automated secrets Mailgun"; FIELD="password" ;;
  4) PROVIDER="Google Workspace"; ITEM_TITLE="Automated secrets Google Workspace"; FIELD="password" ;;
  5) PROVIDER="Mercado Pago"; ITEM_TITLE="Automated secrets Mercado Pago"; FIELD="password" ;;
  6) 
    read -p "Provider name: " PROVIDER
    ITEM_TITLE="Automated secrets $PROVIDER"
    FIELD="password"
    ;;
  *) echo "Invalid choice"; exit 1 ;;
esac

echo ""
echo "Provider: $PROVIDER"
echo "Item title: $ITEM_TITLE"
echo ""

# Check if item exists
ITEM_ID=$(op item list --vault "$VAULT" --format json 2>/dev/null | jq -r --arg title "$ITEM_TITLE" '.[] | select(.title == $title) | .id' || echo "")

if [[ -n "$ITEM_ID" ]]; then
  echo "ℹ️  Item already exists (ID: $ITEM_ID)"
  read -p "Update existing item? (y/n): " UPDATE
  if [[ "$UPDATE" != "y" ]]; then
    echo "Aborted."
    exit 0
  fi
fi

# Get secret value
echo ""
echo "Enter the secret value (will be hidden):"
read -s SECRET_VALUE
echo ""

if [[ -z "$SECRET_VALUE" ]]; then
  echo "❌ Secret value cannot be empty"
  exit 1
fi

SECRET_LENGTH=${#SECRET_VALUE}
echo "Secret length: $SECRET_LENGTH characters"

# Optional: Add metadata
echo ""
read -p "Add description/notes? (y/n): " ADD_NOTES
NOTES=""
if [[ "$ADD_NOTES" == "y" ]]; then
  echo "Enter notes (press Ctrl+D when done):"
  NOTES=$(cat)
fi

# Create or update item
echo ""
echo "💾 Saving to 1Password..."

if [[ -n "$ITEM_ID" ]]; then
  # Update existing
  if [[ "$FIELD" == "password" ]]; then
    op item edit "$ITEM_ID" --vault "$VAULT" "password=$SECRET_VALUE" >/dev/null
  else
    # For notesPlain, we need to use a different approach
    COMBINED_NOTES="${NOTES}\n${SECRET_VALUE}"
    op item edit "$ITEM_ID" --vault "$VAULT" "notesPlain=${COMBINED_NOTES}" >/dev/null
  fi
  echo "✅ Updated item: $ITEM_TITLE (ID: $ITEM_ID)"
else
  # Create new
  if [[ "$FIELD" == "password" ]]; then
    ITEM_ID=$(op item create \
      --category=login \
      --title="$ITEM_TITLE" \
      --vault="$VAULT" \
      "password=$SECRET_VALUE" \
      "notesPlain=$NOTES" \
      --format=json | jq -r '.id')
  else
    COMBINED_NOTES="${NOTES}\n${SECRET_VALUE}"
    ITEM_ID=$(op item create \
      --category=login \
      --title="$ITEM_TITLE" \
      --vault="$VAULT" \
      "notesPlain=$COMBINED_NOTES" \
      --format=json | jq -r '.id')
  fi
  echo "✅ Created new item: $ITEM_TITLE (ID: $ITEM_ID)"
fi

echo ""
echo "📋 Next steps:"
echo ""
echo "1. Sync to GitHub Secrets:"
echo "   ./scripts/sync_1password_item_to_github.sh \\"
echo "     --item-id \"$ITEM_ID\" \\"
echo "     --field $FIELD \\"
echo "     --secret-name ${PROVIDER^^}_API_KEY \\"
echo "     --repo contatohb/Intellicore"
echo ""
echo "2. Update workflow if needed:"
echo "   Edit .github/workflows/weekly-secrets-rotation.yml"
echo ""
echo "3. Test the sync:"
echo "   gh workflow run weekly-secrets-rotation.yml"
