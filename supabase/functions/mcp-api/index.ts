import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface McpRequest {
  jsonrpc: string
  id: number
  method: string
  params?: any
}

interface McpResponse {
  jsonrpc: string
  id: number
  result?: any
  error?: {
    code: number
    message: string
    data?: any
  }
}

// Initialize Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

// MCP Tools
const tools = {
  async getLicitacao(params: { id?: string }) {
    try {
      if (params.id) {
        const { data, error } = await supabase
          .from('licitacoes')
          .select('*')
          .eq('id', params.id)
          .single()
        
        if (error) throw error
        return data
      } else {
        const { data, error } = await supabase
          .from('licitacoes')
          .select('*')
          .order('criado_em', { ascending: false })
          .limit(10)
        
        if (error) throw error
        return data
      }
    } catch (error) {
      throw new Error(`Erro ao buscar licitação: ${error.message}`)
    }
  },

  async createLicitacao(params: { objeto: string; valor?: number; prazo?: string; rawData?: any }) {
    try {
      const { data, error } = await supabase
        .from('licitacoes')
        .insert({
          objeto: params.objeto,
          valor: params.valor,
          prazo: params.prazo,
          raw_data: params.rawData || {}
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    } catch (error) {
      throw new Error(`Erro ao criar licitação: ${error.message}`)
    }
  },

  async analizarLicitacao(params: { id: string; texto: string }) {
    try {
      console.log('Analyzing licitacao:', params.id)
      
      // Chamar Groq API para análise
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Você é um especialista em análise de licitações brasileiras. Analise o edital e forneça um resumo estruturado com: objeto, valor estimado, prazo de execução, requisitos principais e riscos.'
            },
            {
              role: 'user',
              content: `Analise esta licitação: ${params.texto}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.1
        }),
      })

      if (!groqResponse.ok) {
        const errorText = await groqResponse.text()
        console.error('Groq API error:', groqResponse.status, errorText)
        throw new Error(`Groq API error: ${groqResponse.status}`)
      }

      const groqData = await groqResponse.json()
      const resumoIA = groqData.choices[0].message.content

      // Atualizar licitação com resumo da IA
      const { data, error } = await supabase
        .from('licitacoes')
        .update({ resumo_ia: resumoIA })
        .eq('id', params.id)
        .select()
        .single()

      if (error) {
        console.error('Database error:', error)
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error in analizarLicitacao:', error)
      throw new Error(`Erro na análise IA: ${error.message}`)
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (req.method === 'GET') {
      // Return MCP capabilities
      return new Response(JSON.stringify({
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {
            listChanged: false
          },
          resources: {
            listChanged: false
          }
        },
        serverInfo: {
          name: 'super-mcp-licitacoes',
          version: '1.0.0'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const mcpRequest: McpRequest = await req.json()
    
    // Validate JSON-RPC 2.0 format
    if (mcpRequest.jsonrpc !== '2.0' || typeof mcpRequest.id !== 'number') {
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        id: mcpRequest.id || null,
        error: {
          code: -32600,
          message: 'Invalid Request'
        }
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    let response: McpResponse = {
      jsonrpc: '2.0',
      id: mcpRequest.id
    }

    switch (mcpRequest.method) {
      case 'tools/list':
        response.result = {
          tools: [
            {
              name: 'getLicitacao',
              description: 'Buscar licitações por ID ou listar recentes',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'ID da licitação (opcional)' }
                }
              }
            },
            {
              name: 'createLicitacao',
              description: 'Criar nova licitação',
              inputSchema: {
                type: 'object',
                properties: {
                  objeto: { type: 'string', description: 'Objeto da licitação' },
                  valor: { type: 'number', description: 'Valor estimado' },
                  prazo: { type: 'string', description: 'Prazo de execução' },
                  rawData: { type: 'object', description: 'Dados brutos do edital' }
                },
                required: ['objeto']
              }
            },
            {
              name: 'analizarLicitacao',
              description: 'Analisar licitação com IA',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'ID da licitação' },
                  texto: { type: 'string', description: 'Texto do edital' }
                },
                required: ['id', 'texto']
              }
            }
          ]
        }
        break

      case 'tools/call':
        const toolName = mcpRequest.params?.name
        const toolParams = mcpRequest.params?.arguments || {}

        if (tools[toolName]) {
          try {
            const result = await tools[toolName](toolParams)
            response.result = {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2)
                }
              ]
            }
          } catch (error) {
            response.error = {
              code: -32603,
              message: error.message
            }
          }
        } else {
          response.error = {
            code: -32601,
            message: `Tool '${toolName}' not found`
          }
        }
        break

      case 'resources/list':
        response.result = {
          resources: [
            {
              uri: 'licitacoes://recent',
              name: 'Licitações Recentes',
              description: 'Lista das licitações mais recentes',
              mimeType: 'application/json'
            }
          ]
        }
        break

      default:
        response.error = {
          code: -32601,
          message: `Unknown method: ${mcpRequest.method}`
        }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('MCP API Error:', error)
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})