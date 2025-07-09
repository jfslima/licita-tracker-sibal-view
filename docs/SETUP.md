
# Setup do Projeto SIBAL Licita Tracker

## 🚨 PROBLEMA CRÍTICO IDENTIFICADO

O projeto estava com **package-lock.json ausente** na raiz, causando falhas no deploy e execução local.

## ✅ Correções Aplicadas

1. **Estrutura reorganizada**:
   - Frontend: raiz do projeto
   - Backend: `src/backend/`
   - Removidas duplicações entre `packages/` e `src/backend/`

2. **Dependências corrigidas**:
   - Flag `--legacy-peer-deps` para resolver conflitos vite vs lovable-tagger
   - package.json do backend atualizado
   - Configuração do Render otimizada

3. **Scripts de setup criados**:
   - `scripts/setup-project.sh` - configura o projeto localmente
   - Documentação atualizada

## 🔧 Setup Local

```bash
# 1. Dar permissão e executar o script de setup
chmod +x scripts/setup-project.sh
./scripts/setup-project.sh

# 2. Verificar se tudo funcionou
npm run dev  # Frontend
cd src/backend && npm run dev  # Backend (em outro terminal)
```

## 🚀 Deploy no Render

```bash
# 1. Após o setup local, fazer commit
git add .
git commit -m "Fix: Estrutura e dependências do projeto"
git push

# 2. No Render:
# - New + → Blueprint
# - Conectar GitHub
# - Configurar GROQ_API_KEY
# - Deploy automático via render.yaml
```

## 🔍 Verificação

Após o deploy, testar:
- Backend: `https://[backend-url]/health`
- Frontend: `https://[frontend-url]`
- MCP endpoint: `https://[backend-url]/mcp`

## ⚠️ Variáveis de Ambiente Obrigatórias

```bash
# Backend
GROQ_API_KEY=gsk_xxxxxxxxx
PORT=10000
NODE_ENV=production

# Frontend (automático via Render)
VITE_MCP_URL=https://[backend-url]
```
