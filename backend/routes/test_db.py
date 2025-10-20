from flask import Blueprint, jsonify
from db import supabase

test_db = Blueprint("test_db", __name__)

@test_db.route("/test-db")
def test_db_route():
    try:
        data = supabase.table("users").select("*").execute()
        return jsonify({"status": "ok", "count": len(data.data)})
    except Exception as e:
        return jsonify({"status": "error", "detail": str(e)})
