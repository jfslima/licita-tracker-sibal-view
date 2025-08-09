// Configurações para integração com o Portal Nacional de Contratações Públicas (PNCP)

export const PNCP_CONFIG = {
  // URL base da API oficial do PNCP (conforme site oficial)
  // URL base da API oficial de consulta do PNCP via proxy local
  BASE_URL: 'http://localhost:3002/api/pncp',
  
  // URL alternativa para ambiente de treinamento
  BASE_URL_TRAINING: 'https://treina.pncp.gov.br/api/pncp',
  
  // Endpoints principais da API de consulta via proxy
  ENDPOINTS: {
    PUBLICACOES: '/search',
    CONTRATOS: '/v1/contratos',
    ATAS: '/v1/atas-registro-preco',
    ORGAOS: '/v1/orgaos'
  },
  
  // Parâmetros padrão para consultas (conforme site oficial)
  // Parâmetros padrão para consultas
  DEFAULT_PARAMS: {
    pagina: 1,
    tamanhoPagina: 20
  },
  
  // Status disponíveis no PNCP
  STATUS: {
    RECEBENDO_PROPOSTA: 'recebendo_proposta',
    SUSPENSO: 'suspenso',
    CANCELADO: 'cancelado',
    HOMOLOGADO: 'homologado',
    DESERTO: 'deserto',
    FRACASSADO: 'fracassado',
    REVOGADO: 'revogado'
  } as const,
  
  // Modalidades de licitação (baseado na documentação oficial PNCP)
  MODALIDADES: {
    LEILAO_ELETRONICO: 1,
    DIALOGO_COMPETITIVO: 2,
    CONCURSO: 3,
    CONCORRENCIA_ELETRONICA: 4,
    CONCORRENCIA_PRESENCIAL: 5,
    PREGAO_ELETRONICO: 6,
    PREGAO_PRESENCIAL: 7,
    DISPENSA: 8,
    INEXIGIBILIDADE: 9,
    MANIFESTACAO_INTERESSE: 10,
    PRE_QUALIFICACAO: 11,
    CREDENCIAMENTO: 12,
    LEILAO_PRESENCIAL: 13,
    INAPLICABILIDADE: 14
  } as const,
  
  // Configurações de timeout e retry
  REQUEST_CONFIG: {
    timeout: 30000, // 30 segundos
    retries: 3,
    retryDelay: 1000 // 1 segundo
  },
  
  // Configurações de cache
  CACHE_CONFIG: {
    ttl: 5 * 60 * 1000, // 5 minutos
    maxSize: 100 // máximo de 100 entradas no cache
  },
  
  // Filtros úteis para consultas
  FILTROS_COMUNS: {
    // Editais com valor alto (acima de R$ 100.000)
    ALTO_VALOR: {
      valorEstimadoMin: 100000
    },
    
    // Editais que vencem em breve (próximos 7 dias)
    VENCIMENTO_PROXIMO: {
      dataFinalPropostaInicio: new Date().toISOString().split('T')[0],
      dataFinalPropostaFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    
    // Apenas pregões eletrônicos
    PREGAO_ELETRONICO: {
      modalidadeId: 1
    }
  },
  
  // Mapeamento de códigos de erro
  ERROR_CODES: {
    400: 'Parâmetros inválidos',
    401: 'Não autorizado',
    403: 'Acesso negado',
    404: 'Recurso não encontrado',
    429: 'Muitas requisições - tente novamente em alguns segundos',
    500: 'Erro interno do servidor PNCP',
    502: 'Serviço temporariamente indisponível',
    503: 'API PNCP temporariamente indisponível - dados simulados não são permitidos'
  } as const
};

// Tipos para TypeScript
export type PNCPStatus = keyof typeof PNCP_CONFIG.STATUS;
export type PNCPModalidade = keyof typeof PNCP_CONFIG.MODALIDADES;
export type PNCPErrorCode = keyof typeof PNCP_CONFIG.ERROR_CODES;

// Função para construir URLs da API
export function buildPNCPUrl(endpoint: string, params?: Record<string, any>): string {
  const url = new URL(endpoint, PNCP_CONFIG.BASE_URL);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

// Função para obter mensagem de erro amigável
export function getPNCPErrorMessage(statusCode: number): string {
  return PNCP_CONFIG.ERROR_CODES[statusCode as PNCPErrorCode] || 
         `Erro desconhecido (código ${statusCode})`;
}

// Função para validar parâmetros de consulta conforme API oficial
export function validatePNCPParams(params: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Validar página
  if (params.pagina && (params.pagina < 1 || params.pagina > 1000)) {
    errors.push('Página deve estar entre 1 e 1000');
  }
  
  // Validar tamanho da página
  if (params.tamanhoPagina && (params.tamanhoPagina < 1 || params.tamanhoPagina > 500)) {
    errors.push('Tamanho da página deve estar entre 1 e 500');
  }
  
  // Validar formato de datas (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (params.dataInicial && !dateRegex.test(params.dataInicial)) {
    errors.push('Data inicial deve estar no formato YYYY-MM-DD');
  }
  
  if (params.dataFinal && !dateRegex.test(params.dataFinal)) {
    errors.push('Data final deve estar no formato YYYY-MM-DD');
  }
  
  // Validar ordem das datas
  if (params.dataInicial && params.dataFinal && params.dataInicial > params.dataFinal) {
    errors.push('Data inicial deve ser anterior à data final');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Função para formatar parâmetros de consulta conforme API oficial
export function formatPNCPParams(params: Record<string, any>): Record<string, any> {
  const formatted = { ...params };
  
  // Aplicar parâmetros padrão apenas se não foram fornecidos
  Object.entries(PNCP_CONFIG.DEFAULT_PARAMS).forEach(([key, value]) => {
    if (formatted[key] === undefined) {
      formatted[key] = value;
    }
  });
  
  // Remover valores undefined/null/empty
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === undefined || formatted[key] === null || formatted[key] === '') {
      delete formatted[key];
    }
  });
  
  return formatted;
}