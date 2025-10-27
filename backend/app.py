from __future__ import annotations

import os
from urllib.parse import urlencode

from fastapi import FastAPI, Request
from fastapi.responses import RedirectResponse, PlainTextResponse

NEXT_SITE_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "https://hb-advisory-site.onrender.com").rstrip("/")

app = FastAPI(title="HB Advisory Redirect")


def _build_target(path: str, query: str) -> str:
    path = path.lstrip("/")
    base = NEXT_SITE_URL
    if path:
        base = f"{base}/{path}"
    if query:
        base = f"{base}?{query}"
    return base


@app.middleware("http")
async def redirect_all(request: Request, call_next):
    # health checks from Render hit /.well-known or /health; keep them local.
    path = request.url.path or "/"
    if path.startswith("/internal") or path.startswith("/health"):
        return await call_next(request)
    target = _build_target(path, request.url.query)
    return RedirectResponse(url=target, status_code=307)


@app.get("/health", include_in_schema=False)
async def health() -> PlainTextResponse:
    return PlainTextResponse("ok")

