export function normalizarId(raw: string) {
  // "01612564000148-1-000038/2025" → "01612564000148/2025/38"
  if (raw.includes('-')) {
    const [raiz, ano] = raw.split('/');
    const partes = raiz.split('-');
    return `${partes[0]}/${ano}/${partes.at(-1)}`;
  }
  return raw;
}

export function parsePncpId(id: string) {
  const normalizedId = normalizarId(id);
  const [cnpj, ano, seq] = normalizedId.split("/");
  return { cnpj, ano, seq };
}

export function fileUrl(cnpj: string, ano: string, seq: string, n: number) {
  return `https://pncp.gov.br/pncp-api/v1/orgaos/${cnpj}/compras/${ano}/${seq}/arquivos/${n}`;
}

export async function listFiles(id: string) {
  const { cnpj, ano, seq } = parsePncpId(id);
  const url = `https://pncp.gov.br/pncp-api/v1/orgaos/${cnpj}/compras/${ano}/${seq}/arquivos`;
  
  try {
    const response = await fetch(url, { 
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar arquivos: ${response.status}`);
    }
    
    const data = await response.json();
    return data as {
      sequencialDocumento: number;
      titulo: string;
      nomeArquivo: string;
    }[];
  } catch (error) {
    console.error('Erro ao buscar arquivos:', error);
    return [];
  }
}