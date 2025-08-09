// Test script for MCP Server running on N8N
const https = require('http');

// Test MCP Server endpoints
async function testMCPServer() {
  console.log('🧪 Testando servidor MCP no N8N...');
  
  // Test 1: Initialize
  console.log('\n1. Testando inicialização...');
  await testEndpoint({
    method: 'initialize',
    params: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {}
      },
      clientInfo: {
        name: 'Test Client',
        version: '1.0.0'
      }
    }
  });
  
  // Test 2: List tools
  console.log('\n2. Testando listagem de ferramentas...');
  await testEndpoint({
    method: 'tools/list',
    params: {}
  });
  
  // Test 3: Call fetch_notices tool
  console.log('\n3. Testando ferramenta fetch_notices...');
  await testEndpoint({
    method: 'tools/call',
    params: {
      name: 'fetch_notices',
      arguments: {
        query: 'licitação',
        limit: 5
      }
    }
  });
  
  // Test 4: Call risk_classifier tool
  console.log('\n4. Testando ferramenta risk_classifier...');
  await testEndpoint({
    method: 'tools/call',
    params: {
      name: 'risk_classifier',
      arguments: {
        notice_content: 'Edital de licitação para contratação de serviços de TI com prazo de 5 dias para entrega da proposta.',
        notice_id: 'test-001'
      }
    }
  });
}

function testEndpoint(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 5678,
      path: '/webhook/mcp',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(responseData);
          console.log('✅ Resposta:', JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.log('📄 Resposta (texto):', responseData);
          resolve(responseData);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Erro:', error.message);
      resolve(null);
    });
    
    req.write(postData);
    req.end();
  });
}

// Run tests
testMCPServer().then(() => {
  console.log('\n🎉 Testes concluídos!');
}).catch((error) => {
  console.error('💥 Erro nos testes:', error);
});