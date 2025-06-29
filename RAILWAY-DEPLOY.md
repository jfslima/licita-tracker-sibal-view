
# Deploy no Railway - SIBAL

## ✅ Status do Deploy

### MCP Server: CONCLUÍDO ✅
- **URL**: https://licita-tracker-sibal-view-production.up.railway.app
- **Status**: Funcionando
- **Endpoints**: /health, /test, /mcp/chat, /mcp/search_bids

### Frontend: PRÓXIMO PASSO 🔄

## Configuração de Deploy

### 1. Criar Dois Serviços no Railway

#### ✅ Serviço 1: MCP Server (Backend) - CONCLUÍDO
- **Nome**: `licita-tracker-sibal-view`
- **URL**: https://licita-tracker-sibal-view-production.up.railway.app
- **Root Directory**: `mcp-server`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Port**: `8080`

#### 🔄 Serviço 2: Frontend (React) - CRIAR AGORA
- **Nome**: `sibal-frontend`
- **Root Directory**: `.` (raiz)
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`

### 2. Variáveis de Ambiente

#### ✅ Para o MCP Server (já configurado):
```
GROQ_API_KEY=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
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
PORT=8080
NODE_ENV=production
```

#### 🔄 Para o Frontend (configurar agora):
```
VITE_MCP_URL=https://licita-tracker-sibal-view-production.up.railway.app
VITE_LOVABLE_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
NODE_ENV=production
```

### 3. Passos de Deploy

1. ✅ **Deploy do MCP Server** - CONCLUÍDO:
   - ✅ Variáveis configuradas
   - ✅ Deploy concluído
   - ✅ URL obtida: https://licita-tracker-sibal-view-production.up.railway.app

2. 🔄 **Deploy do Frontend** - FAZER AGORA:
   - Criar novo serviço no Railway
   - Root Directory: `.` (raiz do projeto)
   - Build Command: `npm run build`
   - Start Command: `npm run preview`
   - Configurar variáveis de ambiente (ver acima)

3. 🔄 **Teste da Integração**:
   - Acessar o frontend
   - Testar "Busca Inteligente"
   - Verificar conexão MCP ↔ IA

### 4. Instruções Detalhadas para Frontend

#### Passo a Passo no Railway:

1. **Criar Novo Serviço**:
   - No dashboard Railway, clique "New Service"
   - Conecte ao mesmo repositório
   - Nome: `sibal-frontend`

2. **Configurar Build**:
   - Root Directory: `.` (deixar vazio = raiz)
   - Build Command: `npm run build`
   - Start Command: `npm run preview`

3. **Variáveis de Ambiente**:
   ```
   VITE_MCP_URL=https://licita-tracker-sibal-view-production.up.railway.app
   VITE_LOVABLE_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   NODE_ENV=production
   ```

4. **Deploy**:
   - Clique "Deploy"
   - Aguarde build completar
   - Obtenha URL do frontend

### 5. Teste Final

Após deploy do frontend, teste:

1. **Conexão MCP**:
   ```
   https://licita-tracker-sibal-view-production.up.railway.app/health
   ```

2. **Frontend**:
   - Acesse a URL gerada do frontend
   - Clique em "Busca Inteligente"
   - Teste pergunta: "Como funciona licitação no Brasil?"

3. **Integração Completa**:
   - Frontend → MCP Server → Groq AI → Resposta

### 6. Troubleshooting

- **Build falha**: Verifique Root Directory (deve ser `.` para frontend)
- **MCP não conecta**: URL correta configurada nas variáveis
- **IA não responde**: Verificar chave Groq no MCP Server
- **CORS**: Já configurado no MCP Server para aceitar todas origens

### 7. Monitoramento

- **MCP Server**: https://licita-tracker-sibal-view-production.up.railway.app/health
- **Logs**: Disponíveis no dashboard Railway
- **Teste Rápido**: https://licita-tracker-sibal-view-production.up.railway.app/test

## 🚀 Próximo Passo

**CRIAR O SERVIÇO FRONTEND NO RAILWAY AGORA!**

Use as configurações acima e o sistema estará completo.
