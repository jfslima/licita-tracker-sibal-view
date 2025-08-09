import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface McpRequest {
  method: string;
  params?: any;
}

interface McpResponse {
  result?: any;
  error?: string;
  tool?: string;
  timestamp?: string;
}

interface Notice {
  id: string;
  title: string;
  description?: string;
  organ: string;
  modality: string;
  estimated_value?: number;
  opening_date?: string;
  submission_deadline: string;
  status: 'active' | 'closed' | 'cancelled' | 'suspended';
  url?: string;
  risk_level?: 'baixo' | 'médio' | 'alto' | 'crítico';
  risk_score?: number;
  risk_analysis?: any;
  summary?: string;
  detailed_summary?: any;
  source_system?: string;
  external_id?: string;
  document_urls?: string[];
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface FetchNoticesParams {
  query?: string;
  organ?: string;
  modality?: string;
  min_value?: number;
  max_value?: number;
  limit?: number;
}

interface CompanyProfile {
  name?: string;
  sector?: string;
  size?: 'micro' | 'pequena' | 'média' | 'grande';
  experience_years?: number;
  specialties?: string[];
  certifications?: string[];
  previous_contracts?: any[];
}

interface DocumentProcessingResult {
  processing_result: any;
  processing_status: 'success' | 'partial' | 'failed';
  confidence_score?: number;
  processing_time_ms?: number;
}

interface ProposalInsights {
  insights: any;
  win_probability_score?: number;
  recommended_bid_value?: number;
}

interface DeadlineMonitoringResult {
  monitoring_result: any;
  total_deadlines: number;
  critical_deadlines: number;
}

// Manter compatibilidade com interface antiga
interface Licitacao {
  id: string;
  objeto: string;
  valor?: number;
  prazo?: string;
  resumo_ia?: string;
  raw_data?: any;
  criado_em: string;
  atualizado_em: string;
}

export function useSupabaseMcp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callMcpFunction = useCallback(async (request: McpRequest): Promise<McpResponse> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('mcp', {
        body: request
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Nova função genérica para chamar ferramentas MCP
  const callTool = useCallback(async (toolName: string, args: any = {}): Promise<any> => {
    const response = await callMcpFunction({
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });

    if (response.error) throw new Error(response.error);
    return response.result;
  }, [callMcpFunction]);

  // Funções específicas para cada ferramenta MCP
  const fetchNotices = useCallback(async (params: FetchNoticesParams = {}): Promise<{ notices: Notice[], stats: any }> => {
    return await callTool('fetch_notices', params);
  }, [callTool]);

  const classifyRisk = useCallback(async (noticeId: string): Promise<any> => {
    return await callTool('risk_classifier', { notice_id: noticeId });
  }, [callTool]);

  const summarizeNotice = useCallback(async (noticeId: string): Promise<any> => {
    return await callTool('summarize_notice', { notice_id: noticeId });
  }, [callTool]);

  const processDocument = useCallback(async (noticeId: string, documentUrl: string, documentType: 'edital' | 'anexo' | 'ata' | 'resultado'): Promise<DocumentProcessingResult> => {
    return await callTool('process_document', {
      notice_id: noticeId,
      document_url: documentUrl,
      document_type: documentType
    });
  }, [callTool]);

  const generateProposalInsights = useCallback(async (noticeId: string, companyProfile?: CompanyProfile): Promise<ProposalInsights> => {
    return await callTool('generate_proposal_insights', {
      notice_id: noticeId,
      company_profile: companyProfile
    });
  }, [callTool]);

  const monitorDeadlines = useCallback(async (companyId: string, daysAhead: number = 30): Promise<DeadlineMonitoringResult> => {
    return await callTool('monitor_deadlines', {
      company_id: companyId,
      days_ahead: daysAhead
    });
  }, [callTool]);

  const getLicitacoes = useCallback(async (id?: string): Promise<Licitacao[]> => {
    const response = await callMcpFunction({
      method: 'tools/call',
      params: {
        name: 'getLicitacao',
        arguments: { id }
      }
    });

    if (response.error) throw new Error(response.error);
    return JSON.parse(response.result.content[0].text);
  }, [callMcpFunction]);

  const createLicitacao = useCallback(async (licitacao: {
    objeto: string;
    valor?: number;
    prazo?: string;
    rawData?: any;
  }): Promise<Licitacao> => {
    const response = await callMcpFunction({
      method: 'tools/call',
      params: {
        name: 'createLicitacao',
        arguments: licitacao
      }
    });

    if (response.error) throw new Error(response.error);
    return JSON.parse(response.result.content[0].text);
  }, [callMcpFunction]);

  const analizarLicitacao = useCallback(async (id: string, texto: string): Promise<Licitacao> => {
    const response = await callMcpFunction({
      method: 'tools/call',
      params: {
        name: 'analizarLicitacao',
        arguments: { id, texto }
      }
    });

    if (response.error) throw new Error(response.error);
    return JSON.parse(response.result.content[0].text);
  }, [callMcpFunction]);

  const getToolsList = useCallback(async () => {
    const response = await callMcpFunction({
      method: 'tools/list'
    });

    if (response.error) throw new Error(response.error);
    return response.result.tools;
  }, [callMcpFunction]);

  const analyzeBatch = useCallback(async (licitacoes: Array<{ id: string; texto?: string; objeto: string }>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('licitacao-analyzer', {
        body: {
          action: 'analyze_batch',
          data: { licitacoes }
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na análise em lote';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.functions.invoke('licitacao-analyzer', {
        body: {
          action: 'get_stats',
          data: {}
        }
      });

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao obter estatísticas';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Estados
    loading,
    error,
    
    // Funções MCP unificadas (novas)
    callTool,
    fetchNotices,
    classifyRisk,
    summarizeNotice,
    processDocument,
    generateProposalInsights,
    monitorDeadlines,
    
    // Funções legadas (compatibilidade)
    getLicitacoes,
    createLicitacao,
    analizarLicitacao,
    getToolsList,
    analyzeBatch,
    getStats,
    callMcpFunction
  };
}