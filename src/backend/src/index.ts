
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: 'https://api.groq.com/openai/v1'
});

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

// Register plugins
await app.register(cors, { origin: true });
await app.register(jwt, { secret: process.env.JWT_SECRET || 'default-secret-for-dev' });

// MCP-like protocol implementation
interface McpRequest {
  jsonrpc: string;
  id: number;
  method: string;
  params?: any;
}

interface McpResponse<T = any> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
  };
}

// Available tools
const tools = {
  async bid_summary(params: { text: string }) {
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
            content: params.text
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
  },

  async bid_analysis(params: { text: string; company_profile: string }) {
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
            content: `EDITAL:\n${params.text}\n\nPERFIL DA EMPRESA:\n${params.company_profile}\n\nAnalise a viabilidade de participação e forneça recomendações.`
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
};

// Available resources
const resources = {
  async licitations(query?: string) {
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
};

// MCP endpoint handler
app.post('/mcp', async (request, reply) => {
  const req = request.body as McpRequest;
  
  try {
    let result: any;

    switch (req.method) {
      case 'tools/call':
        const toolName = req.params?.name;
        const toolArgs = req.params?.arguments || {};
        
        if (toolName in tools) {
          result = await (tools as any)[toolName](toolArgs);
        } else {
          throw new Error(`Tool '${toolName}' not found`);
        }
        break;

      case 'resources/list':
        const resourceType = req.params?.type;
        const resourceQuery = req.params?.query;
        
        if (resourceType === 'licitations') {
          result = { resources: await resources.licitations(resourceQuery) };
        } else {
          throw new Error(`Resource type '${resourceType}' not found`);
        }
        break;

      case 'tools/list':
        result = {
          tools: [
            {
              name: 'bid_summary',
              description: 'Gera resumo de editais de licitação',
              inputSchema: {
                type: 'object',
                properties: {
                  text: { type: 'string', description: 'Texto do edital' }
                },
                required: ['text']
              }
            },
            {
              name: 'bid_analysis',
              description: 'Analisa viabilidade de participação em licitação',
              inputSchema: {
                type: 'object',
                properties: {
                  text: { type: 'string', description: 'Texto do edital' },
                  company_profile: { type: 'string', description: 'Perfil da empresa' }
                },
                required: ['text', 'company_profile']
              }
            }
          ]
        };
        break;

      case 'resources/templates':
        result = {
          resourceTemplates: [
            {
              uriTemplate: 'licitations://{query}',
              name: 'Licitações',
              description: 'Busca licitações por termo'
            }
          ]
        };
        break;

      default:
        throw new Error(`Method '${req.method}' not supported`);
    }

    const response: McpResponse = {
      jsonrpc: '2.0',
      id: req.id,
      result
    };

    reply.send(response);
  } catch (error) {
    const errorResponse: McpResponse = {
      jsonrpc: '2.0',
      id: req.id,
      error: {
        code: -1,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };

    reply.code(400).send(errorResponse);
  }
});

// Health check endpoint
app.get('/health', async (request, reply) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', timestamp: new Date().toISOString() };
  } catch (error) {
    reply.status(500);
    return { status: 'error', message: 'Database connection failed' };
  }
});

// GET endpoint for MCP capabilities
app.get('/mcp', async (request, reply) => {
  return {
    capabilities: {
      tools: {},
      resources: {}
    },
    serverInfo: {
      name: 'licita-tracker-mcp',
      version: '1.0.0'
    }
  };
});

// Start server
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
