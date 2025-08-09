import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Server } from "https://esm.sh/@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "https://esm.sh/@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "https://esm.sh/@modelcontextprotocol/sdk/types.js";

// Importar todas as ferramentas
import { fetchNotices } from "./tools/fetch_notices.ts";
import { riskClassifier } from "./tools/risk_classifier.ts";
import { summarizeNotice } from "./tools/summarize_notice.ts";
import { processDocument } from "./tools/process_document.ts";
import { generateProposalInsights } from "./tools/generate_proposal_insights.ts";
import { monitorDeadlines } from "./tools/monitor_deadlines.ts";

import { Counter, Gauge, Registry, Histogram } from "https://deno.land/x/ts_prometheus/mod.ts";

interface McpRequest {
  jsonrpc: "2.0";
  method: string;
  params?: any;
  id: string | number;
}

interface McpResponse {
  jsonrpc: "2.0";
  result?: any;
  error?: { code: number; message: string };
  id: string | number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Configuração do servidor MCP
const server = new Server(
  {
    name: "sibal-licita-tracker-mcp",
    version: "2.0.0",
    description: "Servidor MCP unificado para análise inteligente de licitações do SIBAL",
  },
  {
    capabilities: {
      tools: {},
      logging: {},
      prompts: {},
    },
  }
);

// Definir ferramentas disponíveis
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "fetch_notices",
        description: "Busca editais de licitação com filtros avançados e análise de urgência",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Termo de busca semântica",
            },
            organ: {
              type: "string",
              description: "Órgão responsável pela licitação",
            },
            modality: {
              type: "string",
              description: "Modalidade da licitação (pregão, concorrência, etc.)",
            },
            min_value: {
              type: "number",
              description: "Valor mínimo estimado em reais",
            },
            max_value: {
              type: "number",
              description: "Valor máximo estimado em reais",
            },
            limit: {
              type: "number",
              description: "Limite de resultados (máximo 100)",
              default: 20,
              maximum: 100,
            },
          },
        },
      },
      {
        name: "risk_classifier",
        description: "Classifica o risco de participação em um edital usando IA",
        inputSchema: {
          type: "object",
          properties: {
            notice_id: {
              type: "string",
              description: "UUID do edital a ser analisado",
              format: "uuid",
            },
          },
          required: ["notice_id"],
        },
      },
      {
        name: "summarize_notice",
        description: "Gera resumo inteligente e estruturado de um edital",
        inputSchema: {
          type: "object",
          properties: {
            notice_id: {
              type: "string",
              description: "UUID do edital a ser resumido",
              format: "uuid",
            },
          },
          required: ["notice_id"],
        },
      },
      {
        name: "process_document",
        description: "Processa documentos de licitação extraindo informações estruturadas com IA",
        inputSchema: {
          type: "object",
          properties: {
            notice_id: {
              type: "string",
              description: "UUID do edital relacionado",
              format: "uuid",
            },
            document_url: {
              type: "string",
              description: "URL do documento a ser processado",
              format: "uri",
            },
            document_type: {
              type: "string",
              enum: ["edital", "anexo", "ata", "resultado"],
              description: "Tipo do documento",
            },
          },
          required: ["notice_id", "document_url", "document_type"],
        },
      },
      {
        name: "generate_proposal_insights",
        description: "Gera insights estratégicos personalizados para elaboração de propostas",
        inputSchema: {
          type: "object",
          properties: {
            notice_id: {
              type: "string",
              description: "UUID do edital",
              format: "uuid",
            },
            company_profile: {
              type: "object",
              description: "Perfil detalhado da empresa",
              properties: {
                name: { type: "string" },
                sector: { type: "string" },
                size: { type: "string", enum: ["micro", "pequena", "média", "grande"] },
                experience_years: { type: "number" },
                specialties: { type: "array", items: { type: "string" } },
                certifications: { type: "array", items: { type: "string" } },
                previous_contracts: { type: "array" },
              },
            },
          },
          required: ["notice_id"],
        },
      },
      {
        name: "monitor_deadlines",
        description: "Monitora prazos de licitações e gera alertas inteligentes",
        inputSchema: {
          type: "object",
          properties: {
            company_id: {
              type: "string",
              description: "Identificador da empresa",
            },
            days_ahead: {
              type: "number",
              description: "Dias de antecedência para alertas (1-90)",
              default: 30,
              minimum: 1,
              maximum: 90,
            },
          },
          required: ["company_id"],
        },
      },
    ],
  };
});

