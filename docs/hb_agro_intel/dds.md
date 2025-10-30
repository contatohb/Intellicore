# DDS - Documento de Design do Sistema# HB Agro Intel – Documento de Design de Sistema (DDS)

**HB Agro Intel / Intellicore**  

**Última atualização:** 30/10/2025_Revisado em 28/10/2025._



---## 1. Arquitetura de Alto Nível

```

## 1. Visão Geral do SistemaCron (macOS / Render)

    ├── scripts/run_backfill_until_caught_up.py -> módulos/regintel/v2_0_collector (Supabase)

### 1.1 Propósito    ├── scripts/run_due_ingestions.py           -> módulos/regintel/v2_0_collector (Supabase)

Sistema automatizado de coleta, processamento e disseminação de informações regulatórias para o setor agroindustrial brasileiro, com foco em publicações do Diário Oficial da União (DOU) e outros órgãos reguladores.    ├── scripts/manual_collector.py             -> data/manuals, logs/manuals

    ├── scripts/monitor_targets.py              -> logs/monitoring snapshots

### 1.2 Escopo    ├── scripts/send_backfill_snapshot.sh       -> Mailgun

- Coleta automatizada de publicações oficiais (DOU, MAPA, ANVISA, IBAMA)    └── scripts/send_weekly_status.py           -> Mailgun + reports/weekly

- Processamento e análise via LLM (Claude/OpenAI)```

- Geração de boletins diários em formato newsletter

- Distribuição via email e potencial integração com redes sociais## 2. Componentes Principais

- Gerenciamento automatizado de secrets e configurações| Componente | Responsabilidade | Dependências |

| ---------- | ---------------- | ------------ |

---| `modules/regintel/v2_0_collector` | Ingestão de DOU, QD, Agrofit, Bioinsumos, INLABS | Supabase, Config YAML |

| `scripts/run_backfill_until_caught_up.py` | Orquestra ciclos sequenciais até zerar pendências do `ingestion_cursor` | Supabase, `.env`, `run_due_ingestions` |

## 2. Arquitetura do Sistema| `scripts/run_due_ingestions.py` | Scheduler incremental (cron) que dispara novas execuções | Supabase (`ingestion_cursor`), `.env` |

| `scripts/manual_collector.py` | Baixa manuais/guias, usa `cookie_file`/`headers_file` e versiona arquivos | `config/manual_sources.yaml`, `config/credentials/`, `data/manuals/` |

### 2.1 Componentes Principais| `scripts/monitor_targets.py` | Monitora fontes/concorrentes com snapshots e suporte a autenticação | `config/monitor_targets.yaml`, `config/credentials/`, `logs/monitoring/` |

| `scripts/send_weekly_status.py` | Compila status + roadmap, gera Markdown opcional e envia via Mailgun | Mailgun, docs Markdown, `reports/weekly/` |

#### 2.1.1 Backend (Flask API)| `docs/*` | Documentação viva (SRS, DDS, Roadmap, User Stories, Project Status) | Git |

- **Linguagem:** Python 3.11

- **Framework:** Flask## 3. Fluxos

- **Deploy:** Render.com### 3.1 Backfill / Ingestão Contínua

- **Endpoints:**1. Operador (ou cron dedicado) aciona `scripts/run_backfill_until_caught_up.py`, que roda ciclos até `ingestion_cursor` ficar sem pendências.

  - `/health` - Health check2. A cada iteração o script identifica fontes devidas, marca `status=running` e executa `python -m modules.regintel.v2_0_collector.collector.ingest`.

  - `/test-db` - Validação de conexão Supabase3. Após o catch-up, o cron regular (`scripts/run_due_ingestions.py`) mantém ingestões incrementais.

  - `/ingest` - Ingestão de itens de registro4. Logs ficam em `logs/ingestion/`; snapshots opcionais são registrados via `reports/weekly/` e e-mails Mailgun.

  - `/bulletin` - Geração de boletins

  - `/log-event` - Logging estruturado### 3.2 Coleta de Manuais

1. `config/manual_sources.yaml` lista URLs (com flags `auth_required`).

#### 2.1.2 Banco de Dados (Supabase/PostgreSQL)2. Cron diário (`0 3 * * *`) chama `manual_collector.py` (carrega cookies do diretório `config/credentials/`).

- **Tabelas principais:**3. Script baixa arquivo (ou registra pendência quando `auth_required` sem cookie válido).

  - `registry_item` - Items coletados (DOU, MAPA, etc.)4. Novas versões gravadas em `data/manuals/<fonte>/timestamp-nome.ext`.

  - `bulletin` - Boletins gerados5. Estado persistido em `logs/manuals/state.json`.

  - `log_event` - Eventos do sistema

