
# Guia de Deploy no Render - SIBAL Licita Tracker

Este guia explica como fazer o deploy do SIBAL Licita Tracker no Render usando Blueprint.

## 📋 Pré-requisitos

- Conta no [Render](https://render.com)
- Repositório GitHub com o código
- Chave da API Groq (`GROQ_API_KEY`)

## 🚀 Deploy via Blueprint (Recomendado)

### 1. Preparar o Repositório

```bash
# Clone o repositório (se ainda não tiver)
git clone <seu-repositorio>
cd licita-tracker-sibal-view

# Execute o script de preparação
chmod +x scripts/deploy-render.sh
./scripts/deploy-render.sh
```

### 2. Criar o Blueprint no Render

1. Acesse [render.com](https://render.com) e faça login
2. Clique em **"New +"** → **"Blueprint"**
3. Conecte seu repositório GitHub
4. O Render detectará automaticamente o arquivo `render.yaml`

### 3. Configurar Variáveis de Ambiente

Durante o setup do Blueprint, configure:

```bash
# Obrigatório - Sua chave da API Groq
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxx

# Opcional - URL do banco de dados (se usar Prisma)
DATABASE_URL=postgresql://user:password@host:port/database
```

### 4. Aplicar o Blueprint

1. Revise as configurações
2. Clique em **"Apply"**
3. Aguarde o deploy (5-10 minutos)

## 🏗️ Estrutura do Projeto

```
licita-tracker-sibal-view/
├── src/
│   ├── backend/           # Servidor MCP
│   │   ├── src/
│   │   │   └── index.ts   # Servidor principal
│   │   ├── dist/          # Código compilado
│   │   └── tsconfig.json  # Config TypeScript
│   ├── components/        # Componentes React
│   ├── hooks/            # Hooks personalizados
│   └── ...
├── render.yaml           # Configuração do Render
└── package.json          # Dependências principais
```

## 🔧 Comandos de Build

### Backend (MCP Server)
```bash
# Build
npm install && cd src/backend && npx tsc

# Start
cd src/backend && node dist/index.js
```

### Frontend
```bash
# Build
npm install && npm run build

# Start (modo preview)
npm run preview -- --port $PORT --host 0.0.0.0
```

## 🏥 Verificação de Saúde

Após o deploy, verifique:

- **Backend Health**: `https://[backend-url].onrender.com/health`
- **Frontend**: `https://[frontend-url].onrender.com`
- **MCP Endpoint**: `https://[backend-url].onrender.com/mcp`

## 🔍 Troubleshooting

### Erro: "Build failed"
- Verifique se `src/backend/` existe
- Confirme se `tsconfig.json` está correto no backend
- Verifique se todas as dependências estão no `package.json` principal

### Erro: "Service unhealthy"
- Verifique os logs no painel do Render
- Confirme se `GROQ_API_KEY` está configurada
- Teste o endpoint `/health` diretamente

### Erro: "Cannot find module"
- Verifique se as dependências do backend estão instaladas
- Confirme se o TypeScript está compilando corretamente
- Verifique imports relativos vs absolutos

### Frontend não carrega dados
- Verifique se `VITE_MCP_URL` aponta para o backend correto
- Confirme se o backend está respondendo em `/mcp`
- Verifique CORS se necessário

## 📊 Monitoramento

O Render oferece:
- **Logs em tempo real**
- **Métricas de performance**
- **Health checks automáticos**
- **Auto-deploy via GitHub**

## 💰 Custos

- **Plano Starter**: Gratuito (com limitações)
- **Plano Paid**: $7/mês por serviço
- **Sleep automático**: Serviços gratuitos "dormem" após 15min de inatividade

## 🔗 Links Úteis

- [Documentação do Render](https://render.com/docs)
- [Blueprint Reference](https://render.com/docs/blueprint-spec)
- [Environment Variables](https://render.com/docs/environment-variables)
- [Troubleshooting Deploys](https://render.com/docs/troubleshooting-deploys)
