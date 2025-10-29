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
# Aumentado para 30 minutos para tolerar builds mais longos
POLL_TIMEOUT = 30 * 60  # 30 minutos


class DeployError(RuntimeError):
    pass


def require_env(key: str, *, optional: bool = False, default: str | None = None) -> str | None:
    value = os.getenv(key)
    if not value:
        if optional:
            return default
        raise DeployError(f"Variável obrigatória '{key}' não definida.")
    return value


def trigger_deploy(api_key: str, service_id: str) -> str:
    url = f"{RENDER_API}/services/{service_id}/deploys"
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    response = requests.post(url, headers=headers, timeout=30)
    if response.status_code >= 300:
        raise DeployError(f"Falha ao criar deploy: {response.status_code} {response.text}")
    try:
        data = response.json()
    except Exception:
        data = None
    deploy_id = (data or {}).get("id") if isinstance(data, dict) else None
    if not deploy_id:
        # Fallback: listar deploys do serviço e pegar o mais recente
        lst = list_service_deploys(api_key, service_id)
        if not lst:
            raise DeployError("Não foi possível identificar o deploy recém-criado.")
        first = lst[0]
        deploy_id = first.get("id") or first.get("deployId") or ""
        if not deploy_id:
            raise DeployError(f"Lista de deploys sem id: {lst[:1]}")
    print(f"Deploy {deploy_id} criado.")
    return deploy_id


def list_service_deploys(api_key: str, service_id: str) -> list:
    url = f"{RENDER_API}/services/{service_id}/deploys?limit=5"
    headers = {"Authorization": f"Bearer {api_key}"}
    resp = requests.get(url, headers=headers, timeout=30)
    if resp.status_code >= 300:
        raise DeployError(f"Erro ao listar deploys: {resp.status_code} {resp.text}")
    try:
        data = resp.json()
    except Exception:
        data = []
    if not isinstance(data, list):
        return []
    normalized = []
    for item in data:
        if isinstance(item, dict) and "deploy" in item and isinstance(item["deploy"], dict):
            normalized.append(item["deploy"])
        elif isinstance(item, dict):
            normalized.append(item)
    return normalized


def wait_for_deploy(api_key: str, deploy_id: str, service_id: str | None = None) -> Tuple[str, str]:
    url = f"{RENDER_API}/deploys/{deploy_id}"
    headers = {"Authorization": f"Bearer {api_key}"}
    start = time.monotonic()
    while True:
        response = requests.get(url, headers=headers, timeout=30)
        if response.status_code == 404 and service_id:
            # Fallback: algumas contas/regiões retornam 404 nesse endpoint; buscar pelo serviço
            svc_url = f"{RENDER_API}/services/{service_id}/deploys?limit=5"
            svc_resp = requests.get(svc_url, headers=headers, timeout=30)
            if svc_resp.status_code >= 300:
                raise DeployError(f"Erro ao consultar deploy (fallback): {svc_resp.status_code} {svc_resp.text}")
            try:
                lst = svc_resp.json() or []
            except Exception:
                lst = []
            if not isinstance(lst, list) or not lst:
                raise DeployError("Fallback não retornou lista de deploys.")
            # Normaliza como em list_service_deploys
            normalized = []
            for item in lst:
                if isinstance(item, dict) and "deploy" in item and isinstance(item["deploy"], dict):
                    normalized.append(item["deploy"])
                elif isinstance(item, dict):
                    normalized.append(item)
            if not normalized:
                raise DeployError("Fallback não retornou itens de deploy normalizados.")
            data = normalized[0]
        elif response.status_code >= 300:
            raise DeployError(f"Erro ao consultar deploy: {response.status_code} {response.text}")
        try:
            data = response.json()
        except Exception:
            if service_id:
                lst = list_service_deploys(api_key, service_id)
                if not lst:
                    raise DeployError("Não foi possível ler status do deploy (sem JSON).")
                data = lst[0]
            else:
                raise
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
    api_key = require_env("RENDER_API_KEY")  # type: ignore[assignment]
    service_id = require_env("RENDER_SERVICE_ID")  # type: ignore[assignment]
    base_url = require_env("RENDER_SERVICE_URL", optional=True)

    mailgun_domain = require_env("MAILGUN_DOMAIN")
    mailgun_api_key = require_env("MAILGUN_API_KEY")
    mailgun_sender = require_env("MAILGUN_SENDER")
    alert_email = os.getenv("ALERT_EMAIL") or require_env("FROM_EMAIL")

    endpoints = os.getenv("RENDER_SMOKE_ENDPOINTS", ",".join(DEFAULT_ENDPOINTS))
    endpoint_list = [e.strip() for e in endpoints.split(",") if e.strip()]

    try:
        deploy_id = trigger_deploy(api_key, service_id)
        status, commit = wait_for_deploy(api_key, deploy_id, service_id=service_id)
        print(f"Deploy {deploy_id} finalizado com status {status}. Commit {commit}.")
        if base_url:
            run_smoke_tests(base_url, endpoint_list)
            print("Deploy validado com sucesso.")
        else:
            print("Base URL não informada; pulando smoke tests.")
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