### 3.3 Monitoramento de Concorrentes/Portais

#### 2.1.3 Serviços Externos1. `config/monitor_targets.yaml` define targets.

- **1Password:** Gerenciamento de secrets (vault "Intellicore Ops")2. Cron a cada 30 min executa `monitor_targets.py`.

- **Render:** Hosting da API Flask3. Conteúdo é baixado com cabeçalhos/cookies configurados, hash comparado e snapshot salvo.

- **Mailgun:** Envio de emails/newsletters4. `logs/monitoring/activity.log` registra eventos/erros (403, SSL etc.).

- **Mercado Pago:** Processamento de pagamentos (futuro)

- **Google Workspace:** Autenticação OAuth para Gmail### 3.4 Relatórios Semanais

1. `send_weekly_status.py` lê `docs/project_status.md`, `docs/hb_agro_intel/*.md`, relatório semanal atual e, opcionalmente, salva novo Markdown em `reports/weekly/`.

### 2.2 Fluxo de Dados2. Envia e-mail via Mailgun toda segunda, 08h (cron) e registra evento em `logs/communications/weekly_status.log`.



```## 4. Persistência

Fontes Oficiais (DOU, MAPA)- **Supabase**: tabelas `ingestion_cursor`, `regintel_documents`, `event_log`, etc.

    ↓- **File system**:

Coletores Python (coletor.py, coletor_estados.py)  - `data/manuals/` – arquivos versionados.

    ↓  - `logs/ingestion/`, `logs/manuals/`, `logs/monitoring/`, `logs/communications/`.

Backend Flask (/ingest)  - `reports/weekly/` – status semanal em Markdown.

    ↓

Supabase (registry_item)## 5. Segurança / Acesso

    ↓- Variáveis sensíveis em `.env` (Mailgun, Supabase, clientes Embrapa a receber).

LLM Processing (Claude/OpenAI)- Cookies gov.br e credenciais HTTP ficam em `config/credentials/` (ignorados pelo Git).

    ↓- Scripts tratam erros (403/SSL) e adicionam atividade para revisão manual.

Bulletin Generation

    ↓## 6. Roadmap Técnico

Mailgun → Email delivery- Implementar camada de armazenamento para PDFs autenticados (gov.br) com cookies ou API oficial.

```- Substituir scraping por APIs oficiais/CSV (AgroPages, Radar Legislativo).

- Containerizar jobs para execução via Render ou Supabase Edge Functions.

### 2.3 Infraestrutura de Segurança

#### 2.3.1 Rotação Automática de Secrets
- **Implementação:** GitHub Actions (weekly-secrets-rotation.yml)
- **Frequência:** Semanal (segunda-feira 8h UTC / 5h BRT)
- **Providers gerenciados:**
  - Render (1 secret)
  - Supabase (3 secrets)
  - Mailgun (4 secrets)
  - Mercado Pago (5 secrets)
  - Google Workspace Gmail OAuth (4 secrets)
- **Total:** 17 secrets rotacionados automaticamente

#### 2.3.2 Autenticação e Autorização
- **1Password Service Account:** Acesso read-only ao vault
- **GitHub PAT:** Permissões `repo` + `workflow` para publicação de secrets
- **Render API Key:** Validado via endpoint `/v1/services`
- **Supabase Service Role Key:** Acesso administrativo ao banco

---

## 3. Decisões de Design

### 3.1 Escolha de Tecnologias

#### Backend: Flask
**Justificativa:**
- Leveza e simplicidade para APIs REST
- Ecosistema Python rico para processamento de dados
- Fácil integração com Supabase e LLMs

#### Database: Supabase (PostgreSQL)
**Justificativa:**
- PostgreSQL gerenciado com APIs REST/GraphQL built-in
- Row-level security para multi-tenancy futuro
- Edge Functions para lógica serverless
- Integração nativa com Python via `supabase-py`

#### Secrets Management: 1Password
**Justificativa:**
- Single source of truth para secrets
- CLI robusta (`op`) com suporte a Service Accounts
- Auditoria e versionamento de secrets
- Melhor UX que AWS Secrets Manager para equipe pequena

#### CI/CD: GitHub Actions
**Justificativa:**
- Integração nativa com repositório
- Secrets management built-in
- Workflows declarativos em YAML
- Free tier generoso para projetos privados

### 3.2 Padrões de Código

