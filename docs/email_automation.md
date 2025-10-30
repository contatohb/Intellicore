# Envio Automatizado de Documentação

Sistema para enviar documentação técnica por email usando Mailgun.

## Arquivos

- **scripts/send_docs_email.py** - Script principal que envia os emails
- **scripts/send_docs_with_mailgun.py** - Wrapper que valida env vars
- **scripts/send_docs_from_render.sh** - Helper para uso local (busca credenciais do Render)
- **.github/workflows/send-docs-email.yml** - Workflow automatizado (toda segunda-feira 10h BRT)

## Uso

### Opção 1: GitHub Actions (Recomendado)

O workflow roda automaticamente toda segunda-feira às 10h BRT, logo após a rotação de secrets.

Para enviar manualmente:
1. Acesse: https://github.com/contatohb/Intellicore/actions/workflows/send-docs-email.yml
2. Clique em "Run workflow" → "Run workflow"
3. Aguarde conclusão (~30 segundos)

### Opção 2: Local com Render API

```bash
# Requer: 1Password CLI configurado + jq instalado
./scripts/send_docs_from_render.sh
```

O script:
1. Busca Render API key do 1Password
2. Faz GET /v1/services/srv-d3r71h56ubrc738fn58g/env-vars
3. Extrai MAILGUN_* values
4. Exporta para env
5. Executa send_docs_with_mailgun.py

### Opção 3: Local com export manual

```bash
# Se Render API não funcionar, exporte manualmente:
export MAILGUN_API_KEY="your_key_from_render_dashboard"
export MAILGUN_DOMAIN="hb-advisory.com.br"
export MAILGUN_SENDER="no-reply@hb-advisory.com.br"
export MAILGUN_BASE_URL="https://api.mailgun.net/v3"

python3 scripts/send_docs_with_mailgun.py
```

## Destinatários

Email é sempre enviado para:
- huddsong@gmail.com
- hudsonborges@hb-advisory.com.br

## Conteúdo

Concatena todos os documentos de `docs/hb_agro_intel/`:
- dds.md (Design Document)
- srs.md (Software Requirements)
- roadmap.md (Product Roadmap)
- project_status.md (Current Status)
- user_stories.md (User Stories)

Total: ~1.735 linhas de documentação técnica.

## GitHub Secrets

O workflow usa estes secrets (rotacionados semanalmente):
- `MAILGUN_API_KEY` - API key do Mailgun
- `MAILGUN_DOMAIN` - hb-advisory.com.br
- `MAILGUN_SENDER` - no-reply@hb-advisory.com.br
- `MAILGUN_BASE_URL` - https://api.mailgun.net/v3

Rotação automática: toda segunda-feira 00:00 UTC via `.github/workflows/weekly-secrets-rotation.yml`

## Troubleshooting

### "Missing required environment variables"

Verifique se todas as 4 env vars estão configuradas:
```bash
echo $MAILGUN_API_KEY
echo $MAILGUN_DOMAIN
echo $MAILGUN_SENDER
echo $MAILGUN_BASE_URL
```

### "Could not fetch Render API key from 1Password"

1. Verifique 1Password CLI: `op whoami`
2. Se não autenticado: `eval $(op signin)`
3. Teste acesso: `op read "op://Personal/RENDER - RENDER_INTELLICORE_API_KEY/password"`

### Workflow falha no GitHub Actions

1. Verifique secrets: https://github.com/contatohb/Intellicore/settings/secrets/actions
2. Confirme que `MAILGUN_API_KEY` está presente e válido
3. Teste rotação manual: https://github.com/contatohb/Intellicore/actions/workflows/weekly-secrets-rotation.yml

### Email não chega

1. Verifique logs Mailgun: https://app.mailgun.com/app/logs
2. Confirme domínio verificado: https://app.mailgun.com/app/sending/domains/hb-advisory.com.br
3. Verifique spam nos emails destino

## Segurança

**NUNCA** hardcode o `MAILGUN_API_KEY` em código. Sempre use:
- GitHub Secrets (no CI/CD)
- Environment variables (local)
- 1Password/Render API (para buscar dinamicamente)

O GitHub tem Push Protection ativo e vai rejeitar commits com secrets expostos.
