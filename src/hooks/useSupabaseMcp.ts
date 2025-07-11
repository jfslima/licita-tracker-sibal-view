import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface McpRequest {
  method: string;
  params?: any;
}

interface McpResponse {
  result?: any;
  error?: string;
}

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

      const { data, error } = await supabase.functions.invoke('mcp-api', {
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
    loading,
    error,
    getLicitacoes,
    createLicitacao,
    analizarLicitacao,
    getToolsList,
    analyzeBatch,
    getStats,
    callMcpFunction
  };
}