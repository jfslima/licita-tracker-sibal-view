// Script simplificado para testar o health check do MCP Server no Railway

import fetch from 'node-fetch';

const SERVER_URL = 'https://licita-tracker-sibal-view-production.up.railway.app';

async function testHealthEndpoint() {
  console.log('Testando conexão com: ' + SERVER_URL + '/health');
  
  try {
    const response = await fetch(SERVER_URL + '/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('Resposta recebida com sucesso!');
      console.log('Status:', data.status);
      console.log('Timestamp:', data.timestamp);
      return true;
    } else {
      console.log('Erro: Status ' + response.status);
      return false;
    }
  } catch (error) {
    console.log('Erro de conexão:', error.message);
    return false;
  }
}

testHealthEndpoint()
  .then(success => {
    if (success) {
      console.log('\n✅ TESTE PASSOU: O servidor MCP está online!');
    } else {
      console.log('\n❌ TESTE FALHOU: O servidor MCP não está respondendo corretamente.');
    }
  });
