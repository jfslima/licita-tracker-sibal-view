
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { FileText, Download, ArrowLeft, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// util simples para tratar CORS (trocar base se usar proxy)
const apiBase = '/pncp-proxy';

export default function DetalhePNCP() {
  const { tipo, orgao, ano, seq, numeroControle } = useParams();
  const navigate = useNavigate();
  const [dados, setDados] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Monta endpoint real do PNCP
    let url = '';
    if (tipo === 'edital')
      url = `${apiBase}/compras/${orgao}/${ano}/${seq}`;
    else if (tipo === 'ata')
      url = `${apiBase}/atas/${orgao}/${ano}/${seq}`;
    else if (tipo === 'contrato')
      url = `${apiBase}/contratos/${orgao}/${ano}/${seq}`;
    else
      url = `${apiBase}/contratacoes/${orgao}/${numeroControle}`;

    console.log('Buscando dados em:', url);

    fetch(url)
      .then(r => {
        if (!r.ok) {
          throw new Error(`HTTP ${r.status}: ${r.statusText}`);
        }
        return r.json();
      })
      .then(setDados)
      .catch(error => {
        console.error('Erro ao buscar dados:', error);
        setDados(null);
      })
      .finally(() => setLoading(false));
  }, [tipo, orgao, ano, seq, numeroControle]);

  const formatCurrency = (value: any) => {
    if (!value || value === '-') return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'vigente':
      case 'recebendo_proposta':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'em_julgamento':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'encerrada':
      case 'nao_vigente':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!dados) {
    return (
      <div className="space-y-6 p-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Documento não encontrado ou erro ao carregar dados.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {dados.titulo || dados.title || dados.description || 'Documento PNCP'}
          </h1>
        </div>
      </div>

      {/* Informações principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Informações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Órgão:</span>
              <p className="mt-1">{dados.orgao_nome || dados.orgao || 'N/A'}</p>
            </div>
            
            <div>
              <span className="font-semibold text-gray-700">Situação:</span>
              <div className="mt-1">
                <Badge className={`${getStatusColor(dados.situacao_nome || dados.status)} border`}>
                  {dados.situacao_nome || dados.status || 'N/A'}
                </Badge>
              </div>
            </div>

            <div>
              <span className="font-semibold text-gray-700">Data de Publicação:</span>
              <p className="mt-1">
                {dados.data_publicacao_pncp ? 
                  new Date(dados.data_publicacao_pncp).toLocaleDateString('pt-BR') : 
                  'N/A'
                }
              </p>
            </div>

            {dados.valor_global && (
              <div>
                <span className="font-semibold text-gray-700">Valor Global:</span>
                <p className="mt-1 text-green-700 font-medium">
                  {formatCurrency(dados.valor_global)}
                </p>
              </div>
            )}

            {dados.modalidade_licitacao_nome && (
              <div>
                <span className="font-semibold text-gray-700">Modalidade:</span>
                <p className="mt-1">{dados.modalidade_licitacao_nome}</p>
              </div>
            )}

            {dados.numero_controle_pncp && (
              <div>
                <span className="font-semibold text-gray-700">Número de Controle:</span>
                <p className="mt-1 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {dados.numero_controle_pncp}
                </p>
              </div>
            )}
          </div>

          {dados.description && (
            <div className="mt-6">
              <span className="font-semibold text-gray-700">Descrição/Objeto:</span>
              <p className="mt-2 text-gray-600 leading-relaxed">
                {dados.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Arquivos e documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Documentos e Anexos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dados.arquivos?.length ? (
            <div className="space-y-2">
              {dados.arquivos.map((arq: any, index: number) => (
                <div key={arq.id || index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{arq.nome || arq.filename || 'Documento'}</p>
                      {arq.tamanho && (
                        <p className="text-xs text-gray-500">{arq.tamanho}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://pncp.gov.br${arq.url || arq.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum documento anexo encontrado.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Link para o PNCP original */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Visualizar este documento no site oficial do PNCP
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a
                href={`https://pncp.gov.br/app/${tipo === 'edital' ? 'editais' : tipo}/${orgao}/${ano}/${seq || numeroControle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir no PNCP
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
