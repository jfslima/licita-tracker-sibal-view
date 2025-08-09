#!/usr/bin/env node

/**
 * Demonstração de Conexão MCP Externa - Projeto SIBAL
 * 
 * Este script demonstra como conectar-se ao servidor MCP SIBAL
 * e utilizar suas funcionalidades de rastreamento de licitações.
 */

const axios = require('axios');

class SibalMCPDemo {
  constructor() {
    this.webhookUrl = 'http://localhost:5678/webhook/mcp';
    this.requestId = 1;
  }

  async sendMCPRequest(method, params = {}) {
    const payload = {
      jsonrpc: '2.0',
      id: this.requestId++,
      method,
      params
    };

    try {
      console.log(`📤 Enviando: ${method}`);
      const response = await axios.post(this.webhookUrl, payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000
      });

      if (response.data.error) {
        throw new Error(`Erro MCP: ${response.data.error.message}`);
      }

      console.log(`📥 Resposta recebida para: ${method}`);
      return response.data.result;
    } catch (error) {
      console.error(`❌ Erro em ${method}:`, error.message);
      throw error;
    }
  }

  async demonstrateConnection() {
    console.log('🚀 DEMONSTRAÇÃO MCP SIBAL - CONEXÃO EXTERNA');
    console.log('=' .repeat(50));
    console.log();

    try {
      // 1. Inicializar
      console.log('1️⃣ Inicializando conexão MCP...');
      const initResult = await this.sendMCPRequest('initialize', {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        clientInfo: {
          name: 'sibal-demo-client',
          version: '1.0.0'
        }
      });
      console.log(`✅ Servidor: ${initResult.serverInfo.name} v${initResult.serverInfo.version}`);
      console.log();

      // 2. Listar ferramentas
      console.log('2️⃣ Listando ferramentas disponíveis...');
      const toolsResult = await this.sendMCPRequest('tools/list');
      console.log(`📋 Encontradas ${toolsResult.tools.length} ferramentas:`);
      toolsResult.tools.forEach((tool, index) => {
        console.log(`   ${index + 1}. ${tool.name} - ${tool.description}`);
      });
      console.log();

      // 3. Buscar editais
      console.log('3️⃣ Testando busca de editais...');
      const searchResult = await this.sendMCPRequest('tools/call', {
        name: 'search_notices',
        arguments: {
          query: 'equipamentos hospitalares',
          limit: 3
        }
      });
      console.log('🔍 Resultado da busca:');
      searchResult.content.forEach(content => {
        console.log(`   📄 ${content.text}`);
      });
      console.log();

      // 4. Obter detalhes
      console.log('4️⃣ Testando obtenção de detalhes...');
      const detailsResult = await this.sendMCPRequest('tools/call', {
        name: 'get_notice_details',
        arguments: {
          noticeId: 'EDITAL-DEMO-2025'
        }
      });
      console.log('📋 Detalhes do edital:');
      detailsResult.content.forEach(content => {
        console.log(`   📄 ${content.text}`);
      });
      console.log();

      console.log('✅ DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
      console.log();
      console.log('📋 INFORMAÇÕES DE INTEGRAÇÃO:');
      console.log(`   🔗 Webhook URL: ${this.webhookUrl}`);
      console.log('   📡 Protocolo: JSON-RPC 2.0');
      console.log('   🛠️ Métodos: initialize, tools/list, tools/call');
      console.log('   📁 Config: mcp-sibal-config.json');

    } catch (error) {
      console.error('❌ Falha na demonstração:', error.message);
      console.log();
      console.log('🔧 VERIFICAÇÕES NECESSÁRIAS:');
      console.log('   1. N8N está rodando na porta 5678?');
      console.log('   2. Workflow "SIBAL MCP Real" está ativo?');
      console.log('   3. Webhook está configurado corretamente?');
      process.exit(1);
    }
  }
}

// Executar demonstração
if (require.main === module) {
  const demo = new SibalMCPDemo();
  demo.demonstrateConnection();
}

module.exports = SibalMCPDemo;