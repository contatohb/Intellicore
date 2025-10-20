# DOU fetcher (stub). Substituir por parser real depois.
from datetime import datetime

def fetch_dou_items(since: datetime):
    # Exemplo mínimo para validar pipeline
    return [{
        "source": "DOU",
        "url": "https://www.in.gov.br/en/web/dou",
        "title": "Ato normativo — exemplo",
        "summary": "Resumo automático (stub)",
        "published_at": datetime.utcnow().isoformat() + "Z",
        "raw": {"example": True},
    }]
