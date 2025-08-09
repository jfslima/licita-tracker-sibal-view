/**
 * Utilitários para trabalhar com o Portal Nacional de Contratações Públicas (PNCP)
 */

/**
 * Monta link seguro para o detalhe do edital no PNCP.
 * @param cnpjOrg   Ex.: '54332390000126'
 * @param ano       Ex.: 2025
 * @param seq       Ex.: 4  // <-- sem zeros à esquerda
 */
export const gerarLinkPncp = (cnpjOrg: string, ano: number, seq: number): string => {
  return `https://pncp.gov.br/app/editais/${cnpjOrg}/${ano}/${seq}`;
};

/**
 * Extrai CNPJ, ano e sequencial do numero_controle_pncp
 * Formato esperado: "54332390000126-1-000004/2025" ou similar
 */
export const parseNumeroControlePncp = (numeroControle: string): { cnpjOrg: string; ano: number; seq: number } | null => {
  try {
    // Remover espaços e normalizar
    const normalized = numeroControle.trim();
    
    // Padrão: CNPJ-X-SEQUENCIAL/ANO
    const match = normalized.match(/^(\d{14})[-\s]*\d*[-\s]*(\d+)\/(\d{4})$/);
    
    if (match) {
      const cnpjOrg = match[1];
      const seq = parseInt(match[2], 10); // Remove zeros à esquerda
      const ano = parseInt(match[3], 10);
      
      return { cnpjOrg, ano, seq };
    }
    
    // Fallback: tentar outros padrões comuns
    const fallbackMatch = normalized.match(/(\d{14}).*?(\d+).*?(\d{4})/);
    if (fallbackMatch) {
      const cnpjOrg = fallbackMatch[1];
      const seq = parseInt(fallbackMatch[2], 10);
      const ano = parseInt(fallbackMatch[3], 10);
      
      return { cnpjOrg, ano, seq };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao fazer parse do número de controle:', error);
    return null;
  }
};

/**
 * Gera URL otimizada para o PNCP com fallback para busca
 * @param numeroControle Número de controle PNCP
 * @param incluirDocumentos Se deve incluir /documentos na URL
 */
export const gerarUrlPncp = (numeroControle: string, incluirDocumentos = false): { url: string; isOptimized: boolean; searchUrl?: string } => {
  const parsed = parseNumeroControlePncp(numeroControle);
  
  if (parsed) {
    const baseUrl = gerarLinkPncp(parsed.cnpjOrg, parsed.ano, parsed.seq);
    const url = incluirDocumentos ? `${baseUrl}/documentos` : baseUrl;
    const searchUrl = `https://pncp.gov.br/app/editais?q=${parsed.seq}&cnpj=${parsed.cnpjOrg}`;
    
    return {
      url,
      isOptimized: true,
      searchUrl
    };
  }
  
  // Fallback: usar número de controle diretamente
  const fallbackUrl = incluirDocumentos 
    ? `https://pncp.gov.br/app/editais/${numeroControle}/documentos`
    : `https://pncp.gov.br/app/editais/${numeroControle}`;
  
  return {
    url: fallbackUrl,
    isOptimized: false
  };
};