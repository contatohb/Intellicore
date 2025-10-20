from datetime import datetime, timedelta
from .sources.dou import fetch_dou_items
from backend.db import get_supabase
from logger import log_event

def ingest_recent(days: int = 1):
    since = datetime.utcnow() - timedelta(days=days)
    items = fetch_dou_items(since)

    client = get_supabase()
    for item in items:
        client.table("registry_item").insert({
            "source": item["source"],
            "title": item["title"],
            "summary": item["summary"],
            "url": item["url"],
            "published_at": item["published_at"],
            "metadata": item["raw"],
        }).execute()

        log_event("system", "ingest", "registry_item", {"title": item["title"]})

    return {"inserted": len(items), "since": since.isoformat()}
