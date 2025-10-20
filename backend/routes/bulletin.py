from flask import Blueprint, jsonify, request
from modules.regintel.v2_1_bulletin.bulletin.send import run_bulletin

bulletin_api = Blueprint("bulletin_api", __name__)

@bulletin_api.route("/bulletin", methods=["POST", "GET"])
def bulletin():
    email = request.args.get("email", "huddsong@gmail.com")
    result = run_bulletin(email)
    return jsonify({"status": "ok", "sent": result["sent"], "to": result["to"]})
