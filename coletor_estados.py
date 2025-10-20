import os, time, json, html, smtplib, datetime, sys
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
from email.mime.text import MIMEText

TERMS = ['"Hudson Viana Borges"', '"828.258.071-68"', '"82825807168"', '"HB Advisory"']
USER_AGENT = "Mozilla/5.0 (coletor-estaduais)"
TIMEOUT = 30
MAX_LINKS_FIRST = 60
MAX_LINKS_SUBSEQUENT = 30

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'huddsong@gmail.com'
SENDER_PASSWORD = 'yhel trhb ritn blwl'
RECIPIENT_EMAIL = 'huddsong@gmail.com'

STATE_FILE = os.path.expanduser('~/.coletor_estados_state.json')
RUN_LOG = os.path.expanduser('~/estados_run.log')

STATE_SOURCES = [
    ("DF", "https://dodf.df.gov.br/"),
    ("GO", "https://diariooficial.abc.go.gov.br/"),
    ("SP", "https://doe.sp.gov.br/"),
    ("RJ", "https://www.rj.gov.br/servico/acessar-o-diario-oficial-do-digital-da-ioerj78"),
    ("RS", "https://www.diariooficial.rs.gov.br/"),
    ("TO", "https://diariooficial.to.gov.br/"),
    ("AC", "https://diario.ac.gov.br/"),
    ("RN", "https://www.diariooficial.rn.gov.br/dei/dorn3/"),
    ("BA", "https://www.ba.gov.br/egba/"),
]

def log_line(msg: str):
    ts = datetime.datetime.now().isoformat(timespec='seconds')
    line = f"[{ts}] {msg}\n"
    sys.stdout.write(line)
    try:
        with open(RUN_LOG, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception:
        pass

def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r', encoding='utf-8') as f:
                d = json.load(f)
                d.setdefault('reported_urls', [])
                d.setdefault('first_run_done', False)
                return d
        except Exception:
            pass
    return {'reported_urls': [], 'first_run_done': False}

def save_state(st):
    tmp = STATE_FILE + ".tmp"
    with open(tmp, 'w', encoding='utf-8') as f:
        json.dump(st, f, ensure_ascii=False, indent=2)
    os.replace(tmp, STATE_FILE)

def http_get(u):
    return requests.get(u, headers={'User-Agent': USER_AGENT}, timeout=TIMEOUT)

def extract_links(base, html_text):
    soup = BeautifulSoup(html_text, 'html.parser')
    links, seen = [], set()
    for a in soup.find_all('a', href=True):
        href = a['href'].strip()
        if href.startswith('#') or href.lower().startswith('javascript'):
            continue
        full = urljoin(base, href)
        if full not in seen:
            seen.add(full); links.append(full)
    return links

def page_contains(text, terms):
    tl = text.lower()
    for t in terms:
        plain = t.strip('"').lower()
        if plain in tl:
            return True
    return False

def scan_source(sigla, src_url, limit):
    stats = {"sigla": sigla, "source": src_url, "links": 0, "ok": 0, "errors": 0, "matches": 0}
    hits = []
    try:
        r = http_get(src_url); r.raise_for_status()
    except Exception as e:
        stats["errors"] += 1
        return hits, stats, [(src_url, f"ERR_LISTA: {e}")]
    links = extract_links(src_url, r.text)[:limit]
    stats["links"] = len(links)
    tmp_msgs = []
    for link in links:
        try:
            rr = http_get(link); rr.raise_for_status()
            text = BeautifulSoup(rr.text, 'html.parser').get_text(separator='\n')
            stats["ok"] += 1
        except Exception:
            stats["errors"] += 1
            continue
        if page_contains(text, TERMS):
            stats["matches"] += 1
            tl = text.lower()
            snippet = ""
            for t in TERMS:
                plain = t.strip('"').lower()
                idx = tl.find(plain)
                if idx >= 0:
                    a = max(0, idx-120); b = min(len(text), idx+200)
                    snippet = text[a:b].replace('\n',' ')
                    break
            tmp_msgs.append((link, snippet))
        time.sleep(0.25)
    return tmp_msgs, stats, []

def enviar_email(relatorio):
    if not relatorio: return
    msg = MIMEText('\n'.join(relatorio), _charset='utf-8')
    msg['Subject'] = 'Relatório – Diários Oficiais Estaduais'
    msg['From'] = SENDER_EMAIL
    msg['To'] = RECIPIENT_EMAIL
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=30) as s:
        s.ehlo(); s.starttls(); s.ehlo()
        s.login(SENDER_EMAIL, SENDER_PASSWORD)
        s.sendmail(SENDER_EMAIL, [RECIPIENT_EMAIL], msg.as_string())

if __name__ == '__main__':
    state = load_state()
    reported = set(state['reported_urls'])
    first = not state['first_run_done']
    limit = MAX_LINKS_FIRST if first else MAX_LINKS_SUBSEQUENT

    log_line(f"INÍCIO | primeira_execucao={first} | limit={limit}")

    acumulado_email = []
    novas_urls = []
    resumo_stats = []

    for sigla, src in STATE_SOURCES:
        log_line(f"[{sigla}] fonte: {src}")
        hits, stats, fonte_errs = scan_source(sigla, src, limit)
        resumo_stats.append(stats)
        for url, snippet in hits:
            if url in reported: continue
            acumulado_email.append(f"[{sigla}] ENCONTRADO: {url} | {snippet}")
            novas_urls.append(url)
        for url, err in fonte_errs:
            if url in reported: continue
            acumulado_email.append(f"[{sigla}] {url} | {err}")
            novas_urls.append(url)
        log_line(f"[{sigla}] links={stats['links']} ok={stats['ok']} erros={stats['errors']} matches={stats['matches']}")

    # Sumário no log
    total_links = sum(s["links"] for s in resumo_stats)
    total_ok = sum(s["ok"] for s in resumo_stats)
    total_err = sum(s["errors"] for s in resumo_stats)
    total_matches = sum(s["matches"] for s in resumo_stats)
    log_line(f"SUMÁRIO | links={total_links} ok={total_ok} erros={total_err} matches={total_matches}")

    if acumulado_email:
        enviar_email(acumulado_email)
        log_line("EMAIL: enviado")
    else:
        log_line("EMAIL: não enviado (sem novidades)")

    if novas_urls:
        state['reported_urls'].extend(novas_urls)
        state['reported_urls'] = list(dict.fromkeys(state['reported_urls']))
    state['first_run_done'] = True
    save_state(state)
    log_line("FIM")
