from flask import Blueprint, request, jsonify
import os
import hashlib
import hmac
import time
import json
from pathlib import Path

mailgun_api = Blueprint("mailgun_api", __name__)


@mailgun_api.route("/mailgun/inbound", methods=["POST"])
def mailgun_inbound():
    """Endpoint to receive Mailgun inbound webhooks.

    Verifies signature if `MAILGUN_WEBHOOK_SIGNING_KEY` is configured.
    Stores raw payload to /tmp/mailgun_inbound/ for later inspection.
    """
    signing_key = os.getenv("MAILGUN_WEBHOOK_SIGNING_KEY")

    # Mailgun sends timestamp, token, signature as form fields
    data = request.form.to_dict(flat=True) if request.form else {}
    # If not form, try JSON body
    if not data:
        try:
            data = request.get_json(force=True) or {}
        except Exception:
            data = {}

    # Verify signature when possible
    sig = None
    ts = None
    token = None
    # signature may be nested under 'signature' object in JSON
    if isinstance(data, dict) and "signature" in data and isinstance(data["signature"], dict):
        sig = data["signature"].get("signature")
        ts = data["signature"].get("timestamp")
        token = data["signature"].get("token")
    else:
        sig = data.get("signature")
        ts = data.get("timestamp")
        token = data.get("token")

    verified = False
    if signing_key and sig and ts and token:
        try:
            # Compose bytes and compute HMAC-SHA256
            msg = f"{ts}{token}".encode("utf-8")
            computed = hmac.new(signing_key.encode("utf-8"), msg, hashlib.sha256).hexdigest()
            verified = hmac.compare_digest(computed, sig)
        except Exception:
            verified = False

    # Save raw request for inspection
    dest = Path("/tmp/mailgun_inbound")
    dest.mkdir(parents=True, exist_ok=True)
    ts_now = int(time.time())
    filename = dest / f"inbound_{ts_now}.json"
    try:
        with open(filename, "w", encoding="utf-8") as f:
            payload = {
                "headers": dict(request.headers),
                "form": request.form.to_dict(flat=True),
                "args": request.args.to_dict(flat=True),
                "json": None,
            }
            try:
                payload["json"] = request.get_json(force=False)
            except Exception:
                payload["json"] = None
            json.dump(payload, f, ensure_ascii=False, indent=2)
    except Exception:
        # best-effort; don't fail the webhook if logging fails
        pass

    # If signature configured and verification failed, reject
    if signing_key and not verified:
        return jsonify({"ok": False, "reason": "signature_verification_failed"}), 403

    # Return success so Mailgun considers webhook delivered
    return jsonify({"ok": True}), 200

# Expose blueprint with name pattern expected by `register_blueprints` ("<module>_api").
mailgun_inbound_api = mailgun_api
