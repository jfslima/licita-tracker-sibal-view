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
      throw new Error(`Erro ao criar licitação: ${error.message}`)
    }
  },

  // Advanced AI analysis with multiple analysis types
  async analyzeViability(params: { 
    licitacao_id: string; 
    company_profile?: any;
    analysis_type: string;
  }) {
    try {
      const groqApiKey = Deno.env.get('GROQ_API_KEY')
      if (!groqApiKey) {
        throw new Error('GROQ_API_KEY not configured')
      }

      // Get licitação data
      const { data: licitacao, error } = await supabase
        .from('licitacoes')
        .select('*')
        .eq('id', params.licitacao_id)
        .single()

      if (error) throw error

      let analysisPrompt = ''
      
      switch (params.analysis_type) {
        case 'viability':
          analysisPrompt = `
            Analise a viabilidade desta licitação para uma empresa com o seguinte perfil:
            ${JSON.stringify(params.company_profile || 'Perfil não informado')}
            
            Licitação: ${licitacao.objeto}
            Valor: ${licitacao.valor}
            Prazo: ${licitacao.prazo}
            
            Forneça análise em JSON:
            {
              "viability_score": 0-100,
              "recommendation": "PARTICIPAR|AVALIAR|EVITAR",
              "key_factors": ["fator1", "fator2"],
              "required_capabilities": ["cap1", "cap2"],
              "estimated_effort": "Alto|Médio|Baixo",
              "profit_potential": "Alto|Médio|Baixo",
              "risk_assessment": "Alto|Médio|Baixo",
              "competitive_advantage": ["vantagem1", "vantagem2"],
              "preparation_time": "dias necessários para preparar proposta"
            }
          `
          break
          
        case 'competition':
          analysisPrompt = `
            Analise o cenário competitivo desta licitação:
            ${licitacao.objeto}
            
            Forneça análise em JSON:
            {
              "competition_level": "Alto|Médio|Baixo",
              "typical_competitors": ["tipo1", "tipo2"],
              "market_size": "Grande|Médio|Pequeno",
              "entry_barriers": ["barreira1", "barreira2"],
              "success_factors": ["fator1", "fator2"],
              "pricing_strategy": "Estratégia recomendada",
              "differentiation_opportunities": ["oportunidade1", "oportunidade2"]
            }
          `
          break
          
        case 'pricing':
          analysisPrompt = `
            Analise a estratégia de preços para esta licitação:
            ${licitacao.objeto}
            Valor estimado: ${licitacao.valor}
            
            Forneça análise em JSON:
            {
              "suggested_price_range": "faixa de preços",
              "cost_breakdown": ["item1", "item2"],
              "margin_recommendation": "percentual sugerido",
              "pricing_strategy": "estratégia",
              "risk_factors": ["risco1", "risco2"],
              "optimization_tips": ["dica1", "dica2"]
            }
          `
          break
          
        default:
          analysisPrompt = `
            Analise esta licitação de forma estratégica:
            ${licitacao.objeto}
            
            Forneça insights em JSON com campos relevantes.
          `
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'Você é um consultor especialista em licitações públicas brasileiras com 20 anos de experiência. Forneça análises precisas e estratégicas em formato JSON válido.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 3000
        }),
      })

      if (!response.ok) {
        throw new Error(`Groq API error: ${response.statusText}`)
      }

      const groqData = await response.json()
      const analysisResult = groqData.choices[0].message.content

      // Store analysis request in database
      const { data: analysisData, error: analysisError } = await supabase
        .from('ai_analysis_requests')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // TODO: Get from auth
          licitacao_id: params.licitacao_id,
          analysis_type: params.analysis_type,
          input_data: params.company_profile || {},
          result: { analysis: analysisResult },
          status: 'completed',
          tokens_used: groqData.usage?.total_tokens || 0,
          completed_at: new Date().toISOString()
        })
        .select()
        .single()

      if (analysisError) console.error('Error storing analysis:', analysisError)

      return {
        licitacao: licitacao,
        analysis: analysisResult,
        analysis_id: analysisData?.id
      }
    } catch (error) {
      console.error('Error in AI analysis:', error)
      throw new Error(`Erro na análise IA: ${error.message}`)
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
      // This would integrate with PNCP API
      // For now, returning mock data structure
      const mockResults = {
        total: 150,
        page: params.page || 1,
        limit: params.limit || 20,
        results: [
          {
            id: `pncp_${Date.now()}`,
            objeto: `${params.query || 'Equipamentos de TI'} - Pregão Eletrônico`,
            valor: Math.random() * 1000000,
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
          const { data: alerts, error: listError } = await supabase
            .from('user_alerts')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            
          if (listError) throw listError
          return alerts
          
        case 'update':
          const { data: updatedAlert, error: updateError } = await supabase
            .from('user_alerts')
            .update(params.alert_data)
            .eq('id', params.alert_id)
            .eq('user_id', userId)
            .select()
            .single()
            
          if (updateError) throw updateError
          return updatedAlert
          
        case 'delete':
          const { error: deleteError } = await supabase
            .from('user_alerts')
            .delete()
            .eq('id', params.alert_id)
            .eq('user_id', userId)
            
          if (deleteError) throw deleteError
          return { success: true }
          
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
      const userId = params.user_id || '00000000-0000-0000-0000-000000000000'
      const period = params.period || '30d'
      
      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (period) {
        case '7d':
          startDate.setDate(endDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(endDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(endDate.getDate() - 90)
          break
        case '1y':
          startDate.setFullYear(endDate.getFullYear() - 1)
          break
      }
      
      // Get user analytics
      const { data: analytics, error } = await supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        
      if (error) throw error
      
      // Process analytics data
      const processed = {
        period: period,
        total_searches: analytics.filter(a => a.action === 'search').length,
        total_analyses: analytics.filter(a => a.action === 'ai_analysis').length,
        top_categories: {},
        search_trends: [],
        success_rate: 0.85, // Mock data
        roi_estimate: 2.3 // Mock data
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
      
      const { data: subscription, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()
        
      if (error && error.code !== 'PGRST116') throw error
      
      // Get all available plans
      const { data: plans, error: plansError } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price_monthly', { ascending: true })
        
      if (plansError) throw plansError
      
      return {
        current_subscription: subscription,
        available_plans: plans,
        usage_stats: {
          searches_used: 45, // Mock data
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
    return await this.analyzeViability({
      licitacao_id: params.id,
      analysis_type: 'viability',
      company_profile: { texto: params.texto }
    })
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
              name: 'createLicitacao',
              description: 'Criar nova licitação',
              inputSchema: {
                type: 'object',
                properties: {
                  objeto: { type: 'string', description: 'Objeto da licitação' },
                  valor: { type: 'number', description: 'Valor estimado' },
                  prazo: { type: 'string', description: 'Prazo de execução' },
                  rawData: { type: 'object', description: 'Dados brutos do edital' },
                  category: { type: 'string', description: 'Categoria' },
                  agency: { type: 'string', description: 'Órgão responsável' }
                },
                required: ['objeto']
              }
            },
            {
              name: 'analyzeViability',
              description: 'Análise avançada de viabilidade com IA',
              inputSchema: {
                type: 'object',
                properties: {
                  licitacao_id: { type: 'string', description: 'ID da licitação' },
                  company_profile: { type: 'object', description: 'Perfil da empresa' },
                  analysis_type: { type: 'string', description: 'Tipo: viability, competition, pricing' }
                },
                required: ['licitacao_id', 'analysis_type']
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
                  agency: { type: 'string', description: 'Órgão' },
                  modality: { type: 'string', description: 'Modalidade' },
                  min_value: { type: 'number', description: 'Valor mínimo' },
                  max_value: { type: 'number', description: 'Valor máximo' },
                  page: { type: 'number', description: 'Página' }
                }
              }
            },
            {
              name: 'manageAlerts',
              description: 'Gerenciar alertas de licitações',
              inputSchema: {
                type: 'object',
                properties: {
                  action: { type: 'string', description: 'create, update, delete, list' },
                  alert_data: { type: 'object', description: 'Dados do alerta' },
                  alert_id: { type: 'string', description: 'ID do alerta (para update/delete)' },
                  user_id: { type: 'string', description: 'ID do usuário' }
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
                  user_id: { type: 'string', description: 'ID do usuário' },
                  period: { type: 'string', description: '7d, 30d, 90d, 1y' },
                  metrics: { type: 'array', description: 'Métricas específicas' }
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
            },
            {
              name: 'analizarLicitacao',
              description: 'Análise básica de licitação (compatibilidade)',
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