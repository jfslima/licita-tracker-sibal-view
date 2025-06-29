
import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, api-key');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Tool: busca licitações por texto
app.post('/mcp/search_bids', async (req, res) => {
  try {
    const { query } = req.body;
    console.log('🔍 Buscando licitações:', query);
    
    // Simulação de busca no PNCP (substitua pela API real)
    const mockResults = {
      results: [
        {
          id: '001',
          title: `Licitação para ${query}`,
          description: `Processo licitatório relacionado a ${query}`,
          value: 'R$ 150.000,00',
          status: 'Aberto',
          deadline: '2024-02-15'
        },
        {
          id: '002', 
          title: `Pregão Eletrônico - ${query}`,
          description: `Aquisição de itens relacionados a ${query}`,
          value: 'R$ 85.000,00',
          status: 'Em andamento',
          deadline: '2024-02-20'
        }
      ],
      total: 2
    };
    
    res.json(mockResults);
  } catch (error) {
    console.error('Erro na busca:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Proxy: repassa chat ao Groq
app.post('/mcp/chat', async (req, res) => {
  try {
    const { messages, ...rest } = req.body;
    console.log('💬 Enviando mensagem para Groq');
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages,
        ...rest
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Erro no chat:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`⚡ MCP Server rodando na porta ${PORT}`);
  console.log(`🔗 Endpoints disponíveis:`);
  console.log(`   GET  /health`);
  console.log(`   POST /mcp/search_bids`);
  console.log(`   POST /mcp/chat`);
});
