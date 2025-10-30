from __future__ import annotations

import json
from importlib import import_module
from pathlib import Path
from typing import Iterable, List, NamedTuple, Sequence


class BlueprintSpec(NamedTuple):
    module: str
    name: str
    url_prefix: str | None = None


_CONFIG_PATH = Path(__file__).resolve().parent.parent / ".codex.json"
_DEFAULT_BLUEPRINTS: Sequence[BlueprintSpec] = (
    BlueprintSpec("backend.routes.health", "health_api", "/"),
    BlueprintSpec("backend.routes.log_event", "log_api", "/"),
    BlueprintSpec("backend.routes.test_db", "test_db", "/"),
    BlueprintSpec("backend.routes.bulletin", "bulletin_api", "/"),
    BlueprintSpec("backend.routes.ingest", "ingest_api", "/"),
    # Mailgun inbound webhook (added so register_blueprints picks it up)
    BlueprintSpec("backend.routes.mailgun_inbound", "mailgun_inbound_api", "/"),
)


def _load_blueprint_specs() -> Sequence[BlueprintSpec]:
    if _CONFIG_PATH.exists():
        try:
            raw = json.loads(_CONFIG_PATH.read_text())
        except json.JSONDecodeError:
            raw = {}
        specs: List[BlueprintSpec] = []
        for entry in raw.get("blueprints", []):
            module = entry.get("module")
            name = entry.get("name")
            if not module or not name:
                continue
            specs.append(
                BlueprintSpec(
                    module,
                    name,
                    entry.get("url_prefix") or "/",
                )
            )
        if specs:
            return tuple(specs)
    return _DEFAULT_BLUEPRINTS


def iter_blueprints() -> Iterable[tuple]:
    for spec in _load_blueprint_specs():
        module = import_module(spec.module)
        blueprint = getattr(module, spec.name, None)
        if blueprint is None:
            raise AttributeError(
                f"Blueprint '{spec.name}' not found in module '{spec.module}'"
            )
        yield blueprint, spec.url_prefix


def register_blueprints(app) -> None:
    for blueprint, url_prefix in iter_blueprints():
        app.register_blueprint(blueprint, url_prefix=url_prefix)


__all__ = ["register_blueprints", "iter_blueprints", "BlueprintSpec"]
