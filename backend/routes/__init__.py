from flask import Blueprint

bp = Blueprint("routes_root", __name__)

@bp.route("/health")
def health():
    return {"status": "ok"}
