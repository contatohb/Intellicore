# Intellicore — Documentação Completa (2025-10-30)


---

## dds.md

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

---

## 10. Concorrência e Posicionamento

### 10.1 Panorama
- Move Analytics (https://moveanalytics.com.br) — foco em monitoramento e analytics setorial; posicionamento de produto com dashboards e relatórios executivos.
- Giagro — soluções de compliance e registro com ênfase no agronegócio.

### 10.2 Diferenciação do HB Agro Intel
- Coleta oficial-first: prioriza DOU, MAPA, ANVISA, IBAMA com rastreabilidade total de fonte e hash de conteúdo.
- Pipeline LLM embutido: resumos executivos e categorização automática orientada a agronegócio (fitossanitário, sanitário, tributário, ambiental, trabalhista).
- Boletim operacional: distribuição diária/semana via email com métricas (abertura/cliques) e filtros por interesse.
- Custo enxuto e time-to-value: infraestrutura Render + Supabase com OPEX < R$ 200/mês no MVP.

### 10.3 Benchmark rápido (v1)
- Cobertura de fontes: HB Agro Intel foca fontes oficiais; concorrentes tendem a mesclar notícias/editoriais.
- Profundidade de metadados: enriquecimento via LLM e extração de prazos/impacto como primeira-classe.
- Distribuição: email-first (entregabilidade com Mailgun) com plano de social (X/Twitter) para destaques.
- Roadmap: API pública e filtros por cultura/produto como alavancas de diferenciação.


---

## srs.md

# SRS - Software Requirements Specification
**HB Agro Intel / Intellicore**  
**Última atualização:** 30/10/2025

---

## 1. Introdução

### 1.1 Propósito
Este documento especifica os requisitos funcionais e não-funcionais do sistema HB Agro Intel, uma plataforma de inteligência regulatória para o agronegócio brasileiro.

### 1.2 Escopo
O sistema automatiza a coleta, processamento e distribuição de informações regulatórias de órgãos públicos brasileiros (DOU, MAPA, ANVISA, IBAMA), gerando boletins diários personalizados para profissionais do setor agroindustrial.

### 1.3 Definições e Acrônimos
- **Item de Registro:** Publicação oficial coletada (portaria, instrução normativa, etc.)
- **Boletim:** Newsletter diária com resumo de items relevantes
- **Coletor:** Script automatizado que extrai dados de fontes oficiais
- **LLM:** Large Language Model usado para análise e síntese

---

## 2. Descrição Geral

### 2.1 Perspectiva do Produto
Sistema standalone com integrações via API REST e webhooks. Não substitui sistemas existentes de gestão agrícola, mas complementa com camada de inteligência regulatória.

### 2.2 Funções do Produto
1. **Coleta Automatizada:** Extrair publicações de portais oficiais
2. **Processamento Inteligente:** Análise via LLM, categorização, resumo
3. **Geração de Boletins:** Newsletters diárias personalizadas
4. **Distribuição:** Email via Mailgun, potencial X/Twitter
5. **Gestão de Secrets:** Rotação automática de credenciais

### 2.3 Características dos Usuários
- **Gestor Agroindustrial:** Tomador de decisão, precisa de sínteses executivas
- **Advogado Agrário:** Necessita texto completo e referências legais
- **Consultor Técnico:** Foco em normas fitossanitárias e sanitárias
- **Administrador de Sistema:** Gerencia configuração e monitoramento

### 2.4 Restrições
- Dependência de disponibilidade de fontes oficiais (DOU pode ter downtime)
- Rate limits de APIs LLM (Claude/OpenAI)
- Budget de processamento (tokens LLM são pagos)
- LGPD: Não armazenar dados pessoais de usuários

---

## 3. Requisitos Funcionais

### RF01 - Coleta de Publicações DOU
**Prioridade:** Alta  
**Descrição:** O sistema deve coletar diariamente publicações da seção "Atos do Poder Executivo" do DOU.

**Critérios de Aceitação:**
- [ ] Execução automática às 6h BRT (horário de publicação do DOU)
- [ ] Detecção de novas publicações desde última coleta
- [ ] Extração de: título, data, órgão emissor, texto completo, URL
- [ ] Armazenamento em `registry_item` com `source='DOU'`
- [ ] Retry automático em caso de falha (max 3 tentativas)

**Casos de Erro:**
- Site DOU indisponível → Log erro, retry após 10min
- Formato HTML alterado → Alerta para administrador

---

### RF02 - Processamento via LLM
**Prioridade:** Alta  
**Descrição:** Cada item coletado deve ser processado por LLM para gerar resumo e categorização.

**Critérios de Aceitação:**
- [ ] Resumo executivo em português (max 150 palavras)
- [ ] Categorias: Fitossanitário, Sanitário, Tributário, Ambiental, Trabalhista, Outros
- [ ] Extração de: produtos afetados, prazo de vigência, impacto (alto/médio/baixo)
- [ ] Fallback: Se LLM falha, usar extração baseada em regex

**Prompt Template:**
```
Analise a seguinte publicação do DOU e forneça:
1. Resumo executivo (150 palavras)
2. Categoria principal
3. Produtos agrícolas afetados (se aplicável)
4. Prazo de vigência (se aplicável)
5. Impacto estimado: alto/médio/baixo

[TEXTO DA PUBLICAÇÃO]
```

---

### RF03 - Geração de Boletim Diário
**Prioridade:** Alta  
**Descrição:** Agrupar items processados em boletim HTML formatado para email.

**Critérios de Aceitação:**
- [ ] Geração às 8h BRT (após coleta + processamento)
- [ ] Ordenação: impacto alto → médio → baixo
- [ ] Limite: 20 items mais relevantes
- [ ] Template responsivo (mobile-friendly)
- [ ] Links para texto completo no DOU

**Layout do Boletim:**
```
[HEADER: Logo HB Agro Intel]
[Título: Boletim Regulatório - DD/MM/AAAA]

## Destaques do Dia
[3 items de impacto alto]

## Normas Fitossanitárias
[Items da categoria Fitossanitário]

## Outras Atualizações
[Demais items]

[FOOTER: Links úteis, descadastro]
```

---

### RF04 - Distribuição por Email
**Prioridade:** Alta  
**Descrição:** Enviar boletim via Mailgun para lista de assinantes.

**Critérios de Aceitação:**
- [ ] Envio após geração de boletim (≈8h30 BRT)
- [ ] Lista de destinatários em variável de ambiente
- [ ] Tracking de abertura e cliques (Mailgun analytics)
- [ ] Link de descadastro funcional
- [ ] Retry em caso de falha (max 2 tentativas)

---

### RF05 - Rotação Automática de Secrets
**Prioridade:** Crítica  
**Descrição:** Sincronizar secrets do 1Password para GitHub Secrets semanalmente.

**Critérios de Aceitação:**
- [x] Execução toda segunda-feira às 8h UTC (5h BRT)
- [x] Providers: Render, Supabase, Mailgun, Mercado Pago, Google Workspace
- [x] Total: 17 secrets sincronizados
- [x] Validação de Render API key via endpoint `/v1/services`
- [x] Log de sucesso/falha no GitHub Actions summary

**Secrets Gerenciados:**
| Provider | Secrets | Status |
|----------|---------|--------|
| Render | RENDER_API_KEY | ✅ |
| Supabase | SERVICE_ROLE_KEY, URL, ANON_KEY | ✅ |
| Mailgun | API_KEY, BASE_URL, DOMAIN, SENDER | ✅ |
| Mercado Pago | ACCESS_TOKEN, CLIENT_ID, CLIENT_SECRET, PUBLIC_KEY, WEBHOOK_SECRET | ✅ |
| Google Workspace | GMAIL_OAUTH_CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, USER | ✅ |

---

### RF06 - API de Ingestão Manual
**Prioridade:** Média  
**Descrição:** Endpoint `/ingest` para adicionar items manualmente (ex: publicações estaduais).

**Critérios de Aceitação:**
- [ ] Método: POST
- [ ] Body JSON: `{source, url, title, summary, published_at, raw}`
- [ ] Autenticação: API key via header `X-API-Key`
- [ ] Response: `{status: 'ok', id: <uuid>}`

---

### RF07 - Logging Estruturado
**Prioridade:** Média  
**Descrição:** Todos os eventos do sistema devem ser logados em formato estruturado.

**Critérios de Aceitação:**
- [ ] Formato: JSON com `{timestamp, level, component, event, metadata}`
- [ ] Níveis: DEBUG, INFO, WARNING, ERROR, CRITICAL
- [ ] Destino: Supabase `log_event` table + stdout (Render logs)
- [ ] Retention: 90 dias

---

### RF08 - Health Check
**Prioridade:** Alta  
**Descrição:** Endpoint `/health` para monitoramento de disponibilidade.

**Critérios de Aceitação:**
- [x] Método: GET
- [x] Response: `{status: 'ok', timestamp: <iso8601>}`
- [x] Status 200 se sistema operacional
- [ ] Status 503 se Supabase inacessível

---

### RF09 - Teste de Conexão DB
**Prioridade:** Alta  
**Descrição:** Endpoint `/test-db` para validar conectividade com Supabase.

**Critérios de Aceitação:**
- [x] Método: GET
- [x] Response: `{status: 'ok', supabase_connection: 'healthy'}`
- [x] Query de teste: `SELECT 1`

---

### RF10 - Backfill Histórico
**Prioridade:** Baixa  
**Descrição:** Coletar publicações históricas do DOU (últimos 12 meses).

**Critérios de Aceitação:**
- [ ] Trigger manual via workflow GitHub Actions
- [ ] Coleta em batches de 100 items/dia
- [ ] Deduplicação: não reprocessar items já existentes
- [ ] Progress report enviado por email a cada 1000 items

---

### RF11 - Benchmark de Concorrentes (Move Analytics, Giagro)
**Prioridade:** Média  
**Descrição:** O sistema deve manter quadro comparativo simples de features e posicionamento de concorrentes para orientar roadmap.

**Critérios de Aceitação:**
- [ ] Seção "Concorrência e Posicionamento" atualizada no DDS
- [ ] Registro em `docs/` com links e notas de benchmark (Move Analytics, Giagro)
- [ ] Itens de backlog derivados no Roadmap (diferenciais)

---

## 4. Requisitos Não-Funcionais

### RNF01 - Performance
- **API Response Time:** < 500ms (p95) para endpoints `/health`, `/test-db`
- **Coleta DOU:** Processar 1 dia de publicações em < 5min
- **Geração de Boletim:** < 2min para 20 items

### RNF02 - Disponibilidade
- **Uptime:** 99% (target)
- **RTO (Recovery Time Objective):** < 15min
- **RPO (Recovery Point Objective):** < 1h (backup Supabase automático)

### RNF03 - Escalabilidade
- **Horizontal:** Backend stateless, pode escalar via Render auto-scaling
- **Vertical:** Supabase suporta até 10k items/dia sem ajuste

### RNF04 - Segurança
- **Secrets:** Nunca em plaintext, sempre via 1Password + GitHub Secrets
- **Rotation:** Automática semanal (17 secrets)
- **API Authentication:** API key via header `X-API-Key`
- **HTTPS:** Obrigatório para todas as comunicações

### RNF05 - Manutenibilidade
- **Logging:** Estruturado JSON, retention 90 dias
- **Monitoramento:** Render integrated logs + Supabase metrics
- **Documentação:** DDS, SRS, Roadmap versionados no Git

### RNF06 - Usabilidade
- **Emails:** Template responsivo, leitura em mobile
- **Descadastro:** 1 clique (link no footer)
- **Acessibilidade:** Contraste WCAG AA, texto alternativo para imagens

### RNF07 - Conformidade
- **LGPD:** Não armazenar dados pessoais desnecessários
- **Retenção:** Emails de assinantes podem ser removidos a qualquer momento
- **Auditoria:** Logs de acesso a secrets disponíveis por 90 dias

---

## 5. Interfaces Externas

### 5.1 Interface de Usuário
- **Email Newsletter:** HTML responsivo via Mailgun
- **(Futuro) Web Dashboard:** React SPA para visualização de items

### 5.2 Interfaces de Hardware
Não aplicável (cloud-based).

### 5.3 Interfaces de Software

#### 5.3.1 1Password API
- **Protocolo:** REST
- **Autenticação:** Service Account Token
- **Operações:** `op item get`, `op item list`

#### 5.3.2 Supabase API
- **Protocolo:** REST + PostgreSQL wire protocol
- **Autenticação:** Service Role Key (anon key para leitura pública futura)
- **Operações:** INSERT, SELECT, UPDATE em `registry_item`, `bulletin`, `log_event`

#### 5.3.3 Mailgun API
- **Protocolo:** REST
- **Autenticação:** API Key (Basic Auth)
- **Operações:** `POST /messages`

#### 5.3.4 Render API
- **Protocolo:** REST
- **Autenticação:** Bearer Token
- **Operações:** `GET /services`, `POST /deploys`

### 5.4 Interfaces de Comunicação
- **HTTPS:** TLS 1.2+ para todas as APIs
- **Webhooks:** (Futuro) Mailgun inbound para replies

---

## 6. Restrições de Design

### 6.1 Linguagem de Programação
- **Backend:** Python 3.11+
- **Scripts:** Bash (ops), Python (automação)

### 6.2 Banco de Dados
- **SGBD:** PostgreSQL (via Supabase)
- **ORM:** Supabase Python client (não usa SQLAlchemy)

### 6.3 Deployment
- **Backend:** Render.com (container Docker)
- **Workflows:** GitHub Actions (Ubuntu runners)

---

## 7. Casos de Uso Detalhados

### UC01 - Coleta Diária do DOU
**Ator Principal:** Sistema (cron job)  
**Pré-condições:** Site DOU disponível, credenciais Supabase válidas  
**Fluxo Principal:**
1. Cron trigger às 6h BRT
2. Script `coletor.py` acessa `in.gov.br/web/dou`
3. Extrai publicações da seção "Executivo" não coletadas
4. Para cada publicação:
   a. Parse HTML → extrair título, data, órgão, texto
   b. Chamar LLM para processamento
   c. Inserir em `registry_item`
5. Log de sucesso com count de items coletados

**Fluxos Alternativos:**
- **3a.** Site indisponível → Retry após 10min (max 3x) → Alerta admin
- **4b.** LLM falha → Usar fallback regex → Flag `llm_processed=false`

---

### UC02 - Geração e Envio de Boletim
**Ator Principal:** Sistema (cron job)  
**Pré-condições:** Pelo menos 1 item coletado no dia  
**Fluxo Principal:**
1. Trigger às 8h BRT
2. Query Supabase: items de hoje, ordenar por impacto
3. Renderizar template HTML com top 20 items
4. Inserir boletim em tabela `bulletin`
5. Enviar via Mailgun para lista de destinatários
6. Log de envio com IDs Mailgun

**Fluxos Alternativos:**
- **2a.** Nenhum item coletado → Enviar boletim vazio com mensagem informativa
- **5a.** Mailgun falha → Retry após 5min (max 2x) → Alerta admin

---

### UC03 - Rotação de Secrets
**Ator Principal:** GitHub Actions (schedule)  
**Pré-condições:** OP_SERVICE_ACCOUNT_TOKEN e GH_PAT_SECRETS_WRITE configurados  
**Fluxo Principal:**
1. Trigger segunda-feira 8h UTC
2. Para cada secret (17 total):
   a. Executar `scripts/sync_1password_item_to_github.sh`
   b. Ler secret do 1Password (campo `notesPlain`)
   c. Validar (se endpoint disponível, ex: Render)
   d. Publicar no GitHub via `gh secret set`
3. Gerar summary no GitHub Actions

**Fluxos Alternativos:**
- **2b.** Item não encontrado → Usar default do workflow → Log warning
- **2c.** Validação falha → Não publicar → Alerta admin

---

## 8. Requisitos de Dados

### 8.1 Modelo Lógico

#### Tabela: `registry_item`
| Campo | Tipo | Restrições |
|-------|------|------------|
| `id` | UUID | PK, default gen_random_uuid() |
| `source` | TEXT | NOT NULL (DOU, MAPA, ANVISA, ...) |
| `url` | TEXT | NOT NULL, UNIQUE |
| `title` | TEXT | NOT NULL |
| `summary` | TEXT | NULL (gerado por LLM) |
| `published_at` | TIMESTAMPTZ | NOT NULL |
| `collected_at` | TIMESTAMPTZ | NOT NULL, default NOW() |
| `raw` | JSONB | NULL (HTML original) |
| `metadata` | JSONB | NULL (categoria, impacto, etc.) |

#### Tabela: `bulletin`
| Campo | Tipo | Restrições |
|-------|------|------------|
| `id` | UUID | PK |
| `date` | DATE | NOT NULL, UNIQUE |
| `html` | TEXT | NOT NULL |
| `sent_at` | TIMESTAMPTZ | NULL |
| `mailgun_id` | TEXT | NULL |

#### Tabela: `log_event`
| Campo | Tipo | Restrições |
|-------|------|------------|
| `id` | UUID | PK |
| `timestamp` | TIMESTAMPTZ | NOT NULL, default NOW() |
| `level` | TEXT | NOT NULL (DEBUG, INFO, ...) |
| `component` | TEXT | NOT NULL (collector, bulletin, ...) |
| `event` | TEXT | NOT NULL |
| `metadata` | JSONB | NULL |

---

## 9. Rastreabilidade

| Requisito | User Story | Implementação |
|-----------|------------|---------------|
| RF01 | US01 | `coletor.py` |
| RF02 | US02 | `modules/regintel/v2_0_collector/` |
| RF03 | US03 | `backend/routes/bulletin.py` |
| RF04 | US04 | `send_newsletter.py` (hb-regintel) |
| RF05 | - | `.github/workflows/weekly-secrets-rotation.yml` |
| RF08 | - | `backend/routes/health.py` |
| RF09 | - | `backend/routes/test_db.py` |
| RF11 | - | `docs/hb_agro_intel/dds.md` (seção Concorrência) |

---

## 10. Aprovações

| Stakeholder | Data | Assinatura |
|-------------|------|------------|
| Hudson Borges (Product Owner) | 30/10/2025 | ✅ |

---

**Mantenedores:** Hudson Borges (huddsong@gmail.com, hudsonborges@hb-advisory.com.br)  
**Repositório:** https://github.com/contatohb/Intellicore


---

## roadmap.md

# Roadmap - HB Agro Intel / Intellicore# HB Agro Intel – Roadmap de Produto

**Última atualização:** 30/10/2025

_Atualizado em 28/10/2025._

---

## Q4 2025

## Visão de Produto- Finalizar backfill histórico (DOU/QD/Agrofit/Bioinsumos) com `scripts/run_backfill_until_caught_up.py` + cron incremental.

- Automatizar monitoramento de manuais (gov.br) com fluxo de autenticação controlado.

Construir a plataforma de inteligência regulatória #1 do agronegócio brasileiro, automatizando coleta, análise e disseminação de normas oficiais para profissionais do setor.- Formalizar acesso a Radar Legislativo (CSV/API) e AgroPages (assinatura/API).

- Disparo automático de status semanal (Mailgun + `--write-report`).

---

## Q1 2026

## Milestones Completados ✅- Integrar AgroAPI (Embrapa) com credenciais oficiais.

- Lançar dashboard HB Agro Intel com métricas diárias e trilha de auditoria.

### Q3 2025 - MVP Foundation- Implementar alertas configuráveis por cliente (preferências Supabase).

- ✅ Backend Flask API (`/health`, `/test-db`, `/ingest`, `/bulletin`)- Expandir monitoramento para cooperativas, EMATER e portais internacionais (ex.: OECD, FAO).

- ✅ Deploy Render.com com CI/CD

- ✅ Integração Supabase (PostgreSQL)## Q2 2026

- ✅ Coletores DOU básicos (`coletor.py`, `coletor_estados.py`)- Lançar hub público HB Agro Intel (site) com conteúdo automatizado.

- ✅ Logging estruturado (`logger.py`)- Disponibilizar API externa para clientes consultarem dados normalizados.

- Automatizar ingestão de anexos (PDFs/planilhas) em Supabase Storage com OCR.

### Q4 2025 - Automação e Segurança- Configurar pipeline de ML para priorização de alertas críticos.

- ✅ **Rotação Automática de Secrets (30/10/2025)**

  - 17 secrets rotacionando semanalmente (segunda 8h UTC)## Q3 2026 e além

  - Providers: Render, Supabase, Mailgun, Mercado Pago, Google Workspace- Integração com ERPs/agro-industriais parceiros.

  - Workflow GitHub Actions com validação Render API- Inteligência comparativa de concorrentes (ranking, share of voice).

  - Scripts bash + 1Password CLI com Service Account- Versão white-label do boletim e dashboards self-service.

- ✅ Integração 1Password (vault "Intellicore Ops")

- ✅ Scripts de deployment (`manage_render_deploy.py`)> Revisar este roadmap a cada ciclo semanal e refletir mudanças importantes em `docs/project_status.md`.

- ✅ Runbook operacional (`docs/ops/rotacionamento_secrets.md`)

---

## Q4 2025 (Out-Dez) - Boletim Diário e Distribuição

### Sprint 1 (Nov 1-15) - Processamento LLM
**Objetivo:** Análise automática de publicações DOU via Claude/GPT

**Tarefas:**
- [ ] Integrar Claude API (Anthropic)
- [ ] Prompt engineering para resumo executivo
- [ ] Categorização automática (Fitossanitário, Sanitário, Tributário, etc.)
- [ ] Extração de metadados (produtos afetados, prazos, impacto)
- [ ] Fallback: Processamento baseado em regex se LLM falhar
- [ ] Testes: 100 publicações históricas, validar acurácia > 85%

**Entregas:**
- Módulo `modules/regintel/v2_0_collector/llm_processor.py`
- Documentação de prompts em `docs/prompts/`
- Métricas: tokens usados, latência, taxa de erro

---

### Sprint 2 (Nov 16-30) - Geração de Boletim
**Objetivo:** Newsletter HTML diária com top 20 publicações

**Tarefas:**
- [ ] Template HTML responsivo (mobile-friendly)
- [ ] Ordenação por impacto (alto → médio → baixo)
- [ ] Seções: Destaques, Fitossanitário, Tributário, Outros
- [ ] Footer: Links úteis, descadastro
- [ ] Inserção em tabela `bulletin` no Supabase
- [ ] Testes A/B de layout (2 variantes)

**Entregas:**
- `backend/routes/bulletin.py` completo
- Templates em `templates/bulletin/`
- Preview web em `/bulletin/preview/<date>`

---

### Sprint 3 (Dez 1-15) - Distribuição Mailgun
**Objetivo:** Envio automatizado de boletins às 8h30 BRT

**Tarefas:**
- [ ] Integração Mailgun API completa
- [ ] Lista de assinantes gerenciada via Supabase (`subscribers` table)
- [ ] Tracking de abertura e cliques (Mailgun analytics)
- [ ] Link de descadastro (1 clique)
- [ ] Retry automático (max 2x) em caso de falha
- [ ] Alertas de entrega (taxa < 95% → email admin)

**Entregas:**
- Script `send_newsletter.py` (já existe, refinar)
- Dashboard de métricas em `/admin/newsletter-stats`
- Testes: enviar para 10 usuários beta

---

### Sprint 4 (Dez 16-31) - Monitoramento e Refinamento
**Objetivo:** Observabilidade e ajustes baseados em feedback beta

**Tarefas:**
- [ ] Dashboard Render: CPU, memória, response time
- [ ] Alertas: Uptime < 99%, latência > 500ms
- [ ] Análise de logs: erros mais frequentes
- [ ] Ajuste de prompts LLM baseado em feedback
- [ ] Otimização: reduzir custos de tokens LLM (batch processing)

**Entregas:**
- Runbook de troubleshooting atualizado
- Métricas de custo: R$/boletim
- Plano de escalabilidade (quando atingir 100 assinantes)

---

## Iniciativas Transversais (Q4 2025)

### Benchmark Concorrentes (Move Analytics, Giagro)
**Objetivo:** Informar diferenciação de produto e backlog.

**Tarefas:**
- [ ] Levantar features públicas e posicionamento (site, materiais)
- [ ] Comparar cobertura de fontes, distribuição, pricing
- [ ] Documentar em `dds.md` (seção Concorrência) e derivar backlog

**Entregas:**
- Tabela comparativa e 3 diferenciais claros do HB Agro Intel

---

## Q1 2026 (Jan-Mar) - Expansão de Fontes e Filtros

### Sprint 5 (Jan 1-15) - Coleta MAPA
**Objetivo:** Integrar publicações do Ministério da Agricultura

**Tarefas:**
- [ ] Scraper para portal MAPA
- [ ] Parse de portarias, instruções normativas
- [ ] Deduplicação com DOU (mesma norma pode aparecer em ambos)
- [ ] Adicionar `source='MAPA'` em `registry_item`

---

### Sprint 6 (Jan 16-31) - Coleta ANVISA e IBAMA
**Objetivo:** Cobrir órgãos reguladores críticos

**Tarefas:**
- [ ] Scraper ANVISA (resoluções sanitárias)
- [ ] Scraper IBAMA (licenciamento ambiental)
- [ ] Harmonizar formatos (HTML diferente por órgão)

---

### Sprint 7 (Fev 1-28) - Filtros Personalizados
**Objetivo:** Usuários definem quais temas desejam receber

**Tarefas:**
- [ ] UI web: checkboxes para categorias (Fitossanitário, Tributário, etc.)
- [ ] Tabela `subscriber_preferences` no Supabase
- [ ] Lógica de filtragem no gerador de boletins
- [ ] Email personalizado por assinante (não mais broadcast único)

---

### Sprint 8 (Mar 1-31) - API Pública (Beta)
**Objetivo:** Permitir acesso programático para parceiros

**Tarefas:**
- [ ] Endpoints: `GET /items`, `GET /bulletins/<date>`
- [ ] Autenticação: API key via header `X-API-Key`
- [ ] Rate limiting: 1000 requests/dia por key
- [ ] Documentação OpenAPI (Swagger)
- [ ] Onboarding de 3 parceiros beta

---

## Q2 2026 (Abr-Jun) - Web Dashboard e Mobile

### Sprint 9-10 (Abr) - Dashboard Web
**Objetivo:** Interface visual para explorar items coletados

**Stack:**
- Frontend: React + TypeScript
- Estilização: TailwindCSS
- Deploy: Vercel

**Features:**
- [ ] Timeline de publicações (filtros por data, órgão, categoria)
- [ ] Busca full-text (Supabase FTS)
- [ ] Favoritos (salvar items para referência)
- [ ] Compartilhamento: link curto para item

---

### Sprint 11-12 (Mai-Jun) - Mobile App (MVP)
**Objetivo:** Notificações push para normas críticas

**Stack:**
- React Native + Expo
- Push: Firebase Cloud Messaging

**Features:**
- [ ] Feed de publicações (scroll infinito)
- [ ] Notificações: items de impacto alto
- [ ] Modo offline: cache de últimas 50 publicações
- [ ] Compartilhamento via WhatsApp

---

## Q3 2026 (Jul-Set) - Monetização e Escalabilidade

### Sprint 13 (Jul) - Integração Mercado Pago
**Objetivo:** Assinatura paga (R$ 49/mês)

**Tarefas:**
- [ ] Webhook Mercado Pago para confirmação de pagamento
- [ ] Lógica de assinatura: free trial 7 dias
- [ ] Portal do assinante: gerenciar pagamento
- [ ] Nota fiscal automática (integração com contador)

---

### Sprint 14-15 (Ago-Set) - Multi-tenancy
**Objetivo:** Suportar empresas com múltiplos usuários

**Tarefas:**
- [ ] Tabela `organizations` no Supabase
- [ ] Row-level security (RLS): usuários só veem dados da sua org
- [ ] Admin por organização: gerenciar assinantes
- [ ] Faturamento por organização (não por usuário)

---

### Sprint 16 (Set) - Escalabilidade
**Objetivo:** Suportar 1000 assinantes sem degradação

**Tarefas:**
- [ ] Migrar coleta para workers assíncronos (Celery + Redis)
- [ ] Cache de boletins (Redis): reduzir queries Supabase
- [ ] CDN para assets estáticos (Cloudflare)
- [ ] Load testing: simular 10k requests/min

---

## Q4 2026 (Out-Dez) - Inteligência Preditiva

### Sprint 17-18 (Out-Nov) - Análise de Tendências
**Objetivo:** Prever mudanças regulatórias futuras

**Tarefas:**
- [ ] Modelo ML: time series de publicações por categoria
- [ ] Dashboard de tendências: "Aumento de 30% em normas fitossanitárias"
- [ ] Alertas preditivos: "Provável nova regulação de agrotóxicos em 60 dias"

---

### Sprint 19-20 (Dez) - Integração com ERPs
**Objetivo:** Exportar compliance checklist para SAP, TOTVS

**Tarefas:**
- [ ] API de integração: webhook para novos items
- [ ] Mapeamento: normas → ações obrigatórias em ERP
- [ ] Parcerias com 2 fornecedores de ERP

---

## Backlog (2027+)

### Features Futuras
- [ ] Integração X/Twitter: thread automático de destaques diários
- [ ] Podcast semanal: síntese de normas em áudio (TTS)
- [ ] Chatbot: "Quais normas afetam exportação de soja?"
- [ ] Compliance score: empresas avaliam aderência regulatória
- [ ] Marketplace: consultores oferecem serviços baseados em normas

### Tech Debt
- [ ] Migrar de Flask para FastAPI (async nativo)
- [ ] Refatorar coletores: arquitetura plugin-based
- [ ] Testes: cobertura > 80% (hoje ~20%)
- [ ] Migrar secrets de 1Password para Vault (Hashicorp)

---

## Métricas de Sucesso

| Métrica | Q4 2025 | Q1 2026 | Q2 2026 | Q4 2026 |
|---------|---------|---------|---------|---------|
| Assinantes | 10 (beta) | 50 | 200 | 1000 |
| Items/dia | 20 | 50 | 100 | 200 |
| Uptime | 95% | 99% | 99.5% | 99.9% |
| Custo/item | R$ 0.50 | R$ 0.30 | R$ 0.15 | R$ 0.10 |
| MRR | R$ 0 | R$ 500 | R$ 5k | R$ 50k |

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| DOU muda estrutura HTML | Alta | Alto | Parser modular + alertas |
| Custo LLM > Budget | Média | Alto | Batch processing + caching |
| Churn de assinantes | Média | Médio | Pesquisas de satisfação |
| Concorrente lança similar | Baixa | Alto | Foco em nichos (ex: orgânicos) |

---

## Dependências Críticas

1. **Disponibilidade DOU:** Sistema público pode ter downtime (backup: cache de 24h)
2. **APIs LLM:** Claude/GPT podem ter rate limits (fallback: múltiplos providers)
3. **Equipe:** Projeto solo → risco de bus factor (documentação extensiva)

---

## Próximas Ações Imediatas

**Próxima semana (Nov 4-8):**
1. [ ] Integrar Claude API e testar prompt de resumo
2. [ ] Criar template HTML do boletim (versão 1)
3. [ ] Onboarding de 5 usuários beta
4. [ ] Configurar dashboard Render para monitoramento

**Próximo mês (Novembro):**
1. [ ] Completar Sprints 1 e 2 (LLM + Boletim)
2. [ ] Enviar primeiro boletim automatizado
3. [ ] Coletar feedback e iterar

---

**Mantenedores:** Hudson Borges (huddsong@gmail.com, hudsonborges@hb-advisory.com.br)  
**Repositório:** https://github.com/contatohb/Intellicore  
**Última revisão:** 30/10/2025


---

## project_status.md

# Project Status - HB Agro Intel / Intellicore# Project Status — Intellicore / HB Agro Intel

**Última atualização:** 30/10/2025 23:15 BRT

Data: 2025-10-29

---

## Resumo Atual

## 🎯 Status Geral: **ON TRACK** ✅- Backfill: em progresso (orquestrador pronto). Algumas fontes pendentes.

- Serviços Render: `intellicore-olms` OK (health 200). `intellicore-backend` retornou 503 (suspenso).

Sistema de rotacionamento automático de secrets **100% funcional**. Todos os 5 providers configurados e testados com sucesso.- Rotação de secrets: RENDER_API_KEY tentativa automática falhou; pendente criar via dashboard.



---## Próximas Ações Imediatas

1. Criar RENDER API key no dashboard e atualizar 1Password + GitHub Secret.

## 📊 Progresso Atual2. Reativar `intellicore-backend` no Render (ver logs/builds)

3. Finalizar backfill fonte X/Y e validar deduplicação.

### Infrastructure & Security (100% ✅)

- ✅ Backend Flask API deployed no Render## Contatos de Operação

- ✅ Supabase PostgreSQL configurado- Admins: huddsong@gmail.com, hudsonborges@hb-advisory.com.br

- ✅ 1Password vault "Intellicore Ops" operacional
- ✅ **Rotação automática de 17 secrets (Render, Supabase, Mailgun, Mercado Pago, Google Workspace)**
- ✅ GitHub Actions workflows (weekly-secrets-rotation.yml)
- ✅ Scripts de automação (`sync_1password_item_to_github.sh`, `manage_render_deploy.py`)

### Data Collection (60%)
- ✅ Coletores DOU básicos (`coletor.py`, `coletor_estados.py`)
- ⏳ Integração LLM para processamento (pendente)
- ⏳ Coletores MAPA, ANVISA, IBAMA (backlog)

### Bulletin Generation (40%)
- ✅ Estrutura backend (`/bulletin` endpoint)
- ⏳ Template HTML newsletter (em desenvolvimento)
- ⏳ Lógica de seleção de top 20 items (pendente)

### Distribution (30%)
- ✅ Integração Mailgun (secrets configurados)
- ⏳ Lista de assinantes gerenciada (pendente)
- ⏳ Tracking de métricas (pendente)

---

## 🚀 Último Deploy

**Data:** 30/10/2025 23:00 BRT  
**Branch:** `main` (commit `932022e2`)  
**Mudanças:**
- Adicionados 7 novos secrets ao workflow de rotação
- Mailgun expandido de 1 para 4 secrets (API_KEY, BASE_URL, DOMAIN, SENDER)
- Google Workspace OAuth adicionado (4 secrets)
- Total de secrets gerenciados: **17**

**Status:** ✅ Deploy bem-sucedido, todos os secrets sincronizados

---

## ⚡ Atividades Recentes (Última Semana)

### 30/10/2025 - Finalização do Sistema de Secrets
- ✅ Configurado rotacionamento completo de 17 secrets
- ✅ Adicionados Mailgun (BASE_URL, DOMAIN, SENDER)
- ✅ Adicionados Google Workspace (GMAIL_OAUTH_*)
- ✅ Testado workflow completo com `secrets_to_sync=all`
- ✅ Verificado sincronização de todos os providers
- ✅ Documentação atualizada (DDS, SRS, Roadmap, Status)

### 29/10/2025 - Correção de Bugs no Workflow
- ✅ Fixado issue com variáveis de repo sobrescrevendo defaults
- ✅ Atualizado 6 repo variables com títulos corretos do 1Password
- ✅ Validado extração de secrets do campo `notesPlain`

### 28/10/2025 - Expansão de Providers
- ✅ Adicionado Mercado Pago (5 secrets)
- ✅ Configurado Supabase (3 secrets: SERVICE_ROLE_KEY, URL, ANON_KEY)
- ✅ Implementado validação de Render API key via endpoint

---

## 📅 Próximos Passos (Semana 04-08/Nov)

### Prioridade Alta
1. **Integração Claude API**
   - Objetivo: Processar publicações DOU com resumo automático
   - Responsável: Hudson Borges
   - Deadline: 08/11/2025
   - Status: Not started

2. **Template HTML Newsletter**
   - Objetivo: Layout responsivo para boletim diário
   - Responsável: Hudson Borges
   - Deadline: 08/11/2025
   - Status: Not started

3. **Onboarding Usuários Beta**
   - Objetivo: Recrutar 5 usuários para feedback
   - Responsável: Hudson Borges
   - Deadline: 10/11/2025
   - Status: Not started

### Prioridade Média
- [ ] Configurar dashboard Render para monitoramento
- [ ] Implementar retry logic em coletores DOU
- [ ] Criar tabela `subscribers` no Supabase

### Novas Diretrizes
- Incorporar benchmark de concorrentes (Move Analytics, Giagro) no DDS e Roadmap
- Ajustar pipeline de email para fallback de credenciais do Render no CI
- Consolidar bundle atualizado de documentação e anexar como artefato no workflow

---

## 🐛 Issues Conhecidos

### Críticos
Nenhum no momento ✅

### Médios
1. **Coleta DOU depende de disponibilidade do site**
   - Mitigação: Implementar retry com backoff exponencial
   - ETA fix: Sprint 4 (Dezembro)

2. **Logs de erro não centralizados**
   - Atual: Render stdout + Supabase `log_event` (inconsistente)
   - Mitigação: Consolidar em Supabase + criar dashboard
   - ETA fix: Sprint 4 (Dezembro)

### Baixos
1. **Testes unitários com cobertura baixa (~20%)**
   - Não bloqueia desenvolvimento, mas aumenta risco de regressão
   - ETA fix: Q1 2026

---

## 📈 Métricas

### Infrastructure
| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| API Uptime | 99.2% | 99% | ✅ |
| P95 Response Time | 320ms | <500ms | ✅ |
| Secrets Rotacionados | 17 | 17 | ✅ |
| Deploy Frequency | 3x/semana | 2x/semana | ✅ |

### Data Collection
| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Items DOU/dia | 15 | 20 | ⚠️ |
| Erro rate coleta | 5% | <10% | ✅ |
| Latência média | 2.3min | <5min | ✅ |

### Usuários (Beta)
| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Assinantes ativos | 2 | 10 | ⏳ |
| Taxa de abertura | N/A | >40% | ⏳ |
| Taxa de clique | N/A | >15% | ⏳ |

---

## 💰 Custos (Outubro 2025)

| Serviço | Custo Mensal | Uso |
|---------|--------------|-----|
| Render.com | $7 USD | Starter plan (512MB RAM) |
| Supabase | $0 | Free tier (500MB DB) |
| Mailgun | $0 | Free tier (1000 emails/mês) |
| 1Password | $0 | Família do founder |
| GitHub | $0 | Public repo |
| **TOTAL** | **~R$ 35** | (conversão R$ 5/USD) |

**Projeção Q1 2026:** ~R$ 200/mês (upgrade Render para escalar)

---

## 🎓 Aprendizados Recentes

### O que funcionou bem ✅
1. **1Password + GitHub Actions:** Rotação automática é confiável e auditável
2. **Render deploy:** Zero-downtime, rollback rápido
3. **Supabase Python client:** API intuitiva, menos boilerplate que SQLAlchemy

### O que pode melhorar ⚠️
1. **Documentação inline:** Comentários em scripts bash precisam ser mais detalhados
2. **Testes:** Cobertura baixa aumenta ansiedade em refactorings
3. **Monitoramento proativo:** Descobrimos bugs via erro de usuário, não via alertas

---

## 🔒 Segurança e Compliance

### Últimos Audits
- **30/10/2025:** Rotação de secrets validada (17/17 ✅)
- **25/10/2025:** Review de permissões GitHub PAT (repo + workflow, não admin)
- **20/10/2025:** Verificação de secrets expostos no Git (nenhum encontrado ✅)

### Próximas Ações
- [ ] Configurar alertas para secrets expirados/inválidos
- [ ] Implementar 2FA obrigatório para 1Password Service Account
- [ ] Revisar logs de acesso a secrets (auditoria mensal)

---

## 👥 Equipe

**Hudson Borges** (Solo Founder)
- Roles: Product, Engineering, Ops
- Emails: huddsong@gmail.com, hudsonborges@hb-advisory.com.br
- Availability: 20h/semana (projeto paralelo)

---

## 📞 Contato e Suporte

**Issues Técnicos:** https://github.com/contatohb/Intellicore/issues  
**Email Geral:** hudsonborges@hb-advisory.com.br  
**Status Page:** (futuro) https://status.hbagro.com.br

---

## 🗓️ Próximas Milestones

| Milestone | Data Target | Status |
|-----------|-------------|--------|
| Primeiro Boletim Automatizado | 15/11/2025 | ⏳ In Progress |
| 10 Assinantes Beta | 30/11/2025 | ⏳ Not Started |
| API Pública (Beta) | 31/03/2026 | ⏳ Planned |
| Dashboard Web | 30/06/2026 | ⏳ Planned |
| 100 Assinantes Pagos | 31/12/2026 | ⏳ Planned |

---

**Este documento é atualizado automaticamente toda segunda-feira via script `send_weekly_status.py`**

---

**Repositório:** https://github.com/contatohb/Intellicore  
**Última atualização:** 30/10/2025 23:15 BRT


---

## user_stories.md

# User Stories - HB Agro Intel / Intellicore# HB Agro Intel – Histórias de Usuário

**Última atualização:** 30/10/2025

_Atualizado em 28/10/2025._

---

## Persona: Analista Regulatório

## Epic 1: Coleta Automatizada de Dados- **Como** analista regulatório, **quero** receber um boletim diário com mudanças legais, **para** avisar rapidamente a equipe de P&D.

- **Como** analista, **quero** acessar a versão mais recente dos manuais MAPA/ANVISA/IBAMA, **para** garantir conformidade nos processos.

### US01 - Coletar Publicações do DOU- **Como** analista, **quero** comparar releases de concorrentes (ex.: Giagro, Move Analytics), **para** antecipar movimentos do mercado.

**Como** gestor agroindustrial  

**Quero** que o sistema colete automaticamente publicações relevantes do DOU  ## Persona: Gestor de Produto

**Para que** eu não precise monitorar manualmente o diário oficial todos os dias- **Como** gestor de produto, **quero** visualizar um dashboard com status dos pipelines (backfill, monitoramentos), **para** decidir prioridades.

- **Como** gestor, **quero** receber um e-mail semanal consolidado com roadmap e evolução, **para** alinhar stakeholders sem abrir o repositório.

**Critérios de Aceitação:**- **Como** gestor, **quero** ter a linha do tempo de features futuras, **para** planejar lançamentos e comunicação.

- [ ] Sistema executa coleta diariamente às 6h BRT

- [ ] Coleta apenas seção "Atos do Poder Executivo"## Persona: Cliente Final (Indústria Agro)

- [ ] Armazena título, data, órgão, texto completo e URL- **Como** cliente, **quero** ser notificado quando uma norma impactar meu produto, **para** ajustar o registro no prazo.

- [ ] Detecta e ignora publicações já coletadas (deduplicação)- **Como** cliente, **quero** consultar o histórico de mudanças em legislações relevantes, **para** documentar auditorias internas.

- [ ] Log de erros em caso de falha (site indisponível, mudança de formato)- **Como** cliente, **quero** acesso controlado a dashboards, **para** filtrar informações por cultura/região.



**Estimativa:** 8 story points  ## Persona: Equipe Técnica

**Prioridade:** Alta  - **Como** desenvolvedor, **quero** documentação atualizada (SRS/DDS/Roadmap), **para** acelerar onboarding de terceiros.

**Status:** ✅ Implementado- **Como** operador de dados, **quero** logs detalhados e estado de cada pipeline, **para** agir rápido em falhas.

- **Como** operador, **quero** scripts idempotentes e configuráveis via `.env`, **para** replicar ambiente em servidores alternativos.

---- **Como** operador, **quero** armazenar cookies e headers sensíveis fora do Git, **para** habilitar coletas autenticadas com segurança.


### US02 - Processar Publicações com IA
**Como** consultor técnico agrícola  
**Quero** que cada publicação tenha um resumo executivo gerado por IA  
**Para que** eu possa rapidamente avaliar relevância sem ler o texto completo

**Critérios de Aceitação:**
- [ ] Resumo em português com no máximo 150 palavras
- [ ] Categorização automática (Fitossanitário, Sanitário, Tributário, Ambiental, Trabalhista, Outros)
- [ ] Extração de produtos afetados (ex: "soja", "milho", "agrotóxicos")
- [ ] Identificação de prazo de vigência (se aplicável)
- [ ] Classificação de impacto: alto, médio ou baixo
- [ ] Fallback: se IA falhar, usar extração baseada em regex

**Estimativa:** 13 story points  
**Prioridade:** Alta  
**Status:** ⏳ Sprint 1 (Nov 1-15)

---

### US03 - Coletar Publicações do MAPA
**Como** especialista em fitossanidade  
**Quero** que o sistema colete publicações do Ministério da Agricultura  
**Para que** eu tenha cobertura completa de normas agrícolas, não apenas DOU

**Critérios de Aceitação:**
- [ ] Scraper para portal MAPA (gov.br/agricultura)
- [ ] Coleta portarias, instruções normativas, resoluções
- [ ] Deduplicação com DOU (mesma norma pode aparecer em ambos)
- [ ] Mesmo formato de armazenamento (tabela `registry_item`)

**Estimativa:** 8 story points  
**Prioridade:** Média  
**Status:** ⏳ Backlog (Q1 2026)

---

## Epic 2: Geração de Boletins

### US04 - Gerar Boletim Diário
**Como** gestor agroindustrial  
**Quero** receber diariamente um boletim com as principais publicações  
**Para que** eu esteja sempre atualizado sem precisar acessar um portal

**Critérios de Aceitação:**
- [ ] Boletim gerado automaticamente às 8h30 BRT
- [ ] Contém top 20 publicações mais relevantes do dia
- [ ] Ordenado por impacto (alto → médio → baixo)
- [ ] Seções: Destaques, Fitossanitário, Tributário, Outros
- [ ] Layout HTML responsivo (legível em mobile)
- [ ] Links para texto completo na fonte oficial

**Estimativa:** 13 story points  
**Prioridade:** Alta  
**Status:** ⏳ Sprint 2 (Nov 16-30)

---

### US05 - Personalizar Boletim por Interesse
**Como** advogado agrário  
**Quero** receber apenas publicações sobre temas de meu interesse (ex: Tributário)  
**Para que** não seja bombardeado com informações irrelevantes

**Critérios de Aceitação:**
- [ ] Interface web: checkboxes para categorias de interesse
- [ ] Preferências salvas em tabela `subscriber_preferences`
- [ ] Boletim gerado individualmente por assinante (não broadcast único)
- [ ] Mínimo de 5 items no boletim (se não tiver suficientes na categoria, preencher com "Outros")

**Estimativa:** 8 story points  
**Prioridade:** Média  
**Status:** ⏳ Backlog (Q1 2026 Sprint 7)

---

## Epic 3: Distribuição e Engajamento

### US06 - Receber Boletim por Email
**Como** assinante  
**Quero** receber o boletim diário por email  
**Para que** eu seja notificado proativamente sem precisar acessar um site

**Critérios de Aceitação:**
- [ ] Email enviado às 8h30 BRT (após geração de boletim)
- [ ] Assunto: "Boletim HB Agro Intel - DD/MM/AAAA"
- [ ] Corpo HTML responsivo (mobile-friendly)
- [ ] Footer com link de descadastro (1 clique)
- [ ] Tracking de abertura e cliques (Mailgun analytics)

**Estimativa:** 5 story points  
**Prioridade:** Alta  
**Status:** ⏳ Sprint 3 (Dez 1-15)

---

### US07 - Descadastrar de Boletim
**Como** assinante  
**Quero** poder me descadastrar facilmente  
**Para que** pare de receber emails se não for mais relevante

**Critérios de Aceitação:**
- [ ] Link "Descadastrar" no footer de todo email
- [ ] 1 clique → confirmação (não precisa logar)
- [ ] Página de confirmação: "Você foi descadastrado. Deseja dar feedback?"
- [ ] Opcional: formulário de feedback (por que descadastrou?)
- [ ] Email de confirmação: "Você não receberá mais boletins"

**Estimativa:** 3 story points  
**Prioridade:** Média  
**Status:** ⏳ Sprint 3 (Dez 1-15)

---

### US08 - Compartilhar Publicação
**Como** consultor técnico  
**Quero** compartilhar uma publicação específica com colegas via WhatsApp  
**Para que** possamos discutir impactos sem copiar/colar texto manualmente

**Critérios de Aceitação:**
- [ ] Botão "Compartilhar" em cada item do boletim (web e email)
- [ ] Gera link curto: `hbagro.com.br/p/abc123`
- [ ] Link leva para página web com publicação completa
- [ ] Botões de compartilhamento: WhatsApp, Email, Copiar link
- [ ] Página tem meta tags Open Graph (preview bonito no WhatsApp)

**Estimativa:** 5 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (Q2 2026)

---

## Epic 4: Dashboard Web

### US09 - Explorar Histórico de Publicações
**Como** pesquisador  
**Quero** buscar publicações históricas por palavra-chave  
**Para que** eu possa fazer análises de tendências regulatórias

**Critérios de Aceitação:**
- [ ] Interface web com busca full-text (Supabase FTS)
- [ ] Filtros: data (range), órgão, categoria, impacto
- [ ] Timeline visual com publicações agrupadas por mês
- [ ] Resultados paginados (20 items/página)
- [ ] Export para CSV/Excel

**Estimativa:** 13 story points  
**Prioridade:** Média  
**Status:** ⏳ Backlog (Q2 2026 Sprints 9-10)

---

### US10 - Salvar Publicações Favoritas
**Como** advogado agrário  
**Quero** marcar publicações como favoritas  
**Para que** eu possa referenciá-las rapidamente em casos futuros

**Critérios de Aceitação:**
- [ ] Ícone de "estrela" em cada publicação (web e email)
- [ ] Favoritos salvos em tabela `user_favorites`
- [ ] Página "Meus Favoritos" no dashboard web
- [ ] Limite: 100 favoritos por usuário (free tier)
- [ ] Export de favoritos para PDF

**Estimativa:** 8 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (Q2 2026)

---

## Epic 5: Mobile App

### US11 - Receber Notificações Push
**Como** gestor em campo  
**Quero** receber notificação push no celular para publicações de alto impacto  
**Para que** eu possa agir rapidamente mesmo sem acesso a email

**Critérios de Aceitação:**
- [ ] App React Native para iOS e Android
- [ ] Push via Firebase Cloud Messaging
- [ ] Notificação apenas para items de impacto alto
- [ ] Tocar notificação → abrir publicação no app
- [ ] Configuração: usuário pode desabilitar push

**Estimativa:** 21 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (Q2 2026 Sprints 11-12)

---

### US12 - Ler Boletim Offline
**Como** produtor rural em área remota  
**Quero** poder ler boletins mesmo sem internet  
**Para que** conexão intermitente não me impeça de me informar

**Critérios de Aceitação:**
- [ ] App faz cache das últimas 50 publicações
- [ ] Indicador visual: item já baixado (offline) ou online-only
- [ ] Sincronização automática quando reconectar
- [ ] Modo offline: busca só funciona em items baixados

**Estimativa:** 13 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (Q2 2026)

---

## Epic 6: Monetização

### US13 - Assinar Plano Pago
**Como** gestor agroindustrial  
**Quero** assinar um plano pago para ter acesso a features premium  
**Para que** eu tenha prioridade e funcionalidades avançadas

**Critérios de Aceitação:**
- [ ] Página de pricing: Free (limitado) vs Pro (R$ 49/mês)
- [ ] Integração Mercado Pago para pagamento recorrente
- [ ] Free trial: 7 dias de Pro sem cobrar
- [ ] Webhook: confirmação de pagamento → upgrade automático
- [ ] Portal do assinante: gerenciar pagamento, cancelar assinatura

**Features Pro:**
- Alertas personalizados (ex: "avisar quando sair norma sobre soja")
- Acesso à API pública (1000 requests/dia)
- Export ilimitado (CSV, PDF)
- Suporte prioritário (email em 24h)

**Estimativa:** 21 story points  
**Prioridade:** Alta (para monetização)  
**Status:** ⏳ Backlog (Q3 2026 Sprint 13)

---

### US14 - Gerenciar Assinaturas de Equipe
**Como** diretor de compliance  
**Quero** gerenciar assinaturas para minha equipe (10 pessoas)  
**Para que** todos tenham acesso com um único pagamento

**Critérios de Aceitação:**
- [ ] Plano "Empresarial": R$ 199/mês para até 20 usuários
- [ ] Admin pode adicionar/remover usuários
- [ ] Faturamento único por organização (não por usuário)
- [ ] Nota fiscal automática (integração com contador)
- [ ] Dashboard admin: quem leu boletim, engajamento

**Estimativa:** 21 story points  
**Prioridade:** Média  
**Status:** ⏳ Backlog (Q3 2026 Sprints 14-15)

---

## Epic 7: Inteligência Preditiva

### US15 - Ver Análise de Tendências
**Como** consultor estratégico  
**Quero** ver gráficos de tendências regulatórias (ex: "aumento de 30% em normas fitossanitárias")  
**Para que** eu possa aconselhar clientes sobre mudanças futuras

**Critérios de Aceitação:**
- [ ] Dashboard web: gráficos de linha (publicações por categoria ao longo do tempo)
- [ ] Destaque: categorias com crescimento > 20% no último mês
- [ ] Análise de sentimento: normas estão ficando mais ou menos restritivas?
- [ ] Exportar gráficos como PNG

**Estimativa:** 13 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (Q4 2026 Sprints 17-18)

---

### US16 - Receber Alertas Preditivos
**Como** gerente de compliance  
**Quero** ser alertado quando sistema detectar padrão que sugira nova regulação em breve  
**Para que** eu possa me antecipar e preparar a empresa

**Critérios de Aceitação:**
- [ ] Modelo ML treinado em histórico de 12 meses
- [ ] Alerta via email: "Probabilidade 70% de nova norma sobre agrotóxicos nos próximos 60 dias"
- [ ] Justificativa: "Baseado em consulta pública ANVISA + aumento de 40% em publicações relacionadas"
- [ ] Configuração: usuário define threshold de probabilidade (default 60%)

**Estimativa:** 21 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (Q4 2026)

---

## Epic 8: Integrações

### US17 - Integrar com ERP (SAP, TOTVS)
**Como** gerente de TI  
**Quero** que novas normas criem tarefas automaticamente no nosso ERP  
**Para que** compliance seja integrado ao workflow existente

**Critérios de Aceitação:**
- [ ] API webhook: POST para URL configurável quando nova norma de impacto alto
- [ ] Payload JSON: título, categoria, prazo, link
- [ ] Retry automático se webhook falhar (max 3x)
- [ ] Log de webhooks enviados (auditoria)
- [ ] Documentação: como mapear JSON → task no SAP/TOTVS

**Estimativa:** 13 story points  
**Prioridade:** Média  
**Status:** ⏳ Backlog (Q4 2026 Sprints 19-20)

---

### US18 - Publicar Thread no X/Twitter
**Como** influenciador agrícola  
**Quero** que boletim diário seja publicado automaticamente como thread no X  
**Para que** minha audiência seja informada sem eu precisar copiar/colar manualmente

**Critérios de Aceitação:**
- [ ] Integração X API v2
- [ ] Thread: 1 tweet introdutório + 1 tweet por destaque (max 5)
- [ ] Formato: "🚨 Nova norma sobre [tema]: [resumo 200 chars] [link]"
- [ ] Configuração: usuário autentica conta X via OAuth
- [ ] Opção: publicar só destaques de impacto alto

**Estimativa:** 13 story points  
**Prioridade:** Baixa  
**Status:** ⏳ Backlog (2027)

---

## Backlog Não Priorizado

### US19 - Podcast Semanal
**Como** produtor rural em trânsito  
**Quero** ouvir um podcast semanal com síntese das principais normas  
**Para que** eu possa me informar enquanto dirijo

**Estimativa:** 21 story points  
**Status:** Backlog (2027)

---

### US20 - Chatbot de Perguntas
**Como** advogado  
**Quero** fazer perguntas em linguagem natural (ex: "Quais normas afetam exportação de soja?")  
**Para que** eu não precise filtrar manualmente centenas de publicações

**Estimativa:** 34 story points  
**Status:** Backlog (2027)

---

## Rastreabilidade (User Stories → Requisitos)

| User Story | Requisito(s) | Status |
|------------|--------------|--------|
| US01 | RF01 | ✅ Implementado |
| US02 | RF02 | ⏳ Sprint 1 |
| US03 | - | Backlog Q1 2026 |
| US04 | RF03 | ⏳ Sprint 2 |
| US06 | RF04 | ⏳ Sprint 3 |
| US13 | - | Backlog Q3 2026 |
| US17 | - | Backlog Q4 2026 |

---

**Mantenedores:** Hudson Borges (huddsong@gmail.com, hudsonborges@hb-advisory.com.br)  
**Repositório:** https://github.com/contatohb/Intellicore  
**Última atualização:** 30/10/2025

---

## Novas Histórias (30/10/2025)

### US21 - Benchmark Concorrentes
**Como** gestor de produto  
**Quero** manter um quadro de benchmark atualizado (Move Analytics, Giagro)  
**Para que** o roadmap priorize diferenciais claros do HB Agro Intel

**Critérios de Aceitação:**
- [ ] Seção de concorrência no DDS descreve posicionamento e diferenciais
- [ ] Tabela comparativa armazenada em `docs/`
- [ ] Pelo menos 3 itens de backlog no Roadmap derivados do benchmark

