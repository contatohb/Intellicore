# Intellicore (Hybrid Base)
Plataforma web para aprendizagem contínua e automação com IA.
Stack: Python (agentes/coleta) + TypeScript (edge functions/dashboard).
Módulos: RegIntel 2.0 (coleta) e 2.1 (boletins).

## Deploy (Render)
1. Garanta que a Render CLI esteja instalada e autenticada (`render login`).
2. Execute o blueprint diretamente:
   ```bash
   ./scripts/deploy_render.sh
   ```
   - Opcional: informe outro arquivo `render.yaml` ou flags extras (`./scripts/deploy_render.sh render.yaml --dry-run`).
3. A CLI valida o blueprint e publica no serviço `intellicore` no plano Starter.
