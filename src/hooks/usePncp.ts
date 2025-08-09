import { useState, useCallback } from 'react';

interface PncpContratacao {
  id: string;
  title: string;
  description?: string;
  titulo?: string;
  objeto?: string;
  orgao_nome: string;
  modalidade_codigo?: number;
  modalidade_licitacao_id?: string;
  modalidade_licitacao_nome?: string;
  modalidade_nome?: string;
  data_fim_proposta?: string;
  valor_estimado?: number;
  valor_global?: number;
  status?: string;
  situacao_nome?: string;
  uf: string;
  municipio_nome?: string;
  url_documento?: string;
  item_url?: string;
  numero_controle_pncp?: string;
}

interface PncpResponse {
  items: PncpContratacao[];
  total: number;
  total_registros?: number;
  total_paginas?: number;
  pagina_corrente?: number;
}

export function usePncp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editais, setEditais] = useState<PncpContratacao[]>([]);
  const [totalPaginas, setTotalPaginas] = useState(0);

  const buscarEditais = useCallback(async (params: {
    pagina?: number;
    palavraChave?: string;
    status?: string;
    uf?: string;
  } = {}) => {
    setLoading(true);
    setError(null);

    try {
      const {
        pagina = 1,
        palavraChave,
        status = 'aberta',
        uf
      } = params;

      // URL correta da API PNCP
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

      const data = await response.json();
      
      // A API PNCP retorna os dados em 'items'
      const editaisRecebidos = data.items || [];

      if (pagina === 1) {
        setEditais(editaisRecebidos);
      } else {
        setEditais(prev => [...prev, ...editaisRecebidos]);
      }

      setTotalPaginas(data.total_paginas || Math.ceil((data.total || 0) / 20));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido ao buscar editais';
      setError(errorMessage);
      console.error('Erro ao buscar editais PNCP:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    editais,
    totalPaginas,
    buscarEditais
  };
}