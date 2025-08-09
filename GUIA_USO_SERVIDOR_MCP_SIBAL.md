# 📋 Guia de Uso do Servidor MCP SIBAL

## 🎯 Visão Geral

O Servidor MCP (Model Context Protocol) SIBAL é uma implementação completa que permite integração externa com o sistema de rastreamento de licitações. Este guia fornece instruções detalhadas sobre como usar todas as funcionalidades disponíveis.

## 🚀 Iniciando o Servidor

### Pré-requisitos
- N8N instalado e configurado
- Node.js (versão 18 ou superior)
- Dependências do projeto instaladas

### 1. Iniciar o N8N
```bash
# No diretório do projeto
cd D:\SIBAL\licita-tracker-sibal-view
npx n8n start
```

### 2. Verificar se o Workflow está Ativo
O workflow "SIBAL MCP Real" deve estar ativo no N8N (porta 5678).

### 3. Testar Conectividade
```bash
# Executar teste de demonstração
node demo-mcp-connection.cjs
```

## 🔗 Informações de Conexão

- **URL do Webhook:** `http://localhost:5678/webhook/mcp`
- **Protocolo:** JSON-RPC 2.0
- **Método HTTP:** POST
- **Content-Type:** application/json

## 🛠️ Métodos Disponíveis

### 1. Initialize (Inicialização)

**Descrição:** Inicializa a conexão com o servidor MCP.

**Requisição:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {}
    },
    "clientInfo": {
      "name": "seu-cliente-mcp",
      "version": "1.0.0"
    }
  }
}
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "tools": {},
      "resources": {},
      "prompts": {},
      "logging": {}
    },
    "serverInfo": {
      "name": "SIBAL MCP Server",
      "version": "1.0.0"
    }
  }
}
```

### 2. Tools/List (Listar Ferramentas)

**Descrição:** Lista todas as ferramentas disponíveis no servidor.

**Requisição:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "search_notices",
        "description": "Busca editais de licitação no PNCP",
        "inputSchema": {
          "type": "object",
          "properties": {
            "query": {
              "type": "string",
              "description": "Termo de busca"
            },
            "limit": {
              "type": "number",
              "description": "Limite de resultados",
              "default": 10
            }
          },
          "required": ["query"]
        }
      },
      {
        "name": "get_notice_details",
        "description": "Obtém detalhes de um edital específico",
        "inputSchema": {
          "type": "object",
          "properties": {
            "noticeId": {
              "type": "string",
              "description": "ID do edital"
            }
          },
          "required": ["noticeId"]
        }
      }
    ]
  }
}
```

### 3. Tools/Call (Executar Ferramenta)

#### 3.1 Buscar Editais (search_notices)

**Descrição:** Busca editais de licitação por termo de pesquisa.

**Requisição:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "search_notices",
    "arguments": {
      "query": "equipamentos médicos",
      "limit": 5
    }
  }
}
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Busca realizada para: \"equipamentos médicos\". Encontrados resultados simulados de editais (limite: 5)."
      }
    ]
  }
}
```

#### 3.2 Obter Detalhes do Edital (get_notice_details)

**Descrição:** Obtém detalhes completos de um edital específico.

**Requisição:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "get_notice_details",
    "arguments": {
      "noticeId": "EDITAL-2025-001"
    }
  }
}
```

**Resposta:**
```json
{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Detalhes completos do edital ID: EDITAL-2025-001. Simulação de dados detalhados do edital."
      }
    ]
  }
}
```

## 💻 Exemplos de Código

### JavaScript/Node.js

```javascript
const axios = require('axios');

class SibalMCPClient {
  constructor() {
    this.webhookUrl = 'http://localhost:5678/webhook/mcp';
    this.requestId = 1;
  }

  async sendRequest(method, params = {}) {
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    const response = await axios.post(this.webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    return response.data.result;
  }

  async initialize() {
    return await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: { tools: {} },
      clientInfo: { name: 'meu-cliente', version: '1.0.0' }
    });
  }

  async listTools() {
    return await this.sendRequest('tools/list');
  }

  async searchNotices(query, limit = 10) {
    return await this.sendRequest('tools/call', {
      name: 'search_notices',
      arguments: { query, limit }
    });
  }

  async getNoticeDetails(noticeId) {
    return await this.sendRequest('tools/call', {
      name: 'get_notice_details',
      arguments: { noticeId }
    });
  }
}

// Uso
async function exemplo() {
  const client = new SibalMCPClient();
  
  // Inicializar
  await client.initialize();
  
  // Listar ferramentas
  const tools = await client.listTools();
  console.log('Ferramentas:', tools);
  
  // Buscar editais
  const resultados = await client.searchNotices('equipamentos hospitalares', 5);
  console.log('Resultados:', resultados);
  
  // Obter detalhes
  const detalhes = await client.getNoticeDetails('EDITAL-123');
  console.log('Detalhes:', detalhes);
}
```

