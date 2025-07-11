import { useState, useEffect } from 'react';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Search, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

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

  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLicitacao, setSelectedLicitacao] = useState<Licitacao | null>(null);
  const [newLicitacao, setNewLicitacao] = useState({
    objeto: '',
    valor: '',
    prazo: '',
    textoAnalise: ''
  });

  useEffect(() => {
    loadInitialData();
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
      toast.error('Erro ao carregar dados');
      console.error(err);
    }
  };

  const handleCreateLicitacao = async () => {
    try {
      const valor = newLicitacao.valor ? parseFloat(newLicitacao.valor) : undefined;
      const created = await createLicitacao({
        objeto: newLicitacao.objeto,
        valor,
        prazo: newLicitacao.prazo || undefined
      });

      // Se há texto para análise, fazer análise IA
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

  const handleAnalyzeSelected = async () => {
    if (!selectedLicitacao) return;

    try {
      const texto = prompt('Digite o texto do edital para análise:');
      if (!texto) return;

      await analizarLicitacao(selectedLicitacao.id, texto);
      await loadInitialData();
      toast.success('Análise IA concluída!');
    } catch (err) {
      toast.error('Erro na análise IA');
      console.error(err);
    }
  };

  const handleBatchAnalysis = async () => {
    try {
      const licitacoesSemAnalise = licitacoes.filter(l => !l.resumo_ia);
      if (licitacoesSemAnalise.length === 0) {
        toast.info('Todas as licitações já foram analisadas');
        return;
      }

      await analyzeBatch(licitacoesSemAnalise.map(l => ({
        id: l.id,
        objeto: l.objeto,
        texto: l.objeto // Usar objeto como texto base
      })));

      await loadInitialData();
      toast.success(`${licitacoesSemAnalise.length} licitações analisadas!`);
    } catch (err) {
      toast.error('Erro na análise em lote');
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
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super MCP Licitações Brasil</h1>
          <p className="text-muted-foreground">
            Sistema de análise inteligente de licitações públicas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova Licitação
          </Button>
          <Button variant="outline" onClick={handleBatchAnalysis} className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Análise em Lote
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
              <CardTitle className="text-sm font-medium">Média/Dia</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.media_por_dia?.toFixed(1) || '0'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Atualização</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {formatDate(stats.ultima_atualizacao)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Licitação</CardTitle>
            <CardDescription>
              Adicione uma nova licitação ao sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Objeto</label>
              <Input
                value={newLicitacao.objeto}
                onChange={(e) => setNewLicitacao(prev => ({ ...prev, objeto: e.target.value }))}
                placeholder="Descrição do objeto da licitação"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Valor (R$)</label>
                <Input
                  type="number"
                  value={newLicitacao.valor}
                  onChange={(e) => setNewLicitacao(prev => ({ ...prev, valor: e.target.value }))}
                  placeholder="Valor estimado"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Prazo</label>
                <Input
                  value={newLicitacao.prazo}
                  onChange={(e) => setNewLicitacao(prev => ({ ...prev, prazo: e.target.value }))}
                  placeholder="Prazo de execução"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Texto para Análise IA (opcional)</label>
              <Textarea
                value={newLicitacao.textoAnalise}
                onChange={(e) => setNewLicitacao(prev => ({ ...prev, textoAnalise: e.target.value }))}
                placeholder="Cole aqui o texto do edital para análise automática da IA"
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

      {/* Licitações List */}
      <Card>
        <CardHeader>
          <CardTitle>Licitações Recentes</CardTitle>
          <CardDescription>
            Lista das licitações cadastradas no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && licitacoes.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {licitacoes.map((licitacao) => (
                <div
                  key={licitacao.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedLicitacao?.id === licitacao.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedLicitacao(licitacao)}
                >
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
                              : JSON.stringify(licitacao.resumo_ia, null, 2)
                            }
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      {!licitacao.resumo_ia && (
                        <Badge variant="outline">Não Analisado</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLicitacao && (
        <Card>
          <CardHeader>
            <CardTitle>Ações da Licitação Selecionada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button onClick={handleAnalyzeSelected} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Analisar com IA
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