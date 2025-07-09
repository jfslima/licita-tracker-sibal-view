
# 🏛️ SIBAL Licita Tracker

Sistema inteligente para análise e acompanhamento de licitações com IA avançada.

## 🚨 SETUP OBRIGATÓRIO

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

## 🔧 Tecnologias

- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Node.js + TypeScript + Fastify + MCP Protocol
- **IA**: Groq API (Meta Llama)
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
