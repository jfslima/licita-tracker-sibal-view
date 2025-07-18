const http = require('http');
const url = require('url');
const querystring = require('querystring');

// Configuração da API Groq
require('dotenv').config();
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY não encontrada nas variáveis de ambiente!');
  process.exit(1);
}

// Função para fazer requisições HTTP
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = require('https').request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

// Função para chamar a API do Groq
async function callGroqAPI(messages, mode = 'consultant') {
  let systemPrompt = 'Você é um assistente útil e preciso.';
  
  if (mode === 'consultant') {
    systemPrompt = `Você é um consultor especializado em licitações públicas com 20 anos de experiência. 
      Forneça análises jurídicas precisas, interpretações de cláusulas contratuais e orientações estratégicas.
      Seja técnico mas acessível, sempre citando a legislação aplicável (Lei 8.666/93, Lei 14.133/21).`;
  } else if (mode === 'teacher') {
    systemPrompt = `Você é um professor universitário especializado em direito administrativo e licitações.
      Explique conceitos de forma didática, use exemplos e esclareça dúvidas com paciência.
      Cite legislação, jurisprudência e doutrina relevantes para enriquecer suas explicações.`;
  }
  
  const finalMessages = messages[0]?.role === 'system' 
    ? [...messages] 
    : [{ role: 'system', content: systemPrompt }, ...messages];

  const requestData = {
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    messages: finalMessages,
    temperature: 0.2,
    max_tokens: 2048,
    top_p: 1
  };

  const options = {
    hostname: 'api.groq.com',
    port: 443,
    path: '/openai/v1/chat/completions',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    }
  };

  try {
    const response = await makeRequest(options, JSON.stringify(requestData));
    return {
      content: response.choices[0].message.content,
      model: response.model,
      usage: response.usage
    };
  } catch (error) {
    console.error('Erro ao chamar Groq API:', error);
    throw new Error(`Erro ao processar solicitação: ${error.message}`);
  }
}

// Servidor HTTP
const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, api-key');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'POST' && parsedUrl.pathname === '/mcp') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const mcpRequest = JSON.parse(body);
        
        if (mcpRequest.method === 'tools/call' && mcpRequest.params?.name === 'chat_with_ai') {
          const { messages, mode, documentContent, analysisType } = mcpRequest.params.arguments;
          
          let finalMessages = [...messages];
          
          // Se houver conteúdo de documento para análise
          if (documentContent && analysisType) {
            const analysisPrompt = `Analise o seguinte edital de licitação e forneça: 
              ${analysisType === 'summary' ? 'um resumo conciso dos principais pontos' : ''}
              ${analysisType === 'risks' ? 'os principais riscos e pontos de atenção' : ''}
              ${analysisType === 'opportunities' ? 'as principais oportunidades e vantagens competitivas' : ''}
              ${analysisType === 'full' ? 'uma análise completa incluindo resumo, riscos, oportunidades e recomendações' : ''}
              
              DOCUMENTO:
              ${documentContent}`;
              
            finalMessages.push({ role: 'user', content: analysisPrompt });
          }
          
          const result = await callGroqAPI(finalMessages, mode);
          
          const mcpResponse = {
            jsonrpc: '2.0',
            id: mcpRequest.id,
            result: result
          };
          
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(mcpResponse));
        } else {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: mcpRequest.id,
            error: { code: -32601, message: 'Method not found' }
          }));
        }
      } catch (error) {
        console.error('Erro no servidor MCP:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          error: { code: -32603, message: error.message }
        }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`🚀 Servidor MCP rodando na porta ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🤖 Groq API configurada e pronta!`);
});