import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, TrendingDown, DollarSign, Package, AlertCircle, Star, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProdutoPreco {
  id: string;
  nome: string;
  categoria: string;
  precoMedio: number;
  precoMinimo: number;
  precoMaximo: number;
  variacao: number;
  ultimaAtualizacao: string;
  fornecedores: number;
  licitacoes: number;
  tendencia: 'alta' | 'baixa' | 'estavel';
  favorito: boolean;
}

interface Categoria {
  id: string;
  nome: string;
  produtos: number;
  variacao: number;
}

export function PrecosPage() {
  const [produtos] = useState<ProdutoPreco[]>([
    {
      id: '1',
      nome: 'Notebook Dell Inspiron 15 3000',
      categoria: 'Informática',
      precoMedio: 2850.00,
      precoMinimo: 2650.00,
      precoMaximo: 3200.00,
      variacao: -5.2,
      ultimaAtualizacao: '2024-02-10',
      fornecedores: 12,
      licitacoes: 8,
      tendencia: 'baixa',
      favorito: true
    },
    {
      id: '2',
      nome: 'Impressora HP LaserJet Pro M404dn',
      categoria: 'Informática',
      precoMedio: 1250.00,
      precoMinimo: 1180.00,
      precoMaximo: 1350.00,
      variacao: 3.8,
      ultimaAtualizacao: '2024-02-09',
      fornecedores: 8,
      licitacoes: 15,
      tendencia: 'alta',
      favorito: false
    },
    {
      id: '3',
      nome: 'Mesa de Escritório 120x60cm',
      categoria: 'Mobiliário',
      precoMedio: 450.00,
      precoMinimo: 380.00,
      precoMaximo: 520.00,
      variacao: 0.5,
      ultimaAtualizacao: '2024-02-08',
      fornecedores: 15,
      licitacoes: 22,
      tendencia: 'estavel',
      favorito: true
    },
    {
      id: '4',
      nome: 'Ar Condicionado Split 12000 BTUs',
      categoria: 'Climatização',
      precoMedio: 1850.00,
      precoMinimo: 1650.00,
      precoMaximo: 2100.00,
      variacao: -2.1,
      ultimaAtualizacao: '2024-02-10',
      fornecedores: 10,
      licitacoes: 6,
      tendencia: 'baixa',
      favorito: false
    }
  ]);

  const [categorias] = useState<Categoria[]>([
    { id: '1', nome: 'Informática', produtos: 156, variacao: -1.2 },
    { id: '2', nome: 'Mobiliário', produtos: 89, variacao: 2.1 },
    { id: '3', nome: 'Climatização', produtos: 34, variacao: -0.8 },
    { id: '4', nome: 'Veículos', produtos: 45, variacao: 4.5 },
    { id: '5', nome: 'Material de Limpeza', produtos: 78, variacao: 1.3 }
  ]);

  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');
  const [ordenacao, setOrdenacao] = useState('nome');
  const { toast } = useToast();

  const estatisticas = {
    totalProdutos: produtos.length,
    precoMedio: produtos.reduce((acc, p) => acc + p.precoMedio, 0) / produtos.length,
    economiaMedia: 15.8,
    fornecedoresAtivos: produtos.reduce((acc, p) => acc + p.fornecedores, 0)
  };

  const toggleFavorito = (produtoId: string) => {
    toast({
      title: 'Favorito Atualizado',
      description: 'Produto adicionado/removido dos favoritos.',
    });
  };

  const verHistorico = (produto: ProdutoPreco) => {
    toast({
      title: 'Histórico de Preços',
      description: `Abrindo histórico detalhado para "${produto.nome}".`,
    });
  };

  const criarAlerta = (produto: ProdutoPreco) => {
    toast({
      title: 'Alerta Criado',
      description: `Alerta de preço criado para "${produto.nome}".`,
    });
  };

  const produtosFiltrados = produtos.filter(produto => {
    const matchBusca = produto.nome.toLowerCase().includes(busca.toLowerCase()) ||
                     produto.categoria.toLowerCase().includes(busca.toLowerCase());
    const matchCategoria = categoriaFiltro === 'todas' || produto.categoria === categoriaFiltro;
    return matchBusca && matchCategoria;
  }).sort((a, b) => {
    switch (ordenacao) {
      case 'preco-asc':
        return a.precoMedio - b.precoMedio;
      case 'preco-desc':
        return b.precoMedio - a.precoMedio;
      case 'variacao-asc':
        return a.variacao - b.variacao;
      case 'variacao-desc':
        return b.variacao - a.variacao;
      default:
        return a.nome.localeCompare(b.nome);
    }
  });

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'alta':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'baixa':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 0) return 'text-red-600';
    if (variacao < 0) return 'text-green-600';
    return 'text-gray-600';
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Monitoramento de Preços</h1>
        <p className="text-gray-600">Acompanhe preços de produtos em licitações e identifique oportunidades</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{estatisticas.totalProdutos}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-green-600">{formatarMoeda(estatisticas.precoMedio)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Economia Média</p>
                <p className="text-2xl font-bold text-purple-600">{estatisticas.economiaMedia}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Fornecedores Ativos</p>
                <p className="text-2xl font-bold text-orange-600">{estatisticas.fornecedoresAtivos}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="produtos">Produtos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="produtos" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[300px]">
                  <label className="block text-sm font-medium mb-2">Buscar Produto</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Digite o nome do produto ou categoria..."
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium mb-2">Categoria</label>
                  <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas as categorias</SelectItem>
                      <SelectItem value="Informática">Informática</SelectItem>
                      <SelectItem value="Mobiliário">Mobiliário</SelectItem>
                      <SelectItem value="Climatização">Climatização</SelectItem>
                      <SelectItem value="Veículos">Veículos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="min-w-[200px]">
                  <label className="block text-sm font-medium mb-2">Ordenar por</label>
                  <Select value={ordenacao} onValueChange={setOrdenacao}>
                    <SelectTrigger>
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nome">Nome</SelectItem>
                      <SelectItem value="preco-asc">Menor Preço</SelectItem>
                      <SelectItem value="preco-desc">Maior Preço</SelectItem>
                      <SelectItem value="variacao-asc">Menor Variação</SelectItem>
                      <SelectItem value="variacao-desc">Maior Variação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Produtos */}
          <div className="space-y-4">
            {produtosFiltrados.map((produto) => (
              <Card key={produto.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{produto.nome}</h3>
                        <Badge variant="outline">{produto.categoria}</Badge>
                        {getTendenciaIcon(produto.tendencia)}
                        {produto.favorito && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Preço Médio:</span>
                          <br />
                          <span className="text-lg font-bold text-gray-900">{formatarMoeda(produto.precoMedio)}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Faixa de Preço:</span>
                          <br />
                          <span className="text-gray-700">
                            {formatarMoeda(produto.precoMinimo)} - {formatarMoeda(produto.precoMaximo)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Variação:</span>
                          <br />
                          <span className={`font-semibold ${getVariacaoColor(produto.variacao)}`}>
                            {produto.variacao > 0 ? '+' : ''}{produto.variacao.toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Fornecedores:</span>
                          <br />
                          <span className="text-gray-700">{produto.fornecedores}</span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Licitações:</span>
                          <br />
                          <span className="text-gray-700">{produto.licitacoes}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Última atualização: {new Date(produto.ultimaAtualizacao).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorito(produto.id)}
                      >
                        <Star className={`h-4 w-4 mr-2 ${produto.favorito ? 'text-yellow-500 fill-current' : ''}`} />
                        {produto.favorito ? 'Remover' : 'Favoritar'}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => verHistorico(produto)}
                      >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Histórico
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => criarAlerta(produto)}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Criar Alerta
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {produtosFiltrados.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum produto encontrado</h3>
                <p className="text-gray-600 mb-4">Não há produtos que correspondam aos filtros selecionados</p>
                <Button onClick={() => { setBusca(''); setCategoriaFiltro('todas'); }}>Limpar Filtros</Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => (
              <Card key={categoria.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{categoria.nome}</span>
                    <Badge variant={categoria.variacao > 0 ? 'destructive' : 'default'}>
                      {categoria.variacao > 0 ? '+' : ''}{categoria.variacao.toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Produtos monitorados:</span>
                      <span className="font-semibold">{categoria.produtos}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Variação média:</span>
                      <span className={`font-semibold ${getVariacaoColor(categoria.variacao)}`}>
                        {categoria.variacao > 0 ? '+' : ''}{categoria.variacao.toFixed(1)}%
                      </span>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => setCategoriaFiltro(categoria.nome)}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Ver Produtos
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}