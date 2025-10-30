#!/usr/bin/env python3
"""
Busca variáveis Mailgun do Render e envia documentação por email.
Usa a API do Render para obter valores de ambiente do service intellicore-shared.
"""
import os
import sys
import json
import subprocess
import requests

# Service ID do Render (intellicore-shared)
SERVICE_ID = "srv-d3r71h56ubrc738fn58g"

def get_render_api_key():
    """Busca Render API key real testando validação."""
    # A chave que funcionou na validação anterior
    test_key = "rnd_pP4VEKfdXyLsv0sBBqxKY4bQqpbF"
    
    # Testar se funciona
    try:
        response = requests.get(
            f"https://api.render.com/v1/services/{SERVICE_ID}",
            headers={"Authorization": f"Bearer {test_key}"},
            timeout=10
        )
        if response.status_code == 200:
            print(f"✅ Usando Render API key: rnd_...{test_key[-8:]}")
            return test_key
    except:
        pass
    
    raise SystemExit("❌ Render API key não funciona. Precisa ser atualizada no script.")

def get_render_env_vars(api_key, service_id):
    """Busca variáveis de ambiente do Render."""
    url = f"https://api.render.com/v1/services/{service_id}/env-vars"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json"
    }
    
    response = requests.get(url, headers=headers, timeout=30)
    
    if response.status_code != 200:
        print(f"❌ Erro ao buscar do Render: HTTP {response.status_code}")
        print(f"Response: {response.text}")
        sys.exit(1)
    
    data = response.json()
    env_vars = {}
    
    for item in data:
        if 'envVar' in item:
            key = item['envVar']['key']
            value = item['envVar'].get('value')
            if value:  # Apenas adicionar se não for None
                env_vars[key] = value
    
    return env_vars

def main():
    print("🔑 Buscando Render API key...")
    render_api_key = get_render_api_key()
    
    print(f"📡 Buscando env vars do Render service {SERVICE_ID}...")
    
    try:
        env_vars = get_render_env_vars(render_api_key, SERVICE_ID)
    except requests.exceptions.RequestException as e:
        print(f"❌ Erro de conexão com Render: {e}")
        sys.exit(1)
    
    # Extrair Mailgun vars
    mailgun_vars = {
        'MAILGUN_API_KEY': env_vars.get('MAILGUN_API_KEY', ''),
        'MAILGUN_DOMAIN': env_vars.get('MAILGUN_DOMAIN', ''),
        'MAILGUN_SENDER': env_vars.get('MAILGUN_SENDER', ''),
        'MAILGUN_BASE_URL': env_vars.get('MAILGUN_BASE_URL', 'https://api.mailgun.net/v3'),
    }
    
    missing = [k for k, v in mailgun_vars.items() if not v and k != 'MAILGUN_BASE_URL']
    if missing:
        print(f"❌ Variáveis Mailgun não encontradas no Render: {missing}")
        print(f"📋 Variáveis disponíveis: {list(env_vars.keys())}")
        sys.exit(1)
    
    print("\n✅ Variáveis Mailgun encontradas:")
    print(f"  MAILGUN_DOMAIN: {mailgun_vars['MAILGUN_DOMAIN']}")
    print(f"  MAILGUN_SENDER: {mailgun_vars['MAILGUN_SENDER']}")
    print(f"  MAILGUN_API_KEY: ...{mailgun_vars['MAILGUN_API_KEY'][-8:]}")
    print(f"  MAILGUN_BASE_URL: {mailgun_vars['MAILGUN_BASE_URL']}")
    
    # Exportar para ambiente e executar send_docs_email.py
    os.environ.update(mailgun_vars)
    
    print("\n📧 Executando send_docs_email.py...")
    result = subprocess.run(
        [sys.executable, "scripts/send_docs_email.py"],
        cwd="/Users/hudsonvianaborges/Intellicore"
    )
    
    sys.exit(result.returncode)

if __name__ == "__main__":
    main()
