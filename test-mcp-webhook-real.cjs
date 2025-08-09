/**
 * Teste da integração real do MCP Server
 * Testa as chamadas reais ao webhook do N8N
 */

const https = require('http');

const MCP_WEBHOOK_URL = 'http://localhost:5678/webhook/mcp';

// Função para fazer chamadas HTTP
function makeRequest(data) {
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
          const parsed = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsed });
        } catch (err) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Testes
async function runTests() {
  console.log('🚀 Testando integração real do MCP Server...');
  console.log('=' .repeat(50));

  try {
    // Teste 1: Inicialização
    console.log('\n1. Testando inicialização do MCP...');
    const initResult = await makeRequest({
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'SIBAL Test Client',
          version: '1.0.0'
        }
      }
    });
    
    console.log(`Status: ${initResult.status}`);
    console.log('Resposta:', JSON.stringify(initResult.data, null, 2));
    
    if (initResult.status === 200) {
      console.log('✅ Inicialização bem-sucedida!');
    } else {
      console.log('❌ Falha na inicialização');
    }

    // Teste 2: Listar ferramentas
    console.log('\n2. Testando listagem de ferramentas...');
    const toolsResult = await makeRequest({
      method: 'tools/list',
      params: {}
    });
    
    console.log(`Status: ${toolsResult.status}`);
    console.log('Resposta:', JSON.stringify(toolsResult.data, null, 2));
    
    if (toolsResult.status === 200) {
      console.log('✅ Listagem de ferramentas bem-sucedida!');
    } else {
      console.log('❌ Falha na listagem de ferramentas');
    }

    // Teste 3: Buscar editais
    console.log('\n3. Testando busca de editais...');
    const fetchResult = await makeRequest({
      method: 'tools/call',
      params: {
        name: 'fetch_notices',
        arguments: {
          query: 'sistema',
          limit: 5
        }
      }
    });
    
    console.log(`Status: ${fetchResult.status}`);
    console.log('Resposta:', JSON.stringify(fetchResult.data, null, 2));
    
    if (fetchResult.status === 200) {
      console.log('✅ Busca de editais bem-sucedida!');
    } else {
      console.log('❌ Falha na busca de editais');
    }

    // Teste 4: Classificação de risco
    console.log('\n4. Testando classificação de risco...');
    const riskResult = await makeRequest({
      method: 'tools/call',
      params: {
        name: 'risk_classifier',
        arguments: {
          notice_content: 'Desenvolvimento de sistema complexo com prazo de 15 dias para entrega de documentação técnica detalhada'
        }
      }
    });
    
    console.log(`Status: ${riskResult.status}`);
    console.log('Resposta:', JSON.stringify(riskResult.data, null, 2));
    
    if (riskResult.status === 200) {
      console.log('✅ Classificação de risco bem-sucedida!');
    } else {
      console.log('❌ Falha na classificação de risco');
    }

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 Testes concluídos!');
    
  } catch (error) {
    console.error('❌ Erro durante os testes:', error.message);
  }
}

// Executar testes
runTests();