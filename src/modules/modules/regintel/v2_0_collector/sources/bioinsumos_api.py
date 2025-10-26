from __future__ import annotations

from typing import Any, Dict, Optional, Tuple, List

from .agrofit_api import (
    AgrofitClient,
    AgrofitResourceConfig,
    _item_identifier,  # re-export for convenience
    load_config as _load_agrofit_config,
)

BIOINSUMOS_BASE_URL = "https://api.cnptia.embrapa.br/apis/bioinsumos/v3"


class BioinsumosClient(AgrofitClient):
    def __init__(
        self,
        client_id: str,
        client_secret: str,
        scope: Optional[str] = None,
        base_url: str = BIOINSUMOS_BASE_URL,
        request_timeout: float = 120.0,
        max_retries: int = 7,
        backoff_cap: float = 180.0,
        backoff_base: float = 2.0,
        request_delay: float = 0.0,
        min_request_interval: float = 0.0,
    ) -> None:
        super().__init__(
            client_id,
            client_secret,
            scope=scope,
            base_url=base_url,
            request_timeout=request_timeout,
            max_retries=max_retries,
            backoff_cap=backoff_cap,
            backoff_base=backoff_base,
            request_delay=request_delay,
            min_request_interval=min_request_interval,
        )


def load_config(config: Dict[str, Any]) -> Tuple[str, str, Optional[str], List[AgrofitResourceConfig], str, Dict[str, Any]]:
    return _load_agrofit_config(
        config,
        env_client_id="BIOINSUMOS_CLIENT_ID",
        env_client_secret="BIOINSUMOS_CLIENT_SECRET",
        default_base_url=BIOINSUMOS_BASE_URL,
    )


__all__ = [
    "BioinsumosClient",
    "AgrofitResourceConfig",
    "_item_identifier",
    "load_config",
]
