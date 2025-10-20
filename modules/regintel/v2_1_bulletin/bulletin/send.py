from backend.db import get_supabase
from backend.logger import send_email as send_mailgun_email
from logger import log_event

def get_latest_items(limit=5):
    client = get_supabase()
    res = client.table("registry_item").select("*").order("published_at", desc=True).limit(limit).execute()
    return res.data

def send_email(to_email: str, subject: str, html: str):
    send_mailgun_email(to_email, subject, html=html)
    return True

def run_bulletin(to_email="huddsong@gmail.com"):
    items = get_latest_items()
    html = "<h3>Boletim RegIntel</h3><ul>" + "".join(
        [f"<li><a href='{i['url']}'>{i['title']}</a></li>" for i in items]
    ) + "</ul>"
    send_email(to_email, "Boletim RegIntel", html)
    log_event("system", "send_bulletin", "email", {"to": to_email, "count": len(items)})
    return {"sent": len(items), "to": to_email}
