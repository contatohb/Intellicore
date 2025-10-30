#!/usr/bin/env python3
"""
Wrapper script to send documentation emails using Mailgun.
Requires MAILGUN_* environment variables to be set.

Usage:
  # Export required env vars first (from 1Password, GitHub Secrets, or Render):
  export MAILGUN_API_KEY="your_api_key"
  export MAILGUN_DOMAIN="hb-advisory.com.br"
  export MAILGUN_SENDER="no-reply@hb-advisory.com.br"
  export MAILGUN_BASE_URL="https://api.mailgun.net/v3"
  
  # Then run:
  python3 scripts/send_docs_with_mailgun.py

  # Or use the GitHub Actions workflow:
  # .github/workflows/send-docs-email.yml (uses secrets automatically)
"""

import os
import subprocess
import sys

# Required environment variables
REQUIRED_VARS = ['MAILGUN_API_KEY', 'MAILGUN_DOMAIN', 'MAILGUN_SENDER', 'MAILGUN_BASE_URL']

def main():
    # Validate all required env vars are present
    missing_vars = [var for var in REQUIRED_VARS if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ ERROR: Missing required environment variables: {', '.join(missing_vars)}")
        print("\n💡 Please export them first, or use the GitHub Actions workflow.")
        print("📖 See script docstring for usage instructions.")
        sys.exit(1)
    
    print("✅ All Mailgun env vars present")
    print("\n📧 Sending documentation via email...")
    
    result = subprocess.run(
        [sys.executable, "scripts/send_docs_email.py"],
        cwd="/Users/hudsonvianaborges/Intellicore"
    )
    
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
