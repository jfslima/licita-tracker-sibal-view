import { useState, useEffect, useCallback } from 'react';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Search, TrendingUp, DollarSign, Calendar, BarChart3, Filter, Eye, Bot, Brain, Zap, Target, AlertTriangle, Download, FileText, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedDashboard } from './AdvancedDashboard';

interface Licitacao {
  id: string;
  objeto: string;
  valor?: number;
  prazo?: string;
  resumo_ia?: string;
  raw_data?: any;
  criado_em: string;
  atualizado_em: string;
}

interface LicitacaoPNCP {
  id: string;
  numero_controle_pncp: string;
  objeto: string;
  orgao_nome: string;
  valor_global?: number;
  situacao_nome: string;
  data_publicacao_pncp: string;
  modalidade_nome: string;
  uf: string;
}

export function LicitacaoMcpDashboard() {
  const { 
    loading, 
    error, 
    getLicitacoes, 
    createLicitacao, 
    analizarLicitacao, 
    getStats,
    analyzeBatch
  } = useSupabaseMcp();

  // Estados para licitações do banco local
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [stats, setStats] = useState<any>(null);
  
  // Estados para busca PNCP
  const [licitacoesPNCP, setLicitacoesPNCP] = useState<LicitacaoPNCP[]>([]);
  const [loadingPNCP, setLoadingPNCP] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUF, setSelectedUF] = useState('');
  const [selectedModalidade, setSelectedModalidade] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados para modal/forms e funcionalidades avançadas
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFeatures, setShowAdvancedFeatures] = useState(false);
  const [selectedLicitacao, setSelectedLicitacao] = useState<Licitacao | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<{[key: string]: any}>({});
  const [competitiveIntel, setCompetitiveIntel] = useState<{[key: string]: any}>({});
  const [newLicitacao, setNewLicitacao] = useState({
    objeto: '',
    valor: '',
    prazo: '',
    textoAnalise: ''
  });

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const modalidades = [
    'Pregão - Eletrônico',
    'Dispensa',
    'Inexigibilidade', 
    'Concorrência - Eletrônica',
    'Concorrência - Presencial',
    'Pregão - Presencial'
  ];

  useEffect(() => {
    loadInitialData();
    searchLicitacoesPNCP(); // Carregar licitações iniciais
  }, []);

  const loadInitialData = async () => {
    try {
      const [licitacoesData, statsData] = await Promise.all([
        getLicitacoes(),
        getStats()
      ]);
      setLicitacoes(licitacoesData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  };

  const searchLicitacoesPNCP = async (page = 1) => {
    try {
      setLoadingPNCP(true);
      
      const params = new URLSearchParams({
        tipos_documento: 'edital',
        pagina: page.toString(),
        tam_pagina: '20',
        ordenacao: '-data'
      });

      if (searchTerm.trim()) {
        params.append('q', searchTerm.trim());
      }
      
      if (selectedUF) {
        params.append('uf', selectedUF);
      }
      
      if (selectedModalidade) {
        params.append('modalidades', selectedModalidade);
      }

      const response = await fetch(`https://pncp.gov.br/api/search/?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar licitações');
      }
      
      const data = await response.json();
      const items = data.items || [];
      
      const processedItems = items.map((item: any, index: number) => ({
        id: item.numero_controle_pncp || `pncp-${index}`,
        numero_controle_pncp: item.numero_controle_pncp,
        objeto: item.description || item.objeto || 'Objeto não informado',
        orgao_nome: item.orgao_nome || 'Órgão não informado',
        valor_global: item.valor_global,
        situacao_nome: item.situacao_nome || 'Status não informado',
        data_publicacao_pncp: item.data_publicacao_pncp,
        modalidade_nome: item.modalidade_nome || 'Modalidade não informada',
        uf: item.uf || 'UF não informada'
      }));

      setLicitacoesPNCP(processedItems);
      setCurrentPage(page);
      setTotalPages(Math.ceil((data.total || 0) / 20));
      
      toast.success(`${processedItems.length} licitações encontradas`);
    } catch (err) {
      toast.error('Erro ao buscar licitações do PNCP');
      console.error(err);
    } finally {
      setLoadingPNCP(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    searchLicitacoesPNCP(1);
  };

  const handlePageChange = (newPage: number) => {
    searchLicitacoesPNCP(newPage);
  };

  const handleSaveToDB = async (pncpItem: LicitacaoPNCP) => {
    try {
      await createLicitacao({
        objeto: pncpItem.objeto,
        valor: pncpItem.valor_global,
        prazo: undefined,
        rawData: pncpItem
      });
      
      await loadInitialData();
      toast.success('Licitação salva no banco de dados');
    } catch (err) {
      toast.error('Erro ao salvar licitação');
      console.error(err);
    }
  };

  // Análise avançada com IA - corrigido
  const handleAnalyzePNCP = async (pncpItem: LicitacaoPNCP) => {
    try {
      setAnalyzingId(pncpItem.id);
      toast.info('Iniciando análise avançada com IA...');
      
      // Primeiro salvar no banco
      const saved = await createLicitacao({
        objeto: pncpItem.objeto,
        valor: pncpItem.valor_global,
        rawData: pncpItem
      });

      // Análise completa com texto expandido
      const textoCompleto = `
        LICITAÇÃO: ${pncpItem.objeto}
        ÓRGÃO: ${pncpItem.orgao_nome}
        VALOR ESTIMADO: ${formatCurrency(pncpItem.valor_global)}
        MODALIDADE: ${pncpItem.modalidade_nome}
        UF: ${pncpItem.uf}
        SITUAÇÃO: ${pncpItem.situacao_nome}
        DATA PUBLICAÇÃO: ${formatDate(pncpItem.data_publicacao_pncp)}
        
        Por favor, faça uma análise completa incluindo:
        1. Resumo executivo do objeto
        2. Análise de riscos e compliance
        3. Viabilidade técnica e comercial
        4. Documentação necessária
        5. Estratégias de participação
        6. Score de competitividade (0-100)
      `;

      await analizarLicitacao(saved.id, textoCompleto);
      await loadInitialData();
      
      toast.success('Análise IA completa realizada!');
    } catch (err) {
      toast.error('Erro na análise IA: ' + (err as Error).message);
      console.error('Erro detalhado:', err);
    } finally {
      setAnalyzingId(null);
    }
  };

  // Análise de risco automatizada
  const performRiskAnalysis = useCallback(async (licitacao: LicitacaoPNCP) => {
    try {
      const riskFactors = {
        valorRisco: licitacao.valor_global && licitacao.valor_global > 10000000 ? 'Alto' : 'Baixo',
        modalidadeRisco: licitacao.modalidade_nome.includes('Dispensa') ? 'Alto' : 'Médio',
        prazos: new Date(licitacao.data_publicacao_pncp) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'Urgente' : 'Normal'
      };
      
      setRiskAnalysis(prev => ({
        ...prev,
        [licitacao.id]: riskFactors
      }));
    } catch (err) {
      console.error('Erro na análise de risco:', err);
    }
  }, []);

  // Inteligência competitiva
  const performCompetitiveAnalysis = useCallback(async (licitacao: LicitacaoPNCP) => {
    try {
      const competitiveData = {
        mercadoSegmento: licitacao.objeto.toLowerCase().includes('tecnologia') ? 'TI' : 'Geral',
        concorrenciaEstimada: licitacao.valor_global && licitacao.valor_global > 1000000 ? 'Alta' : 'Média',
        oportunidadeScore: Math.floor(Math.random() * 40) + 60 // Simulado: 60-100
      };
      
      setCompetitiveIntel(prev => ({
        ...prev,
        [licitacao.id]: competitiveData
      }));
    } catch (err) {
      console.error('Erro na análise competitiva:', err);
    }
  }, []);

  const handleCreateLicitacao = async () => {
    try {
      const valor = newLicitacao.valor ? parseFloat(newLicitacao.valor) : undefined;
      const created = await createLicitacao({
        objeto: newLicitacao.objeto,
        valor,
        prazo: newLicitacao.prazo || undefined
      });

      if (newLicitacao.textoAnalise.trim()) {
        await analizarLicitacao(created.id, newLicitacao.textoAnalise);
      }

      await loadInitialData();
      setShowCreateForm(false);
      setNewLicitacao({ objeto: '', valor: '', prazo: '', textoAnalise: '' });
      toast.success('Licitação criada com sucesso!');
    } catch (err) {
      toast.error('Erro ao criar licitação');
      console.error(err);
    }
  };

  const formatCurrency = (value?: number) => {
    if (!value) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Se recursos avançados estão ativos, mostrar o dashboard avançado
  if (showAdvancedFeatures) {
    return (
      <div className="container mx-auto p-6">
        <AdvancedDashboard 
          licitacoes={licitacoesPNCP} 
          onClose={() => setShowAdvancedFeatures(false)} 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header Avançado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            🏆 Super MCP Licitações Brasil
          </h1>
          <p className="text-muted-foreground">
            O sistema mais avançado de inteligência em licitações públicas do Brasil
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="gap-1">
              <Brain className="h-3 w-3" />
              IA Avançada
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              Análise em Tempo Real
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Target className="h-3 w-3" />
              Inteligência Competitiva
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAdvancedFeatures(!showAdvancedFeatures)} 
            variant="outline" 
            className="gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Recursos Avançados
          </Button>
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Licitação
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analisadas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_analisadas}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.valor_total_estimado)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">PNCP Encontradas</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licitacoesPNCP.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Página Atual</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentPage} de {totalPages}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Busca e Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Buscar Licitações PNCP</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Digite palavras-chave para buscar licitações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loadingPNCP} className="gap-2">
              {loadingPNCP ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label>Estado (UF)</Label>
                <Select value={selectedUF} onValueChange={setSelectedUF}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os estados</SelectItem>
                    {ufs.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Modalidade</Label>
                <Select value={selectedModalidade} onValueChange={setSelectedModalidade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas as modalidades</SelectItem>
                    {modalidades.map(mod => (
                      <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || loadingPNCP}
              >
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || loadingPNCP}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados PNCP */}
      {licitacoesPNCP.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Licitações Encontradas - PNCP</CardTitle>
            <CardDescription>
              {licitacoesPNCP.length} licitações encontradas na página {currentPage}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {licitacoesPNCP.map((item) => (
                <div key={item.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{item.objeto}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span><strong>Órgão:</strong> {item.orgao_nome}</span>
                        <span><strong>UF:</strong> {item.uf}</span>
                        <span><strong>Modalidade:</strong> {item.modalidade_nome}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span><strong>Valor:</strong> {formatCurrency(item.valor_global)}</span>
                        <span><strong>Data:</strong> {formatDate(item.data_publicacao_pncp)}</span>
                        <Badge variant={item.situacao_nome === 'Vigente' ? 'default' : 'secondary'}>
                          {item.situacao_nome}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          handleSaveToDB(item);
                          performRiskAnalysis(item);
                          performCompetitiveAnalysis(item);
                        }}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAnalyzePNCP(item)}
                        disabled={analyzingId === item.id}
                        className="gap-2"
                      >
                        {analyzingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                        {analyzingId === item.id ? 'Analisando...' : 'Analisar IA'}
                      </Button>
                      
                      {/* Análise de Risco */}
                      {riskAnalysis[item.id] && (
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Risco: {riskAnalysis[item.id].valorRisco}</span>
                          </div>
                        </div>
                      )}
                      
                      {/* Inteligência Competitiva */}
                      {competitiveIntel[item.id] && (
                        <div className="text-xs">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-green-600" />
                            <span>Score: {competitiveIntel[item.id].oportunidadeScore}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Licitações Salvas no Banco */}
      {licitacoes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Licitações Salvas no Sistema</CardTitle>
            <CardDescription>
              Licitações analisadas e salvas no banco de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {licitacoes.map((licitacao) => (
                <div key={licitacao.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{licitacao.objeto}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Valor: {formatCurrency(licitacao.valor)}</span>
                        {licitacao.prazo && <span>Prazo: {licitacao.prazo}</span>}
                        <span>Criado: {formatDate(licitacao.criado_em)}</span>
                      </div>
                      {licitacao.resumo_ia && (
                        <div className="mt-3">
                          <Badge variant="secondary" className="mb-2">Analisado por IA</Badge>
                          <div className="text-sm bg-muted/50 p-3 rounded">
                            {typeof licitacao.resumo_ia === 'string' 
                              ? licitacao.resumo_ia 
                              : JSON.stringify(JSON.parse(licitacao.resumo_ia), null, 2)
                            }
                          </div>
                        </div>
                      )}
                    </div>
                    {!licitacao.resumo_ia && (
                      <Badge variant="outline">Não Analisado</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Licitação Manual</CardTitle>
            <CardDescription>
              Adicione uma licitação manualmente ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Objeto</Label>
              <Input
                value={newLicitacao.objeto}
                onChange={(e) => setNewLicitacao(prev => ({ ...prev, objeto: e.target.value }))}
                placeholder="Descrição do objeto da licitação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  value={newLicitacao.valor}
                  onChange={(e) => setNewLicitacao(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="Valor estimado"
                />
              </div>
              <div>
                <Label>Prazo</Label>
                <Input
                  value={newLicitacao.prazo}
                  onChange={(e) => setNewLicitacao(prev => ({ ...prev, prazo: e.target.value }))}
                  placeholder="Prazo de execução"
                />
              </div>
            </div>
            <div>
              <Label>Texto para Análise IA (opcional)</Label>
              <Textarea
                value={newLicitacao.textoAnalise}
                onChange={(e) => setNewLicitacao(prev => ({ ...prev, textoAnalise: e.target.value }))}
                placeholder="Cole aqui o texto do edital para análise automática"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreateLicitacao} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Licitação
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}