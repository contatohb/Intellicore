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
