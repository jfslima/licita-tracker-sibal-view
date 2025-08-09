// Script para criar um workflow limpo no N8N
const http = require('http');

console.log('🧹 Criando workflow limpo no N8N...');

// Credenciais de autenticação
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQ3MDFmZi1jMTYwLTQ2NmQtOWNjYS1iYWM4M2NiYTAwNjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0MDk0NjcwfQ.TDYHUFUajags-Zie1IBSbGVFyH7z67OBJx6baK300do';

// Função para fazer requisições HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function createCleanWorkflow() {
  try {
    // Workflow limpo e simplificado (sem campo active)
    const cleanWorkflow = {
      name: "SIBAL MCP Real",
      nodes: [
        {
          parameters: {
            httpMethod: "POST",
            path: "mcp",
            responseMode: "responseNode",
            options: {}
          },
          id: "webhook-trigger",
          name: "MCP Webhook",
          type: "n8n-nodes-base.webhook",
          typeVersion: 2,
          position: [240, 300],
          webhookId: "sibal-mcp-server"
        },
        {
          parameters: {
            language: "javaScript",
            jsCode: `// SIBAL MCP Server Implementation
const request = $input.all()[0].json;
const method = request.method || 'unknown';
const params = request.params || {};

// MCP Tools Implementation
const mcpTools = {
  async fetch_notices(args) {
    const { keyword = '', date_from, date_to, status = 'aberta' } = args;
    const notices = [
      {
        id: '001',
        title: \`Licitação para \${keyword || 'equipamentos'}\`,
        description: 'Aquisição de equipamentos para órgão público',
        status: status,
        deadline: '2024-12-31',
        value: 150000,
        organ: 'Prefeitura Municipal',
        modality: 'Pregão Eletrônico',
        created_at: date_from || '2024-01-01'
      }
    ];
    return { success: true, data: notices, total: notices.length };
  },

  async risk_classifier(args) {
    const { notice_id } = args;
    return {
      success: true,
      data: {
        notice_id,
        risk_level: 'MEDIUM',
        score: 65,
        factors: ['Prazo apertado', 'Valor elevado']
      }
    };
  }
};

// MCP Protocol Handler
async function handleMCPRequest(method, params) {
  switch (method) {
    case 'initialize':
      return {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {}, logging: {}, prompts: {} },
        serverInfo: { name: 'sibal-mcp-server', version: '1.0.0' }
      };

    case 'tools/list':
      return {
        tools: [
          {
            name: 'fetch_notices',
            description: 'Buscar editais de licitação no PNCP',
            inputSchema: {
              type: 'object',
              properties: {
                keyword: { type: 'string', description: 'Palavra-chave para busca' },
                date_from: { type: 'string', description: 'Data inicial (YYYY-MM-DD)' },
                date_to: { type: 'string', description: 'Data final (YYYY-MM-DD)' },
                status: { type: 'string', description: 'Status da licitação' }
              }
            }
          },
          {
            name: 'risk_classifier',
            description: 'Classificar risco de uma licitação',
            inputSchema: {
              type: 'object',
              properties: {
                notice_id: { type: 'string', description: 'ID do edital' }
              },
              required: ['notice_id']
            }
          }
        ]
      };

    case 'tools/call':
      const { name: toolName, arguments: toolArgs } = params;
      if (mcpTools[toolName]) {
        const result = await mcpTools[toolName](toolArgs);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }]
        };
      } else {
        return {
          content: [{ type: 'text', text: JSON.stringify({ success: false, error: \`Tool '\${toolName}' not found\` }, null, 2) }],
          isError: true
        };
      }

    default:
      return {
        error: { code: -32601, message: \`Method '\${method}' not found\` }
      };
  }
}

// Main execution
try {
  const response = await handleMCPRequest(method, params);
  return [{
    json: {
      jsonrpc: '2.0',
      id: request.id || 1,
      result: response
    }
  }];
} catch (error) {
  return [{
    json: {
      jsonrpc: '2.0',
      id: request.id || 1,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    }
  }];
}`
          },
          id: "mcp-processor",
          name: "MCP Processor",
          type: "n8n-nodes-base.code",
          typeVersion: 2,
          position: [460, 300]
        },
        {
          parameters: {
            respondWith: "json",
            responseBody: "={{ $json }}",
            options: {
              responseHeaders: {
                entries: [
                  { name: "Content-Type", value: "application/json" },
                  { name: "Access-Control-Allow-Origin", value: "*" },
                  { name: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
                  { name: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" }
                ]
              }
            }
          },
          id: "respond-webhook",
          name: "Respond to Webhook",
          type: "n8n-nodes-base.respondToWebhook",
          typeVersion: 1.5,
          position: [680, 300]
        }
      ],
      connections: {
        "MCP Webhook": {
          main: [[
            { node: "MCP Processor", type: "main", index: 0 }
          ]]
        },
        "MCP Processor": {
          main: [[
            { node: "Respond to Webhook", type: "main", index: 0 }
          ]]
        }
      },
      settings: { executionOrder: "v1" }
    };

    console.log('➕ Criando workflow limpo...');
    const createOptions = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1/workflows',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY
      }
    };
    
    const createResult = await makeRequest(createOptions, cleanWorkflow);
    console.log('Status criação:', createResult.status);
    
    if (createResult.status === 201 || createResult.status === 200) {
      console.log('✅ Workflow criado com sucesso!');
      console.log('ID do novo workflow:', createResult.data.id);
      
      // Ativar o workflow
      console.log('▶️ Ativando workflow...');
      const activateOptions = {
        hostname: 'localhost',
        port: 5678,
        path: `/api/v1/workflows/${createResult.data.id}/activate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': API_KEY
        }
      };
      
      const activateResult = await makeRequest(activateOptions, { active: true });
      console.log('Status ativação:', activateResult.status);
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Testar o webhook
      console.log('🧪 Testando webhook...');
      const testOptions = {
        hostname: 'localhost',
        port: 5678,
        path: '/webhook/mcp',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const testData = {
        method: 'tools/list',
        params: {},
        id: 1,
        jsonrpc: '2.0'
      };
      
      const testResult = await makeRequest(testOptions, testData);
      console.log('Status teste:', testResult.status);
      
      if (testResult.status === 200) {
        console.log('✅ Webhook funcionando corretamente!');
        console.log('🎉 Problema resolvido!');
        console.log('Resposta:', JSON.stringify(testResult.data, null, 2));
      } else {
        console.log('❌ Webhook ainda não está funcionando');
        console.log('Resposta:', testResult.data);
      }
      
    } else {
      console.error('❌ Erro ao criar workflow:', createResult.data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

createCleanWorkflow();