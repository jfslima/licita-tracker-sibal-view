
# Backend MCP Server

Este é o servidor MCP (Model Context Protocol) construído com Fastify, Prisma e integração com Groq AI.

## Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (`src/backend/.env`) com:

```env
DATABASE_URL="postgresql://usuario:senha@localhost:5432/sibal_db"
GROQ_API_KEY="sua_chave_groq_aqui"
JWT_SECRET="sua_chave_jwt_secreta"
PORT=3000
```

### 2. Configurar Banco de Dados

```bash
# Instalar dependências
cd src/backend
npm install

# Configurar Prisma
npx prisma generate
npx prisma db push

# Ou executar migrações
npx prisma migrate deploy
```

### 3. Executar em Desenvolvimento

```bash
# Na raiz do projeto
pnpm dev:backend

# Ou diretamente no backend
cd src/backend
npm run dev
```

### 4. Build para Produção

```bash
# Na raiz do projeto
pnpm build:backend

# Executar
cd src/backend
npm start
```

## Endpoints Disponíveis

- `GET /health` - Health check do servidor
- `POST /mcp` - Endpoint principal do MCP
- `GET /mcp?capabilities=1` - Verificar capacidades do servidor

## Ferramentas MCP Disponíveis

### bid_summary
Gera resumo de editais de licitação.

**Parâmetros:**
- `text` (string): Texto do edital

### bid_analysis
Analisa viabilidade de participação em licitação.

**Parâmetros:**
- `text` (string): Texto do edital
- `company_profile` (string): Perfil da empresa

### Recursos Disponíveis

### licitations
Lista licitações do banco de dados.

**Parâmetros:**
- `query` (string, opcional): Termo de busca

## Testes

### Via curl:

```bash
# Health check
curl -X GET http://localhost:3000/health

# Capacidades MCP
curl -X GET "http://localhost:3000/mcp?capabilities=1"

# Chamar ferramenta
curl -X POST http://localhost:3000/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc":"2.0",
    "id":1,
    "method":"tools/call",
    "params":{
      "name":"bid_summary",
      "arguments":{"text":"Texto do edital aqui..."}
    }
  }'
```

### Via Interface React

Use o componente `McpTestPanel` incluído no projeto para testar as funcionalidades via interface gráfica.
