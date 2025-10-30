# Runbook: Rotação Automática de Secrets

## Objetivo
Automatizar completamente a rotação e sincronização de secrets entre 1Password e GitHub Secrets, eliminando exposição manual e reduzindo trabalho operacional.

## Arquitetura de Segurança

### Fluxo de Dados
```
1Password Vault (source of truth)
    ↓ (1Password Connect ou op CLI)
GitHub Secrets (consumo por Actions/Render)
    ↓ (deploy automático)
Aplicação (usa secrets via env vars)
```

### Princípios
- **Single Source of Truth**: 1Password vault "Intellicore Ops"
- **Nunca expor secrets**: Validação e publicação sem print/log de valores
- **Idempotência**: Scripts podem ser re-executados sem side effects
- **Auditabilidade**: Logs estruturados com timestamps

## Pré-requisitos

### Ferramentas
- GitHub CLI (`gh`): https://cli.github.com/
- 1Password CLI (`op`): https://developer.1password.com/docs/cli/
- `jq`, `curl` (geralmente já instalados no macOS/Linux)

### Autenticação
```bash
# GitHub CLI
gh auth login

# 1Password CLI (escolha uma opção)
op signin  # Interativo
# OU
export OP_SERVICE_ACCOUNT_TOKEN="..."  # Service account (CI/CD)
```

### 1Password Connect (Recomendado para CI/CD)
- Servidor Connect criado no painel 1Password
- Secrets no GitHub:
  - `OP_CONNECT_HOST`: https://hbadvisory.1password.eu
  - `OP_CONNECT_TOKEN`: <token JWT do Connect>
  - `OP_ITEM_ID`: ID do item específico (opcional)

## Scripts Principais

### `scripts/sync_1password_item_to_github.sh`
Sincroniza um secret do 1Password para GitHub Secrets.

**Uso**:
```bash
./scripts/sync_1password_item_to_github.sh \
  --item-id "Automated secrets Render API" \
  --field notesPlain \
  --secret-name RENDER_API_KEY \
  --repo contatohb/Intellicore \
  --validate-url https://api.render.com/v1/services
```

**Parâmetros**:
- `--item-id`: Título ou ID do item no 1Password
- `--field`: Campo a extrair (password, notesPlain, api_key, etc.)
- `--secret-name`: Nome do secret no GitHub
- `--repo`: Repositório (owner/repo)
- `--validate-url`: (Opcional) Endpoint para validar a chave

**Exemplo prático**:
```bash
# Sync Render API key
./scripts/sync_1password_item_to_github.sh \
  --item-id "fl2a7mjlcxt5wzovpycog7dvyq" \
  --field notesPlain \
  --secret-name RENDER_API_KEY \
  --repo contatohb/Intellicore \
  --validate-url https://api.render.com/v1/services
```

### Scripts de Suporte
- `scripts/check_render_api.sh`: Valida chave Render
- `scripts/store_in_1password.sh`: Cria/atualiza item no 1Password
- `scripts/update_github_secret.sh`: Publica secret no GitHub

## Workflow Automático Semanal

### `.github/workflows/weekly-secrets-rotation.yml`
- **Schedule**: Toda segunda-feira às 8h UTC (5h BRT)
- **Manual**: Trigger via `workflow_dispatch`
- **Funcionalidade**: Sincroniza secrets críticos automaticamente

**Executar manualmente**:
```bash
gh workflow run weekly-secrets-rotation.yml
# OU via interface Actions → Weekly Secrets Rotation → Run workflow
```

**Configurar secrets adicionais**:
1. Adicionar item no 1Password vault "Intellicore Ops"
2. Editar workflow e descomentar step correspondente
3. Commit e push

## Fluxo Recomendado (Rotação Completa)

### 1. Criar Nova Chave no Provedor
**Render**:
1. Acessar https://dashboard.render.com → Account Settings → API Keys
2. Clicar "Create API Key"
3. Copiar chave gerada (começa com `rnd_`)

**Supabase**:
1. Acessar projeto → Settings → API
2. Copiar "service_role" key (ou gerar nova se necessário)

**Mailgun**:
1. Acessar https://app.mailgun.com/settings/api_security
2. Criar nova Private API key

### 2. Armazenar no 1Password
```bash
# Opção A: Via script
./scripts/store_in_1password.sh \
  "Automated secrets Render API" \
  "notesPlain" \
  "rnd_NEW_KEY_HERE" \
  "Intellicore Ops"

# Opção B: Manual via 1Password app (recomendado)
# - Abrir 1Password → Vault "Intellicore Ops"
# - Criar/editar item "Automated secrets <Provider>"
# - Adicionar chave no campo "notes" ou criar campo custom
```

