#!/usr/bin/env python3
"""
CI helper to fetch Mailgun env vars from Render and print `key=value` lines to export into GITHUB_ENV.
Usage:
  python scripts/ci_fetch_mailgun_from_render.py <RENDER_API_KEY> <SERVICE_ID>
Prints:
  MAILGUN_API_KEY=...
  MAILGUN_DOMAIN=...
  MAILGUN_SENDER=...
  MAILGUN_BASE_URL=...
"""
import sys
import json
import os
from urllib.request import Request, urlopen

API = "https://api.render.com/v1"

def fetch_env_vars(render_api_key: str, service_id: str):
    url = f"{API}/services/{service_id}/env-vars"
    req = Request(url, headers={"Authorization": f"Bearer {render_api_key}"})
    with urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    if len(sys.argv) < 3:
        print("Missing args: RENDER_API_KEY SERVICE_ID", file=sys.stderr)
        sys.exit(1)
    token = sys.argv[1]
    service_id = sys.argv[2]
    try:
        data = fetch_env_vars(token, service_id)
    except Exception as e:
        print(f"Failed to fetch env vars from Render: {e}", file=sys.stderr)
        sys.exit(2)

    keys = {item["key"]: item.get("value") for item in data}
    required = ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "MAILGUN_SENDER", "MAILGUN_BASE_URL"]
    missing = [k for k in required if not keys.get(k)]
    if missing:
        print(f"Missing Mailgun keys in Render: {', '.join(missing)}", file=sys.stderr)
        sys.exit(3)

    for k in required:
        v = keys[k]
        # GitHub masks secrets loaded into env if added via $GITHUB_ENV
        print(f"{k}={v}")

if __name__ == "__main__":
    main()
