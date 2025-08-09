// Script para ativar o workflow MCP no N8N
const http = require('http');

console.log('🔧 Ativando workflow MCP no N8N...');

// Credenciais de autenticação
const AUTH_USER = 'sibal';
const AUTH_PASSWORD = 'SibalN8n2024!@#$';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmMjQ3MDFmZi1jMTYwLTQ2NmQtOWNjYS1iYWM4M2NiYTAwNjgiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzU0MDk0NjcwfQ.TDYHUFUajags-Zie1IBSbGVFyH7z67OBJx6baK300do';

// Função para criar header de autenticação básica
function createBasicAuthHeader() {
  const credentials = Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString('base64');
  return `Basic ${credentials}`;
}

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

async function activateWorkflow() {
  try {
    // 1. Listar workflows para encontrar o MCP Server
    console.log('📋 Listando workflows...');
    const listOptions = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1/workflows',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY
      }
    };
    
    const listResult = await makeRequest(listOptions);
    console.log(`Status: ${listResult.status}`);
    
    if (listResult.status !== 200) {
      console.log('❌ Erro ao listar workflows:', listResult.data);
      return;
    }
    
    // 2. Encontrar o workflow MCP Server
    const workflows = listResult.data.data || listResult.data;
    const mcpWorkflow = workflows.find(w => w.name === 'MCP Server' || w.name.includes('MCP'));
    
    if (!mcpWorkflow) {
      console.log('❌ Workflow MCP não encontrado');
      console.log('Workflows disponíveis:', workflows.map(w => w.name));
      return;
    }
    
    console.log(`✅ Workflow encontrado: ${mcpWorkflow.name} (ID: ${mcpWorkflow.id})`);
    console.log(`Status atual: ${mcpWorkflow.active ? 'Ativo' : 'Inativo'}`);
    
    if (mcpWorkflow.active) {
      console.log('✅ Workflow já está ativo!');
      return;
    }
    
    // 3. Ativar o workflow
    console.log('🔄 Ativando workflow...');
    const activateOptions = {
      hostname: 'localhost',
      port: 5678,
      path: `/api/v1/workflows/${mcpWorkflow.id}/activate`,
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': API_KEY
        }
    };
    
    const activateResult = await makeRequest(activateOptions);
    console.log(`Status: ${activateResult.status}`);
    
    if (activateResult.status === 200) {
      console.log('🎉 Workflow ativado com sucesso!');
      console.log('🌐 Webhook disponível em: http://localhost:5678/webhook/mcp');
      
      // 4. Testar o webhook
      console.log('\n🧪 Testando webhook...');
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
        method: 'tools/list'
      };
      
      const testResult = await makeRequest(testOptions, testData);
      console.log(`Status do teste: ${testResult.status}`);
      
      if (testResult.status === 200) {
        console.log('✅ Webhook funcionando!');
        console.log('Ferramentas disponíveis:', testResult.data.tools?.length || 0);
      } else {
        console.log('⚠️ Webhook pode não estar funcionando ainda:', testResult.data);
      }
      
    } else {
      console.log('❌ Erro ao ativar workflow:', activateResult.data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

activateWorkflow();