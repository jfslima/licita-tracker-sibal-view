
# MCP Server - Licita Tracker

Servidor MCP (Model Context Protocol) para integração com APIs de licitações e Groq AI.

## Configuração Rápida

1. O arquivo `.env` já está configurado com a chave da API Groq
2. Execute os comandos abaixo:

```bash
# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev
```

O servidor estará disponível em `http://localhost:8080`

## Endpoints Disponíveis

- `GET /health` - Health check
- `POST /mcp/search_bids` - Buscar licitações
- `POST /mcp/chat` - Chat com IA via Groq

## Como Usar

1. **Backend**: Na pasta `mcp-server/`, execute `npm run dev`
2. **Frontend**: Na pasta raiz, execute `npm run dev`
3. **Teste**: Acesse a aplicação e clique em "Busca Inteligente"

## Docker (Opcional)

```bash
docker build -t mcp-server .
docker run -p 8080:8080 mcp-server
```
