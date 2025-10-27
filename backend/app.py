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


@app.api_route("/", methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], include_in_schema=False)
async def root_redirect(request: Request):
    target = _build_target("", request.url.query)
    return RedirectResponse(url=target, status_code=307)


@app.api_route("/{path:path}", methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], include_in_schema=False)
async def wildcard_redirect(path: str, request: Request):
    if path.lower().startswith("health"):
        return PlainTextResponse("ok")
    target = _build_target(path, request.url.query)
    return RedirectResponse(url=target, status_code=307)
