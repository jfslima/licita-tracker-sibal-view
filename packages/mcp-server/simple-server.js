// Servidor Express simples que simula um servidor MCP
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const API_KEY = process.env.API_KEY || 'local-dev';

// Middleware para parsing JSON e CORS
app.use(cors());
app.use(express.json());

// Middleware de autenticação
app.use((req, res, next) => {
  const apiKey = req.headers['api-key'] || req.query.apiKey;
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Acesso não autorizado - Chave API inválida' });
  }
  
  next();
});

// Rota de health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rota MCP para chat
app.post('/mcp', (req, res) => {
  try {
    const { type, arguments: args } = req.body;
    
    console.log('Recebida requisição:', { type, messageCount: args?.messages?.length });
    
    if (type === 'chat') {
      // Simula resposta da IA
      setTimeout(() => {
        res.json({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Esta é uma resposta simulada do servidor MCP. O servidor real com Groq ainda não está configurado adequadamente. Por favor, configure o servidor MCP com sua chave de API Groq válida para respostas reais.'
              }
            }
          ]
        });
      }, 500);
    } else if (type === 'tool' && args?.name === 'search_bids') {
      // Simula resposta da ferramenta search_bids
      setTimeout(() => {
        res.json({
          result: JSON.stringify([
            { 
              id: "0001/2025", 
              title: "Aquisição de Combustíveis", 
              date: "2025-06-29",
              value: "R$ 1.500.000,00",
              status: "Aberto"
            },
            { 
              id: "0002/2025", 
              title: "Fornecimento de Diesel para Frota Municipal", 
              date: "2025-06-15",
              value: "R$ 2.300.000,00",
              status: "Em andamento"
            }
          ])
        });
      }, 300);
    } else {
      res.status(400).json({ error: 'Tipo de requisição não suportado' });
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`⚡ Servidor MCP simplificado rodando na porta ${PORT}`);
  console.log(`🔒 API protegida com autenticação via header 'api-key'`);
  console.log(`🔍 Endpoint: http://localhost:${PORT}/mcp`);
});
