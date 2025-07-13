export function parsePncpId(id: string) {
  const [cnpj, ano, seq] = id.split("/");
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