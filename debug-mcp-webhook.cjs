const axios = require('axios');

const N8N_API_BASE = 'http://localhost:5678/api/v1';
const WORKFLOW_ID = 'eXDL8aTRag0NJ1KR';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQ3MDFmZi1jMTYwLTQ2NmQtOWNjYS1iYWM4M2NiYTAwNjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0MDk0NjcwfQ.TDYHUFUajags-Zie1IBSbGVFyH7z67OBJx6baK300do';

// Configurar headers com API key
const headers = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json'
};

// Código JavaScript com logs de debug para o nó MCP Processor
const debugJsCode = `
// Código MCP Processor com logs de debug
console.log('=== DEBUG: Dados recebidos ===');
console.log('$json completo:', JSON.stringify($json, null, 2));
console.log('Tipo de $json:', typeof $json);
console.log('Keys de $json:', Object.keys($json || {}));

// Verificar se os dados estão no body
if ($json.body) {
  console.log('$json.body:', JSON.stringify($json.body, null, 2));
}

// Verificar se os dados estão no query
if ($json.query) {
  console.log('$json.query:', JSON.stringify($json.query, null, 2));
}

// Verificar headers
if ($json.headers) {
  console.log('$json.headers:', JSON.stringify($json.headers, null, 2));
}

// Tentar extrair method de diferentes locais
let method = $json.method || ($json.body && $json.body.method) || ($json.query && $json.query.method);
let params = $json.params || ($json.body && $json.body.params) || ($json.query && $json.query.params) || {};
let id = $json.id || ($json.body && $json.body.id) || ($json.query && $json.query.id) || 1;

console.log('=== DEBUG: Valores extraídos ===');
console.log('method:', method);
console.log('params:', JSON.stringify(params, null, 2));
console.log('id:', id);

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
      const toolName = params.name;
      const toolArgs = params.arguments || {};
      
      if (toolName === 'search_notices') {
        result = {
          content: [
            {
              type: 'text',
              text: \`Busca realizada para: \${toolArgs.query}. Simulação de resultados de editais.\`
            }
          ]
        };
      } else if (toolName === 'get_notice_details') {
        result = {
          content: [
            {
              type: 'text',
              text: \`Detalhes do edital \${toolArgs.noticeId}: Simulação de detalhes completos.\`
            }
          ]
        };
      } else {
        throw new Error(\`Tool '\${toolName}' not found\`);
      }
      break;
      
    default:
      console.log('=== Método não encontrado ===');
      console.log('Method recebido:', method);
      throw new Error(\`Method '\${method}' not found\`);
  }
  
  console.log('=== DEBUG: Resultado gerado ===');
  console.log('result:', JSON.stringify(result, null, 2));
  
  // Retorna o resultado no formato correto
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
  
  // Retorna erro no formato correto
  const errorResponse = [{
    json: {
      jsonrpc: '2.0',
      id: id,
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

async function updateMCPProcessorWithDebug() {
  try {
    console.log('🔧 Atualizando MCP Processor com logs de debug...');
    
    // Obter o workflow atual
    const workflowResponse = await axios.get(`${N8N_API_BASE}/workflows/${WORKFLOW_ID}`, { headers });
    const workflow = workflowResponse.data;
    
    console.log('📋 Workflow obtido:', workflow.name);
    
    // Encontrar o nó MCP Processor
    const mcpProcessorNode = workflow.nodes.find(node => node.name === 'MCP Processor');
    
    if (!mcpProcessorNode) {
      throw new Error('Nó MCP Processor não encontrado');
    }
    
    console.log('🎯 Nó encontrado:', mcpProcessorNode.name);
    
    // Atualizar o código JavaScript com debug
    mcpProcessorNode.parameters.jsCode = debugJsCode;
    
    // Preparar dados para atualização
    const updateData = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
    };
    
    // Atualizar o workflow
    const updateResponse = await axios.put(`${N8N_API_BASE}/workflows/${WORKFLOW_ID}`, updateData, { headers });
    
    console.log('✅ MCP Processor atualizado com logs de debug!');
    
    // Testar o webhook
    console.log('🧪 Testando webhook com debug...');
    
    const testPayload = {
      jsonrpc: '2.0',
      method: 'initialize',
      id: 1
    };
    
    const webhookUrl = 'http://localhost:5678/webhook/mcp';
    const testResponse = await axios.post(webhookUrl, testPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('📊 Resposta do teste:', JSON.stringify(testResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Executar a atualização
updateMCPProcessorWithDebug();