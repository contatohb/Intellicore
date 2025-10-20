from flask import Blueprint, jsonify
from datetime import datetime
from db import supabase
from logger import log_event

ingest_api = Blueprint("ingest_api", __name__)

@ingest_api.route("/ingest", methods=["POST", "GET"])
def ingest():
    # Stub: 1 item do DOU só para validar escrita no registry_item
    item = {
        "source": "DOU",
        "url": "https://www.in.gov.br/en/web/dou",
        "title": "Ato normativo — exemplo",
        "summary": "Resumo automático (stub)",
        "published_at": datetime.utcnow().isoformat() + "Z",
        "raw": {"example": True},
    }

    res = supabase.table("registry_item").insert(item).execute()
    log_event("system", "ingest", "registry_item", {"count": len(res.data)})

    return jsonify({"status": "ok", "inserted": len(res.data)})
