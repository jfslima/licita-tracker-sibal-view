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

// Advanced MCP Tools for Commercial Platform
const tools = {
  // Enhanced licitação retrieval with advanced filtering
  async getLicitacao(params: { 
    id?: string; 
    filters?: any; 
    page?: number; 
    limit?: number;
    sort?: string;
    search?: string;
  }) {
    try {
      let query = supabase.from('licitacoes').select('*')
      
      if (params.id) {
        query = query.eq('id', params.id)
      }
      
      if (params.search) {
        query = query.ilike('objeto', `%${params.search}%`)
      }
      
      if (params.filters) {
        if (params.filters.minValue) {
          query = query.gte('valor', params.filters.minValue)
        }
        if (params.filters.maxValue) {
          query = query.lte('valor', params.filters.maxValue)
        }
        if (params.filters.startDate) {
          query = query.gte('criado_em', params.filters.startDate)
        }
        if (params.filters.endDate) {
          query = query.lte('criado_em', params.filters.endDate)
        }
        if (params.filters.category) {
          query = query.ilike('objeto', `%${params.filters.category}%`)
        }
      }
      
      // Apply sorting
      if (params.sort) {
        const [field, direction] = params.sort.split(':')
        query = query.order(field, { ascending: direction === 'asc' })
      } else {
        query = query.order('criado_em', { ascending: false })
      }
      
      const page = params.page || 1
      const limit = params.limit || 10
      query = query.range((page - 1) * limit, page * limit - 1)
      
      const { data, error } = await query
      
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching licitações:', error)
      throw new Error(`Erro ao buscar licitação: ${error.message}`)
    }
  },

  // Create new licitação with validation
  async createLicitacao(params: { 
    objeto: string; 
    valor?: number; 
    prazo?: string; 
    rawData?: any;
    category?: string;
    agency?: string;
  }) {
    try {
      const { data, error } = await supabase
        .from('licitacoes')
        .insert({
          objeto: params.objeto,
          valor: params.valor,
          prazo: params.prazo,
          raw_data: {
            ...params.rawData,
            category: params.category,
            agency: params.agency,
            created_by: 'mcp_api'
          }
        })
        .select()
        .single()
        
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating licitação:', error)
      throw new Error(`Erro ao criar licitação: ${error.message}`)
    }
  },

  // Search PNCP with advanced filters
  async searchPNCP(params: {
    query?: string;
    state?: string;
    city?: string;
    agency?: string;
    modality?: string;
    min_value?: number;
    max_value?: number;
    date_from?: string;
    date_to?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    try {
      // Mock data for demonstration - in production this would call PNCP API
      const mockResults = {
        total: 150,
        page: params.page || 1,
        limit: params.limit || 20,
        results: [
          {
            id: `pncp_${Date.now()}`,
            objeto: `${params.query || 'Equipamentos de TI'} - Pregão Eletrônico`,
            valor: Math.floor(Math.random() * 1000000),
            orgao: params.agency || 'Prefeitura Municipal',
            modalidade: params.modality || 'Pregão Eletrônico',
            situacao: params.status || 'Em andamento',
            data_abertura: new Date().toISOString(),
            municipio: params.city || 'São Paulo',
            uf: params.state || 'SP',
            url_edital: 'https://pncp.gov.br/edital/123456'
          }
        ]
      }
      
      return mockResults
    } catch (error) {
      console.error('Error searching PNCP:', error)
      throw error
    }
  },

  // Create and manage user alerts
  async manageAlerts(params: {
    action: 'create' | 'update' | 'delete' | 'list';
    alert_data?: any;
    alert_id?: string;
    user_id?: string;
  }) {
    try {
      const userId = params.user_id || '00000000-0000-0000-0000-000000000000'
      
      switch (params.action) {
        case 'create':
          const { data: newAlert, error: createError } = await supabase
            .from('user_alerts')
            .insert({
              user_id: userId,
              name: params.alert_data.name,
              keywords: params.alert_data.keywords,
              filters: params.alert_data.filters || {},
              notification_email: params.alert_data.notification_email !== false,
              notification_sms: params.alert_data.notification_sms || false
            })
            .select()
            .single()
            
          if (createError) throw createError
          return newAlert
          
        case 'list':
          // Return mock alerts for demo
          return [
            {
              id: '1',
              name: 'Alerta TI',
              keywords: ['tecnologia', 'software'],
              is_active: true,
              created_at: new Date().toISOString()
            }
          ]
          
        default:
          throw new Error('Invalid action')
      }
    } catch (error) {
      console.error('Error managing alerts:', error)
      throw error
    }
  },

  // Get business intelligence analytics
  async getAnalytics(params: {
    user_id?: string;
    period?: string;
    metrics?: string[];
  }) {
    try {
      // Return mock analytics data
      const processed = {
        period: params.period || '30d',
        total_searches: 45,
        total_analyses: 12,
        top_categories: {},
        search_trends: [],
        success_rate: 0.85,
        roi_estimate: 2.3
      }
      
      return processed
    } catch (error) {
      console.error('Error getting analytics:', error)
      throw error
    }
  },

  // Get subscription information
  async getSubscription(params: { user_id?: string }) {
    try {
      const userId = params.user_id || '00000000-0000-0000-0000-000000000000'
      
      // Get subscription plans
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true })
        
      if (plansError) throw plansError
      
      return {
        current_subscription: {
          subscription_plans: plans[0] // Mock current plan
        },
        available_plans: plans,
        usage_stats: {
          searches_used: 45,
          alerts_used: 3,
          ai_analyses_used: 12
        }
      }
    } catch (error) {
      console.error('Error getting subscription:', error)
      throw error
    }
  },

  // Legacy method for compatibility
  async analizarLicitacao(params: { id: string; texto: string }) {
    try {
      console.log('Analyzing licitacao:', params.id)
      
      const mockAnalysis = {
        id: params.id,
        objeto: 'Análise concluída',
        resumo_ia: 'Análise de viabilidade realizada com sucesso',
        created_at: new Date().toISOString()
      }
      
      return mockAnalysis
    } catch (error) {
      console.error('Error in analizarLicitacao:', error)
      throw new Error(`Erro na análise IA: ${error.message}`)
    }
  }
}

