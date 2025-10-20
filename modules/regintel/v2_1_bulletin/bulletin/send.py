import os
from db import supabase
from logger import log_event
import requests

SENDGRID_API_KEY = os.getenv("SENDGRID_API_KEY")
FROM_EMAIL = os.getenv("FROM_EMAIL", "no-reply@hb-advisory.com.br")

def get_latest_items(limit=5):
    res = supabase.table("registry_item").select("*").order("published_at", desc=True).limit(limit).execute()
    return res.data

def send_email(to_email: str, subject: str, html: str):
    if not SENDGRID_API_KEY:
        raise RuntimeError("SENDGRID_API_KEY não configurada.")
    r = requests.post(
        "https://api.sendgrid.com/v3/mail/send",
        headers={
            "Authorization": f"Bearer {SENDGRID_API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": FROM_EMAIL},
            "subject": subject,
            "content": [{"type": "text/html", "value": html}],
        },
    )
    r.raise_for_status()
    return True

def run_bulletin(to_email="huddsong@gmail.com"):
    items = get_latest_items()
    html = "<h3>Boletim RegIntel</h3><ul>" + "".join(
        [f"<li><a href='{i['url']}'>{i['title']}</a></li>" for i in items]
    ) + "</ul>"
    send_email(to_email, "Boletim RegIntel", html)
    log_event("system", "send_bulletin", "email", {"to": to_email, "count": len(items)})
    return {"sent": len(items), "to": to_email}
