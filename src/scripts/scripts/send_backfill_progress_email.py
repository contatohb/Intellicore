#!/usr/bin/env python3
"""Envio automático do status do backfill via Mailgun."""
from __future__ import annotations

import os
import sys
from datetime import datetime, timezone
try:
    # Python 3.9+
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None

import requests

THIS_DIR = __file__
import pathlib

SCRIPTS_DIR = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(SCRIPTS_DIR))

from report_backfill_progress import build_report

import argparse


def send_email(subject: str, body: str, recipients: list[str], *, dry_run: bool = False) -> None:
    api_key = os.getenv("MAILGUN_API_KEY")
    domain = os.getenv("MAILGUN_DOMAIN")
    sender = os.getenv("STATUS_REPORT_SENDER", os.getenv("MAILGUN_SENDER"))
    base_url = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net/v3")
    
    # Garantir que ambos emails ADM sempre recebam
    admin_emails = ["huddsong@gmail.com", "hudsonborges@hb-advisory.com.br"]
    all_recipients = list(set(recipients + admin_emails))

    if not api_key or not domain or not sender or not all_recipients:
        raise SystemExit("Missing Mailgun configuration for backfill email.")

    if dry_run:
        print("=== DRY RUN ===")
        print(f"From   : {sender}")
        print(f"To     : {', '.join(all_recipients)}")
        print(f"Subject: {subject}")
        print(body)
        return

    resp = requests.post(
        f"{base_url}/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": sender,
            "to": all_recipients,
            "subject": subject,
            "text": body,
        },
        timeout=30,
    )
    resp.raise_for_status()


def main() -> None:
    parser = argparse.ArgumentParser(description="Send hourly backfill progress email.")
    parser.add_argument("--dry-run", action="store_true", help="Print e-mail without sending.")
    args = parser.parse_args()

    report = build_report()
    if not report.strip():
        return

    recipients = [
        email.strip()
        for email in os.getenv("STATUS_REPORT_RECIPIENTS", "").split(",")
        if email.strip()
    ]
    if not recipients:
        raise SystemExit("STATUS_REPORT_RECIPIENTS not configured.")

    # Format timestamp in configured timezone (STATUS_REPORT_TZ) or default to America/Sao_Paulo
    tz_name = os.getenv("STATUS_REPORT_TZ", "America/Sao_Paulo")
    try:
        if ZoneInfo:
            local_tz = ZoneInfo(tz_name)
            now_local = datetime.now(local_tz)
            tz_suffix = tz_name
        else:
            # Fallback to UTC if zoneinfo not available
            now_local = datetime.now(timezone.utc)
            tz_suffix = "UTC"
    except Exception:
        now_local = datetime.now(timezone.utc)
        tz_suffix = "UTC"

    now_str = now_local.strftime("%Y-%m-%d %H:%M")
    subject = f"[HB Agro Intel] Backfill status {now_str} {tz_suffix}"
    send_email(subject, report, recipients, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
