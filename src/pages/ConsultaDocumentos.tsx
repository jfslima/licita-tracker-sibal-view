import { useState } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { usePncp } from '@/hooks/usePncp';

export function ConsultaDocumentos() {
  const { loading, buscarEditais } = usePncp();
  const [palavraChave, setPalavraChave] = useState('');
  const [status, setStatus] = useState('recebendo_proposta');

  const handleConsultar = async () => {
    await buscarEditais({
      pagina: 1,
      status,
      palavraChave: palavraChave.trim() || undefined
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">Consulta de Documentos</h1>
            <div className="ml-auto flex items-center gap-2 text-slate-600">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros Avançados</span>
            </div>
          </div>
          <p className="text-slate-600">Portal Nacional de Contratações Públicas (PNCP)</p>
        </div>

        <Card className="mb-8 shadow-lg border-0">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tipo de Documento */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Tipo de Documento
                </label>
                <Select defaultValue="editais">
                  <SelectTrigger className="h-12 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="editais">Editais</SelectItem>
                    <SelectItem value="contratos">Contratos</SelectItem>
                    <SelectItem value="atas">Atas de Registro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Palavra-chave */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Palavra-chave
                </label>
                <Input
                  placeholder="exército"
                  value={palavraChave}
                  onChange={(e) => setPalavraChave(e.target.value)}
                  className="h-12 text-base"
                  onKeyPress={(e) => e.key === 'Enter' && handleConsultar()}
                />
              </div>
            </div>

            {/* Status */}
            <div className="mt-8 space-y-4">
              <label className="text-sm font-medium text-slate-700 block">
                Status
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="recebendo_proposta"
                    checked={status === 'recebendo_proposta'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-primary border-2 border-slate-300 focus:ring-primary focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium">Recebendo Proposta</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="divulgado"
                    checked={status === 'divulgado'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-primary border-2 border-slate-300 focus:ring-primary focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium">Em Julgamento</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value="concluido"
                    checked={status === 'concluido'}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-primary border-2 border-slate-300 focus:ring-primary focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium">Encerrada</span>
                </label>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value=""
                    checked={status === ''}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-4 h-4 text-primary border-2 border-slate-300 focus:ring-primary focus:ring-2"
                  />
                  <span className="text-slate-700 font-medium">Todos</span>
                </label>
              </div>
            </div>

            {/* Botão de Consulta */}
            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleConsultar}
                disabled={loading}
                size="lg"
                className="px-12 py-4 text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Search className="h-5 w-5 mr-2" />
                {loading ? 'Consultando...' : 'Consultar Documentos'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}