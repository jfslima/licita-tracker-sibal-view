
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
          const { data: licitacoes, error: licitacoesError } = await supabase
            .from('licitacoes')
            .select('*')
            .order('criado_em', { ascending: false })
            .limit(arguments_.limit || 10);

          if (licitacoesError) throw licitacoesError;
          return licitacoes as T;

        case 'searchPNCP':
          // Dados mock para demonstração
          const mockResults = {
            total: 150,
            page: arguments_.page || 1,
            limit: arguments_.limit || 20,
            results: [
              {
                id: `pncp_${Date.now()}`,
                objeto: `${arguments_.query || 'Equipamentos de TI'} - Pregão Eletrônico`,
                valor: Math.floor(Math.random() * 1000000),
                orgao: arguments_.agency || 'Prefeitura Municipal',
                modalidade: arguments_.modality || 'Pregão Eletrônico',
                situacao: arguments_.status || 'Em andamento',
                data_abertura: new Date().toISOString(),
                municipio: arguments_.city || 'São Paulo',
                uf: arguments_.state || 'SP',
                url_edital: 'https://pncp.gov.br/edital/123456'
              },
              {
                id: `pncp_${Date.now() + 1}`,
                objeto: 'Aquisição de Material de Escritório',
                valor: 25000,
                orgao: 'Secretaria de Administração',
                modalidade: 'Pregão Eletrônico',
                situacao: 'Aberto',
                data_abertura: new Date().toISOString(),
                municipio: 'Rio de Janeiro',
                uf: 'RJ',
                url_edital: 'https://pncp.gov.br/edital/123457'
              },
              {
                id: `pncp_${Date.now() + 2}`,
                objeto: 'Serviços de Consultoria em TI',
                valor: 500000,
                orgao: 'Governo do Estado',
                modalidade: 'Concorrência',
                situacao: 'Publicado',
                data_abertura: new Date().toISOString(),
                municipio: 'Brasília',
                uf: 'DF',
                url_edital: 'https://pncp.gov.br/edital/123458'
              }
            ]
          };
          return mockResults as T;

        case 'manageAlerts':
          // Dados mock para alertas
          const mockAlerts = [
            {
              id: '1',
              name: 'Alerta TI',
              keywords: ['tecnologia', 'software'],
              is_active: true,
              created_at: new Date().toISOString()
            },
            {
              id: '2',
              name: 'Alerta Consultoria',
              keywords: ['consultoria', 'análise'],
              is_active: true,
              created_at: new Date().toISOString()
            }
          ];
          return mockAlerts as T;

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
          // Dados mock de analytics
          const mockAnalytics = {
            period: arguments_.period || '30d',
            total_searches: 45,
            total_analyses: 12,
            top_categories: {
              'TI': 15,
              'Consultoria': 8,
              'Equipamentos': 5
            },
            search_trends: [],
            success_rate: 0.85,
            roi_estimate: 2.3
          };
          return mockAnalytics as T;

        case 'analyzeViability':
          // Mock de análise de viabilidade
          const mockAnalysis = {
            licitacao: {
              id: arguments_.licitacao_id,
              objeto: 'Licitação analisada',
              valor: 100000
            },
            analysis: JSON.stringify({
              viability_score: Math.floor(Math.random() * 100),
              recommendation: ['PARTICIPAR', 'AVALIAR', 'EVITAR'][Math.floor(Math.random() * 3)],
              key_factors: ['Experiência técnica necessária', 'Concorrência moderada'],
              profit_potential: ['Alto', 'Médio', 'Baixo'][Math.floor(Math.random() * 3)],
              risk_assessment: ['Alto', 'Médio', 'Baixo'][Math.floor(Math.random() * 3)]
            }),
            analysis_id: 'mock_analysis_id'
          };
          return mockAnalysis as T;

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
