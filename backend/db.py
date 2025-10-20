from __future__ import annotations

import os
from typing import Any

from supabase import Client, create_client

SUPABASE_URL: str | None = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY: str | None = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

_supabase_client: Client | None = None


def get_supabase() -> Client:
    """Lazy inicialização do cliente Supabase."""
    global _supabase_client
    if _supabase_client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "Supabase client not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )
        _supabase_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supabase_client


class _SupabaseProxy:
    def __getattr__(self, item: str) -> Any:
        return getattr(get_supabase(), item)


supabase = _SupabaseProxy()


__all__ = ["get_supabase", "supabase"]
