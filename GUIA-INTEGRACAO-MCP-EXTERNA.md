# 🔌 Guia de Integração MCP Externa - Projeto SIBAL

## 📋 Visão Geral

Este guia demonstra como conectar clientes MCP externos ao sistema SIBAL de rastreamento de licitações através do webhook N8N configurado.

## 🌐 Endpoint MCP

**URL do Webhook:** `http://localhost:5678/webhook/mcp`
**Protocolo:** JSON-RPC 2.0
**Método HTTP:** POST

## 🛠️ Ferramentas Disponíveis

### 1. `search_notices`
**Descrição:** Buscar editais de licitação por critérios

**Parâmetros:**
- `query` (string, obrigatório): Termo de busca
- `limit` (number, opcional): Limite de resultados (padrão: 10)
- `category` (string, opcional): Categoria do edital
- `dateFrom` (string, opcional): Data inicial (YYYY-MM-DD)
- `dateTo` (string, opcional): Data final (YYYY-MM-DD)

**Exemplo de uso:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "search_notices",
    "arguments": {
      "query": "equipamentos médicos",
      "limit": 5,
      "category": "saúde"
    }
  },
  "id": 1
}
```

### 2. `get_notice_details`
**Descrição:** Obter detalhes completos de um edital específico

**Parâmetros:**
- `noticeId` (string, obrigatório): ID do edital

**Exemplo de uso:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_notice_details",
    "arguments": {
      "noticeId": "EDITAL-2025-001"
    }
  },
  "id": 2
}
```

## 🔧 Configuração para Claude Desktop

### 1. Localizar arquivo de configuração

**Windows:**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**macOS:**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Linux:**
```
~/.config/Claude/claude_desktop_config.json
```

### 2. Adicionar configuração SIBAL

```json
{
  "mcpServers": {
    "sibal-licita-tracker": {
      "command": "node",
      "args": [
        "d:\\SIBAL\\licita-tracker-sibal-view\\mcp-external-connection.cjs"
      ],
      "env": {
        "SIBAL_WEBHOOK_URL": "http://localhost:5678/webhook/mcp",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## 🚀 Configuração para Outros Clientes MCP

### Continue (VS Code)

**Arquivo:** `.continue/config.json`

```json
{
  "mcpServers": [
    {
      "name": "sibal-licita-tracker",
      "command": "node",
      "args": ["d:\\SIBAL\\licita-tracker-sibal-view\\mcp-external-connection.cjs"],
      "env": {
        "SIBAL_WEBHOOK_URL": "http://localhost:5678/webhook/mcp"
      }
    }
  ]
}
```

### Cursor

**Arquivo:** `.cursor/mcp_config.json`

```json
{
  "servers": {
    "sibal-licita-tracker": {
      "command": "node",
      "args": ["d:\\SIBAL\\licita-tracker-sibal-view\\mcp-external-connection.cjs"],
      "env": {
        "SIBAL_WEBHOOK_URL": "http://localhost:5678/webhook/mcp"
      }
    }
  }
}
```

## 📝 Exemplo de Cliente Personalizado

```javascript
const { SibalMCPClient } = require('./mcp-external-connection.cjs');

async function exemploUso() {
  const client = new SibalMCPClient('http://localhost:5678/webhook/mcp');
  
  // Inicializar
  await client.initialize();
  
  // Listar ferramentas
  const tools = await client.listTools();
  
  // Buscar editais
  const resultados = await client.searchNotices('equipamentos médicos', {
    limit: 10,
    category: 'saúde'
  });
  
  // Obter detalhes
  const detalhes = await client.getNoticeDetails('EDITAL-2025-001');
}
```

## 🔍 Métodos de Protocolo Suportados

### 1. `initialize`
**Descrição:** Inicializar conexão MCP

```json
{
  "jsonrpc": "2.0",
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": { "tools": {} },
    "clientInfo": {
      "name": "meu-cliente",
      "version": "1.0.0"
    }
  },
  "id": 1
}
```

### 2. `tools/list`
**Descrição:** Listar ferramentas disponíveis

```json
{
  "jsonrpc": "2.0",
  "method": "tools/list",
  "id": 2
}
```

### 3. `tools/call`
**Descrição:** Executar uma ferramenta específica

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "nome_da_ferramenta",
    "arguments": {
      "parametro1": "valor1",
      "parametro2": "valor2"
    }
  },
  "id": 3
}
```

## ⚙️ Pré-requisitos

1. **N8N rodando:** `http://localhost:5678`
2. **Workflow MCP ativo** no N8N
3. **Node.js** instalado para clientes JavaScript
4. **Conectividade de rede** para localhost:5678

## 🧪 Teste de Conectividade

```bash
# Testar se o webhook está respondendo
curl -X POST http://localhost:5678/webhook/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "initialize",
    "id": 1
  }'
```

## 🔧 Solução de Problemas

### Erro: "ECONNREFUSED"
- **Causa:** N8N não está rodando
- **Solução:** Iniciar N8N com `npm run dev` ou `n8n start`

### Erro: "Method not found"
- **Causa:** Método inválido ou workflow inativo
- **Solução:** Verificar se o workflow MCP está ativo no N8N

### Erro: "Tool not found"
- **Causa:** Nome da ferramenta incorreto
- **Solução:** Usar `tools/list` para ver ferramentas disponíveis

## 📚 Recursos Adicionais

- **Documentação MCP:** https://modelcontextprotocol.io/
- **Especificação JSON-RPC 2.0:** https://www.jsonrpc.org/specification
- **N8N Documentation:** https://docs.n8n.io/

## 🎯 Casos de Uso

1. **Assistentes IA:** Integrar busca de licitações em conversas
2. **Automação:** Monitoramento automático de editais
3. **Dashboards:** Exibição de dados em tempo real
4. **APIs:** Proxy para outros sistemas
5. **Relatórios:** Geração automática de relatórios

---

**Status:** ✅ Funcional e testado
**Versão:** 1.0.0
**Última atualização:** $(Get-Date -Format "yyyy-MM-dd")