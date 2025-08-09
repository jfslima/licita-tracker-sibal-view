/**
 * Script de teste para validar o MCP Server via webhook
 * Testa todas as funcionalidades disponíveis do servidor MCP
 */

const axios = require('axios');

const MCP_WEBHOOK_URL = 'http://localhost:5678/webhook/mcp';

// Função para fazer requisições ao MCP
async function callMCP(method, params = {}) {
  try {
    const response = await axios.post(MCP_WEBHOOK_URL, {
      method,
      params
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Erro ao chamar ${method}:`, error.response?.data || error.message);
    return null;
  }
}

// Teste 1: Inicialização do MCP
async function testInitialize() {
  console.log('\n🔧 Testando inicialização do MCP...');
  const result = await callMCP('initialize');
  if (result) {
    console.log('✅ Inicialização bem-sucedida:');
    console.log(JSON.stringify(result, null, 2));
  }
}

// Teste 2: Listar ferramentas disponíveis
async function testToolsList() {
  console.log('\n📋 Testando listagem de ferramentas...');
  const result = await callMCP('tools/list');
  if (result) {
    console.log('✅ Ferramentas disponíveis:');
    result.tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
  }
}

// Teste 3: Buscar editais
async function testFetchNotices() {
  console.log('\n🔍 Testando busca de editais...');
  const result = await callMCP('tools/call', {
    name: 'fetch_notices',
    arguments: {
      query: 'tecnologia',
      limit: 5,
      status: 'active'
    }
  });
  if (result) {
    console.log('✅ Busca de editais:');
    console.log(JSON.stringify(result, null, 2));
  }
}

// Teste 4: Classificar risco
async function testRiskClassifier() {
  console.log('\n⚠️ Testando classificação de risco...');
  const result = await callMCP('tools/call', {
    name: 'risk_classifier',
    arguments: {
      notice_content: 'Edital para contratação de serviços de desenvolvimento de software com prazo de 15 dias para entrega e documentação técnica complexa.',
      notice_id: 'edital-001'
    }
  });
  if (result) {
    console.log('✅ Classificação de risco:');
    console.log(JSON.stringify(result, null, 2));
  }
}

// Teste 5: Método inexistente (teste de erro)
async function testInvalidMethod() {
  console.log('\n❌ Testando método inexistente...');
  const result = await callMCP('invalid/method');
  if (result) {
    console.log('✅ Tratamento de erro:');
    console.log(JSON.stringify(result, null, 2));
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes do MCP Server SIBAL\n');
  console.log('=' .repeat(50));
  
  await testInitialize();
  await testToolsList();
  await testFetchNotices();
  await testRiskClassifier();
  await testInvalidMethod();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Todos os testes concluídos!');
}

// Executar se chamado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  callMCP,
  testInitialize,
  testToolsList,
  testFetchNotices,
  testRiskClassifier,
  runAllTests
};