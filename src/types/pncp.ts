// Tipos TypeScript para integração com o Portal Nacional de Contratações Públicas (PNCP)

/**
 * Interface para edital retornado pela API PNCP
 */
export interface PNCPEdital {
  sequencial: number;
  numeroControlePNCP: string;
  linkSistemaOrigem: string;
  dataPublicacaoPncp: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  situacaoEdital: string;
  modalidadeId: number;
  modalidadeNome: string;
  unidadeOrgao: {
    ufNome: string;
    ufSigla: string;
    municipioNome: string;
    codigoIbge: string;
    nomeOrgao: string;
    cnpj: string;
    esferaId: string;
    poderId: string;
  };
  objetoContratacao: string;
  informacaoComplementar?: string;
  valorEstimadoTotal?: number;
  srp: boolean;
  justificativaPresencial?: string;
  itens?: Array<{
    numero: number;
    descricao: string;
    quantidade: number;
    unidadeMedida: string;
    valorUnitarioEstimado?: number;
    valorTotal?: number;
  }>;
}

/**
 * Interface para resposta paginada da API PNCP
 */
export interface PNCPResponse {
  data: PNCPEdital[];
  links: {
    first: string;
    last: string;
    prev?: string;
    next?: string;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

/**
 * Interface para parâmetros de busca na API PNCP
 */
export interface PNCPSearchParams {
  /** Tipo de documento: 'edital', 'contrato', 'ata' */
  tipos_documento?: string;
  /** Ordenação: 'data', 'relevancia' */
  ordenacao?: string;
  /** Número da página (1-1000) */
  pagina?: number;
  /** Tamanho da página (1-100) */
  tam_pagina?: number;
  /** Status do edital */
  status?: string;
  /** Termo de busca (palavra_chave) */
  q?: string;
  /** Número do aviso */
  numero_aviso?: string;
  /** Data de início (YYYY-MM-DD) */
  data_inicio?: string;
  /** Data de fim (YYYY-MM-DD) */
  data_fim?: string;
  /** IDs das modalidades (separados por vírgula) */
  modalidade_id?: string;
  /** Valor estimado mínimo */
  valor_estimado_min?: number;
  /** Valor estimado máximo */
  valor_estimado_max?: number;
  /** UFs (separadas por vírgula) */
  uf?: string;
}

/**
 * Interface para filtros avançados
 */
export interface PNCPFiltrosAvancados {
  modalidades?: number[];
  orgaos?: string[];
  valorMin?: number;
  valorMax?: number;
  ufs?: string[];
  termo?: string;
  pagina?: number;
}

/**
 * Interface para filtros disponíveis retornados pela API
 */
export interface PNCPFiltrosDisponiveis {
  filters: {
    modalidades: Array<{
      id: string;
      nome: string;
      total: number;
    }>;
    orgaos: Array<{
      id: string;
      cnpj: string;
      nome: string;
      total: number;
    }>;
  };
}

/**
 * Interface para estatísticas gerais
 */
export interface PNCPEstatisticas {
  totalEditais: number;
  modalidadesMaisUsadas: Array<{
    modalidade: string;
    total: number;
  }>;
  orgaosMaisAtivos: Array<{
    orgao: string;
    total: number;
  }>;
}

/**
 * Interface para edital convertido para formato interno
 */
export interface EditalInterno {
  id: string;
  sequencial: number;
  titulo: string;
  objeto: string;
  orgao: string;
  uf: string;
  municipio: string;
  modalidade: string;
  modalidadeId: number;
  situacao: string;
  valorEstimado: number;
  dataPublicacao: string;
  dataVigenciaInicio?: string;
  dataVigenciaFim?: string;
  linkOrigem: string;
  cnpjOrgao: string;
  informacaoComplementar?: string;
  srp: boolean;
  itens: Array<{
    numero: number;
    descricao: string;
    quantidade: number;
    unidadeMedida: string;
    valorUnitarioEstimado?: number;
    valorTotal?: number;
  }>;
}

/**
 * Interface para estatísticas calculadas
 */
export interface EstatisticasCalculadas {
  total: number;
  valorTotal: number;
  porModalidade: Record<string, number>;
  porUF: Record<string, number>;
  porSituacao: Record<string, number>;
  mediaValor: number;
}

/**
 * Interface para métricas de performance
 */
export interface PNCPMetricas {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  cacheHitRate: number;
  lastRequestTime: number;
}

/**
 * Tipos para status de editais
 */
export type PNCPStatus = 
  | 'recebendo_proposta'
  | 'suspenso'
  | 'cancelado'
  | 'homologado'
  | 'deserto'
  | 'fracassado'
  | 'revogado';

/**
 * Tipos para modalidades de licitação
 */
export type PNCPModalidade = 
  | 'LEILAO_ELETRONICO'
  | 'DIALOGO_COMPETITIVO'
  | 'CONCURSO'
  | 'CONCORRENCIA_ELETRONICA'
  | 'CONCORRENCIA_PRESENCIAL'
  | 'PREGAO_ELETRONICO'
  | 'PREGAO_PRESENCIAL'
  | 'DISPENSA'
  | 'INEXIGIBILIDADE'
  | 'MANIFESTACAO_INTERESSE'
  | 'PRE_QUALIFICACAO'
  | 'CREDENCIAMENTO'
  | 'LEILAO_PRESENCIAL'
  | 'INAPLICABILIDADE';

/**
 * Tipos para códigos de erro HTTP
 */
export type PNCPErrorCode = 400 | 401 | 403 | 404 | 429 | 500 | 502 | 503;

/**
 * Interface para configuração de cache
 */
export interface CacheConfig {
  ttl: number;
  maxSize: number;
}

/**
 * Interface para configuração de requisições
 */
export interface RequestConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
}