serve(async (req) => {
  console.log('MCP API called:', req.method, req.url)
  
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
          name: 'sibal-pro-mcp',
          version: '1.0.0'
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const mcpRequest: McpRequest = await req.json()
    console.log('MCP Request:', mcpRequest)
    
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
              description: 'Buscar licitações com filtros avançados',
              inputSchema: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'ID da licitação (opcional)' },
                  filters: { type: 'object', description: 'Filtros de busca' },
                  page: { type: 'number', description: 'Página' },
                  limit: { type: 'number', description: 'Limite por página' },
                  sort: { type: 'string', description: 'Ordenação (campo:asc/desc)' },
                  search: { type: 'string', description: 'Busca por texto' }
                }
              }
            },
            {
              name: 'searchPNCP',
              description: 'Busca avançada no PNCP',
              inputSchema: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: 'Termo de busca' },
                  state: { type: 'string', description: 'Estado (UF)' },
                  city: { type: 'string', description: 'Cidade' },
                  agency: { type: 'string', description: 'Órgão' }
                }
              }
            },
            {
              name: 'manageAlerts',
              description: 'Gerenciar alertas de licitações',
              inputSchema: {
                type: 'object',
                properties: {
                  action: { type: 'string', description: 'create, update, delete, list' }
                },
                required: ['action']
              }
            },
            {
              name: 'getAnalytics',
              description: 'Obter analytics e relatórios',
              inputSchema: {
                type: 'object',
                properties: {
                  period: { type: 'string', description: '7d, 30d, 90d, 1y' }
                }
              }
            },
            {
              name: 'getSubscription',
              description: 'Informações de assinatura e planos',
              inputSchema: {
                type: 'object',
                properties: {
                  user_id: { type: 'string', description: 'ID do usuário' }
                }
              }
            }
          ]
        }
        break

      case 'tools/call':
        const toolName = mcpRequest.params?.name
        const toolParams = mcpRequest.params?.arguments || {}

        console.log('Calling tool:', toolName, 'with params:', toolParams)

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
            console.error('Tool error:', error)
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

    console.log('MCP Response:', response)
    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('MCP API Error:', error)
    return new Response(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: error.message
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})