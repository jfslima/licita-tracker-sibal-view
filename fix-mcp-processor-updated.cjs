const axios = require('axios');

const N8N_API_BASE = 'http://localhost:5678/api/v1';
const WORKFLOW_ID = 'eXDL8aTRag0NJ1KR';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQ3MDFmZi1jMTYwLTQ2NmQtOWNjYS1iYWM4M2NiYTAwNjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0MDk0NjcwfQ.TDYHUFUajags-Zie1IBSbGVFyH7z67OBJx6baK300do';

// Configurar headers com API key
const headers = {
  'X-N8N-API-KEY': API_KEY,
  'Content-Type': 'application/json'
};

// Código JavaScript corrigido para o nó MCP Processor
const fixedJsCode = `
// Código MCP Processor corrigido
const method = $json.method;
const params = $json.params || {};
const id = $json.id || 1;

try {
  let result;
  
  switch (method) {
    case 'initialize':
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
      throw new Error(\`Method '\${method}' not found\`);
  }
  
  // Retorna o resultado no formato correto
  return [{
    json: {
      jsonrpc: '2.0',
      id: id,
      result: result
    }
  }];
  
} catch (error) {
  // Retorna erro no formato correto
  return [{
    json: {
      jsonrpc: '2.0',
      id: id,
      error: {
        code: -32603,
        message: error.message
      }
    }
  }];
}
`;

async function fixMcpProcessor() {
  try {
    console.log('🔧 Corrigindo código do MCP Processor...');
    
    // 1. Obter o workflow atual
    const workflowResponse = await axios.get(`${N8N_API_BASE}/workflows/${WORKFLOW_ID}`, { headers });
    const workflow = workflowResponse.data.data;
    
    console.log('📋 Workflow obtido:', workflow.name);
    
    // 2. Encontrar e atualizar o nó MCP Processor
    const nodes = workflow.nodes;
    const mcpProcessorNode = nodes.find(node => node.name === 'MCP Processor');
    
    if (!mcpProcessorNode) {
      throw new Error('Nó MCP Processor não encontrado');
    }
    
    console.log('🎯 Nó encontrado:', mcpProcessorNode.name);
    
    // 3. Atualizar o código JavaScript
    mcpProcessorNode.parameters.jsCode = fixedJsCode;
    
    // 4. Preparar dados para atualização (apenas campos necessários)
    const updateData = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: workflow.settings || {},
      staticData: workflow.staticData || {},
      tags: workflow.tags || []
    };
    
    // 5. Atualizar o workflow
    const updateResponse = await axios.put(`${N8N_API_BASE}/workflows/${WORKFLOW_ID}`, updateData, { headers });
    
    if (updateResponse.status === 200) {
      console.log('✅ Código do MCP Processor atualizado com sucesso!');
      
      // 6. Testar o webhook
      console.log('🧪 Testando webhook...');
      
      const testResponse = await axios.post('http://localhost:5678/webhook/mcp', {
        method: 'tools/list',
        params: {},
        id: 1,
        jsonrpc: '2.0'
      });
      
      console.log('📊 Resposta do teste:', JSON.stringify(testResponse.data, null, 2));
      
      if (testResponse.data.result && testResponse.data.result.tools) {
        console.log('🎉 Webhook funcionando corretamente!');
        console.log(`📝 Ferramentas disponíveis: ${testResponse.data.result.tools.length}`);
      } else {
        console.log('⚠️ Webhook respondeu mas sem ferramentas');
      }
      
    } else {
      console.log('❌ Falha ao atualizar workflow:', updateResponse.status);
    }
    
  } catch (error) {
    console.error('❌ Erro ao corrigir MCP Processor:', error.message);
    if (error.response) {
      console.error('📋 Detalhes do erro:', error.response.data);
    }
  }
}

fixMcpProcessor();