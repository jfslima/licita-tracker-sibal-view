/**
 * Configuração centralizada de APIs
 * Define as URLs base e endpoints para todos os serviços utilizados pela aplicação
 */

// URL base da API - usa variável de ambiente ou fallback para localhost
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Endpoints PNCP - URLs oficiais da API pública
export const PNCP_SEARCH = 'https://pncp.gov.br/api/search/';
export const PNCP_API_BASE = 'https://pncp.gov.br/api';
export const PNCP_DOWNLOAD = 'https://pncp.gov.br/api/pncp-api/v1';
export const PNCP_CONTRATACOES_DETAIL = 'https://pncp.gov.br/api/consulta/v1/contratacoes';

/**
 * Função para construir URL de busca PNCP com parâmetros
 * @param params Parâmetros de busca (palavra_chave, pagina, etc)
 * @returns URL completa para a requisição
 */
export function buildPncpSearchUrl(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  // Adiciona apenas parâmetros com valor definido
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  
  return `${PNCP_API_BASE}/search?${searchParams.toString()}`;
}