// Handler para chamadas de ferramentas
// Métricas Prometheus
const registry = new Registry();
const toolCallsTotal = Counter.with({
  name: "mcp_tool_calls_total",
  help: "Total de chamadas de ferramentas MCP",
  labels: ["tool_name", "status"],
  registry: [registry],
});
const toolDuration = Histogram.with({
  name: "mcp_tool_duration_seconds",
  help: "Duração das chamadas de ferramentas em segundos",
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  labels: ["tool_name"],
  registry: [registry],
});
const activeRequests = Gauge.with({
  name: "mcp_active_requests",
  help: "Número de requisições ativas",
  registry: [registry],
});

// No handler CallToolRequestSchema
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  activeRequests.inc();
  const startTime = performance.now();
  let status = "success";

  try {
    let result: any;

    switch (name) {
      case "fetch_notices":
        result = await fetchNotices(supabase, args);
        break;
      case "risk_classifier":
        result = await riskClassifier(supabase, args);
        break;
      case "summarize_notice":
        result = await summarizeNotice(supabase, args);
        break;
      case "process_document":
        result = await processDocument(supabase, args);
        break;
      case "generate_proposal_insights":
        result = await generateProposalInsights(supabase, args);
        break;
      case "monitor_deadlines":
        result = await monitorDeadlines(supabase, args);
        break;
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Ferramenta desconhecida: ${name}`
        );
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    status = "error";
    console.error(`Erro na ferramenta ${name}:`, error);
    throw new McpError(
      ErrorCode.InternalError,
      `Erro ao executar ${name}: ${error.message}`
    );
  } finally {
    activeRequests.dec();
    const duration = (performance.now() - startTime) / 1000;
    toolDuration.labels({ tool_name: name }).observe(duration);
    toolCallsTotal.labels({ tool_name: name, status }).inc();
  }
});

// Adicionar rota /metrics no serve
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verificação JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized - Missing or invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }

  const token = authHeader.split(' ')[1];

  const userSupabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await userSupabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const mcpRequest: McpRequest = await req.json();
    let result: any;

    switch (mcpRequest.method) {
      case "tools/list":
        result = {
          tools: [
            {
              name: "fetch_notices",
              description: "Busca editais de licitação com filtros avançados e análise de urgência",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Termo de busca semântica" },
                  organ: { type: "string", description: "Órgão responsável pela licitação" },
                  modality: { type: "string", description: "Modalidade da licitação" },
                  min_value: { type: "number", description: "Valor mínimo estimado" },
                  max_value: { type: "number", description: "Valor máximo estimado" },
                  limit: { type: "number", description: "Limite de resultados", default: 20, maximum: 100 }
                }
              }
            },
            {
              name: "risk_classifier",
              description: "Classifica o risco de participação em um edital usando IA",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" }
                },
                required: ["notice_id"]
              }
            },
            {
              name: "summarize_notice",
              description: "Gera resumo inteligente e estruturado de um edital",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" }
                },
                required: ["notice_id"]
              }
            },
            {
              name: "process_document",
              description: "Processa documentos de licitação extraindo informações estruturadas com IA",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" },
                  document_url: { type: "string", description: "URL do documento", format: "uri" },
                  document_type: { type: "string", enum: ["edital", "anexo", "ata", "resultado"] }
                },
                required: ["notice_id", "document_url", "document_type"]
              }
            },
            {
              name: "generate_proposal_insights",
              description: "Gera insights estratégicos personalizados para elaboração de propostas",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" },
                  company_profile: { type: "object", description: "Perfil detalhado da empresa" }
                },
                required: ["notice_id"]
              }
            },
            {
              name: "monitor_deadlines",
              description: "Monitora prazos de licitações e gera alertas inteligentes",
              inputSchema: {
                type: "object",
                properties: {
                  company_id: { type: "string", description: "Identificador da empresa" },
                  days_ahead: { type: "number", default: 30, minimum: 1, maximum: 90, description: "Dias de antecedência" }
                },
                required: ["company_id"]
              }
            }
          ]
        };
        break;

      case "tools/call":
        const { name, arguments: args } = mcpRequest.params;
        
        try {
          switch (name) {
            case "fetch_notices":
              result = await fetchNotices(supabase, args);
              break;
            case "risk_classifier":
              result = await riskClassifier(supabase, args);
              break;
            case "summarize_notice":
              result = await summarizeNotice(supabase, args);
              break;
            case "process_document":
              result = await processDocument(supabase, args);
              break;
            case "generate_proposal_insights":
              result = await generateProposalInsights(supabase, args);
              break;
            case "monitor_deadlines":
              result = await monitorDeadlines(supabase, args);
              break;
            default:
              throw new Error(`Ferramenta desconhecida: ${name}`);
          }
        } catch (toolError) {
          console.error(`Erro na ferramenta ${name}:`, toolError);
          throw toolError;
        }
        break;

      default:
        throw new Error(`Método não suportado: ${mcpRequest.method}`);
    }

    const response: McpResponse = {
      jsonrpc: "2.0",
      result,
      id: mcpRequest.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (error) {
    console.error("MCP Error:", error);
    
    const errorResponse: McpResponse = {
      jsonrpc: "2.0",
      error: { code: -1, message: error.message },
      id: 0
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }
});

  if (req.method === "GET" && new URL(req.url).pathname === "/metrics") {
    return new Response(registry.metrics(), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

// Inicializar servidor MCP
async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Servidor MCP SIBAL Licita Tracker iniciado");
}

// Executar servidor se for o módulo principal
if (import.meta.main) {
  runServer().catch(console.error);
}

// Também manter compatibilidade com HTTP para desenvolvimento
serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Verificação JWT
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized - Missing or invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }

  const token = authHeader.split(' ')[1];

  const userSupabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await userSupabase.auth.getUser();

  if (error || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const mcpRequest: McpRequest = await req.json();
    let result: any;

    switch (mcpRequest.method) {
      case "tools/list":
        result = {
          tools: [
            {
              name: "fetch_notices",
              description: "Busca editais de licitação com filtros avançados e análise de urgência",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Termo de busca semântica" },
                  organ: { type: "string", description: "Órgão responsável pela licitação" },
                  modality: { type: "string", description: "Modalidade da licitação" },
                  min_value: { type: "number", description: "Valor mínimo estimado" },
                  max_value: { type: "number", description: "Valor máximo estimado" },
                  limit: { type: "number", description: "Limite de resultados", default: 20, maximum: 100 }
                }
              }
            },
            {
              name: "risk_classifier",
              description: "Classifica o risco de participação em um edital usando IA",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" }
                },
                required: ["notice_id"]
              }
            },
            {
              name: "summarize_notice",
              description: "Gera resumo inteligente e estruturado de um edital",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" }
                },
                required: ["notice_id"]
              }
            },
            {
              name: "process_document",
              description: "Processa documentos de licitação extraindo informações estruturadas com IA",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" },
                  document_url: { type: "string", description: "URL do documento", format: "uri" },
                  document_type: { type: "string", enum: ["edital", "anexo", "ata", "resultado"] }
                },
                required: ["notice_id", "document_url", "document_type"]
              }
            },
            {
              name: "generate_proposal_insights",
              description: "Gera insights estratégicos personalizados para elaboração de propostas",
              inputSchema: {
                type: "object",
                properties: {
                  notice_id: { type: "string", description: "UUID do edital", format: "uuid" },
                  company_profile: { type: "object", description: "Perfil detalhado da empresa" }
                },
                required: ["notice_id"]
              }
            },
            {
              name: "monitor_deadlines",
              description: "Monitora prazos de licitações e gera alertas inteligentes",
              inputSchema: {
                type: "object",
                properties: {
                  company_id: { type: "string", description: "Identificador da empresa" },
                  days_ahead: { type: "number", default: 30, minimum: 1, maximum: 90, description: "Dias de antecedência" }
                },
                required: ["company_id"]
              }
            }
          ]
        };
        break;

      case "tools/call":
        const { name, arguments: args } = mcpRequest.params;
        
        try {
          switch (name) {
            case "fetch_notices":
              result = await fetchNotices(supabase, args);
              break;
            case "risk_classifier":
              result = await riskClassifier(supabase, args);
              break;
            case "summarize_notice":
              result = await summarizeNotice(supabase, args);
              break;
            case "process_document":
              result = await processDocument(supabase, args);
              break;
            case "generate_proposal_insights":
              result = await generateProposalInsights(supabase, args);
              break;
            case "monitor_deadlines":
              result = await monitorDeadlines(supabase, args);
              break;
            default:
              throw new Error(`Ferramenta desconhecida: ${name}`);
          }
        } catch (toolError) {
          console.error(`Erro na ferramenta ${name}:`, toolError);
          throw toolError;
        }
        break;

      default:
        throw new Error(`Método não suportado: ${mcpRequest.method}`);
    }

    const response: McpResponse = {
      jsonrpc: "2.0",
      result,
      id: mcpRequest.id
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });

  } catch (error) {
    console.error("MCP Error:", error);
    
    const errorResponse: McpResponse = {
      jsonrpc: "2.0",
      error: { code: -1, message: error.message },
      id: 0
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" }
    });
  }
});