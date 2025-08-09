// Script para corrigir o problema do webhook N8N
const http = require('http');
const fs = require('fs');

console.log('🔧 Corrigindo webhook do N8N...');

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

async function fixWebhook() {
  try {
    // 1. Desativar o workflow
    console.log('⏸️ Desativando workflow...');
    const deactivateOptions = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1/workflows/gHPYgMXn8M8C7TDg/activate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY
      }
    };
    
    const deactivateResult = await makeRequest(deactivateOptions, { active: false });
    console.log('Status desativação:', deactivateResult.status);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 2. Reativar o workflow
    console.log('▶️ Reativando workflow...');
    const activateResult = await makeRequest(deactivateOptions, { active: true });
    console.log('Status ativação:', activateResult.status);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 3. Testar o webhook
    console.log('🧪 Testando webhook...');
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
      console.log('✅ Webhook funcionando corretamente!');
      console.log('Resposta:', JSON.stringify(testResult.data, null, 2));
    } else {
      console.log('❌ Webhook ainda não está funcionando');
      console.log('Resposta:', testResult.data);
      
      // Tentar executar o workflow manualmente
      console.log('🔄 Tentando executar workflow manualmente...');
      const executeOptions = {
        hostname: 'localhost',
        port: 5678,
        path: '/api/v1/workflows/gHPYgMXn8M8C7TDg/execute',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': API_KEY
        }
      };
      
      const executeResult = await makeRequest(executeOptions, {});
      console.log('Status execução manual:', executeResult.status);
      
      // Aguardar e testar novamente
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const testResult2 = await makeRequest(testOptions, testData);
      console.log('Status teste final:', testResult2.status);
      
      if (testResult2.status === 200) {
        console.log('✅ Webhook funcionando após execução manual!');
      } else {
        console.log('❌ Problema persiste. Verifique a configuração do workflow.');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

fixWebhook();