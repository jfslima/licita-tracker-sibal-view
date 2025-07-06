// Importa tipos e pacotes com suas definições de tipo
import * as dotenv from 'dotenv';
// Carrega o arquivo .env da raiz do projeto apenas em ambiente não-produção
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '../../.env' });
}
import express, { Request, Response, NextFunction } from 'express';
import { createMcpServer, z } from '@modelcontextprotocol/sdk';
import fetch from 'node-fetch';
import cors from 'cors';
import { Groq } from 'groq';

const app = express();
const mcp = createMcpServer();

// Middleware de CORS para permitir requisições do frontend
app.use(cors());

// Endpoint de health check para o Railway
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de autenticação para proteger a API
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['api-key'] || req.query.apiKey;
  const validApiKey = process.env.API_KEY || 'local-dev'; // Valor padrão para desenvolvimento local
  
  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({ error: 'Acesso não autorizado - Chave API inválida' });
  }
  
  next();
};

// TOOL: busca licitações por texto
mcp.tool('search_bids',
  z.object({ query: z.string() }),
  async ({ query }: { query: string }) => {
    const url = `https://pncp.gov.br/api/search/?q=${encodeURIComponent(query)}`;
    return (await fetch(url)).json();
  }
);

// Inicializa o cliente Groq com a chave API
const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// PROXY: repassa chat ao Groq usando a biblioteca oficial
mcp.chatCompletionProxy('groq_chat', async ({ messages, temperature = 1, max_tokens, top_p = 1, stream = false, stop = null, ...rest }: { 
  messages: Array<any>; 
  temperature?: number; 
  max_tokens?: number; 
  top_p?: number; 
  stream?: boolean; 
  stop?: string | null; 
  [key: string]: any;
}) => {
  try {
    console.log('Enviando requisição ao Groq:', {
      model: process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
      messageCount: messages.length,
      temperatura: temperature,
      stream
    });
    
    // Usando o cliente Groq oficial para fazer a chamada
    const completion = await groqClient.chat.completions.create({
      model: process.env.GROQ_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages,
      temperature,
      max_tokens: max_tokens || 1024,
      top_p,
      stream,
      stop,
      ...rest
    });
    
    return completion;
  } catch (error) {
    console.error('Erro na chamada ao Groq:', error);
    throw error;
  }
});

// Aplica o middleware de autenticação às rotas MCP
app.use('/mcp', authMiddleware, mcp.router());

// Nota: já temos um endpoint de health na linha anterior, este está comentado para evitar duplicação
// app.get('/health', (req, res) => {
//   res.json({ status: 'OK', timestamp: new Date().toISOString() });
// });

// Inicializa o servidor
const PORT = process.env.PORT ?? 8080;
app.listen(PORT, () => {
  console.log(`⚡ MCP server ON - Porta ${PORT}`);
  console.log(`🔒 API protegida com autenticação via header 'api-key'`);
  console.log(`🔍 Ferramentas disponíveis: search_bids`);
});
