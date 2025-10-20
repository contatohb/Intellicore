import datetime
import html
import requests
from bs4 import BeautifulSoup
import smtplib
from email.mime.text import MIMEText

# termos de busca
TERMS = ['"Hudson Viana Borges"','"32.309.482/0001-52"', '"32309482000152"', '"828.258.071-68"', '"82825807168"', '"HB Advisory"' ]

# credenciais de e-mail (mantidas)
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'huddsong@gmail.com'
SENDER_PASSWORD = 'yhel trhb ritn blwl'
RECIPIENT_EMAIL = 'huddsong@gmail.com'

def _wrap_exact(term: str) -> str:
    # força frase exata quando há espaço ou pontuação; CPF sem formatação também é buscado
    needs_quotes = any(c in term for c in ' -_/.,')
    return f'"{term}"' if needs_quotes else term

def buscar_dou(date_iso):
    """Busca termos no DOU apenas na data indicada."""
    url = f'https://www.in.gov.br/leiturajornal?data={date_iso}&secao=do1'
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        return [f'Erro ao acessar DOU {date_iso}: {exc}']
    soup = BeautifulSoup(resp.content, 'html.parser')
    texto = soup.get_text(separator='\n').lower()
    achados = []
    for termo in TERMS:
        if termo.lower() in texto:
            achados.append(f'Termo "{termo}" encontrado no DOU {date_iso} – {url}')
    return achados

def buscar_querido_diario_hoje(termo, size=50):
    """
    Busca termo (frase exata quando aplicável) no Querido Diário.
    Retorna só publicações com data >= hoje e inclui link do PDF.
    """
    api_url = 'https://api.queridodiario.ok.org.br/api/gazettes'
    hoje = datetime.date.today()
    params = {
        'querystring': _wrap_exact(termo),
        'size': size,
        'pre_tags': '<b>',
        'post_tags': '</b>'
    }
    try:
        resp = requests.get(api_url, params=params, timeout=30)
        resp.raise_for_status()
    except Exception as exc:
        return [f'Erro ao buscar "{termo}" no Querido Diário: {exc}']
    data = resp.json()
    msgs = []
    for g in data.get('gazettes', []):
        data_ed = g.get('date') or ''
        try:
            d = datetime.date.fromisoformat(data_ed)
        except Exception:
            continue
        if d < hoje:
            continue  # ignora antigas

        cidade = g.get('territory_name', '?')
        edicao = g.get('edition', '?')
        extra = 'extra' if g.get('is_extra_edition') else 'ordinária'
        link_pdf = g.get('url', '') or ''
        excerto = ''
        if g.get('excerpts'):
            excerto = html.unescape(g['excerpts'][0]).strip().replace('\n', ' ')[:200]
        msgs.append(
            f'Termo "{termo}" encontrado em {cidade} ({data_ed}, edição {edicao}, {extra}): '
            f'{excerto}... | PDF: {link_pdf}'
        )
    return msgs

def enviar_email(relatorio):
    """Envia relatório por e-mail se houver conteúdo (SMTP igual ao seu)."""
    if not relatorio:
        return
    msg = MIMEText('\n'.join(relatorio), _charset='utf-8')
    msg['Subject'] = 'Relatório de ocorrências nos diários oficiais'
    msg['From'] = 'huddsong@gmail.com'
    msg['To'] = 'huddsong@gmail.com'
    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login('huddsong@gmail.com', 'yhel trhb ritn blwl')
        server.send_message(msg)

if __name__ == '__main__':
    hoje = datetime.date.today().isoformat()

    resultados = []
    # DOU: só hoje
    resultados.extend(buscar_dou(hoje))
    # QD: só hoje
    for termo in TERMS:
        resultados.extend(buscar_querido_diario_hoje(termo))

    if resultados:
        enviar_email(resultados)
        print('Relatório enviado')
    else:
        print('Nenhuma ocorrência encontrada')
