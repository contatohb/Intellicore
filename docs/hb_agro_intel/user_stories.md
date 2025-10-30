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
