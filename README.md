# Intellicore (Hybrid Base)
Plataforma web para aprendizagem contínua e automação com IA.
Stack: Python (agentes/coleta) + TypeScript (edge functions/dashboard).
Módulos: RegIntel 2.0 (coleta) e 2.1 (boletins).

## Deploy (Render)
1. Garanta que a Render CLI esteja instalada e autenticada (`render login`).
2. Sincronize comandos e variáveis via API:
   ```bash
   export RENDER_API_KEY=...           # chave gerada no painel da Render
   python -m pip install pyyaml        # uma vez
   python scripts/apply_render_config.py --service Intellicore --env-file .env
   ```
   - Ajuste `--env-file` se guardar credenciais noutro caminho; valores ausentes são ignorados.
   - Use `--dry-run` para apenas exibir o payload.
3. Opcional: se preferir a CLI, mantenha `render workspace set ...` e outros comandos para consultar serviços (`render services list -o json`).

## CI/CD
O workflow `.github/workflows/render-sync.yml` roda em pushes para `main` (ou manualmente via **Run workflow**). Ele:

1. Lê `render.yaml` e o script `scripts/apply_render_config.py` para sincronizar comandos/variáveis no serviço `intellicore`.
2. Dispara um deploy via API (`POST /services/<id>/deploys`).

### Secrets necessários
Configure em *Settings → Secrets and variables → Actions* os seguintes valores:

| Secret | Observação |
| ------ | ---------- |
| `RENDER_API_KEY` | Token com acesso à API (equivale ao utilizado localmente). |
| `SUPABASE_URL` | URL do projeto Supabase. |
| `SUPABASE_ANON_KEY` | Chave pública (anon). |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role. |
| `FROM_EMAIL` | Remetente padrão dos envios. |
| `MAILGUN_DOMAIN` | Domínio configurado no Mailgun. |
| `MAILGUN_API_KEY` | API key ativa (full access). |
| `MAILGUN_SENDER` | Endereço remetente, ex.: `no-reply@hb-advisory.com.br`. |
| `MAILGUN_BASE_URL` | Geralmente `https://api.mailgun.net/v3`. |

Após definir os secrets, qualquer `git push origin main` disparará o pipeline; o deploy só depende dos secrets estarem válidos.
