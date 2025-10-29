#!/usr/bin/env python3
"""
Dispara um deploy no Render, aguarda a conclusão e executa testes de fumaça.
Se algo falhar, envia notificação via Mailgun.
"""

from __future__ import annotations

import os
import sys
import time
from typing import Iterable, Tuple

import requests

RENDER_API = "https://api.render.com/v1"
DEFAULT_ENDPOINTS = ("/health", "/test-db")
POLL_INTERVAL = 10  # segundos
POLL_TIMEOUT = 15 * 60  # 15 minutos


class DeployError(RuntimeError):
    pass


def require_env(key: str) -> str:
    value = os.getenv(key)
    if not value:
        raise DeployError(f"Variável obrigatória '{key}' não definida.")
    return value


def trigger_deploy(api_key: str, service_id: str) -> str:
    url = f"{RENDER_API}/services/{service_id}/deploys"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    response = requests.post(url, headers=headers, timeout=30)
    if response.status_code >= 300:
        raise DeployError(f"Falha ao criar deploy: {response.status_code} {response.text}")
    data = response.json()
    deploy_id = data.get("id")
    if not deploy_id:
        raise DeployError(f"Resposta inesperada ao criar deploy: {data}")
    print(f"Deploy {deploy_id} criado.")
    return deploy_id


def wait_for_deploy(api_key: str, deploy_id: str) -> Tuple[str, str]:
    url = f"{RENDER_API}/deploys/{deploy_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    start = time.monotonic()
    while True:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code >= 300:
            raise DeployError(f"Erro ao consultar deploy: {response.status_code} {response.text}")
        data = response.json()
        status = data.get("status")
        commit = data.get("commitId", "")
        print(f"Status do deploy {deploy_id}: {status}")
        if status in {"live", "deployed"}:
            return status, commit
        if status in {"failed", "cancelled", "build_failed"}:
            raise DeployError(f"Deploy {deploy_id} terminou com status '{status}'.")
        if time.monotonic() - start > POLL_TIMEOUT:
            raise DeployError(f"Timeout aguardando deploy {deploy_id}.")
        time.sleep(POLL_INTERVAL)


def run_smoke_tests(base_url: str, endpoints: Iterable[str]) -> None:
    base = base_url.rstrip("/")
    for endpoint in endpoints:
        path = endpoint if endpoint.startswith("/") else f"/{endpoint}"
        url = f"{base}{path}"
        print(f"Smoke test GET {url} ...", end=" ", flush=True)
        response = requests.get(url, timeout=30)
        if response.status_code != 200:
            raise DeployError(f"Smoke test falhou para {url}: {response.status_code} {response.text}")
        print("ok")


def notify_failure(
    mailgun_domain: str,
    mailgun_api_key: str,
    sender: str,
    recipient: str,
    subject: str,
    message: str,
) -> None:
    url = f"https://api.mailgun.net/v3/{mailgun_domain}/messages"
    data = {
        "from": sender,
        "to": [recipient],
        "subject": subject,
        "text": message,
    }
    response = requests.post(url, auth=("api", mailgun_api_key), data=data, timeout=30)
    if response.status_code >= 300:
        print(f"Falha ao enviar notificação: {response.status_code} {response.text}", file=sys.stderr)
    else:
        print(f"Notificação enviada para {recipient}.")


def main() -> int:
    api_key = require_env("RENDER_API_KEY")
    service_id = require_env("RENDER_SERVICE_ID")
    base_url = require_env("RENDER_SERVICE_URL")

    mailgun_domain = require_env("MAILGUN_DOMAIN")
    mailgun_api_key = require_env("MAILGUN_API_KEY")
    mailgun_sender = require_env("MAILGUN_SENDER")
    alert_email = os.getenv("ALERT_EMAIL") or require_env("FROM_EMAIL")

    endpoints = os.getenv("RENDER_SMOKE_ENDPOINTS", ",".join(DEFAULT_ENDPOINTS))
    endpoint_list = [e.strip() for e in endpoints.split(",") if e.strip()]

    try:
        deploy_id = trigger_deploy(api_key, service_id)
        status, commit = wait_for_deploy(api_key, deploy_id)
        print(f"Deploy {deploy_id} finalizado com status {status}. Commit {commit}.")
        run_smoke_tests(base_url, endpoint_list)
        print("Deploy validado com sucesso.")
        return 0
    except DeployError as exc:
        print(f"Erro: {exc}", file=sys.stderr)
        notify_failure(
            mailgun_domain=mailgun_domain,
            mailgun_api_key=mailgun_api_key,
            sender=mailgun_sender,
            recipient=alert_email,
            subject="[Intellicore] Falha no deploy",
            message=str(exc),
        )
        return 1


if __name__ == "__main__":
    sys.exit(main())
