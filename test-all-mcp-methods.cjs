const axios = require('axios');

const webhookUrl = 'http://localhost:5678/webhook/mcp';

async function testMCPMethods() {
  console.log('🧪 Testando todos os métodos MCP...');
  
  // Teste 1: initialize
  console.log('\n=== Teste 1: initialize ===');
  try {
    const initPayload = {
      jsonrpc: '2.0',
      method: 'initialize',
      id: 1
    };
    
    const initResponse = await axios.post(webhookUrl, initPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Initialize:', JSON.stringify(initResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Initialize erro:', error.response?.data || error.message);
  }
  
  // Teste 2: tools/list
  console.log('\n=== Teste 2: tools/list ===');
  try {
    const toolsPayload = {
      jsonrpc: '2.0',
      method: 'tools/list',
      id: 2
    };
    
    const toolsResponse = await axios.post(webhookUrl, toolsPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Tools/list:', JSON.stringify(toolsResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Tools/list erro:', error.response?.data || error.message);
  }
  
  // Teste 3: tools/call
  console.log('\n=== Teste 3: tools/call ===');
  try {
    const callPayload = {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: 'search_notices',
        arguments: {
          query: 'licitação teste',
          limit: 5
        }
      },
      id: 3
    };
    
    const callResponse = await axios.post(webhookUrl, callPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Tools/call:', JSON.stringify(callResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Tools/call erro:', error.response?.data || error.message);
  }
  
  // Teste 4: método inexistente
  console.log('\n=== Teste 4: método inexistente ===');
  try {
    const invalidPayload = {
      jsonrpc: '2.0',
      method: 'invalid_method',
      id: 4
    };
    
    const invalidResponse = await axios.post(webhookUrl, invalidPayload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Método inexistente:', JSON.stringify(invalidResponse.data, null, 2));
  } catch (error) {
    console.log('❌ Método inexistente erro:', error.response?.data || error.message);
  }
  
  console.log('\n🎉 Todos os testes concluídos!');
}

// Executar os testes
testMCPMethods();