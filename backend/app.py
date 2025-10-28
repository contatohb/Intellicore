from __future__ import annotations

import os
from flask import Flask, redirect, request, Response

NEXT_SITE_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "https://hb-advisory-site.onrender.com").rstrip("/")

app = Flask(__name__)


def _target(path: str, query: str) -> str:
    path = path.lstrip("/")
    url = NEXT_SITE_URL
    if path:
        url = f"{url}/{path}"
    if query:
        url = f"{url}?{query}"
    return url


@app.route("/health", methods=["GET", "HEAD"])
def health() -> Response:
    return Response("ok", mimetype="text/plain")


@app.route("/", defaults={"path": ""}, methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
@app.route("/<path:path>", methods=["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
def redirect_all(path: str):
    if path.startswith(".well-known"):
        return Response("ok", mimetype="text/plain")
    target = _target(path, request.query_string.decode("utf-8"))
    return redirect(target, code=307)
