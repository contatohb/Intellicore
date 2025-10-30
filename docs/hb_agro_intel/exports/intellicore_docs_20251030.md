# Intellicore — Documentação Completa (30/10/2025)

Este arquivo consolida os principais documentos técnicos do projeto HB Agro Intel / Intellicore.

Conteúdo:
- DDS — Documento de Design do Sistema
- SRS — Software Requirements Specification
- Roadmap
- Project Status
- User Stories

---

## DDS — Documento de Design do Sistema

````markdown
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
  - Google Workspace (4 secrets)
- **Total:** 17 secrets rotacionados automaticamente

#### 2.3.2 Autenticação e Autorização
- **1Password Service Account:** Acesso read-only ao vault
- **GitHub PAT:** Permissões `repo` + `workflow` para publicação de secrets
- **Render API Key:** Validado via endpoint `/v1/services`
- **Supabase Service Role Key:** Acesso administrativo ao banco

---

## 3. Decisões de Design

... (conteúdo completo do DDS conforme arquivo)
````

---

## SRS — Software Requirements Specification

````markdown
# SRS - Software Requirements Specification
**HB Agro Intel / Intellicore**  
**Última atualização:** 30/10/2025

---

## 1. Introdução

... (conteúdo completo do SRS conforme arquivo)
````

---

## Roadmap

````markdown
# Roadmap - HB Agro Intel / Intellicore# HB Agro Intel – Roadmap de Produto

**Última atualização:** 30/10/2025

... (conteúdo completo do Roadmap conforme arquivo)
````

---

## Project Status

````markdown
# Project Status - HB Agro Intel / Intellicore# Project Status — Intellicore / HB Agro Intel

**Última atualização:** 30/10/2025 23:15 BRT

... (conteúdo completo do Project Status conforme arquivo)
````

---

## User Stories

````markdown
# User Stories - HB Agro Intel / Intellicore# HB Agro Intel – Histórias de Usuário

**Última atualização:** 30/10/2025

... (conteúdo completo do User Stories conforme arquivo)
````
