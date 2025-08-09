import { useState } from 'react';
import { usePncp } from '@/hooks/usePncp';

export function PncpSearch() {
  const { loading, error, editais, buscarEditais } = usePncp();
  const [palavraChave, setPalavraChave] = useState('');
  const [status, setStatus] = useState('aberta'); // Status correto da API

  const handleBuscar = async () => {
    await buscarEditais({
      pagina: 1,
      status,
      palavraChave: palavraChave.trim() || undefined
    });
  };

  // Função para construir link correto do PNCP
  const construirLinkPncp = (item: any) => {
    if (item.numero_controle_pncp) {
      return `https://pncp.gov.br/app/editais/${item.numero_controle_pncp}`;
    } else if (item.item_url) {
      return `https://pncp.gov.br${item.item_url}`;
    }
    return null;
  };



  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Buscar editais..."
          value={palavraChave}
          onChange={(e) => setPalavraChave(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="aberta">Aberta</option>
          <option value="divulgada">Divulgada</option>
          <option value="concluida">Concluída</option>
        </select>
        <button
          onClick={handleBuscar}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {editais.length > 0 && (
        <div className="space-y-4">
          {editais.map((edital) => (
            <div key={edital.id} className="p-4 border rounded-md bg-white shadow-sm">
              <h3 className="font-semibold">{edital.title || edital.objeto}</h3>
              <p className="text-sm text-gray-600 mt-1">{edital.description}</p>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {edital.orgao_nome} - {edital.uf}
                </span>
                {construirLinkPncp(edital) && (
                  <a
                    href={construirLinkPncp(edital)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Ver no PNCP →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}