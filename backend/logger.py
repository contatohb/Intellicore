import os
import requests

MAILGUN_DOMAIN = os.getenv("MAILGUN_DOMAIN", "hb-advisory.com.br")
MAILGUN_API_KEY = os.getenv("MAILGUN_API_KEY")
MAILGUN_SENDER = os.getenv("MAILGUN_SENDER", "no-reply@hb-advisory.com.br")
MAILGUN_BASE_URL = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net/v3")


def _ensure_mailgun_config() -> None:
    if not MAILGUN_DOMAIN or not MAILGUN_API_KEY:
        raise RuntimeError("Missing Mailgun configuration: set MAILGUN_DOMAIN and MAILGUN_API_KEY.")


def send_email(to: str, subject: str, text: str = "", html: str | None = None):
    _ensure_mailgun_config()
    url = f"{MAILGUN_BASE_URL}/{MAILGUN_DOMAIN}/messages"
    data = {
        "from": MAILGUN_SENDER,
        "to": [to],
        "subject": subject,
        "text": text or " ",
    }
    if html:
        data["html"] = html
    resp = requests.post(url, auth=("api", MAILGUN_API_KEY), data=data, timeout=15)
    resp.raise_for_status()
    return resp.json()
