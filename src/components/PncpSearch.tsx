import { useState } from 'react';
import { Search, Calendar, Building, FileText, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePncp } from '@/hooks/usePncp';

export function PncpSearch() {
  const { loading, error, editais, totalPaginas, buscarEditais, limparEditais } = usePncp();
  const [palavraChave, setPalavraChave] = useState('');
  const [modalidade, setModalidade] = useState('0');
  const [paginaAtual, setPaginaAtual] = useState(1);

  const handleBuscar = async (novaPagina = 1) => {
    setPaginaAtual(novaPagina);
    await buscarEditais({
      pagina: novaPagina,
      modalidade: parseInt(modalidade),
      palavraChave: palavraChave.trim() || undefined
    });
  };

  const handleCarregarMais = () => {
    if (paginaAtual < totalPaginas) {
      handleBuscar(paginaAtual + 1);
    }
  };

  const formatarData = (data: string) => {
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

  return (
    <div className="space-y-6">
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
            <Select value={modalidade} onValueChange={setModalidade}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Todas as modalidades</SelectItem>
                <SelectItem value="8">Pregão eletrônico</SelectItem>
                <SelectItem value="1">Concorrência</SelectItem>
                <SelectItem value="2">Tomada de preços</SelectItem>
                <SelectItem value="3">Convite</SelectItem>
                <SelectItem value="5">Concurso</SelectItem>
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
              <Card key={edital.numeroControle} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base leading-tight">
                        {edital.titulo}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {edital.orgaoNome}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {edital.modalidadeNome}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Prazo: {formatarData(edital.dataFimRecebimentoProposta)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>Controle: {edital.numeroControle}</span>
                    </div>
                    {edital.valorEstimado && (
                      <div className="text-sm font-medium">
                        Valor: {formatarValor(edital.valorEstimado)}
                      </div>
                    )}
                  </div>
                  
                  {edital.linkSistemaOrigem && (
                    <div className="mt-3 pt-3 border-t">
                      <Button 
                        variant="outline" 
                        size="sm"
                        asChild
                      >
                        <a 
                          href={edital.linkSistemaOrigem} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver no PNCP
                        </a>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}