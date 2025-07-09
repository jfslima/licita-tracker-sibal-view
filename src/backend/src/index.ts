
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from 'fastify-jwt';
import { createMcpServer } from 'fastify-mcp';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1'
});

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Registrar plugins
await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'default-secret-for-dev' });

// Criar servidor MCP
const { mcpHandler, defineResource, defineTool } = createMcpServer(app);

// Definir recurso de licitações
defineResource('licitations', {
  list: async (_ctx, { query }) => {
    try {
      return await prisma.licitation.findMany({
        where: {
          title: {
            contains: query ?? '',
            mode: 'insensitive'
          }
        },
        take: 50,
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (error) {
      console.error('Erro ao buscar licitações:', error);
      return [];
    }
  }
});

// Definir ferramenta de resumo de editais
defineTool('bid_summary', {
  input: {
    type: 'object',
    properties: {
      text: { type: 'string' }
    },
    required: ['text']
  },
  output: { type: 'string' },
  handler: async (_ctx, { text }) => {
    try {
      const chat = await openai.chat.completions.create({
        model: 'llama-3-groq-70b-tool-use',
        messages: [
          {
            role: 'system',
            content: 'Você é um analista especializado em licitações públicas brasileiras. Resuma o texto fornecido em 10 pontos principais, destacando informações relevantes como objeto, valor, prazo, requisitos técnicos e critérios de avaliação.'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      });
      return chat.choices[0].message.content ?? 'Não foi possível gerar o resumo.';
    } catch (error) {
      console.error('Erro ao gerar resumo:', error);
      return 'Erro ao processar o resumo. Verifique a configuração da API.';
    }
  }
});

// Definir ferramenta de análise de viabilidade
defineTool('bid_analysis', {
  input: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      company_profile: { type: 'string' }
    },
    required: ['text', 'company_profile']
  },
  output: { type: 'string' },
  handler: async (_ctx, { text, company_profile }) => {
    try {
      const chat = await openai.chat.completions.create({
        model: 'llama-3-groq-70b-tool-use',
        messages: [
          {
            role: 'system',
            content: 'Você é um consultor especializado em licitações públicas. Analise a viabilidade de participação da empresa no edital, considerando requisitos técnicos, financeiros e operacionais.'
          },
          {
            role: 'user',
            content: `EDITAL:\n${text}\n\nPERFIL DA EMPRESA:\n${company_profile}\n\nAnalise a viabilidade de participação e forneça recomendações.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.4
      });
      return chat.choices[0].message.content ?? 'Não foi possível gerar a análise.';
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      return 'Erro ao processar a análise. Verifique a configuração da API.';
    }
  }
});

// Rota de health check
app.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    reply.status(500);
    return { status: 'error', message: 'Database connection failed' };
  }
});

// Registrar handler MCP
app.route({
  method: ['GET', 'POST'],
  url: '/mcp',
  handler: mcpHandler
});

// Inicializar servidor
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';
    
    await app.listen({ port, host });
    console.log(`🚀 Servidor MCP rodando em http://${host}:${port}`);
    console.log(`📡 Endpoint MCP: http://${host}:${port}/mcp`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Encerrando servidor...');
  await prisma.$disconnect();
  await app.close();
  process.exit(0);
});

start();
