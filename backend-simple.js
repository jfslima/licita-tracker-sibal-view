const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Proxy para API do PNCP
app.get('/api/pncp/*', async (req, res) => {
  try {
    const pncpUrl = `https://pncp.gov.br/api${req.path.replace('/api/pncp', '')}`;
    const queryString = new URLSearchParams(req.query).toString();
    const fullUrl = queryString ? `${pncpUrl}?${queryString}` : pncpUrl;
    
    console.log('🌐 Fazendo requisição para:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'SIBAL-LicitaTracker/1.0'
      }
    });
    
    if (!response.ok) {
      console.error('❌ Erro na resposta:', response.status, response.statusText);
      return res.status(response.status).json({ 
        error: `Erro ${response.status}: ${response.statusText}` 
      });
    }
    
    const data = await response.json();
    console.log('✅ Resposta recebida:', {
      status: response.status,
      total: data.meta?.total || 'N/A',
      items: data.data?.length || 0
    });
    
    res.json(data);
  } catch (error) {
    console.error('❌ Erro no proxy:', error.message);
    res.status(500).json({ error: 'Erro interno do servidor proxy' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor proxy rodando em http://localhost:${PORT}`);
  console.log(`📡 Proxy PNCP disponível em http://localhost:${PORT}/api/pncp/*`);
});