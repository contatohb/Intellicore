#!/usr/bin/env python3
"""
Compila o status semanal do HB Agro Intel e envia e-mail via Mailgun.
"""
from __future__ import annotations

import argparse
import datetime as dt
try:
    from zoneinfo import ZoneInfo
except Exception:
    ZoneInfo = None
import os
import pathlib
from typing import Iterable, List, Optional

import requests

try:  # Optional import; script fica resiliente se faltar.
    from report_backfill_progress import build_report as build_backfill_report
except ImportError:  # pragma: no cover
    build_backfill_report = None  # type: ignore

REPO_ROOT = pathlib.Path(__file__).resolve().parents[3]
DOCS_DIR = REPO_ROOT / "docs"
HB_DOCS_DIR = DOCS_DIR / "hb_agro_intel"
REPORTS_DIR = REPO_ROOT / "reports" / "weekly"
LOG_FILE = REPO_ROOT / "logs" / "communications" / "weekly_status.log"


def read_text(path: pathlib.Path) -> Optional[str]:
    if not path.exists():
        return None
    try:
        return path.read_text(encoding="utf-8")
    except Exception as exc:  # pragma: no cover
        return f"[Erro ao ler {path}: {exc}]"


def latest_weekly_report() -> Optional[pathlib.Path]:
    if not REPORTS_DIR.exists():
        return None
    candidates: List[pathlib.Path] = sorted(REPORTS_DIR.glob("*.md"))
    return candidates[-1] if candidates else None


def append_log(message: str) -> None:
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    timestamp = dt.datetime.now(dt.timezone.utc).isoformat()
    with LOG_FILE.open("a", encoding="utf-8") as fh:
        fh.write(f"[{timestamp}] {message}\n")


def write_report(body: str, destination: Optional[str]) -> pathlib.Path:
    if destination is None or destination == "auto":
        date_slug = dt.datetime.now().strftime("%Y-%m-%d")
        output_path = REPORTS_DIR / f"{date_slug}.md"
    else:
        raw_path = pathlib.Path(destination).expanduser()
        if raw_path.is_dir() or destination.endswith("/"):
            date_slug = dt.datetime.now().strftime("%Y-%m-%d")
            output_path = raw_path / f"{date_slug}.md"
        else:
            output_path = raw_path
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(body, encoding="utf-8")
    return output_path


def build_body(extra_notes: Optional[str] = None) -> str:
    # Use configurable timezone (STATUS_REPORT_TZ) or fallback to America/Sao_Paulo
    tz_name = os.getenv("STATUS_REPORT_TZ", "America/Sao_Paulo")
    try:
        if ZoneInfo:
            local_tz = ZoneInfo(tz_name)
            today_dt = dt.datetime.now(tz=local_tz)
            tz_label = tz_name
        else:
            local_tz = dt.timezone(dt.timedelta(hours=-3))
            today_dt = dt.datetime.now(tz=local_tz)
            tz_label = "UTC-3"
    except Exception:
        today_dt = dt.datetime.now(dt.timezone.utc)
        tz_label = "UTC"

    today = today_dt.strftime("%d/%m/%Y %H:%M") + f" ({tz_label})"
    sections: List[tuple[str, pathlib.Path]] = [
        ("Resumo de Projeto", DOCS_DIR / "project_status.md"),
        ("SRS", HB_DOCS_DIR / "srs.md"),
        ("DDS", HB_DOCS_DIR / "dds.md"),
        ("Roadmap", HB_DOCS_DIR / "roadmap.md"),
        ("Histórias de Usuário", HB_DOCS_DIR / "user_stories.md"),
    ]
    latest_report = latest_weekly_report()
    if latest_report:
        sections.insert(1, ("Relatório Semanal Mais Recente", latest_report))

    lines = [
        f"Status HB Agro Intel – atualizado em {today}",
        "",
        "Este resumo é gerado automaticamente a partir dos documentos vivos do repositório.",
        "",
    ]
    if extra_notes:
        lines.extend(["Notas adicionais:", extra_notes.strip(), ""])

    if build_backfill_report:
        try:
            backfill = build_backfill_report().strip()
        except Exception as exc:  # pragma: no cover
            backfill = f"[Erro ao gerar status de backfill: {exc}]"
        if backfill:
            lines.extend(["## Status do Backfill", backfill, ""])

    for title, path in sections:
        raw_content = read_text(path)
        content = raw_content.strip() if raw_content else "Documento ainda não disponível."
        lines.extend([f"## {title} ({path.relative_to(REPO_ROOT)})", content.strip(), ""])

    return "\n".join(lines).strip()


