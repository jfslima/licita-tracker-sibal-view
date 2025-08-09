/**
 * Configuração centralizada de APIs
 * Define as URLs base e endpoints para todos os serviços utilizados pela aplicação
 */

// URL base da API - usa variável de ambiente ou fallback para localhost
export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3002';

// Endpoints PNCP - URLs oficiais da API pública
export const PNCP_SEARCH = 'http://localhost:3002/api/pncp/search';
export const PNCP_API_BASE = 'http://localhost:3002/api/pncp';
export const PNCP_DOWNLOAD = `${API_BASE}/api/pncp/pncp-api/v1`;
export const PNCP_CONTRATACOES_DETAIL = `${API_BASE}/api/pncp/consulta/v1/contratacoes`;

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