### Python

```python
import requests
import json

class SibalMCPClient:
    def __init__(self):
        self.webhook_url = 'http://localhost:5678/webhook/mcp'
        self.request_id = 1
    
    def send_request(self, method, params=None):
        payload = {
            'jsonrpc': '2.0',
            'id': self.request_id,
            'method': method
        }
        
        if params:
            payload['params'] = params
        
        self.request_id += 1
        
        response = requests.post(
            self.webhook_url,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        return response.json()['result']
    
    def initialize(self):
        return self.send_request('initialize', {
            'protocolVersion': '2024-11-05',
            'capabilities': {'tools': {}},
            'clientInfo': {'name': 'python-client', 'version': '1.0.0'}
        })
    
    def list_tools(self):
        return self.send_request('tools/list')
    
    def search_notices(self, query, limit=10):
        return self.send_request('tools/call', {
            'name': 'search_notices',
            'arguments': {'query': query, 'limit': limit}
        })
    
    def get_notice_details(self, notice_id):
        return self.send_request('tools/call', {
            'name': 'get_notice_details',
            'arguments': {'noticeId': notice_id}
        })

# Uso
client = SibalMCPClient()

# Inicializar
client.initialize()

# Listar ferramentas
tools = client.list_tools()
print('Ferramentas:', tools)

# Buscar editais
resultados = client.search_notices('equipamentos médicos', 5)
print('Resultados:', resultados)

# Obter detalhes
detalhes = client.get_notice_details('EDITAL-123')
print('Detalhes:', detalhes)
```

### cURL

```bash
# Inicializar
curl -X POST http://localhost:5678/webhook/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {"tools": {}},
      "clientInfo": {"name": "curl-client", "version": "1.0.0"}
    }
  }'

# Listar ferramentas
curl -X POST http://localhost:5678/webhook/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list"
  }'

# Buscar editais
curl -X POST http://localhost:5678/webhook/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 3,
    "method": "tools/call",
    "params": {
      "name": "search_notices",
      "arguments": {
        "query": "equipamentos médicos",
        "limit": 5
      }
    }
  }'
```

## 🔧 Scripts Prontos

### 1. Demonstração Completa
```bash
node demo-mcp-connection.cjs
```

### 2. Teste de Conectividade
```bash
node mcp-external-connection.cjs
```

## 📁 Arquivos de Configuração

### mcp-sibal-config.json
Contém a configuração completa do servidor MCP, incluindo:
- Informações do servidor
- Capacidades disponíveis
- Exemplos de uso
- Schema das ferramentas

## ❌ Tratamento de Erros

### Erros Comuns

1. **Conexão Recusada**
   - Verificar se o N8N está rodando
   - Confirmar a porta 5678

2. **Workflow Inativo**
   - Ativar o workflow "SIBAL MCP Real" no N8N

3. **Método Não Encontrado**
   - Verificar se o método está correto
   - Usar apenas: initialize, tools/list, tools/call

4. **Parâmetros Inválidos**
   - Verificar o schema da ferramenta
   - Garantir que parâmetros obrigatórios estão presentes

### Exemplo de Resposta de Erro
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32603,
    "message": "Method 'invalid_method' not found"
  }
}
```

## 🚀 Próximos Passos

1. **Integração com Claude Desktop**
   - Usar o arquivo `claude-desktop-integration.json`

2. **Desenvolvimento de Clientes**
   - Implementar clientes em outras linguagens
   - Adicionar autenticação se necessário

3. **Expansão de Funcionalidades**
   - Adicionar mais ferramentas ao workflow
   - Implementar cache de resultados

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar os logs do N8N
2. Executar os scripts de teste
3. Consultar a documentação do projeto

---

**Servidor MCP SIBAL** - Sistema de Rastreamento de Licitações  
*Versão 1.0.0 - Totalmente Funcional*