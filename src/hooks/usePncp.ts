import { useState, useCallback } from 'react';

interface PncpContratacao {
  id: string;
  title: string;
  description: string;
  item_url: string;
  document_type: string;
  numero_controle_pncp: string;
  orgao_nome: string;
  modalidade_licitacao_nome: string;
  data_fim_vigencia?: string;
  valor_global?: number;
  situacao_nome: string;
  uf: string;
  municipio_nome: string;
}

interface PncpResponse {
  items: PncpContratacao[];
  total_records?: number;
}

interface UsePncpReturn {
  loading: boolean;
  error: string | null;
  editais: PncpContratacao[];
  totalPaginas: number;
  buscarEditais: (params?: BuscarEditaisParams) => Promise<void>;
  limparEditais: () => void;
}

interface BuscarEditaisParams {
  pagina?: number;
  palavraChave?: string;
  status?: string;
}

export function usePncp(): UsePncpReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editais, setEditais] = useState<PncpContratacao[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const buscarEditais = useCallback(async (params: BuscarEditaisParams = {}) => {
    setLoading(true);
    setError(null);

    try {
      const {
        pagina = 1,
        palavraChave,
        status = 'aberta'
      } = params;

      const url = new URL('https://pncp.gov.br/api/search/');
      url.searchParams.append('tipos_documento', 'edital');
      url.searchParams.append('pagina', pagina.toString());
      url.searchParams.append('tam_pagina', '20');
      url.searchParams.append('ordenacao', '-data');
      url.searchParams.append('status', status);

      if (palavraChave && palavraChave.trim()) {
        url.searchParams.append('q', palavraChave.trim());
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API PNCP: ${response.status} ${response.statusText}`);
      }

      const data: PncpResponse = await response.json();
      
      const editaisRecebidos = data.items || [];

      if (pagina === 1) {
        setEditais(editaisRecebidos);
      } else {
        setEditais(prev => [...prev, ...editaisRecebidos]);
      }

      // Estimativa de páginas baseada em 20 itens por página
      const totalEstimado = data.total_records || editaisRecebidos.length * 10;
      setTotalPaginas(Math.ceil(totalEstimado / 20));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar editais';
      setError(errorMessage);
      console.error('Erro ao buscar editais PNCP:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const limparEditais = useCallback(() => {
    setEditais([]);
    setError(null);
    setTotalPaginas(0);
  }, []);

  return {
    loading,
    error,
    editais,
    totalPaginas,
    buscarEditais,
    limparEditais,
  };
}