### 3. Sincronizar para GitHub Secrets
```bash
# Executar sync local
./scripts/sync_1password_item_to_github.sh \
  --item-id "Automated secrets Render API" \
  --field notesPlain \
  --secret-name RENDER_API_KEY \
  --repo contatohb/Intellicore \
  --validate-url https://api.render.com/v1/services
```

### 4. Validar Deploy
```bash
# Trigger workflow Render sync
gh workflow run render-sync.yml

# Aguardar deploy e testar endpoints
curl -f https://seu-app.onrender.com/health
curl -f https://seu-app.onrender.com/test-db
```

### 5. Revogar Chave Antiga (Após Validação)
⚠️ **Importante**: Só revogue após validar que a nova chave funciona em produção!

- Render: Dashboard → API Keys → Revoke antiga
- Supabase: Gerar nova invalida a anterior automaticamente
- Mailgun: Dashboard → Revoke antiga

## Secrets Críticos a Rotacionar

| Secret | 1Password Item | Campo | Validação | Status |
|--------|---------------|-------|-----------|--------|
| `RENDER_API_KEY` | Automated secrets Render API | notesPlain | https://api.render.com/v1/services | ✅ Configurado |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role | password | Supabase API | ⚠️ Pendente |
| `MAILGUN_API_KEY` | Mailgun API | password | Mailgun API | ⚠️ Pendente |
| `MAILGUN_DOMAIN` | Mailgun API | domain | - | ⚠️ Pendente |

## Troubleshooting

### "Permission denied" ao executar scripts
```bash
chmod +x scripts/*.sh
```

### "gh: command not found"
```bash
brew install gh  # macOS
# OU ver https://github.com/cli/cli#installation
```

### "op: not authenticated"
```bash
op signin
# OU configure OP_SERVICE_ACCOUNT_TOKEN para CI/CD
```

### Secret não atualiza no GitHub
```bash
# Verificar autenticação gh
gh auth status

# Re-login se necessário
gh auth login

# Verificar permissões do token (precisa scope 'repo')
gh auth status --show-token
```

### Chave falha na validação (HTTP 401)
- Verificar se copiou a chave completa (sem espaços/quebras de linha)
- Confirmar que a chave não foi revogada no provedor
- Gerar nova chave e repetir o processo

## Segurança & Auditoria

### Logs
- Workflow executions: GitHub Actions → Weekly Secrets Rotation
- 1Password audit log: Vault → Activity

### Rollback
Se algo der errado:
```bash
# 1. Restaurar secret anterior no GitHub
echo "OLD_KEY" | gh secret set RENDER_API_KEY --repo contatohb/Intellicore

# 2. Trigger redeploy
gh workflow run render-sync.yml

# 3. Verificar health
curl https://seu-app.onrender.com/health
```

### Rotação de Emergência
Se uma chave foi comprometida:
```bash
# 1. Revogar IMEDIATAMENTE no provedor
# 2. Gerar nova chave
# 3. Executar sync rápido
./scripts/sync_1password_item_to_github.sh ... && gh workflow run render-sync.yml
```

## Próximos Passos

1. ✅ Render API key configurada e workflow semanal ativo
2. ⏳ Adicionar Supabase, Mailgun, Google Workspace ao 1Password
3. ⏳ Implementar rotação automática via APIs dos provedores (quando disponível)
4. ⏳ Configurar alertas para falhas no workflow semanal
5. ⏳ Limpeza de histórico Git (BFG) para chaves expostas
   - Vá em Actions → Sync Render Service → Run workflow (manual) e rode.

Automação avançada (opcional)
----------------------------
- Você pode criar um GitHub Action `workflow_dispatch` que fetches secrets from 1Password Connect and updates repository secrets programmatically.
- Requisitos: 1Password Connect server or Action, e um token com permissão para atualizar secrets (GITHUB_TOKEN ou PAT com `repo` scope). Teste em repositório de staging primeiro.

Segurança e boas práticas
------------------------
- Nunca exponha a chave em chats ou logs públicos.
- Prefira usar `op` para armazenar o segredo e o `gh` para enviar ao GitHub — dessa forma o valor tem trânsito mínimo no host.
- Documente a rotação no changelog/1Password item (quem rotacionou, motivo, timestamp).

Próximo passo sugerido
----------------------
Se quer, eu crio um workflow `rotate-secrets.yml` que, quando disparado manualmente, puxa valores do 1Password Connect e atualiza os secrets do repositório. Preciso que você confirme se tem/quer configurar 1Password Connect ou prefere usar o flow local CLI (mais simples).
