#!/bin/bash
# Helper script to export Mailgun env vars from Render and send documentation
# Usage: ./scripts/send_docs_from_render.sh

set -e

echo "🔑 Fetching Mailgun configuration from Render..."

# Render service ID (intellicore-shared)
SERVICE_ID="srv-d3r71h56ubrc738fn58g"

# Get Render API key from 1Password
echo "📥 Getting Render API key from 1Password..."
RENDER_API_KEY=$(op read "op://Personal/RENDER - RENDER_INTELLICORE_API_KEY/password" 2>/dev/null || echo "")

if [ -z "$RENDER_API_KEY" ]; then
    echo "❌ ERROR: Could not fetch Render API key from 1Password"
    echo "💡 Alternative: Manually export Mailgun env vars:"
    echo "   export MAILGUN_API_KEY='your_key'"
    echo "   export MAILGUN_DOMAIN='hb-advisory.com.br'"
    echo "   export MAILGUN_SENDER='no-reply@hb-advisory.com.br'"
    echo "   export MAILGUN_BASE_URL='https://api.mailgun.net/v3'"
    echo "   python3 scripts/send_docs_with_mailgun.py"
    exit 1
fi

# Fetch env vars from Render
echo "🌐 Fetching environment variables from Render..."
RENDER_RESPONSE=$(curl -s -H "Authorization: Bearer $RENDER_API_KEY" \
    "https://api.render.com/v1/services/$SERVICE_ID/env-vars")

# Extract Mailgun values
export MAILGUN_API_KEY=$(echo "$RENDER_RESPONSE" | jq -r '.[] | select(.key=="MAILGUN_API_KEY") | .value')
export MAILGUN_DOMAIN=$(echo "$RENDER_RESPONSE" | jq -r '.[] | select(.key=="MAILGUN_DOMAIN") | .value')
export MAILGUN_SENDER=$(echo "$RENDER_RESPONSE" | jq -r '.[] | select(.key=="MAILGUN_SENDER") | .value')
export MAILGUN_BASE_URL=$(echo "$RENDER_RESPONSE" | jq -r '.[] | select(.key=="MAILGUN_BASE_URL") | .value')

# Validate we got all values
if [ -z "$MAILGUN_API_KEY" ] || [ "$MAILGUN_API_KEY" = "null" ]; then
    echo "❌ ERROR: Could not extract MAILGUN_API_KEY from Render"
    exit 1
fi

echo "✅ Mailgun configuration loaded from Render"
echo ""

# Run the email script
python3 scripts/send_docs_with_mailgun.py
