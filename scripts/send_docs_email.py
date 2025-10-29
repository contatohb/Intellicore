#!/usr/bin/env python3
"""
Enviar por email os documentos DDS/SRS/Roadmap/Project Status/User Stories
localizados em `docs/hb_agro_intel/`.
"""
from __future__ import annotations

import os
from datetime import datetime, timezone, timedelta
try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None
from pathlib import Path
import requests

DOC_FILES = [
    "dds.md",
    "srs.md",
    "roadmap.md",
    "project_status.md",
    "user_stories.md",
]


def read_docs(base: Path) -> str:
    parts = []
    for fname in DOC_FILES:
        p = base / fname
        if not p.exists():
            parts.append(f"## {fname} (missing)\nThis document was not found in {p}.\n")
            continue
        parts.append(f"## {fname}\n")
        parts.append(p.read_text(encoding="utf-8"))
        parts.append("\n\n---\n\n")
    return "\n".join(parts)


def mailgun_send(subject: str, body: str, recipients: list[str]) -> None:
    api_key = os.getenv("MAILGUN_API_KEY")
    domain = os.getenv("MAILGUN_DOMAIN")
    sender = os.getenv("STATUS_REPORT_SENDER", os.getenv("MAILGUN_SENDER"))
    base_url = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net/v3")

    if not api_key or not domain or not sender:
        raise SystemExit("Missing MAILGUN config in environment.")

    # always include admin addresses
    admin_emails = ["huddsong@gmail.com", "hudsonborges@hb-advisory.com.br"]
    to_addrs = list(dict.fromkeys(recipients + admin_emails))

    resp = requests.post(
        f"{base_url}/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": sender,
            "to": to_addrs,
            "subject": subject,
            "text": body,
        },
        timeout=30,
    )
    resp.raise_for_status()


def main() -> None:
    base = Path(__file__).resolve().parents[1] / "docs" / "hb_agro_intel"
    body = read_docs(base)

    # Subject with configurable timezone (STATUS_REPORT_TZ) or fallback to America/Sao_Paulo
    tz_name = os.getenv("STATUS_REPORT_TZ", "America/Sao_Paulo")
    try:
        if ZoneInfo:
            local_tz = ZoneInfo(tz_name)
            now_local = datetime.now(local_tz)
            tz_suffix = tz_name
        else:
            now_local = datetime.now(timezone(timedelta(hours=-3)))
            tz_suffix = "UTC-3"
    except Exception:
        now_local = datetime.now(timezone.utc)
        tz_suffix = "UTC"

    now = now_local.strftime("%Y-%m-%d %H:%M")
    subject = f"Intellicore — DDS / SRS / Roadmap / Status / User stories — {now} ({tz_suffix})"

    recipients = os.getenv("STATUS_REPORT_RECIPIENTS", "").split(",") if os.getenv("STATUS_REPORT_RECIPIENTS") else []
    recipients = [r.strip() for r in recipients if r.strip()]

    mailgun_send(subject, body, recipients)
    print("Email enviado para:", recipients + ["huddsong@gmail.com", "hudsonborges@hb-advisory.com.br"])


if __name__ == "__main__":
    main()
