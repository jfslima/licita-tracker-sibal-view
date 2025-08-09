
# 🏛️ SIBAL Licita Tracker

Sistema de visualização e análise inteligente de licitações do SIBAL (Sistema de Informações sobre Licitações) com **MCP Unificado 2.0** - Powered by AI.

## 🚀 Novidades da Versão 2.0

### ✨ MCP Unificado com IA
- **6 ferramentas especializadas** para análise de licitações
- **Integração com Groq AI** (Llama-3.1-70b-versatile)
- **Busca semântica avançada** com processamento de linguagem natural
- **Classificação de risco automatizada** usando machine learning
- **Resumos inteligentes** de editais complexos
- **Processamento de documentos** (PDF, DOCX, XLSX)
- **Insights estratégicos** para propostas
- **Monitoramento proativo** de prazos

### 🏗️ Arquitetura Moderna
- **Edge Functions** no Supabase para máxima performance
- **Protocol MCP 1.0** para integração com ferramentas de IA
- **Schema otimizado** com RLS e índices avançados
- **Cache inteligente** para reduzir latência
- **Fallbacks robustos** para alta disponibilidade

## 🧠 MCP Unificado - Ferramentas de IA

### 🔍 fetch_notices
Busca avançada de editais com filtros semânticos e IA.
```typescript
const { notices, stats } = await fetchNotices({
  query: 'desenvolvimento de software',
  organ: 'Prefeitura Municipal',
  min_value: 100000,
  max_value: 500000
});
```

### ⚠️ risk_classifier
Classificação automática de risco usando machine learning.
```typescript
const riskAnalysis = await classifyRisk(noticeId);
// Retorna: risk_level, risk_score, factors, recommendations
```

### 📄 summarize_notice
Resumos inteligentes de editais complexos.
```typescript
const summary = await summarizeNotice(noticeId);
// Retorna: key_points, requirements, opportunities, timeline
```

### 📎 process_document
Processamento automático de documentos (PDF, DOCX, XLSX).
```typescript
const result = await processDocument(noticeId, documentUrl, 'edital');
// Extrai: texto, tabelas, requisitos, datas, valores
```

### 💡 generate_proposal_insights
Insights estratégicos personalizados para propostas.
```typescript
const insights = await generateProposalInsights(noticeId, companyProfile);
// Retorna: win_probability, strategies, recommendations
```

### ⏰ monitor_deadlines
Monitoramento proativo de prazos com alertas inteligentes.
```typescript
const monitoring = await monitorDeadlines(companyId, 30);
// Retorna: alerts, recommendations, calendar_events
```

## 🚀 Deploy do MCP Unificado

### Migração Automática
```powershell
# Deploy completo com um comando
.\scripts\deploy-mcp-unified.ps1

# Ou com opções específicas
.\scripts\deploy-mcp-unified.ps1 -Environment production -SkipSecrets
```

### Testes de Validação
```powershell
# Executar todos os testes
.\scripts\test-mcp-unified.ps1

# Testes com relatório detalhado
.\scripts\test-mcp-unified.ps1 -Verbose -ProjectUrl https://your-project.supabase.co
```

## 🚨 SETUP OBRIGATÓRIO

### 1. Configurar Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Linkar projeto
supabase link --project-ref YOUR_PROJECT_REF

# Aplicar migrações do MCP Unificado
supabase db push

# Deploy da nova Edge Function MCP
supabase functions deploy mcp
```

### 2. Configurar Variáveis de Ambiente do MCP

```bash
# Variáveis obrigatórias para o MCP Unificado
supabase secrets set GROQ_API_KEY="your_groq_api_key_here"

# Variáveis opcionais (com valores padrão)
supabase secrets set MCP_LOG_LEVEL="info"
supabase secrets set MCP_RATE_LIMIT="100"
supabase secrets set MCP_TIMEOUT="30000"
supabase secrets set MCP_CACHE_TTL="3600"

# Para desenvolvimento local
cp .env.example .env.local
# Edite .env.local com suas chaves
```

**IMPORTANTE**: Este projeto estava com problemas críticos de estrutura e dependências. Execute o setup antes de usar:

```bash
# 1. Clone o repositório
git clone <seu-repositorio>
cd licita-tracker-sibal-view

# 2. Execute o setup automático
chmod +x scripts/setup-project.sh
./scripts/setup-project.sh

# 3. Inicie o desenvolvimento
npm run dev
```

## 🏗️ Arquitetura

```
licita-tracker-sibal-view/
├── src/
│   ├── backend/           # 🔧 MCP Server (Node.js + TypeScript)
│   │   ├── src/index.ts   # Servidor principal
│   │   ├── package.json   # Dependências do backend
│   │   └── tsconfig.json  # Config TypeScript
│   ├── components/        # ⚛️ Componentes React
│   ├── hooks/            # 🪝 Hooks personalizados  
│   └── pages/            # 📄 Páginas da aplicação
├── render.yaml           # 🚀 Config deploy Render
└── package.json          # 📦 Dependências principais
```

## 🚀 Deploy no Render

Após executar o setup local:

1. **Commit das correções**:
```bash
git add .
git commit -m "Fix: Setup completo do projeto"
git push
```

2. **Deploy via Blueprint**:
   - Vá para [render.com](https://render.com)
   - **New +** → **Blueprint**
   - Conecte seu repositório GitHub
   - Configure `GROQ_API_KEY` no painel
   - Deploy automático!

## 🤖 Serviço N8N - Automação de Workflows

### Iniciar N8N
```bash
# Subir serviço n8n
pnpm n8n:dev

# Acessar interface
# URL: http://localhost:5678
# Usuário: sibal
# Senha: SibalN8n2024!@#$
```

### Workflows Disponíveis
- **🚨 Alerta High Risk**: Monitora editais de alto risco (executa a cada 15min)
- **📊 Relatórios Automáticos**: Gera relatórios periódicos
- **🔔 Notificações Telegram**: Alertas em tempo real

### Comandos N8N
```bash
pnpm n8n:dev      # Iniciar serviço
pnpm n8n:stop     # Parar serviço
pnpm n8n:logs     # Ver logs
pnpm n8n:restart  # Reiniciar
```

**Documentação completa**: [packages/n8n/README.md](./packages/n8n/README.md)

## 🔧 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + TypeScript + Fastify + MCP Protocol
- **IA**: Groq API (Meta Llama)
- **Automação**: N8N (Workflows e alertas)
- **Deploy**: Render (via Blueprint)
- **Monitoramento**: Health checks automáticos

## 📊 Funcionalidades

- 🤖 **Chat IA Avançado** - Análise inteligente de licitações
- 🔍 **Busca Semântica** - Encontre licitações similares
- 📈 **Dashboard Analytics** - Métricas e insights
- 🏛️ **Integração SIBAL** - Dados oficiais do governo
- 📋 **Análise de Viabilidade** - IA avalia adequação da empresa
- 💼 **Gestão de Propostas** - Acompanhamento completo

## 🔗 Links Úteis

- [Documentação Render](https://render.com/docs/blueprint-spec)
- [Setup Troubleshooting](./docs/SETUP.md)
- [Deploy Guide](./docs/RENDER_DEPLOYMENT.md)

## ⚡ Desenvolvimento

```bash
# Frontend (desenvolvimento)
npm run dev

# Backend (desenvolvimento) 
cd src/backend && npm run dev

# Build completo
npm run build && cd src/backend && npm run build
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique se executou `scripts/setup-project.sh`
2. Confirme que `package-lock.json` existe na raiz
3. Consulte `docs/SETUP.md` para detalhes

---

**Projeto desenvolvido com Lovable AI + Render Platform**
