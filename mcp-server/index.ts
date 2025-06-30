
import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json({ limit: '10mb' }));

// CORS middleware mais permissivo e detalhado
app.use((req, res, next) => {
  const origin = req.headers.origin;
  console.log(`🌐 Requisição de origem: ${origin}`);
  
  // Permitir todas as origens Lovable
  if (!origin || origin.includes('lovableproject.com') || origin.includes('lovable.app')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, api-key');
  res.header('Access-Control-Max-Age', '3600');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Respondendo OPTIONS (preflight)');
    res.sendStatus(200);
    return;
  }
  next();
});

// Logging middleware melhorado
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🚀 MCP Server está funcionando!',
    status: 'online',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /health - Status do servidor',
      'GET /test - Teste básico',
      'POST /mcp/search_bids - Busca licitações',
      'POST /mcp/chat - Chat com IA'
    ]
  });
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
    console.log('🔑 API Key configurada:', process.env.GROQ_API_KEY ? 'Sim (oculta)' : 'Não');
    
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY não configurada!');
      return res.status(500).json({
        error: 'Configuração inválida',
        message: 'GROQ_API_KEY não está configurada no servidor',
        details: 'Configure a variável de ambiente GROQ_API_KEY no Railway'
      });
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
      return res.status(response.status).json({
        error: `Erro na API Groq: ${response.status}`,
        message: errorText,
        details: 'Verifique se a chave da API Groq está correta e ativa'
      });
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
      details: 'Verifique se a chave da API Groq está configurada corretamente e se há conectividade com a internet'
    });
  }
});

// Health check detalhado
app.get('/health', (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    server: 'MCP Server Sibal',
    version: '1.0.1',
    groq: {
      configured: !!process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || 'llama3-70b-8192',
      key_preview: process.env.GROQ_API_KEY ? `${process.env.GROQ_API_KEY.substring(0, 8)}...` : 'não configurada'
    },
    environment: {
      node_env: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 8080
    },
    cors: {
      enabled: true,
      origins: 'lovableproject.com, lovable.app, *'
    }
  };
  
  console.log('💚 Health check realizado:', JSON.stringify(health, null, 2));
  res.json(health);
});

// Endpoint de teste com mais informações
app.get('/test', (req, res) => {
  const testInfo = {
    message: '🚀 MCP Server funcionando perfeitamente!',
    timestamp: new Date().toISOString(),
    request_info: {
      origin: req.headers.origin,
      user_agent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    },
    endpoints: [
      'GET / - Informações básicas',
      'GET /health - Status detalhado do servidor',
      'GET /test - Este endpoint de teste', 
      'POST /mcp/search_bids - Busca licitações',
      'POST /mcp/chat - Chat com IA Groq'
    ],
    groq_status: process.env.GROQ_API_KEY ? '✅ Configurado' : '❌ Não configurado'
  };
  
  console.log('🧪 Teste realizado:', testInfo);
  res.json(testInfo);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log('🚀 ================================');
  console.log('⚡ MCP SERVER INICIADO COM SUCESSO!');
  console.log(`🌐 Porta: ${PORT}`);
  console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY ? '✅ Configurada' : '❌ NÃO configurada'}`);
  console.log(`🤖 Modelo: ${process.env.GROQ_MODEL || 'llama3-70b-8192'}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔗 Endpoints disponíveis:');
  console.log('   GET  / - Informações do servidor');
  console.log('   GET  /health - Status detalhado');
  console.log('   GET  /test - Teste de conectividade');
  console.log('   POST /mcp/search_bids - Busca licitações');
  console.log('   POST /mcp/chat - Chat com IA');
  console.log('🚀 ================================');
});

// Tratamento de erros melhorado
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});
