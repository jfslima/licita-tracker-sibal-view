const axios = require('axios');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuração do MCP Server SIBAL
const SIBAL_MCP_CONFIG = {
  name: 'sibal-licita-tracker',
  description: 'MCP Server para rastreamento de licitações SIBAL',
  version: '1.0.0',
  webhookUrl: 'http://localhost:5678/webhook/mcp',
  capabilities: {
    tools: [
      {
        name: 'search_notices',
        description: 'Buscar editais de licitação por critérios',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Termo de busca' },
            limit: { type: 'number', description: 'Limite de resultados', default: 10 },
            category: { type: 'string', description: 'Categoria do edital' },
            dateFrom: { type: 'string', description: 'Data inicial (YYYY-MM-DD)' },
            dateTo: { type: 'string', description: 'Data final (YYYY-MM-DD)' }
          },
          required: ['query']
        }
      },
      {
        name: 'get_notice_details',
        description: 'Obter detalhes completos de um edital específico',
        inputSchema: {
          type: 'object',
          properties: {
            noticeId: { type: 'string', description: 'ID do edital' }
          },
          required: ['noticeId']
        }
      }
    ]
  }
};

class SibalMCPClient {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
    this.requestId = 1;
  }

  async initialize() {
    console.log('🔌 Inicializando conexão com SIBAL MCP Server...');
    
    const response = await this.sendRequest({
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'sibal-external-client',
          version: '1.0.0'
        }
      }
    });
    
    console.log('✅ Conexão inicializada:', response.result);
    return response.result;
  }

  async listTools() {
    console.log('🛠️ Listando ferramentas disponíveis...');
    
    const response = await this.sendRequest({
      method: 'tools/list'
    });
    
    console.log('📋 Ferramentas disponíveis:');
    response.result.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    
    return response.result.tools;
  }

  async searchNotices(query, options = {}) {
    console.log(`🔍 Buscando editais: "${query}"...`);
    
    const response = await this.sendRequest({
      method: 'tools/call',
      params: {
        name: 'search_notices',
        arguments: {
          query,
          ...options
        }
      }
    });
    
    console.log('📄 Resultados da busca:');
    response.result.content.forEach(content => {
      console.log(`  ${content.text}`);
    });
    
    return response.result;
  }

  async getNoticeDetails(noticeId) {
    console.log(`📋 Obtendo detalhes do edital: ${noticeId}...`);
    
    const response = await this.sendRequest({
      method: 'tools/call',
      params: {
        name: 'get_notice_details',
        arguments: {
          noticeId
        }
      }
    });
    
    console.log('📄 Detalhes do edital:');
    response.result.content.forEach(content => {
      console.log(`  ${content.text}`);
    });
    
    return response.result;
  }

  async sendRequest(request) {
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId++,
      ...request
    };

    try {
      const response = await axios.post(this.webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      if (response.data.error) {
        throw new Error(`MCP Error: ${response.data.error.message}`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ Erro na requisição MCP:', error.message);
      throw error;
    }
  }
}

// Função para criar arquivo de configuração MCP
function createMCPConfig() {
  const configPath = path.join(__dirname, 'mcp-sibal-config.json');
  
  const config = {
    mcpServers: {
      'sibal-licita-tracker': {
        command: 'node',
        args: ['mcp-external-connection.cjs'],
        env: {
          SIBAL_WEBHOOK_URL: 'http://localhost:5678/webhook/mcp'
        }
      }
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log(`📝 Arquivo de configuração criado: ${configPath}`);
  
  return configPath;
}

// Função para demonstrar uso completo
async function demonstrateUsage() {
  console.log('🚀 DEMONSTRAÇÃO DE CONEXÃO MCP EXTERNA - PROJETO SIBAL');
  console.log('=======================================================\n');
  
  const client = new SibalMCPClient(SIBAL_MCP_CONFIG.webhookUrl);
  
  try {
    // 1. Inicializar conexão
    await client.initialize();
    console.log();
    
    // 2. Listar ferramentas
    await client.listTools();
    console.log();
    
    // 3. Buscar editais
    await client.searchNotices('equipamentos médicos', {
      limit: 5,
      category: 'saúde'
    });
    console.log();
    
    // 4. Obter detalhes de um edital
    await client.getNoticeDetails('EDITAL-2025-001');
    console.log();
    
    // 5. Criar configuração para outros clientes MCP
    createMCPConfig();
    
    console.log('✅ Demonstração concluída com sucesso!');
    console.log('\n📋 PRÓXIMOS PASSOS PARA INTEGRAÇÃO:');
    console.log('1. Configure seu cliente MCP para usar o webhook: http://localhost:5678/webhook/mcp');
    console.log('2. Use o arquivo mcp-sibal-config.json como referência');
    console.log('3. Implemente as chamadas usando o protocolo JSON-RPC 2.0');
    console.log('4. Teste com os métodos: initialize, tools/list, tools/call');
    
  } catch (error) {
    console.error('❌ Erro na demonstração:', error.message);
    process.exit(1);
  }
}

// Função para testar conectividade
async function testConnectivity() {
  console.log('🔍 Testando conectividade com o webhook SIBAL...');
  
  try {
    const response = await axios.get('http://localhost:5678/webhook/mcp', {
      timeout: 5000
    });
    console.log('✅ Webhook está acessível');
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ N8N não está rodando. Inicie o N8N primeiro.');
    } else {
      console.log('⚠️ Webhook pode não estar configurado corretamente');
    }
    return false;
  }
}

// Executar demonstração
async function main() {
  const isConnected = await testConnectivity();
  
  if (isConnected) {
    await demonstrateUsage();
  } else {
    console.log('\n📋 INSTRUÇÕES PARA INICIAR:');
    console.log('1. Certifique-se de que o N8N está rodando');
    console.log('2. Verifique se o workflow MCP está ativo');
    console.log('3. Execute novamente este script');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = {
  SibalMCPClient,
  SIBAL_MCP_CONFIG,
  createMCPConfig
};