
# MCP Server - Licita Tracker

Servidor MCP (Model Context Protocol) para integração com APIs de licitações e Groq AI.

## Configuração

1. Copie `.env.example` para `.env`
2. Configure suas variáveis de ambiente:
   ```
   GROQ_API_KEY=sua_chave_groq_aqui
   GROQ_MODEL=meta-llama/llama-4-scout-17b-16e-instruct
   PORT=8080
   ```

## Desenvolvimento

```bash
npm install
npm run dev
```

## Produção

```bash
npm run build
npm start
```

## Endpoints

- `GET /health` - Health check
- `POST /mcp/search_bids` - Buscar licitações
- `POST /mcp/chat` - Chat com IA via Groq

## Docker

```bash
docker build -t mcp-server .
docker run -p 8080:8080 --env-file .env mcp-server
```
