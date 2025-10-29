#!/usr/bin/env python3
"""
Valida que todas as variáveis de ambiente necessárias estão definidas.
Falha o processo caso alguma esteja ausente ou vazia.
"""

from __future__ import annotations

import os
import sys

REQUIRED_KEYS = [
    "RENDER_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "FROM_EMAIL",
    "MAILGUN_DOMAIN",
    "MAILGUN_API_KEY",
    "MAILGUN_SENDER",
    "MAILGUN_BASE_URL",
]

# ALERT_EMAIL é preferencial; se não existir usamos FROM_EMAIL
ALERT_KEY = "ALERT_EMAIL"


def main() -> int:
    missing = [key for key in REQUIRED_KEYS if not os.environ.get(key)]
    if missing:
        print("Erro: variáveis obrigatórias ausentes:", ", ".join(sorted(missing)))
        return 1

    alert_email = os.environ.get(ALERT_KEY)
    if not alert_email:
        os.environ[ALERT_KEY] = os.environ["FROM_EMAIL"]
        print(f"Aviso: {ALERT_KEY} não informado. Usando FROM_EMAIL como fallback.")
    else:
        print(f"{ALERT_KEY} definido.")

    print("Todas as variáveis obrigatórias estão definidas.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
