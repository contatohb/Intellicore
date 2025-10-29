#!/usr/bin/env python3
"""
Envia email semanal com DDS, SRS, Roadmap, Project Status e User Stories.
Deve ser agendado para toda segunda-feira às 8h via cron/scheduler.
"""
from __future__ import annotations

import os
import sys
from datetime import datetime, timedelta, timezone
try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None
from pathlib import Path
from typing import List

import requests

REPO_ROOT = Path(__file__).resolve().parents[3]
DOCS_DIR = REPO_ROOT / "docs" / "hb_agro_intel"

ADMIN_EMAILS = ["huddsong@gmail.com", "hudsonborges@hb-advisory.com.br"]

DOCS_FILES = {
    "DDS": "dds.md",
    "SRS": "srs.md",
    "Roadmap": "roadmap.md",
    "Project Status": "project_status.md",
    "User Stories": "user_stories.md",
}


def read_markdown_file(file_path: Path) -> str:
    """Lê arquivo markdown e retorna conteúdo."""
    if not file_path.exists():
        return f"[Arquivo {file_path.name} não encontrado]"
    return file_path.read_text(encoding="utf-8")


def build_email_body() -> str:
    """Constrói o corpo do email com todos os documentos."""
    brasilia_tz = timezone(timedelta(hours=-3))
    now = datetime.now(brasilia_tz)
    
    body_parts = [
        "=" * 80,
        f"HB Agro Intel - Relatório Semanal de Documentação Técnica",
        f"Data: {now.strftime('%d/%m/%Y %H:%M')} (Brasília)",
        "=" * 80,
        "",
    ]
    
    for title, filename in DOCS_FILES.items():
        file_path = DOCS_DIR / filename
        content = read_markdown_file(file_path)
        
        body_parts.extend([
            "",
            "=" * 80,
            f"### {title.upper()} ###",
            "=" * 80,
            "",
            content,
            "",
        ])
    
    body_parts.extend([
        "",
        "=" * 80,
        "Este email é enviado automaticamente toda segunda-feira às 8h (Brasília).",
        "Destinatários: Administradores HB Advisory/Intellicore",
        "=" * 80,
    ])
    
    return "\n".join(body_parts)


def send_weekly_docs_email(*, dry_run: bool = False) -> None:
    """Envia email semanal com documentação técnica."""
    api_key = os.getenv("MAILGUN_API_KEY")
    domain = os.getenv("MAILGUN_DOMAIN")
    sender = os.getenv("STATUS_REPORT_SENDER", os.getenv("MAILGUN_SENDER"))
    base_url = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net/v3")
    
    if not all([api_key, domain, sender]):
        raise SystemExit("Missing Mailgun configuration (MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_SENDER).")
    
    # Use configurable timezone for subject (STATUS_REPORT_TZ) or default to America/Sao_Paulo
    tz_name = os.getenv("STATUS_REPORT_TZ", "America/Sao_Paulo")
    try:
        if ZoneInfo:
            local_tz = ZoneInfo(tz_name)
            now = datetime.now(local_tz)
            tz_suffix = tz_name
        else:
            now = datetime.now(timezone(timedelta(hours=-3)))
            tz_suffix = "UTC-3"
    except Exception:
        now = datetime.now(timezone.utc)
        tz_suffix = "UTC"

    subject = f"[HB Agro Intel] Documentação Técnica Semanal - {now.strftime('%d/%m/%Y')} ({tz_suffix})"
    body = build_email_body()
    
    if dry_run:
        print("=" * 80)
        print("DRY RUN - Email NÃO será enviado")
        print("=" * 80)
        print(f"From   : {sender}")
        print(f"To     : {', '.join(ADMIN_EMAILS)}")
        print(f"Subject: {subject}")
        print("=" * 80)
        print(body)
        return
    
    resp = requests.post(
        f"{base_url}/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": sender,
            "to": ADMIN_EMAILS,
            "subject": subject,
            "text": body,
        },
        timeout=30,
    )
    resp.raise_for_status()
    print(f"Email enviado com sucesso para: {', '.join(ADMIN_EMAILS)}")


def main() -> None:
    import argparse
    parser = argparse.ArgumentParser(description="Envia email semanal com documentação técnica.")
    parser.add_argument("--dry-run", action="store_true", help="Mostra o email sem enviar.")
    args = parser.parse_args()
    
    send_weekly_docs_email(dry_run=args.dry_run)


if __name__ == "__main__":
    main()
