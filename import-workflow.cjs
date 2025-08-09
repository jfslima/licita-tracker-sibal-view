// Script para importar o workflow MCP no N8N
const http = require('http');
const fs = require('fs');

console.log('📥 Importando workflow MCP no N8N...');

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

async function importWorkflow() {
  try {
    // 1. Ler o arquivo do workflow
    console.log('📖 Lendo arquivo do workflow...');
    const workflowPath = './packages/n8n/workflows/mcp-server.json';
    
    if (!fs.existsSync(workflowPath)) {
      console.error('❌ Arquivo do workflow não encontrado:', workflowPath);
      return;
    }
    
    const workflowData = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    console.log('✅ Workflow carregado:', workflowData.name);
    
    // 2. Deletar workflow existente se houver
    console.log('🗑️ Removendo workflow existente...');
    const deleteOptions = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1/workflows/gHPYgMXn8M8C7TDg',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY
      }
    };
    
    const deleteResult = await makeRequest(deleteOptions);
    console.log('Status remoção:', deleteResult.status);
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 3. Criar novo workflow
    console.log('➕ Criando novo workflow...');
    
    // Remover campos que podem causar conflito
    delete workflowData.id;
    delete workflowData.versionId;
    delete workflowData.createdAt;
    delete workflowData.updatedAt;
    
    // Garantir que o workflow está ativo
    workflowData.active = true;
    
    const createOptions = {
      hostname: 'localhost',
      port: 5678,
      path: '/api/v1/workflows',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': API_KEY
      }
    };
    
    const createResult = await makeRequest(createOptions, workflowData);
    console.log('Status criação:', createResult.status);
    
    if (createResult.status === 201 || createResult.status === 200) {
      console.log('✅ Workflow criado com sucesso!');
      console.log('ID do novo workflow:', createResult.data.id);
      
      // 4. Ativar o workflow
      console.log('▶️ Ativando workflow...');
      const activateOptions = {
        hostname: 'localhost',
        port: 5678,
        path: `/api/v1/workflows/${createResult.data.id}/activate`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': API_KEY
        }
      };
      
      const activateResult = await makeRequest(activateOptions, { active: true });
      console.log('Status ativação:', activateResult.status);
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 5. Testar o webhook
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
        console.log('🎉 Problema resolvido!');
      } else {
        console.log('❌ Webhook ainda não está funcionando');
        console.log('Resposta:', testResult.data);
      }
      
    } else {
      console.error('❌ Erro ao criar workflow:', createResult.data);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

importWorkflow();