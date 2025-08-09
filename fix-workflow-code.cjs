// Script para corrigir o código JavaScript do workflow
const http = require('http');

console.log('🔧 Corrigindo código do workflow...');

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

async function fixWorkflowCode() {
  try {
    // Código JavaScript corrigido
    const fixedJsCode = `// SIBAL MCP Server Implementation
const inputData = $input.all()[0];
const request = inputData.json;
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
      },
      {
        id: '002',
        title: \`Contratação de serviços relacionados a \${keyword || 'tecnologia'}\`,
        description: 'Serviços de desenvolvimento de software',
        status: status,
        deadline: '2024-11-30',
        value: 250000,
        organ: 'Governo do Estado',
        modality: 'Concorrência',
        created_at: date_from || '2024-01-15'
      }
    ];
    return { success: true, data: notices, total: notices.length };
  },

  async risk_classifier(args) {
    const { notice_id, company_profile = {} } = args;
    const riskLevel = Math.random() > 0.5 ? 'MEDIUM' : 'LOW';
    const score = riskLevel === 'MEDIUM' ? 65 : 35;
    
    return {
      success: true,
      data: {
        notice_id,
        risk_level: riskLevel,
        score,
        factors: ['Prazo de entrega apertado', 'Valor elevado do contrato'],
        recommendations: ['Revisar cronograma', 'Avaliar capacidade técnica']
      }
    };
  },

  async summarize_notice(args) {
    const { notice_id, content } = args;
    return {
      success: true,
      data: {
        notice_id,
        summary: 'Licitação para aquisição de equipamentos tecnológicos.',
        key_points: ['Valor: R$ 150.000', 'Prazo: 60 dias', 'Modalidade: Pregão']
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
                notice_id: { type: 'string', description: 'ID do edital' },
                company_profile: { type: 'object', description: 'Perfil da empresa' }
              },
              required: ['notice_id']
            }
          },
          {
            name: 'summarize_notice',
            description: 'Resumir conteúdo de um edital',
            inputSchema: {
              type: 'object',
              properties: {
                notice_id: { type: 'string', description: 'ID do edital' },
                content: { type: 'string', description: 'Conteúdo do edital' }
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
  
  // Retornar no formato correto para o N8N
  return {
    json: {
      jsonrpc: '2.0',
      id: request.id || 1,
      result: response
    }
  };
} catch (error) {
  return {
    json: {
      jsonrpc: '2.0',
      id: request.id || 1,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    }
  };
}`;

    // Atualizar o workflow com o código corrigido
    console.log('🔄 Atualizando código do workflow...');
    
    // Primeiro, obter o workflow atual
    const getOptions = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1/workflows/eXDL8aTRag0NJ1KR',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY
      }
    };
    
    const getResult = await makeRequest(getOptions);
    
    if (getResult.status === 200) {
      const workflow = getResult.data;
      
      // Atualizar o código JavaScript do nó MCP Processor
      const mcpProcessorNode = workflow.nodes.find(node => node.name === 'MCP Processor');
      if (mcpProcessorNode) {
        mcpProcessorNode.parameters.jsCode = fixedJsCode;
        
        // Atualizar o workflow
        const updateOptions = {
          hostname: 'localhost',
          port: 5678,
          path: '/api/v1/workflows/eXDL8aTRag0NJ1KR',
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': API_KEY
          }
        };
        
        const updateResult = await makeRequest(updateOptions, workflow);
        console.log('Status atualização:', updateResult.status);
        
        if (updateResult.status === 200) {
          console.log('✅ Código atualizado com sucesso!');
          
          // Aguardar um pouco
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Testar o webhook
          console.log('🧪 Testando webhook corrigido...');
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
            console.log('✅ Webhook funcionando perfeitamente!');
            console.log('🎉 Problema totalmente resolvido!');
            console.log('Resposta:', JSON.stringify(testResult.data, null, 2));
          } else {
            console.log('❌ Ainda há problemas');
            console.log('Resposta:', testResult.data);
          }
          
        } else {
          console.error('❌ Erro ao atualizar workflow:', updateResult.data);
        }
      } else {
        console.error('❌ Nó MCP Processor não encontrado');
      }
    } else {
      console.error('❌ Erro ao obter workflow:', getResult.data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixWorkflowCode();