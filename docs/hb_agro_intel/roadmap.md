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
