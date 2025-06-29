
import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS middleware mais permissivo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, api-key');
  res.header('Access-Control-Max-Age', '3600');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Tool: busca licitações por texto
app.post('/mcp/search_bids', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('🔍 Buscando licitações para:', query);
    
    // Simulação de busca no PNCP (substitua pela API real quando disponível)
    const mockResults = {
      success: true,
      query: query,
      results: [
        {
          id: '001-2024',
          title: `Pregão Eletrônico - Aquisição de ${query}`,
          description: `Processo licitatório para aquisição de equipamentos relacionados a ${query}`,
          value: 'R$ 1.250.000,00',
          status: 'Aberto para propostas',
          deadline: '2024-07-15',
          organ: 'Ministério da Defesa',
          modality: 'Pregão Eletrônico'
        },
        {
          id: '002-2024',
          title: `Concorrência - Serviços de ${query}`,
          description: `Contratação de empresa especializada em serviços relacionados a ${query}`,
          value: 'R$ 850.000,00',
          status: 'Em análise',
          deadline: '2024-07-20',
          organ: 'Governo do Distrito Federal',
          modality: 'Concorrência'
        },
        {
          id: '003-2024',
          title: `Dispensa de Licitação - ${query}`,
          description: `Aquisição emergencial de materiais para ${query}`,
          value: 'R$ 75.000,00',
          status: 'Concluído',
          deadline: '2024-06-30',
          organ: 'Prefeitura Municipal',
          modality: 'Dispensa'
        }
      ],
      total: 3,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Retornando resultados simulados:', mockResults.total, 'licitações');
    res.json(mockResults);
  } catch (error) {
    console.error('❌ Erro na busca:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Proxy: repassa chat ao Groq
app.post('/mcp/chat', async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 1024, top_p = 1, ...rest } = req.body;
    
    console.log('💬 Enviando mensagem para Groq AI');
    console.log('📝 Modelo:', process.env.GROQ_MODEL);
    console.log('🔑 API Key configurada:', process.env.GROQ_API_KEY ? 'Sim' : 'Não');
    
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama3-70b-8192',
        messages,
        temperature,
        max_tokens,
        top_p,
        ...rest
      })
    });

    console.log('📡 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Groq:', response.status, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da IA recebida com sucesso');
    
    res.json(data);
  } catch (error) {
    console.error('❌ Erro no chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: errorMessage,
      details: 'Verifique se a chave da API Groq está configurada corretamente'
    });
  }
});

// Health check melhorado
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'MCP Server',
    version: '1.0.0',
    groq_configured: !!process.env.GROQ_API_KEY,
    groq_model: process.env.GROQ_MODEL || 'llama3-70b-8192',
    port: process.env.PORT || 8080
  };
  
  console.log('💚 Health check realizado:', health);
  res.json(health);
});

// Endpoint de teste
app.get('/test', (req, res) => {
  res.json({
    message: 'MCP Server funcionando!',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health',
      'GET /test', 
      'POST /mcp/search_bids',
      'POST /mcp/chat'
    ]
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log('⚡ MCP Server INICIADO com sucesso!');
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY ? 'Configurada ✅' : 'NÃO configurada ❌'}`);
  console.log(`🤖 Modelo: ${process.env.GROQ_MODEL || 'llama3-70b-8192'}`);
  console.log('🔗 Endpoints disponíveis:');
  console.log('   GET  /health - Status do servidor');
  console.log('   GET  /test - Teste básico');
  console.log('   POST /mcp/search_bids - Busca licitações');
  console.log('   POST /mcp/chat - Chat com IA');
  console.log('🚀 ================================');
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});
