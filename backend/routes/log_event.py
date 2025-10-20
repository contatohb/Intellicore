from flask import Blueprint, jsonify, request
from backend.db import get_supabase

log_api = Blueprint("log_api", __name__)

@log_api.route("/log-test", methods=["POST"])
def log_test():
    payload = {
        "actor": "system",
        "action": "test",
        "entity": "connectivity",
        "payload": {"ok": True}
    }
    client = get_supabase()
    res = client.table("event_log").insert(payload).execute()
    return jsonify({"status": "ok", "inserted": len(res.data)})
