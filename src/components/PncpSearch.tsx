import { useState } from 'react';
import { Search, Calendar, Building, FileText, ExternalLink, Loader2, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePncp } from '@/hooks/usePncp';
import { useToast } from '@/hooks/use-toast';

export function PncpSearch() {
  const { loading, error, editais, totalPaginas, buscarEditais, limparEditais } = usePncp();
  const { toast } = useToast();
  const [palavraChave, setPalavraChave] = useState('');
  const [status, setStatus] = useState('recebendo_proposta');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleBuscar = async (novaPagina = 1) => {
    setPaginaAtual(novaPagina);
    await buscarEditais({
      pagina: novaPagina,
      status,
      palavraChave: palavraChave.trim() || undefined
    });
  };

  const handleCarregarMais = () => {
    if (paginaAtual < totalPaginas) {
      handleBuscar(paginaAtual + 1);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) return 'Não informado';
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch {
      return data;
    }
  };

  const formatarValor = (valor?: number) => {
    if (!valor) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const construirLinkPncp = (itemUrl: string) => {
    return `https://pncp.gov.br${itemUrl}`;
  };

  const copiarNumeroControle = async (numeroControle: string) => {
    try {
      await navigator.clipboard.writeText(numeroControle);
      setCopiedId(numeroControle);
      toast({
        title: "Copiado!",
        description: "Número de controle copiado para a área de transferência",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o número de controle",
        variant: "destructive",
      });
    }
  };

  const abrirComAviso = (url: string) => {
    toast({
      title: "Redirecionando para PNCP",
      description: "Se houver erro, é instabilidade temporária do portal.",
    });
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Atenção:</strong> O portal PNCP pode apresentar instabilidades temporárias. 
          Se houver erro ao visualizar editais, é uma limitação do portal oficial, não do nosso sistema.
          Você pode copiar o número de controle clicando sobre ele para pesquisar diretamente no PNCP.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Buscar Editais PNCP
          </CardTitle>
          <CardDescription>
            Consulte editais em tempo real no Portal Nacional de Contratações Públicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Digite palavras-chave (ex: exército, saúde, TI)..."
              value={palavraChave}
              onChange={(e) => setPalavraChave(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBuscar()}
              className="flex-1"
            />
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recebendo_proposta">Recebendo Proposta</SelectItem>
                <SelectItem value="divulgado">Divulgado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="todos">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleBuscar()} 
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                limparEditais();
                setPalavraChave('');
                setPaginaAtual(1);
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {editais.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">
              {editais.length} editais encontrados
            </h3>
            {paginaAtual < totalPaginas && (
              <Button 
                variant="outline" 
                onClick={handleCarregarMais}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Carregar mais
              </Button>
            )}
          </div>

          <div className="grid gap-4">
            {editais.map((edital) => (
              <Card key={edital.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">
                        {edital.titulo}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {edital.orgao_nome}
                        </div>
                      </CardDescription>
                      {edital.objeto && (
                        <CardDescription className="mt-2 text-xs">
                          {edital.objeto}
                        </CardDescription>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {edital.modalidade_nome || `Modalidade ${edital.modalidade_codigo}`}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {edital.data_fim_proposta && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Prazo: {formatarData(edital.data_fim_proposta)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => copiarNumeroControle(edital.id)}>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="select-all">ID: {edital.id}</span>
                      {copiedId === edital.id ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        <Badge variant="outline">{edital.uf}</Badge> {edital.municipio_nome || 'Município não informado'}
                      </span>
                    </div>
                    {edital.valor_estimado && (
                      <div className="text-sm font-medium">
                        Valor: {formatarValor(edital.valor_estimado)}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 pt-3 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => abrirComAviso(edital.url_documento || `https://pncp.gov.br/app/editais/${edital.id}`)}
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Ver no PNCP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}