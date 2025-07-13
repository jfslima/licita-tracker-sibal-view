import { useState, useCallback } from 'react';

interface PncpContratacao {
  numeroControle: string;
  titulo: string;
  dataFimRecebimentoProposta: string;
  orgaoNome: string;
  valorEstimado?: number;
  modalidadeNome: string;
  situacao: string;
  linkSistemaOrigem?: string;
}

interface PncpResponse {
  contratacoes: PncpContratacao[];
  totalPaginas: number;
  totalRegistros: number;
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
  dataInicial?: string;
  dataFinal?: string;
  modalidade?: number;
  palavraChave?: string;
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
        dataFinal = new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        modalidade = 0, // todas as modalidades
        palavraChave
      } = params;

      const url = new URL('https://pncp.gov.br/api/consulta/v1/contratacoes/proposta');
      url.searchParams.append('dataFinal', dataFinal);
      url.searchParams.append('codigoModalidadeContratacao', modalidade.toString());
      url.searchParams.append('pagina', pagina.toString());

      if (params.dataInicial) {
        url.searchParams.append('dataInicial', params.dataInicial);
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
      
      let editaisFiltrados = data.contratacoes || [];

      // Filtro client-side por palavra-chave
      if (palavraChave && palavraChave.trim()) {
        const termo = palavraChave.toLowerCase().trim();
        editaisFiltrados = editaisFiltrados.filter(edital =>
          edital.titulo.toLowerCase().includes(termo) ||
          edital.orgaoNome.toLowerCase().includes(termo)
        );
      }

      if (pagina === 1) {
        setEditais(editaisFiltrados);
      } else {
        setEditais(prev => [...prev, ...editaisFiltrados]);
      }

      setTotalPaginas(data.totalPaginas || 1);
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