from __future__ import annotations

import os
from urllib.parse import urlencode

NEXT_SITE_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "https://hb-advisory-site.onrender.com").rstrip("/")


def _target(path: str, query: str) -> str:
    path = path.lstrip("/")
    url = NEXT_SITE_URL
    if path:
        url = f"{url}/{path}"
    if query:
        url = f"{url}?{query}"
    return url


def app(environ, start_response):
    path = environ.get("PATH_INFO", "")
    method = environ.get("REQUEST_METHOD", "GET").upper()
    if path.startswith("/health"):
        start_response("200 OK", [("Content-Type", "text/plain"), ("Content-Length", "2")])
        return [b"ok"]

    query = environ.get("QUERY_STRING", "")
    target = _target(path, query)
    status = "307 Temporary Redirect"
    headers = [("Location", target)]
    if method != "HEAD":
        body = f"Redirecting to {target}".encode("utf-8")
        headers.append(("Content-Type", "text/plain; charset=utf-8"))
        headers.append(("Content-Length", str(len(body))))
        start_response(status, headers)
        return [body]
    headers.append(("Content-Length", "0"))
    start_response(status, headers)
    return [b""]