#### 3.2.1 Estrutura de Diretórios
```
backend/          # Flask API
  routes/         # Blueprints modulares
  db.py           # Cliente Supabase
  logger.py       # Logging estruturado
scripts/          # Automação e ops
  sync_1password_item_to_github.sh
  manage_render_deploy.py
docs/             # Documentação
  ops/            # Runbooks operacionais
  hb_agro_intel/  # Docs do projeto
modules/          # Lógica de negócio
  regintel/       # Coleta e processamento
```

#### 3.2.2 Convenções de Naming
- **Secrets:** `UPPERCASE_WITH_UNDERSCORES`
- **Variáveis de ambiente:** Mesmo padrão de secrets
- **Funções Python:** `snake_case`
- **Classes Python:** `PascalCase`
- **Items 1Password:** `"GITHUB - SECRET_NAME"` pattern

---

## 4. Integração entre Componentes

### 4.1 Backend ↔ Supabase
```python
from backend.db import get_supabase

client = get_supabase()
res = client.table("registry_item").insert(item).execute()
```

### 4.2 Scripts ↔ 1Password
```bash
# Service Account auth
export OP_SERVICE_ACCOUNT_TOKEN="ops_..."
op item get "GITHUB - RENDER_API_KEY" --vault "Intellicore Ops" --fields notesPlain
```

### 4.3 GitHub Actions ↔ Render
```yaml
- name: Sync secrets to Render
  env:
    RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
  run: python scripts/manage_render_deploy.py
```

---

## 5. Considerações de Performance

### 5.1 Coleta de Dados
- **Rate limiting:** Respeitar limites dos sites oficiais (DOU, MAPA)
- **Caching:** Evitar reprocessamento de items já coletados
- **Backfill:** Coleta histórica em batches controlados

### 5.2 Geração de Boletins
- **Async processing:** LLM calls não devem bloquear API
- **Batch generation:** Agrupar items para reduzir calls LLM
- **Caching de templates:** Reutilizar estrutura de newsletters

---

## 6. Monitoramento e Observabilidade

### 6.1 Logging
- **Estruturado:** JSON logs com `timestamp`, `level`, `component`, `message`
- **Centralizado:** Supabase `log_event` table
- **Retention:** 90 dias

### 6.2 Alertas
- **Deploy failures:** Email via Mailgun
- **Secrets rotation failures:** GitHub Actions notifications
- **API errors:** Render integrated logging

### 6.3 Métricas
- Items coletados por dia
- Boletins gerados
- Taxa de entrega de emails
- Uptime da API

---

## 7. Segurança

### 7.1 Princípios
- **Least privilege:** Cada componente tem apenas permissões necessárias
- **Secrets never in code:** Sempre via env vars ou secrets managers
- **Rotation automática:** 17 secrets rotacionam semanalmente
- **Auditoria:** Todos os acessos a secrets são logados

### 7.2 Threat Model
- **Exposição de secrets no Git:** Mitigado por rotação automática + BFG cleanup
- **Comprometimento de API keys:** Detecção rápida via monitoring + revoke imediato
- **Acesso não autorizado ao Supabase:** Row-level security + service role key rotation

---

## 8. Próximas Iterações

### 8.1 Curto Prazo (Q4 2025)
- [ ] Integração com X/Twitter para distribuição de boletins
- [ ] Dashboard web para visualização de items coletados
- [ ] Filtros de conteúdo por tema (fitossanitário, tributário, etc.)

### 8.2 Médio Prazo (Q1 2026)
- [ ] Multi-tenancy para diferentes clientes
- [ ] API pública para acesso programático
- [ ] Mobile app (React Native)

### 8.3 Longo Prazo (Q2+ 2026)
- [ ] Análise preditiva de tendências regulatórias
- [ ] Integração com ERPs agroindustriais
- [ ] Plataforma de gestão de compliance

---

## 9. Glossário

- **DOU:** Diário Oficial da União
- **MAPA:** Ministério da Agricultura, Pecuária e Abastecimento
- **ANVISA:** Agência Nacional de Vigilância Sanitária
- **IBAMA:** Instituto Brasileiro do Meio Ambiente e dos Recursos Naturais Renováveis
- **LLM:** Large Language Model (Claude, GPT)
- **Service Account:** Credencial programática para 1Password CLI
- **PAT:** Personal Access Token (GitHub)

---

**Mantenedores:** Hudson Borges (huddsong@gmail.com, hudsonborges@hb-advisory.com.br)  
**Repositório:** https://github.com/contatohb/Intellicore
