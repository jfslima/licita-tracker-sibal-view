import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart3, Download, FileText, TrendingUp, Calendar as CalendarIcon, Filter, Eye, PieChart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Relatorio {
  id: string;
  titulo: string;
  tipo: 'mensal' | 'trimestral' | 'anual' | 'personalizado';
  status: 'gerado' | 'processando' | 'erro';
  dataGeracao: string;
  tamanho: string;
  downloads: number;
}

export function RelatoriosPage() {
  const [relatorios] = useState<Relatorio[]>([
    {
      id: '1',
      titulo: 'Relatório Mensal - Janeiro 2024',
      tipo: 'mensal',
      status: 'gerado',
      dataGeracao: '2024-02-01',
      tamanho: '2.4 MB',
      downloads: 15
    },
    {
      id: '2',
      titulo: 'Análise Trimestral Q4 2023',
      tipo: 'trimestral',
      status: 'gerado',
      dataGeracao: '2024-01-15',
      tamanho: '5.8 MB',
      downloads: 32
    },
    {
      id: '3',
      titulo: 'Relatório Personalizado - Tecnologia',
      tipo: 'personalizado',
      status: 'processando',
      dataGeracao: '2024-02-10',
      tamanho: '-',
      downloads: 0
    }
  ]);

  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [dataInicio, setDataInicio] = useState<Date>();
  const [dataFim, setDataFim] = useState<Date>();
  const { toast } = useToast();

  const estatisticas = {
    totalRelatorios: relatorios.length,
    relatoriosGerados: relatorios.filter(r => r.status === 'gerado').length,
    totalDownloads: relatorios.reduce((acc, r) => acc + r.downloads, 0),
    tamanhoTotal: '12.5 MB'
  };

  const gerarRelatorio = (tipo: string) => {
    toast({
      title: 'Relatório em Processamento',
      description: `Seu relatório ${tipo} está sendo gerado. Você será notificado quando estiver pronto.`,
    });
  };

  const downloadRelatorio = (relatorio: Relatorio) => {
    if (relatorio.status !== 'gerado') {
      toast({
        title: 'Relatório Indisponível',
        description: 'Este relatório ainda não foi gerado ou está em processamento.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Download Iniciado',
      description: `Download do relatório "${relatorio.titulo}" iniciado.`,
    });
  };

  const visualizarRelatorio = (relatorio: Relatorio) => {
    if (relatorio.status !== 'gerado') {
      toast({
        title: 'Relatório Indisponível',
        description: 'Este relatório ainda não foi gerado ou está em processamento.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Abrindo Visualização',
      description: `Abrindo visualização do relatório "${relatorio.titulo}".`,
    });
  };

  const relatoriosFiltrados = relatorios.filter(relatorio => {
    if (filtroTipo !== 'todos' && relatorio.tipo !== filtroTipo) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'gerado':
        return <Badge className="bg-green-100 text-green-800">Gerado</Badge>;
      case 'processando':
        return <Badge className="bg-yellow-100 text-yellow-800">Processando</Badge>;
      case 'erro':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'mensal': return 'Mensal';
      case 'trimestral': return 'Trimestral';
      case 'anual': return 'Anual';
      case 'personalizado': return 'Personalizado';
      default: return tipo;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h1>
        <p className="text-gray-600">Gere e gerencie relatórios detalhados sobre licitações e performance</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Relatórios</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalRelatorios}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Relatórios Gerados</p>
                <p className="text-2xl font-bold text-green-600">{estatisticas.relatoriosGerados}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.totalDownloads}</p>
              </div>
              <Download className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tamanho Total</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.tamanhoTotal}</p>
              </div>
              <PieChart className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerar Novo Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => gerarRelatorio('mensal')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <CalendarIcon className="h-6 w-6" />
              <span>Relatório Mensal</span>
            </Button>
            
            <Button 
              onClick={() => gerarRelatorio('trimestral')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <BarChart3 className="h-6 w-6" />
              <span>Relatório Trimestral</span>
            </Button>
            
            <Button 
              onClick={() => gerarRelatorio('anual')}
              className="h-20 flex flex-col items-center justify-center space-y-2"
              variant="outline"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Relatório Anual</span>
            </Button>
            
            <Button 
              onClick={() => gerarRelatorio('personalizado')}
              className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              <Filter className="h-6 w-6" />
              <span>Personalizado</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-2">Tipo de Relatório</label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                  <SelectItem value="personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Data Início</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={setDataInicio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Data Fim</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={setDataFim}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="space-y-4">
        {relatoriosFiltrados.map((relatorio) => (
          <Card key={relatorio.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{relatorio.titulo}</h3>
                    {getStatusBadge(relatorio.status)}
                    <Badge variant="outline">{getTipoLabel(relatorio.tipo)}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Data de Geração:</span>
                      <br />
                      {new Date(relatorio.dataGeracao).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Tamanho:</span>
                      <br />
                      {relatorio.tamanho}
                    </div>
                    <div>
                      <span className="font-medium">Downloads:</span>
                      <br />
                      {relatorio.downloads}
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <br />
                      {relatorio.status === 'gerado' ? 'Disponível' : 'Em processamento'}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => visualizarRelatorio(relatorio)}
                    disabled={relatorio.status !== 'gerado'}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={() => downloadRelatorio(relatorio)}
                    disabled={relatorio.status !== 'gerado'}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {relatoriosFiltrados.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum relatório encontrado</h3>
            <p className="text-gray-600 mb-4">Não há relatórios que correspondam aos filtros selecionados</p>
            <Button onClick={() => setFiltroTipo('todos')}>Limpar Filtros</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}