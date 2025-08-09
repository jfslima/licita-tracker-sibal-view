const axios = require('axios');

const N8N_API_BASE = 'http://localhost:5678/api/v1';
const WORKFLOW_ID = 'eXDL8aTRag0NJ1KR';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQ3MDFmZi1jMTYwLTQ2NmQtOWNjYS1iYWM4M2NiYTAwNjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0MDk0NjcwfQ.TDYHUFUajags-Zie1IBSbGVFyH7z67OBJx6baK300do';

// Configurar headers com API key
const headers = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json'
};

async function fixWebhookConfig() {
  try {
    console.log('🔧 Verificando e corrigindo configuração do webhook...');
    
    // Obter o workflow atual
    const workflowResponse = await axios.get(`${N8N_API_BASE}/workflows/${WORKFLOW_ID}`, { headers });
    const workflow = workflowResponse.data;
    
    console.log('📋 Workflow obtido:', workflow.name);
    
    // Encontrar o nó MCP Webhook
    const webhookNode = workflow.nodes.find(node => node.name === 'MCP Webhook');
    
    if (!webhookNode) {
      throw new Error('Nó MCP Webhook não encontrado');
    }
    
    console.log('🎯 Configuração atual do webhook:');
    console.log(JSON.stringify(webhookNode.parameters, null, 2));
    
    // Atualizar configuração do webhook para garantir que passa dados JSON corretamente
    webhookNode.parameters = {
      httpMethod: 'POST',
      path: 'mcp',
      responseMode: 'responseNode',
      options: {
        binaryPropertyOutput: 'data',
        ignoreBots: false,
        lowercaseHeaders: false,
        allowedOrigins: '*'
      }
    };
    
    console.log('🔄 Nova configuração do webhook:');
    console.log(JSON.stringify(webhookNode.parameters, null, 2));
    
    // Encontrar o nó MCP Processor e atualizar com código que verifica melhor os dados
    const mcpProcessorNode = workflow.nodes.find(node => node.name === 'MCP Processor');
    
    if (!mcpProcessorNode) {
      throw new Error('Nó MCP Processor não encontrado');
    }
    
    // Código JavaScript que verifica todas as possíveis localizações dos dados
    const improvedJsCode = `
// Código MCP Processor - versão melhorada para debug
console.log('=== DEBUG COMPLETO: Dados recebidos ===');
console.log('$json completo:', JSON.stringify($json, null, 2));
console.log('Tipo de $json:', typeof $json);
console.log('Keys de $json:', Object.keys($json || {}));

// Verificar todas as possíveis localizações dos dados
let method, params, id;

// Tentar extrair diretamente do $json
if ($json.method) {
  console.log('=== Dados encontrados diretamente em $json ===');
  method = $json.method;
  params = $json.params || {};
  id = $json.id || 1;
} 
// Tentar extrair do body
else if ($json.body && typeof $json.body === 'object') {
  console.log('=== Dados encontrados em $json.body ===');
  const bodyData = typeof $json.body === 'string' ? JSON.parse($json.body) : $json.body;
  method = bodyData.method;
  params = bodyData.params || {};
  id = bodyData.id || 1;
}
// Tentar extrair do query
else if ($json.query && typeof $json.query === 'object') {
  console.log('=== Dados encontrados em $json.query ===');
  method = $json.query.method;
  params = $json.query.params || {};
  id = $json.query.id || 1;
}
// Se $json é uma string, tentar fazer parse
else if (typeof $json === 'string') {
  console.log('=== $json é string, tentando parse ===');
  try {
    const parsedData = JSON.parse($json);
    method = parsedData.method;
    params = parsedData.params || {};
    id = parsedData.id || 1;
  } catch (e) {
    console.log('Erro ao fazer parse de $json como string:', e.message);
  }
}
// Verificar se os dados estão em um nível mais profundo
else {
  console.log('=== Procurando dados em níveis mais profundos ===');
  // Procurar recursivamente por method
  function findMethod(obj, path = '') {
    if (typeof obj !== 'object' || obj === null) return null;
    
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? \`\${path}.\${key}\` : key;
      
      if (key === 'method' && typeof value === 'string') {
        console.log(\`Method encontrado em: \${currentPath}\`);
        return { method: value, parent: obj, path: currentPath };
      }
      
      if (typeof value === 'object' && value !== null) {
        const result = findMethod(value, currentPath);
        if (result) return result;
      }
    }
    return null;
  }
  
  const methodResult = findMethod($json);
  if (methodResult) {
    method = methodResult.method;
    params = methodResult.parent.params || {};
    id = methodResult.parent.id || 1;
    console.log(\`Dados extraídos de: \${methodResult.path}\`);
  }
}

console.log('=== DEBUG: Valores finais extraídos ===');
console.log('method:', method);
console.log('params:', JSON.stringify(params, null, 2));
console.log('id:', id);

if (!method) {
  console.log('=== ERRO: Method não encontrado ===');
  console.log('Estrutura completa de $json:');
  console.log(JSON.stringify($json, null, 2));
  throw new Error('Method not found in request data');
}

try {
  let result;
  
  switch (method) {
    case 'initialize':
      console.log('=== Processando initialize ===');
      result = {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
          logging: {}
        },
        serverInfo: {
          name: 'SIBAL MCP Server',
          version: '1.0.0'
        }
      };
      break;
      
    case 'tools/list':
      console.log('=== Processando tools/list ===');
      result = {
        tools: [
          {
            name: 'search_notices',
            description: 'Busca editais de licitação no PNCP',
            inputSchema: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Termo de busca' },
                limit: { type: 'number', description: 'Limite de resultados', default: 10 }
              },
              required: ['query']
            }
          },
          {
            name: 'get_notice_details',
            description: 'Obtém detalhes de um edital específico',
            inputSchema: {
              type: 'object',
              properties: {
                noticeId: { type: 'string', description: 'ID do edital' }
              },
              required: ['noticeId']
            }
          }
        ]
      };
      break;
      
    case 'tools/call':
      console.log('=== Processando tools/call ===');
      console.log('params completo:', JSON.stringify(params, null, 2));
      
      const toolName = params.name;
      const toolArgs = params.arguments || {};
      
      console.log('toolName extraído:', toolName);
      console.log('toolArgs extraído:', JSON.stringify(toolArgs, null, 2));
      
      if (!toolName) {
        throw new Error('Tool name is required in params.name');
      }
      
      if (toolName === 'search_notices') {
        console.log('=== Executando search_notices ===');
        result = {
          content: [
            {
              type: 'text',
              text: \`Busca realizada para: "\${toolArgs.query || 'termo não especificado'}". Encontrados resultados simulados de editais (limite: \${toolArgs.limit || 10}).\`
            }
          ]
        };
      } else if (toolName === 'get_notice_details') {
        console.log('=== Executando get_notice_details ===');
        result = {
          content: [
            {
              type: 'text',
              text: \`Detalhes completos do edital ID: \${toolArgs.noticeId || 'ID não especificado'}. Simulação de dados detalhados do edital.\`
            }
          ]
        };
      } else {
        throw new Error(\`Tool '\${toolName}' not found. Available tools: search_notices, get_notice_details\`);
      }
      break;
      
    default:
      console.log('=== Método não encontrado ===');
      console.log('Method recebido:', method);
      throw new Error(\`Method '\${method}' not found. Available methods: initialize, tools/list, tools/call\`);
  }
  
  console.log('=== DEBUG: Resultado gerado ===');
  console.log('result:', JSON.stringify(result, null, 2));
  
  const response = [{
    json: {
      jsonrpc: '2.0',
      id: id,
      result: result
    }
  }];
  
  console.log('=== DEBUG: Resposta final ===');
  console.log('response:', JSON.stringify(response, null, 2));
  
  return response;
  
} catch (error) {
  console.log('=== DEBUG: Erro capturado ===');
  console.log('error.message:', error.message);
  console.log('error.stack:', error.stack);
  
  const errorResponse = [{
    json: {
      jsonrpc: '2.0',
      id: id || 1,
      error: {
        code: -32603,
        message: error.message
      }
    }
  }];
  
  console.log('=== DEBUG: Resposta de erro ===');
  console.log('errorResponse:', JSON.stringify(errorResponse, null, 2));
  
  return errorResponse;
}
`;
    
    // Atualizar o código JavaScript do MCP Processor
    mcpProcessorNode.parameters.jsCode = improvedJsCode;
    
    // Preparar dados para atualização
    const updateData = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
    };
    
    // Atualizar o workflow
    const updateResponse = await axios.put(`${N8N_API_BASE}/workflows/${WORKFLOW_ID}`, updateData, { headers });
    
    console.log('✅ Webhook e MCP Processor atualizados!');
    
    // Testar novamente
    console.log('🧪 Testando configuração corrigida...');
    
    const testPayload = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'search_notices',
        arguments: {
          query: 'teste webhook corrigido',
          limit: 3
        }
      },
      id: 1
    };
    
    const webhookUrl = 'http://localhost:5678/webhook/mcp';
    const testResponse = await axios.post(webhookUrl, testPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('📊 Resposta do teste final:', JSON.stringify(testResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Executar a correção
fixWebhookConfig();