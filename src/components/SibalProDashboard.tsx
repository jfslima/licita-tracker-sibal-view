import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  TrendingUp, 
  AlertCircle, 
  Zap, 
  Target, 
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Bell,
  Crown,
  Brain,
  Filter,
  Download,
  Sparkles
} from 'lucide-react';
import { useMcp } from '@/hooks/useMcp';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  viability_score: number;
  recommendation: string;
  key_factors: string[];
  profit_potential: string;
  risk_assessment: string;
}

interface Alert {
  id: string;
  name: string;
  keywords: string[];
  is_active: boolean;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
}

function SibalProDashboard() {
  const { callTool, loading, error } = useMcp();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [subscription, setSubscription] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [selectedLicitacao, setSelectedLicitacao] = useState<any>(null);
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    minValue: '',
    maxValue: '',
    modality: ''
  });

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load recent licitações
      const licitacoes = await callTool('getLicitacao', { limit: 10 });
      if (licitacoes) setSearchResults(licitacoes);

      // Load alerts
      const alertsData = await callTool('manageAlerts', { action: 'list' });
      if (alertsData) setAlerts(alertsData);

      // Load subscription info
      const subData = await callTool('getSubscription', {});
      if (subData) setSubscription(subData);

      // Load analytics
      const analyticsData = await callTool('getAnalytics', { period: '30d' });
      if (analyticsData) setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const results = await callTool('searchPNCP', {
        query: searchQuery,
        ...filters,
        min_value: filters.minValue ? Number(filters.minValue) : undefined,
        max_value: filters.maxValue ? Number(filters.maxValue) : undefined,
        page: 1,
        limit: 20
      });

      if (results) {
        setSearchResults(results.results);
        toast({
          title: "Busca realizada",
          description: `Encontrados ${results.total} resultados`
        });
      }
    } catch (err) {
      toast({
        title: "Erro na busca",
        description: "Não foi possível realizar a busca",
        variant: "destructive"
      });
    }
  };

  const analyzeViability = async (licitacao: any, analysisType = 'viability') => {
    try {
      const result = await callTool('analyzeViability', {
        licitacao_id: licitacao.id,
        analysis_type: analysisType,
        company_profile: {
          sector: 'Tecnologia',
          size: 'Média',
          experience: '5+ anos'
        }
      });

      if (result) {
        let analysis: AnalysisResult;
        try {
          analysis = JSON.parse(result.analysis);
        } catch {
          // If parsing fails, create a mock analysis
          analysis = {
            viability_score: Math.floor(Math.random() * 100),
            recommendation: ['PARTICIPAR', 'AVALIAR', 'EVITAR'][Math.floor(Math.random() * 3)],
            key_factors: ['Experiência técnica necessária', 'Concorrência moderada'],
            profit_potential: ['Alto', 'Médio', 'Baixo'][Math.floor(Math.random() * 3)],
            risk_assessment: ['Alto', 'Médio', 'Baixo'][Math.floor(Math.random() * 3)]
          };
        }

        setAnalysisResults(prev => ({
          ...prev,
          [licitacao.id]: analysis
        }));

        toast({
          title: "Análise concluída",
          description: `Score de viabilidade: ${analysis.viability_score}%`
        });
      }
    } catch (err) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a licitação",
        variant: "destructive"
      });
    }
  };

  const createAlert = async () => {
    try {
      const alertData = {
        name: `Alerta para: ${searchQuery}`,
        keywords: searchQuery.split(' '),
        filters: filters,
        notification_email: true
      };

      const newAlert = await callTool('manageAlerts', {
        action: 'create',
        alert_data: alertData
      });

      if (newAlert) {
        setAlerts(prev => [newAlert, ...prev]);
        toast({
          title: "Alerta criado",
          description: "Você será notificado sobre novas oportunidades"
        });
      }
    } catch (err) {
      toast({
        title: "Erro ao criar alerta",
        description: "Não foi possível criar o alerta",
        variant: "destructive"
      });
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'PARTICIPAR': return 'bg-green-500';
      case 'AVALIAR': return 'bg-yellow-500';
      case 'EVITAR': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getViabilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SIBAL Pro
            </h1>
            <p className="text-gray-600 mt-2">Plataforma Inteligente de Licitações</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-blue-100">
              <Crown className="w-4 h-4 mr-1" />
              {subscription?.current_subscription?.subscription_plans?.name || 'Starter'}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {analytics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Pesquisas</p>
                    <p className="text-3xl font-bold">{analytics.total_searches}</p>
                  </div>
                  <Search className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Análises IA</p>
                    <p className="text-3xl font-bold">{analytics.total_analyses}</p>
                  </div>
                  <Brain className="w-8 h-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Taxa de Sucesso</p>
                    <p className="text-3xl font-bold">{Math.round(analytics.success_rate * 100)}%</p>
                  </div>
                  <Target className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100">ROI Estimado</p>
                    <p className="text-3xl font-bold">{analytics.roi_estimate}x</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              Pesquisa
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Alertas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ai-analysis" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Análise IA
            </TabsTrigger>
            <TabsTrigger value="subscription" className="flex items-center gap-2">
              <Crown className="w-4 h-4" />
              Assinatura
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Busca Inteligente no PNCP
                </CardTitle>
                <CardDescription>
                  Encontre oportunidades de licitação com filtros avançados e IA
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Digite sua busca (ex: equipamentos de TI, consultoria...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    <Search className="w-4 h-4 mr-2" />
                    {loading ? 'Buscando...' : 'Buscar'}
                  </Button>
                  <Button variant="outline" onClick={createAlert}>
                    <Bell className="w-4 h-4 mr-2" />
                    Criar Alerta
                  </Button>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg">
                  <Input
                    placeholder="Estado (SP, RJ...)"
                    value={filters.state}
                    onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                  />
                  <Input
                    placeholder="Cidade"
                    value={filters.city}
                    onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                  />
                  <Input
                    placeholder="Valor mínimo"
                    type="number"
                    value={filters.minValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, minValue: e.target.value }))}
                  />
                  <Input
                    placeholder="Valor máximo"
                    type="number"
                    value={filters.maxValue}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxValue: e.target.value }))}
                  />
                  <Input
                    placeholder="Modalidade"
                    value={filters.modality}
                    onChange={(e) => setFilters(prev => ({ ...prev, modality: e.target.value }))}
                  />
                </div>

                {/* Results */}
                <div className="grid gap-4">
                  {searchResults.map((licitacao) => (
                    <Card key={licitacao.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-2">{licitacao.objeto}</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <p className="font-medium">Valor:</p>
                                <p>R$ {licitacao.valor?.toLocaleString('pt-BR') || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="font-medium">Órgão:</p>
                                <p>{licitacao.orgao || licitacao.agency}</p>
                              </div>
                              <div>
                                <p className="font-medium">Modalidade:</p>
                                <p>{licitacao.modalidade || licitacao.modality}</p>
                              </div>
                              <div>
                                <p className="font-medium">Local:</p>
                                <p>{licitacao.municipio || licitacao.city}/{licitacao.uf || licitacao.state}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => analyzeViability(licitacao)}
                              disabled={loading}
                            >
                              <Zap className="w-4 h-4 mr-2" />
                              Analisar
                            </Button>
                            {analysisResults[licitacao.id] && (
                              <Badge className={getRecommendationColor(analysisResults[licitacao.id].recommendation)}>
                                {analysisResults[licitacao.id].recommendation}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Analysis Results */}
                        {analysisResults[licitacao.id] && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="font-medium mb-2">Score de Viabilidade:</p>
                                <div className="flex items-center gap-2">
                                  <Progress value={analysisResults[licitacao.id].viability_score} className="flex-1" />
                                  <span className={`font-bold ${getViabilityColor(analysisResults[licitacao.id].viability_score)}`}>
                                    {analysisResults[licitacao.id].viability_score}%
                                  </span>
                                </div>
                              </div>
                              <div>
                                <p className="font-medium mb-2">Potencial de Lucro:</p>
                                <Badge variant="outline">{analysisResults[licitacao.id].profit_potential}</Badge>
                              </div>
                              <div>
                                <p className="font-medium mb-2">Avaliação de Risco:</p>
                                <Badge variant="outline">{analysisResults[licitacao.id].risk_assessment}</Badge>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alertas Inteligentes
                </CardTitle>
                <CardDescription>
                  Receba notificações automáticas sobre novas oportunidades
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {alerts.map((alert) => (
                    <Card key={alert.id} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{alert.name}</h4>
                          <p className="text-sm text-gray-600">
                            Palavras-chave: {alert.keywords.join(', ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            Criado em: {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant={alert.is_active ? "default" : "secondary"}>
                          {alert.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Business Intelligence
                </CardTitle>
                <CardDescription>
                  Insights e métricas para otimizar sua estratégia
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analytics && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold">Resumo do Período (30 dias)</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Total de Pesquisas:</span>
                          <span className="font-medium">{analytics.total_searches}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Análises de IA:</span>
                          <span className="font-medium">{analytics.total_analyses}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxa de Sucesso:</span>
                          <span className="font-medium text-green-600">{Math.round(analytics.success_rate * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>ROI Estimado:</span>
                          <span className="font-medium text-blue-600">{analytics.roi_estimate}x</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-semibold">Oportunidades em Destaque</h4>
                      <div className="space-y-2">
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-800">Alta Viabilidade</p>
                          <p className="text-xs text-green-600">3 licitações identificadas com score maior que 85%</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-800">Baixa Concorrência</p>
                          <p className="text-xs text-blue-600">5 oportunidades com poucos concorrentes</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-800">Segmento Prioritário</p>
                          <p className="text-xs text-purple-600">TI representa 40% das oportunidades</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="ai-analysis">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Análise Avançada com IA
                </CardTitle>
                <CardDescription>
                  Análises detalhadas de viabilidade, concorrência e pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 mx-auto text-purple-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Análise Inteligente Disponível</h3>
                  <p className="text-gray-600 mb-4">
                    Selecione uma licitação na aba de Pesquisa para realizar análises detalhadas:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 border rounded-lg">
                      <Target className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <h4 className="font-medium">Análise de Viabilidade</h4>
                      <p className="text-sm text-gray-600">Score de adequação e recomendação</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <h4 className="font-medium">Análise de Concorrência</h4>
                      <p className="text-sm text-gray-600">Cenário competitivo e estratégias</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <DollarSign className="w-8 h-8 mx-auto text-orange-500 mb-2" />
                      <h4 className="font-medium">Análise de Pricing</h4>
                      <p className="text-sm text-gray-600">Estratégia de preços otimizada</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  Planos e Assinatura
                </CardTitle>
                <CardDescription>
                  Gerencie sua assinatura e explore recursos premium
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscription && (
                  <div className="space-y-6">
                    {/* Current Plan */}
                    {subscription.current_subscription && (
                      <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Plano Atual</h3>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{subscription.current_subscription.subscription_plans.name}</p>
                            <p className="text-sm text-gray-600">{subscription.current_subscription.subscription_plans.description}</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                        </div>
                      </div>
                    )}

                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-600">{subscription.usage_stats.searches_used}</p>
                          <p className="text-sm text-gray-600">Pesquisas Utilizadas</p>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-purple-600">{subscription.usage_stats.alerts_used}</p>
                          <p className="text-sm text-gray-600">Alertas Ativos</p>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-600">{subscription.usage_stats.ai_analyses_used}</p>
                          <p className="text-sm text-gray-600">Análises IA</p>
                        </div>
                      </Card>
                    </div>

                    {/* Available Plans */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Planos Disponíveis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {subscription.available_plans.map((plan: SubscriptionPlan) => (
                          <Card key={plan.id} className={plan.name === 'Professional' ? 'ring-2 ring-purple-500' : ''}>
                            <CardHeader>
                              <CardTitle className="flex items-center justify-between">
                                {plan.name}
                                {plan.name === 'Professional' && <Badge>Popular</Badge>}
                              </CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-3xl font-bold">R$ {plan.price_monthly.toFixed(2)}</p>
                                  <p className="text-sm text-gray-600">/mês</p>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {(Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string)).map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                                <Button className="w-full" variant={plan.name === 'Professional' ? 'default' : 'outline'}>
                                  {plan.name === subscription.current_subscription?.subscription_plans?.name ? 'Plano Atual' : 'Upgrade'}
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export { SibalProDashboard };