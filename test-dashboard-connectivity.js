// Teste de conectividade do Dashboard SIBAL
// Este script verifica se todos os componentes estão funcionando corretamente

const https = require('https');
const http = require('http');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(url, isHttps = false) {
  return new Promise((resolve, reject) => {
    const client = isHttps ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

async function testConnectivity() {
  log('🔍 TESTE DE CONECTIVIDADE DO DASHBOARD SIBAL', 'blue');
  log('=' .repeat(50), 'blue');
  
  const tests = [
    {
      name: 'Servidor Proxy Local',
      url: 'http://localhost:3002/health',
      expected: 200
    },
    {
      name: 'Teste PNCP via Proxy',
      url: 'http://localhost:3002/test-pncp',
      expected: 200
    },
    {
      name: 'API PNCP Search via Proxy',
      url: 'http://localhost:3002/api/pncp/search?tipos_documento=edital&tam_pagina=1&status=recebendo_proposta',
      expected: 200
    },
    {
      name: 'Frontend Development Server',
      url: 'http://localhost:5173',
      expected: 200
    },
    {
      name: 'API PNCP Direta (teste de conectividade)',
      url: 'https://pncp.gov.br/api/search?tipos_documento=edital&tam_pagina=1',
      expected: 200,
      isHttps: true
    }
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      log(`\n🧪 Testando: ${test.name}`, 'yellow');
      log(`   URL: ${test.url}`);
      
      const result = await makeRequest(test.url, test.isHttps);
      
      if (result.statusCode === test.expected) {
        log(`   ✅ SUCESSO - Status: ${result.statusCode}`, 'green');
        
        // Verificar se é uma resposta JSON válida
        try {
          const jsonData = JSON.parse(result.data);
          if (test.name.includes('PNCP')) {
            const itemCount = jsonData.dados?.length || jsonData.items?.length || 0;
            log(`   📊 Dados recebidos: ${itemCount} itens`, 'green');
          }
        } catch (e) {
          // Não é JSON, mas pode ser HTML válido (frontend)
          if (test.name.includes('Frontend')) {
            log(`   📄 HTML recebido: ${result.data.length} bytes`, 'green');
          }
        }
        
        passedTests++;
      } else {
        log(`   ❌ FALHA - Status esperado: ${test.expected}, recebido: ${result.statusCode}`, 'red');
      }
    } catch (error) {
      log(`   ❌ ERRO - ${error.message}`, 'red');
    }
  }
  
  log('\n' + '=' .repeat(50), 'blue');
  log(`📊 RESULTADO FINAL: ${passedTests}/${totalTests} testes passaram`, 
      passedTests === totalTests ? 'green' : 'red');
  
  if (passedTests === totalTests) {
    log('🎉 TODOS OS TESTES PASSARAM! Dashboard está funcionando corretamente.', 'green');
  } else {
    log('⚠️  ALGUNS TESTES FALHARAM. Verifique os problemas acima.', 'yellow');
  }
  
  // Diagnóstico adicional
  log('\n🔧 DIAGNÓSTICO:', 'blue');
  
  if (passedTests >= 3) {
    log('✅ Conectividade básica está funcionando', 'green');
  }
  
  if (tests.find(t => t.name.includes('Proxy'))?.url && passedTests >= 2) {
    log('✅ Servidor proxy está operacional', 'green');
  }
  
  if (tests.find(t => t.name.includes('Frontend'))?.url && passedTests >= 1) {
    log('✅ Frontend está acessível', 'green');
  }
  
  log('\n💡 PRÓXIMOS PASSOS:', 'blue');
  log('1. Verifique se todos os serviços estão rodando');
  log('2. Acesse http://localhost:5173 no navegador');
  log('3. Verifique o status PNCP no dashboard');
  log('4. Teste as funcionalidades de busca');
}

// Executar teste
testConnectivity().catch(error => {
  log(`\n❌ ERRO GERAL: ${error.message}`, 'red');
  process.exit(1);
});