def send_email(subject: str, body: str, recipients: Iterable[str], dry_run: bool = False) -> bool:
    api_key = os.getenv("MAILGUN_API_KEY")
    domain = os.getenv("MAILGUN_DOMAIN")
    sender = os.getenv("STATUS_REPORT_SENDER", os.getenv("MAILGUN_SENDER"))
    base_url = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net/v3")

    if not api_key or not domain or not sender:
        raise SystemExit("Defina MAILGUN_API_KEY, MAILGUN_DOMAIN e STATUS_REPORT_SENDER/MAILGUN_SENDER.")

    # Sempre garantir entrega para os e-mails ADM
    admin_set = {"huddsong@gmail.com", "hudsonborges@hb-advisory.com.br"}
    target = list(admin_set.union(set(recipients)))

    if dry_run:
        print("=== DRY RUN ===")
        print(f"To: {', '.join(target)}")
        print(f"From: {sender}")
        print(f"Subject: {subject}")
        print(body)
        return False

    response = requests.post(
        f"{base_url}/{domain}/messages",
        auth=("api", api_key),
        data={
            "from": sender,
            "to": target,
            "subject": subject,
            "text": body,
        },
    )
    response.raise_for_status()
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Envia e-mail semanal de status HB Agro Intel.")
    parser.add_argument(
        "--recipients",
        help="Lista de destinatários separados por vírgula (default: STATUS_REPORT_RECIPIENTS).",
    )
    parser.add_argument("--subject", default="[HB Agro Intel] Status Semanal", help="Assunto do e-mail.")
    parser.add_argument("--notes", help="Notas adicionais para incluir no corpo.")
    parser.add_argument("--dry-run", action="store_true", help="Não envia e-mail; apenas imprime o conteúdo.")
    parser.add_argument(
        "--no-email",
        action="store_true",
        help="Pula o envio de e-mail (útil ao gerar apenas relatório).",
    )
    parser.add_argument(
        "--write-report",
        nargs="?",
        const="auto",
        help="Grava o corpo em Markdown (default: reports/weekly/<data>.md).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    recipients_env = args.recipients or os.getenv("STATUS_REPORT_RECIPIENTS")
    if not recipients_env:
        raise SystemExit("Defina STATUS_REPORT_RECIPIENTS ou passe --recipients.")
    recipients = [email.strip() for email in recipients_env.split(",") if email.strip()]
    if not recipients:
        raise SystemExit("Nenhum destinatário informado.")

    body = build_body(extra_notes=args.notes)

    report_path: Optional[pathlib.Path] = None
    if args.write_report:
        report_path = write_report(body, args.write_report)

    sent = False
    if args.dry_run:
        send_email(args.subject, body, recipients, dry_run=True)
    elif not args.no_email:
        sent = send_email(args.subject, body, recipients, dry_run=False)

    summary_parts = [
        f"subject={args.subject}",
        f"recipients={len(recipients)}",
        f"sent={'yes' if sent else 'no'}",
    ]
    if args.dry_run:
        summary_parts.append("mode=dry-run")
    if args.no_email and not args.dry_run:
        summary_parts.append("mode=no-email")
    if report_path:
        try:
            rel_path = report_path.relative_to(REPO_ROOT)
        except ValueError:
            rel_path = report_path
        summary_parts.append(f"report={rel_path}")
    append_log("; ".join(summary_parts))

    if report_path and not args.dry_run:
        print(f"Relatório salvo em {report_path}")


if __name__ == "__main__":
    main()

