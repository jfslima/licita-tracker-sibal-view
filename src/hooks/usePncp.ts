import { useState, useCallback } from 'react';

interface PncpContratacao {
  id: string;
  titulo: string;
  objeto?: string;
  orgao_nome: string;
  modalidade_codigo: number;
  modalidade_nome?: string;
  data_fim_proposta?: string;
  valor_estimado?: number;
  status: string;
  uf: string;
  municipio_nome?: string;
  url_documento?: string;
}

interface PncpResponse {
  dados: PncpContratacao[];
  total_registros: number;
  total_paginas: number;
  pagina_corrente: number;
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
  uf?: string;
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
        status = 'recebendo_proposta',
        uf
      } = params;

      const url = new URL('https://pncp.gov.br/api/search/');
      url.searchParams.append('tipos_documento', 'edital');
      url.searchParams.append('pagina', pagina.toString());
      url.searchParams.append('tam_pagina', '20');
      url.searchParams.append('ordenacao', '-data');
      
      if (status) {
        url.searchParams.append('status', status);
      }

      if (palavraChave && palavraChave.trim()) {
        url.searchParams.append('q', palavraChave.trim());
      }

      if (uf) {
        url.searchParams.append('uf', uf);
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
      
      const editaisRecebidos = data.dados || [];

      if (pagina === 1) {
        setEditais(editaisRecebidos);
      } else {
        setEditais(prev => [...prev, ...editaisRecebidos]);
      }

      setTotalPaginas(data.total_paginas || Math.ceil((data.total_registros || 0) / 20));
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