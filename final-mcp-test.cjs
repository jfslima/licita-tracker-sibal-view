const axios = require('axios');

const webhookUrl = 'http://localhost:5678/webhook/mcp';

async function finalMCPTest() {
  console.log('🎯 TESTE FINAL COMPLETO DO MCP SERVER');
  console.log('=====================================\n');
  
  const tests = [
    {
      name: 'Initialize',
      payload: {
        jsonrpc: '2.0',
        method: 'initialize',
        id: 1
      }
    },
    {
      name: 'Tools List',
      payload: {
        jsonrpc: '2.0',
        method: 'tools/list',
        id: 2
      }
    },
    {
      name: 'Search Notices Tool',
      payload: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'search_notices',
          arguments: {
            query: 'equipamentos médicos',
            limit: 5
          }
        },
        id: 3
      }
    },
    {
      name: 'Get Notice Details Tool',
      payload: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'get_notice_details',
          arguments: {
            noticeId: 'EDITAL-2025-001'
          }
        },
        id: 4
      }
    },
    {
      name: 'Invalid Method (Error Test)',
      payload: {
        jsonrpc: '2.0',
        method: 'invalid_method',
        id: 5
      }
    },
    {
      name: 'Invalid Tool (Error Test)',
      payload: {
        jsonrpc: '2.0',
        method: 'tools/call',
        params: {
          name: 'invalid_tool',
          arguments: {}
        },
        id: 6
      }
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    console.log(`🧪 Testando: ${test.name}`);
    console.log(`📤 Payload: ${JSON.stringify(test.payload, null, 2)}`);
    
    try {
      const response = await axios.post(webhookUrl, test.payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`✅ Resposta:`);
      console.log(JSON.stringify(response.data, null, 2));
      
      // Verificar se a resposta está no formato correto
      if (response.data.jsonrpc === '2.0' && response.data.id === test.payload.id) {
        if (response.data.result || response.data.error) {
          passedTests++;
          console.log(`✅ PASSOU: Formato de resposta correto\n`);
        } else {
          console.log(`❌ FALHOU: Resposta sem result ou error\n`);
        }
      } else {
        console.log(`❌ FALHOU: Formato de resposta incorreto\n`);
      }
      
    } catch (error) {
      console.log(`❌ ERRO: ${error.response?.data || error.message}\n`);
    }
  }
  
  console.log('📊 RESUMO DOS TESTES');
  console.log('====================');
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`📈 Taxa de sucesso: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    console.log('✅ O MCP Server está funcionando perfeitamente!');
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  console.log('\n🔗 URL do Webhook: http://localhost:5678/webhook/mcp');
  console.log('📋 Métodos disponíveis: initialize, tools/list, tools/call');
  console.log('🛠️ Ferramentas disponíveis: search_notices, get_notice_details');
}

// Executar teste final
finalMCPTest();