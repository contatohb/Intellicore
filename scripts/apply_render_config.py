#!/usr/bin/env python3
"""
Sincroniza o serviço Render usando a API oficial.

Requer:
  - RENDER_API_KEY via variável de ambiente ou --api-key
  - PyYAML (pip install pyyaml) para ler render.yaml
  - Opcional: arquivo .env com os valores das variáveis
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from typing import Dict, Iterable, Optional

try:
    import yaml  # type: ignore
except ModuleNotFoundError as exc:  # pragma: no cover - dependência clara
    raise SystemExit(
        "PyYAML não encontrado. Instale com `python -m pip install pyyaml`."
    ) from exc


API_BASE = "https://api.render.com/v1"


class RenderApiError(RuntimeError):
    pass


def http_request(
    method: str,
    path: str,
    *,
    api_key: str,
    data: Optional[dict] = None,
) -> dict | list | None:
    url = urllib.parse.urljoin(API_BASE + "/", path.lstrip("/"))
    payload = None
    headers = {"Authorization": f"Bearer {api_key}"}
    if data is not None:
        payload = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=payload, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            if resp.status == 204:
                return None
            content_type = resp.headers.get("Content-Type", "")
            if "application/json" in content_type:
                return json.load(resp)
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as err:
        detail = err.read().decode()
        raise RenderApiError(f"{method} {url} -> {err.code}: {detail}") from err


def iter_services(api_key: str) -> Iterable[dict]:
    cursor = None
    while True:
        params = f"?cursor={cursor}" if cursor else ""
        data = http_request("GET", f"/services{params}", api_key=api_key)
        if not isinstance(data, list):
            break
        if not data:
            break
        for item in data:
            cursor = item.get("cursor")
            service = item.get("service")
            if service:
                yield service
        if len(data) < 1 or cursor is None:
            break


def locate_service(api_key: str, name_or_slug: str) -> dict:
    target = name_or_slug.lower()
    for service in iter_services(api_key):
        if service.get("name", "").lower() == target or service.get("slug", "").lower() == target:
            return service
    raise RenderApiError(f"Serviço '{name_or_slug}' não encontrado na conta Render.")


def load_blueprint(config_path: str) -> dict:
    with open(config_path, "r", encoding="utf-8") as fp:
        data = yaml.safe_load(fp)
    if not isinstance(data, dict) or "services" not in data:
        raise ValueError(f"Blueprint inválido em {config_path}: campo 'services' ausente.")
    return data


def parse_env_file(path: str) -> Dict[str, str]:
    env: Dict[str, str] = {}
    if not path or not os.path.exists(path):
        return env
    with open(path, "r", encoding="utf-8") as fp:
        for line in fp:
            stripped = line.strip()
            if not stripped or stripped.startswith("#"):
                continue
            if "=" not in stripped:
                continue
            key, value = stripped.split("=", 1)
            env[key.strip()] = value.strip()
    return env


def resolve_env_value(key: str, env_files: Dict[str, str], prefer_env: bool) -> Optional[str]:
    if prefer_env and key in os.environ:
        return os.environ[key]
    if key in env_files:
        return env_files[key]
    if not prefer_env and key in os.environ:
        return os.environ[key]
    return None


def main() -> None:
    parser = argparse.ArgumentParser(description="Atualiza serviço Render via API.")
    parser.add_argument("--config", default="render.yaml", help="Arquivo blueprint (default: render.yaml)")
    parser.add_argument("--service", default="Intellicore", help="Nome do serviço no blueprint/Render.")
    parser.add_argument(
        "--api-key",
        default=os.environ.get("RENDER_API_KEY"),
        help="API key da Render (padrão: variável RENDER_API_KEY).",
    )
    parser.add_argument("--env-file", default=".env", help="Arquivo .env com valores para envVars.")
    parser.add_argument(
        "--prefer-env",
        action="store_true",
        help="Prioriza valores já exportados no ambiente em vez do arquivo .env.",
    )
    parser.add_argument("--dry-run", action="store_true", help="Mostra alterações sem aplicar.")
    args = parser.parse_args()

    if not args.api_key:
        raise SystemExit("Defina RENDER_API_KEY ou use --api-key.")

    blueprint = load_blueprint(args.config)
    env_values = parse_env_file(args.env_file)
    service = locate_service(args.api_key, args.service)

    config_entry = None
    target_name = args.service.lower()
    for entry in blueprint.get("services", []):
        if entry.get("name", "").lower() == target_name:
            config_entry = entry
            break
    if not config_entry:
        raise SystemExit(f"Serviço '{args.service}' não encontrado em {args.config}.")

    service_details = config_entry.get("serviceDetails") or {}
    env_specific = service_details.get("envSpecificDetails") or {}
    build_command = env_specific.get("buildCommand") or config_entry.get("buildCommand")
    start_command = env_specific.get("startCommand") or config_entry.get("startCommand")
    plan = service_details.get("plan") or config_entry.get("plan")
    runtime_env = service_details.get("env") or config_entry.get("env")

    if not build_command or not start_command:
        raise SystemExit("Blueprint não define buildCommand/startCommand para o serviço alvo.")

    env_map: Dict[str, str] = {}
    for item in config_entry.get("envVars", []):
        key = item.get("key")
        if not key:
            continue
        value = resolve_env_value(key, env_values, args.prefer_env)
        if value is None or value == "":
            print(f"Aviso: sem valor definido para {key}; ignorando.")
            continue
        env_map[key] = value

    # Atualiza comandos
    patch_body = {
        "serviceDetails": {
            "envSpecificDetails": {
                "buildCommand": build_command,
                "startCommand": start_command,
            }
        }
    }
    if plan:
        patch_body["serviceDetails"]["plan"] = plan  # type: ignore[assignment]
    if runtime_env:
        patch_body["serviceDetails"]["env"] = runtime_env  # type: ignore[assignment]

    print(f"Atualizando comandos do serviço '{args.service}' (id={service['id']})...")
    if args.dry_run:
        print(json.dumps(patch_body, indent=2, ensure_ascii=False))
    else:
        http_request(
            "PATCH",
            f"/services/{service['id']}",
            api_key=args.api_key,
            data=patch_body,
        )

    # Atualiza env vars
    for key, value in env_map.items():
        body = {"value": value, "type": "general"}
        print(f"Definindo variável {key}...")
        if args.dry_run:
            print(json.dumps(body, indent=2, ensure_ascii=False))
            continue
        http_request(
            "PUT",
            f"/services/{service['id']}/env-vars/{key}",
            api_key=args.api_key,
            data=body,
        )

    print("Concluído.")


if __name__ == "__main__":
    main()
