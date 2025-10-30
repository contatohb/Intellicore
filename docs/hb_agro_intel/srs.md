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
