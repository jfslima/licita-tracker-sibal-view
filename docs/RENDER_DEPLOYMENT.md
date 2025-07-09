
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

# Opcional - Modelo a ser usado (já tem padrão)
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
```

### 4. Aplicar o Blueprint

1. Revise as configurações
2. Clique em **"Apply"**
3. Aguarde o deploy (5-10 minutos)

## 🔧 Deploy Manual (Alternativo)

Se preferir fazer deploy manual de cada serviço:

### Backend (MCP Server)

1. **New +** → **Web Service**
2. **Build Command**: `cd packages/mcp-server && npm install && npm run build`
3. **Start Command**: `cd packages/mcp-server && npm start`
4. **Environment Variables**:
   ```
   NODE_ENV=production
   PORT=10000
   API_KEY=[gerado automaticamente]
   GROQ_API_KEY=[sua chave]
   GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   ```

### Frontend

1. **New +** → **Web Service**
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run preview -- --port $PORT --host 0.0.0.0`
4. **Environment Variables**:
   ```
   NODE_ENV=production
   VITE_MCP_URL=https://[backend-url].onrender.com/mcp
   VITE_MCP_HEADER=api-key
   VITE_MCP_TOKEN=[mesmo valor de API_KEY do backend]
   VITE_LOVABLE_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   ```

## 🏥 Verificação de Saúde

Após o deploy, verifique:

- **Backend Health**: `https://[backend-url].onrender.com/health`
- **Frontend**: `https://[frontend-url].onrender.com`

## 🔍 Troubleshooting

### Erro: "Build failed"
- Verifique se o `package.json` está correto
- Confirme se todas as dependências estão listadas

### Erro: "Service unhealthy"
- Verifique os logs no painel do Render
- Confirme se as variáveis de ambiente estão configuradas

### Erro: "CORS"
- Verifique se o backend está configurado para aceitar requests do frontend
- Confirme a URL do backend no frontend

### Frontend não carrega dados
- Verifique se `VITE_MCP_URL` aponta para o backend correto
- Confirme se `VITE_MCP_TOKEN` tem o mesmo valor de `API_KEY` do backend

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
