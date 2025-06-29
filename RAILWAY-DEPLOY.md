
# Deploy no Railway - SIBAL

## Configuração de Deploy

### 1. Criar Dois Serviços no Railway

#### Serviço 1: MCP Server (Backend)
- **Nome**: `sibal-mcp-server`
- **Root Directory**: `mcp-server`
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Port**: `8080`

#### Serviço 2: Frontend (React)
- **Nome**: `sibal-frontend`
- **Root Directory**: `.` (raiz)
- **Build Command**: `npm run build`
- **Start Command**: `npm run preview`

### 2. Variáveis de Ambiente

#### Para o MCP Server:
```
GROQ_API_KEY=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
GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
PORT=8080
NODE_ENV=production
```

#### Para o Frontend:
```
VITE_MCP_URL=https://[SEU-MCP-SERVER-URL].up.railway.app
VITE_LOVABLE_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
NODE_ENV=production
```

### 3. Passos de Deploy

1. **Deploy do MCP Server primeiro**:
   - Configure as variáveis de ambiente
   - Aguarde o deploy completar
   - Copie a URL gerada

2. **Deploy do Frontend**:
   - Use a URL do MCP Server na variável `VITE_MCP_URL`
   - Configure as demais variáveis
   - Deploy

3. **Teste a Integração**:
   - Acesse o frontend
   - Teste a funcionalidade de "Busca Inteligente"
   - Verifique se a IA está respondendo

### 4. Troubleshooting

- **Build falha**: Verifique se está usando o diretório correto
- **MCP não conecta**: Verifique a URL e CORS
- **IA não responde**: Verifique a chave da API Groq
- **Timeout**: Aumentar timeout no Railway (Settings > Deploy)

### 5. Monitoramento

- Logs disponíveis no dashboard do Railway
- Health check: `GET /health` no MCP server
- Teste: `GET /test` no MCP server
