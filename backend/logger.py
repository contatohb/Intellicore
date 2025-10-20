import os
import requests

MAILGUN_DOMAIN = os.getenv("hb-advisory.com.br")
MAILGUN_API_KEY = os.getenv("5e1ffd43-1ff22346")
MAILGUN_SENDER = os.getenv("MAILGUN_SENDER", f"no-reply@hb-advisory.com.br")
MAILGUN_BASE_URL = os.getenv("MAILGUN_BASE_URL", "https://api.mailgun.net/v3")

def send_email(to: str, subject: str, text: str = "", html: str = None):
    assert MAILGUN_DOMAIN and MAILGUN_API_KEY, "MAILGUN_* env vars missing"
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
