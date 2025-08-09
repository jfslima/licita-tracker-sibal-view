// Script para testar a comunicação com o servidor MCP local no Supabase

import fetch from 'node-fetch';

// URL do servidor MCP local no Supabase
const MCP_URL = 'http://127.0.0.1:54321/functions/v1/mcp';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'; // Chave anon do Supabase local

// Função para testar o endpoint de health check
async function testHealthEndpoint() {
  try {
    const response = await fetch('http://127.0.0.1:54321/functions/v1/mcp');
    const data = await response.json();
    console.log('📊 Health Check Response:', data);
    console.log('✅ Health Endpoint Test:', response.ok ? 'SUCCESS' : 'FAILED');
    return response.ok;
  } catch (error) {
    console.error('❌ Health Endpoint Error:', error.message);
    return false;
  }
}

// Função para testar o endpoint MCP com uma mensagem simples
async function testMcpChat() {
  try {
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify({
        type: "chat",
        arguments: {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            { role: "system", content: "Você é um assistente especializado em licitações." },
            { role: "user", content: "O que é uma licitação pública?" }
          ]
        }
      })
    });
    
    const data = await response.json();
    console.log('\n📨 MCP Chat Response:');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('🤖 AI Response:', data.choices[0].message.content.slice(0, 150) + '...');
      console.log('✅ MCP Chat Test: SUCCESS');
    } else {
      console.log('📄 Raw Response:', JSON.stringify(data, null, 2));
      console.log('⚠️ MCP Chat Test: RESPONSE FORMAT UNEXPECTED');
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ MCP Chat Error:', error.message);
    return false;
  }
}

// Função para testar a ferramenta search_bids
async function testSearchBids() {
  try {
    const response = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY
      },
      body: JSON.stringify({
        type: "tool",
        arguments: {
          name: "search_bids",
          parameters: {
            query: "combustível"
          }
        }
      })
    });
    
    const data = await response.json();
    console.log('\n🔍 Search Bids Response:');
    
    if (data.result) {
      console.log('📋 Search Results Sample:', JSON.stringify(data.result).slice(0, 100) + '...');
      console.log('✅ Search Bids Test: SUCCESS');
    } else {
      console.log('📄 Raw Response:', JSON.stringify(data, null, 2));
      console.log('⚠️ Search Bids Test: RESPONSE FORMAT UNEXPECTED');
    }
    
    return response.ok;
  } catch (error) {
    console.error('❌ Search Bids Error:', error.message);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes de comunicação com o servidor MCP no Railway...\n');
  
  console.log('🔄 Teste 1: Health Check');
  const healthResult = await testHealthEndpoint();
  
  console.log('\n🔄 Teste 2: MCP Chat');
  const chatResult = await testMcpChat();
  
  console.log('\n🔄 Teste 3: Search Bids Tool');
  const searchResult = await testSearchBids();
  
  console.log('\n📊 Resumo dos Testes:');
  console.log(`Health Check: ${healthResult ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`MCP Chat: ${chatResult ? '✅ PASSOU' : '❌ FALHOU'}`);
  console.log(`Search Bids: ${searchResult ? '✅ PASSOU' : '❌ FALHOU'}`);
  
  const overallResult = healthResult && chatResult && searchResult;
  console.log(`\n${overallResult ? '🎉 TODOS OS TESTES PASSARAM!' : '⚠️ ALGUNS TESTES FALHARAM!'}`);
  
  if (!overallResult) {
    console.log('\n🛠️ Sugestões de Solução:');
    if (!healthResult) console.log('- Verifique se o servidor MCP está rodando no Railway');
    if (!chatResult) console.log('- Confira a chave API e as credenciais do Groq');
    if (!searchResult) console.log('- Verifique a implementação da ferramenta search_bids');
  }
}

// Executar os testes
runAllTests().catch(error => {
  console.error('❌ Erro ao executar os testes:', error);
});
