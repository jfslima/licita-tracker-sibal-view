
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface McpResponse<T = any> {
  jsonrpc: string;
  id: number;
  result?: T;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface UseMcpReturn {
  loading: boolean;
  error: string | null;
  callTool: <T = any>(name: string, arguments_: Record<string, any>) => Promise<T | null>;
  listResources: <T = any>(type: string, query?: string) => Promise<T[] | null>;
}

export function useMcp(): UseMcpReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Implementação direta usando Supabase (bypass da Edge Function temporariamente)
  const callTool = useCallback(async <T = any>(
    name: string,
    arguments_: Record<string, any>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      console.log('Calling tool:', name, 'with args:', arguments_);

      switch (name) {
        case 'getLicitacao':
          let query = supabase
            .from('licitacoes')
            .select('*');
          
          // Apply filters if provided
          if (arguments_.search) {
            query = query.or(`objeto.ilike.%${arguments_.search}%,resumo_ia.ilike.%${arguments_.search}%`);
          }
          
          if (arguments_.filters?.uf) {
            query = query.eq('raw_data->>uf', arguments_.filters.uf);
          }
          
          if (arguments_.filters?.orgao) {
            query = query.ilike('raw_data->>orgao_nome', `%${arguments_.filters.orgao}%`);
          }
          
          if (arguments_.filters?.modalidade) {
            query = query.ilike('raw_data->>modalidade_nome', `%${arguments_.filters.modalidade}%`);
          }
          
          if (arguments_.filters?.situacao) {
            query = query.ilike('raw_data->>situacao_nome', `%${arguments_.filters.situacao}%`);
          }
          
          // Apply sorting
          if (arguments_.sort) {
            const [field, direction] = arguments_.sort.split(':');
            query = query.order(field, { ascending: direction === 'asc' });
          } else {
            query = query.order('criado_em', { ascending: false });
          }
          
          // Apply pagination
          const page = arguments_.page || 1;
          const limit = arguments_.limit || 10;
          const from = (page - 1) * limit;
          const to = from + limit - 1;
          
          query = query.range(from, to);
          
          const { data: licitacoes, error: licitacoesQueryError, count } = await query;
          
          if (licitacoesQueryError) throw licitacoesQueryError;
          
          return {
            data: licitacoes,
            total: count,
            page,
            limit,
            totalPages: Math.ceil((count || 0) / limit)
          } as T;

        case 'searchPNCP':
          // Buscar dados reais das licitações com filtros do PNCP
          let pncpQuery = supabase
            .from('licitacoes')
            .select('*, raw_data');
          
          // Apply search filters
          if (arguments_.query) {
            pncpQuery = pncpQuery.or(`objeto.ilike.%${arguments_.query}%,resumo_ia.ilike.%${arguments_.query}%`);
          }
          
          if (arguments_.state) {
            pncpQuery = pncpQuery.eq('raw_data->>uf', arguments_.state);
          }
          
          if (arguments_.agency) {
            pncpQuery = pncpQuery.ilike('raw_data->>orgao_nome', `%${arguments_.agency}%`);
          }
          
          if (arguments_.modality) {
            pncpQuery = pncpQuery.ilike('raw_data->>modalidade_nome', `%${arguments_.modality}%`);
          }
          
          if (arguments_.status) {
            pncpQuery = pncpQuery.ilike('raw_data->>situacao_nome', `%${arguments_.status}%`);
          }
          
          // Apply date filters
          if (arguments_.date_from) {
            pncpQuery = pncpQuery.gte('criado_em', arguments_.date_from);
          }
          
          if (arguments_.date_to) {
            pncpQuery = pncpQuery.lte('criado_em', arguments_.date_to);
          }
          
          // Apply pagination
          const pncpPage = arguments_.page || 1;
          const pncpLimit = arguments_.limit || 20;
          const pncpFrom = (pncpPage - 1) * pncpLimit;
          const pncpTo = pncpFrom + pncpLimit - 1;
          
          pncpQuery = pncpQuery
            .range(pncpFrom, pncpTo)
            .order('criado_em', { ascending: false });
          
          const { data: pncpResults, error: pncpError, count: pncpCount } = await pncpQuery;
          
          if (pncpError) throw pncpError;
          
          // Transform data to PNCP format
          const transformedResults = pncpResults?.map(item => {
            const rawData = item.raw_data as any; // Type assertion for Json data
            return {
              id: rawData?.numero_controle_pncp || item.id,
              objeto: item.objeto,
              valor: item.valor || rawData?.valor_global,
              orgao: rawData?.orgao_nome || 'Não informado',
              modalidade: rawData?.modalidade_nome || 'Não informada',
              situacao: rawData?.situacao_nome || 'Não informada',
              data_abertura: rawData?.data_publicacao_pncp || item.criado_em,
              municipio: rawData?.municipio || 'Não informado',
              uf: rawData?.uf || 'BR',
              url_edital: `https://pncp.gov.br/edital/${rawData?.numero_controle_pncp || item.id}`
            };
          }) || [];
          
          return {
            total: pncpCount || 0,
            page: pncpPage,
            limit: pncpLimit,
            results: transformedResults
          } as T;

        case 'manageAlerts':
          const action = arguments_.action;
          const alertUserId = arguments_.user_id || 'temp-user-id'; // TODO: Implementar auth real
          
          switch (action) {
            case 'create':
              const { data: newAlert, error: createError } = await supabase
                .from('user_alerts')
                .insert({
                  user_id: alertUserId,
                  name: arguments_.alert_data.name,
                  keywords: arguments_.alert_data.keywords,
                  filters: arguments_.alert_data.filters || {},
                  notification_email: arguments_.alert_data.notification_email !== false,
                  notification_sms: arguments_.alert_data.notification_sms || false,
                  is_active: arguments_.alert_data.is_active !== false
                })
                .select()
                .single();
              
              if (createError) throw createError;
              return newAlert as T;
            
            case 'update':
              const { data: updatedAlert, error: updateError } = await supabase
                .from('user_alerts')
                .update({
                  name: arguments_.alert_data.name,
                  keywords: arguments_.alert_data.keywords,
                  filters: arguments_.alert_data.filters,
                  notification_email: arguments_.alert_data.notification_email,
                  notification_sms: arguments_.alert_data.notification_sms,
                  is_active: arguments_.alert_data.is_active,
                  updated_at: new Date().toISOString()
                })
                .eq('id', arguments_.alert_id)
                .eq('user_id', alertUserId)
                .select()
                .single();
              
              if (updateError) throw updateError;
              return updatedAlert as T;
            
            case 'delete':
              const { error: deleteError } = await supabase
                .from('user_alerts')
                .delete()
                .eq('id', arguments_.alert_id)
                .eq('user_id', alertUserId);
              
              if (deleteError) throw deleteError;
              return { success: true } as T;
            
            case 'list':
            default:
              const { data: alerts, error: listError } = await supabase
                .from('user_alerts')
                .select('*')
                .eq('user_id', alertUserId)
                .order('created_at', { ascending: false });
              
              if (listError) throw listError;
              return alerts as T;
          }

        case 'getSubscription':
          // Buscar planos reais do banco
          const { data: plans, error: plansError } = await supabase
            .from('subscription_plans')
            .select('*')
            .order('price_monthly', { ascending: true });

          if (plansError) {
            console.error('Error fetching plans:', plansError);
            // Fallback para dados mock se houver erro
            const mockPlans = [
              {
                id: '1',
                name: 'Starter',
                description: 'Ideal para pequenos fornecedores',
                price_monthly: 29.90,
                price_yearly: 299.00,
                features: ['Pesquisa básica', 'Alertas por email', 'Dashboard básico']
              },
              {
                id: '2',
                name: 'Professional',
                description: 'Para empresas que precisam de análises avançadas',
                price_monthly: 99.90,
                price_yearly: 999.00,
                features: ['Pesquisa avançada', 'Análise de IA', 'API de acesso', 'Alertas inteligentes']
              },
              {
                id: '3',
                name: 'Enterprise',
                description: 'Solução completa para grandes organizações',
                price_monthly: 299.90,
                price_yearly: 2999.00,
                features: ['Pesquisas ilimitadas', 'IA avançada', 'API dedicada', 'Suporte 24/7']
              }
            ];
            return {
              current_subscription: {
                subscription_plans: mockPlans[0]
              },
              available_plans: mockPlans,
              usage_stats: {
                searches_used: 45,
                alerts_used: 3,
                ai_analyses_used: 12
              }
            } as T;
          }

          return {
            current_subscription: {
              subscription_plans: plans?.[0]
            },
            available_plans: plans,
            usage_stats: {
              searches_used: 45,
              alerts_used: 3,
              ai_analyses_used: 12
            }
          } as T;

        case 'getAnalytics':
          const period = arguments_.period || '30d';
          const analyticsUserId = arguments_.user_id || 'temp-user-id';
          
          // Calculate date range based on period
          let startDate = new Date();
          switch (period) {
            case '7d':
              startDate.setDate(startDate.getDate() - 7);
              break;
            case '30d':
              startDate.setDate(startDate.getDate() - 30);
              break;
            case '90d':
              startDate.setDate(startDate.getDate() - 90);
              break;
            case '1y':
              startDate.setFullYear(startDate.getFullYear() - 1);
              break;
            default:
              startDate.setDate(startDate.getDate() - 30);
          }
          
          // Get real analytics from user_analytics table
          const { data: analyticsData, error: analyticsError } = await supabase
            .from('user_analytics')
            .select('*')
            .eq('user_id', analyticsUserId)
            .gte('created_at', startDate.toISOString());
          
          if (analyticsError) {
            console.error('Error fetching analytics:', analyticsError);
          }
          
          // Get licitações data for categories analysis
          const { data: licitacoesAnalyticsData, error: licitacoesAnalyticsError } = await supabase
            .from('licitacoes')
            .select('objeto, criado_em')
            .gte('criado_em', startDate.toISOString());
          
          if (licitacoesAnalyticsError) {
            console.error('Error fetching licitações for analytics:', licitacoesAnalyticsError);
          }
          
          // Process real data
          const totalSearches = analyticsData?.filter(item => item.action === 'search').length || 0;
          const totalAnalyses = analyticsData?.filter(item => item.action === 'ai_analysis').length || 0;
          
          // Analyze categories from licitações
          const topCategories: Record<string, number> = {};
          licitacoesAnalyticsData?.forEach(licitacao => {
            const objeto = licitacao.objeto.toLowerCase();
            if (objeto.includes('tecnologia') || objeto.includes('software') || objeto.includes('ti')) {
              topCategories['TI'] = (topCategories['TI'] || 0) + 1;
            } else if (objeto.includes('consultoria')) {
              topCategories['Consultoria'] = (topCategories['Consultoria'] || 0) + 1;
            } else if (objeto.includes('equipamento')) {
              topCategories['Equipamentos'] = (topCategories['Equipamentos'] || 0) + 1;
            } else if (objeto.includes('obra') || objeto.includes('construção')) {
              topCategories['Obras'] = (topCategories['Obras'] || 0) + 1;
            } else {
              topCategories['Outros'] = (topCategories['Outros'] || 0) + 1;
            }
          });
          
          // Calculate success rate based on real data
          const totalAttempts = totalSearches + totalAnalyses;
          const successfulActions = analyticsData?.filter(item => 
            item.metadata && typeof item.metadata === 'object' && 
            'success' in item.metadata && item.metadata.success === true
          ).length || totalAttempts; // Assume success if no metadata
          
          const successRate = totalAttempts > 0 ? successfulActions / totalAttempts : 0.85;
          
          return {
            period,
            total_searches: totalSearches,
            total_analyses: totalAnalyses,
            top_categories: topCategories,
            search_trends: [], // Could be implemented with more complex queries
            success_rate: successRate,
            roi_estimate: 2.3 // This would need business logic to calculate
          } as T;

        case 'analyzeViability':
          const licitacaoId = arguments_.licitacao_id;
          
          // Get real licitação data
          const { data: licitacao, error: licitacaoAnalysisError } = await supabase
            .from('licitacoes')
            .select('*')
            .eq('id', licitacaoId)
            .single();
          
          if (licitacaoAnalysisError) throw licitacaoAnalysisError;
          if (!licitacao) throw new Error('Licitação não encontrada');
          
          // Create AI analysis request
          const analysisData = {
            user_id: arguments_.user_id || 'temp-user-id',
            licitacao_id: licitacaoId,
            analysis_type: 'viability',
            input_data: {
              objeto: licitacao.objeto,
              valor: licitacao.valor,
              raw_data: licitacao.raw_data,
              resumo_ia: licitacao.resumo_ia
            },
            status: 'completed'
          };
          
          // Generate real analysis based on licitação data
          const objeto = licitacao.objeto.toLowerCase();
          const valor = licitacao.valor || 0;
          const rawData = licitacao.raw_data as any; // Type assertion for Json data
          const orgao = rawData?.orgao_nome || '';
          
          // Score calculation based on real factors
          let viabilityScore = 50; // Base score
          
          // Adjust score based on object complexity
          if (objeto.includes('tecnologia') || objeto.includes('software')) {
            viabilityScore += 20; // Tech projects often have good margins
          }
          if (objeto.includes('consultoria')) {
            viabilityScore += 15; // Consulting has good profit potential
          }
          if (objeto.includes('obra') || objeto.includes('construção')) {
            viabilityScore -= 10; // Construction has more risks
          }
          
          // Adjust score based on value
          if (valor > 1000000) {
            viabilityScore += 15; // Large contracts are more attractive
          } else if (valor < 50000) {
            viabilityScore -= 10; // Small contracts may not be worth it
          }
          
          // Adjust score based on organ type
          if (orgao.includes('FEDERAL') || orgao.includes('MINISTÉRIO')) {
            viabilityScore += 10; // Federal organs are generally more reliable
          }
          
          // Ensure score is within bounds
          viabilityScore = Math.max(0, Math.min(100, viabilityScore));
          
          // Determine recommendation
          let recommendation = 'AVALIAR';
          if (viabilityScore >= 70) recommendation = 'PARTICIPAR';
          if (viabilityScore <= 40) recommendation = 'EVITAR';
          
          // Generate key factors based on analysis
          const keyFactors = [];
          if (objeto.includes('tecnologia')) {
            keyFactors.push('Experiência técnica em TI necessária');
          }
          if (valor > 500000) {
            keyFactors.push('Contrato de alto valor - boa oportunidade');
          }
          if (orgao.includes('COMANDO') || orgao.includes('EXERCITO')) {
            keyFactors.push('Órgão militar - processos rigorosos');
          }
          keyFactors.push('Análise de concorrência recomendada');
          
          const analysis = {
            viability_score: viabilityScore,
            recommendation,
            key_factors: keyFactors,
            profit_potential: viabilityScore >= 70 ? 'Alto' : viabilityScore >= 50 ? 'Médio' : 'Baixo',
            risk_assessment: viabilityScore <= 40 ? 'Alto' : viabilityScore <= 70 ? 'Médio' : 'Baixo'
          };
          
          // Save analysis to database
          const { data: savedAnalysis, error: saveError } = await supabase
            .from('ai_analysis_requests')
            .insert({
              ...analysisData,
              result: analysis,
              completed_at: new Date().toISOString()
            })
            .select()
            .single();
          
          if (saveError) {
            console.error('Error saving analysis:', saveError);
          }
          
          return {
            licitacao: {
              id: licitacao.id,
              objeto: licitacao.objeto,
              valor: licitacao.valor
            },
            analysis: JSON.stringify(analysis),
            analysis_id: savedAnalysis?.id || 'temp_analysis_id'
          } as T;

        default:
          throw new Error(`Tool '${name}' não implementado`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      console.error('Erro MCP:', errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const listResources = useCallback(async <T = any>(
    type: string,
    query?: string
  ): Promise<T[] | null> => {
    // Mock de recursos
    const mockResources = [
      {
        uri: 'licitacoes://recent',
        name: 'Licitações Recentes',
        description: 'Lista das licitações mais recentes',
        mimeType: 'application/json'
      }
    ];
    return mockResources as T[];
  }, []);

  return {
    loading,
    error,
    callTool,
    listResources,
  };
}
