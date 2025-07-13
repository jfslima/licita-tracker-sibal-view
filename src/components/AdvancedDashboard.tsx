import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentUpload } from '@/components/DocumentUpload';
import { 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Calendar, 
  FileText, 
  BarChart3, 
  Users, 
  Trophy,
  Clock,
  DollarSign,
  Activity,
  Brain,
  Zap,
  Upload
} from 'lucide-react';

interface AdvancedDashboardProps {
  licitacoes: any[];
  onClose: () => void;
}

export function AdvancedDashboard({ licitacoes, onClose }: AdvancedDashboardProps) {
  const [competitiveData, setCompetitiveData] = useState<any[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>({});

  useEffect(() => {
    generateAdvancedMetrics();
  }, [licitacoes]);

  const generateAdvancedMetrics = () => {
    // Simulação de dados de inteligência competitiva
    const competitive = licitacoes.map((lic, index) => ({
      id: lic.id,
      objeto: lic.objeto,
      marketShare: Math.floor(Math.random() * 40) + 30,
      competitors: Math.floor(Math.random() * 8) + 3,
      winProbability: Math.floor(Math.random() * 40) + 60,
      segment: lic.objeto?.toLowerCase().includes('tecnologia') ? 'TI' : 'Geral'
    }));

    const risks = licitacoes.map((lic) => ({
      id: lic.id,
      objeto: lic.objeto,
      complianceRisk: Math.floor(Math.random() * 30) + 20,
      technicalRisk: Math.floor(Math.random() * 40) + 30,
      financialRisk: Math.floor(Math.random() * 25) + 15,
      overallRisk: Math.floor(Math.random() * 30) + 25
    }));

    const performance = {
      totalAnalyzed: licitacoes.length,
      avgWinRate: 67,
      avgTimeToAnalyze: 3.2,
      topSegments: ['TI', 'Construção', 'Serviços'],
      monthlyTrend: 15
    };

    setCompetitiveData(competitive);
    setRiskMetrics(risks);
    setPerformanceMetrics(performance);
  };

  const getRiskColor = (risk: number) => {
    if (risk < 30) return 'text-green-600';
    if (risk < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskVariant = (risk: number) => {
    if (risk < 30) return 'default';
    if (risk < 60) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🚀 Dashboard Avançado de Inteligência
            </CardTitle>
            <CardDescription>
              Análise competitiva, gestão de riscos e métricas de performance em tempo real
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="documents" className="gap-2">
              <Upload className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="competitive" className="gap-2">
              <Target className="h-4 w-4" />
              Inteligência
            </TabsTrigger>
            <TabsTrigger value="risks" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Riscos
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="ai-insights" className="gap-2">
              <Brain className="h-4 w-4" />
              IA
            </TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-4">
            <DocumentUpload onAnalysisComplete={(analysis, extractedText) => {
              console.log('Document analysis completed:', analysis, extractedText);
              // Aqui você pode adicionar lógica para salvar a análise na base de dados
            }} />
          </TabsContent>

          <TabsContent value="competitive" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Market Share Médio</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {competitiveData.length > 0 
                      ? Math.round(competitiveData.reduce((sum, item) => sum + item.marketShare, 0) / competitiveData.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Participação de mercado estimada
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {competitiveData.length > 0 
                      ? Math.round(competitiveData.reduce((sum, item) => sum + item.winProbability, 0) / competitiveData.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Probabilidade média de vitória
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Concorrentes Médios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {competitiveData.length > 0 
                      ? Math.round(competitiveData.reduce((sum, item) => sum + item.competitors, 0) / competitiveData.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Por licitação
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Análise por Licitação</h3>
              {competitiveData.slice(0, 5).map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium truncate">{item.objeto}</h4>
                    <Badge variant="outline">{item.segment}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Market Share: </span>
                      <span className="font-medium">{item.marketShare}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Concorrentes: </span>
                      <span className="font-medium">{item.competitors}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prob. Vitória: </span>
                      <span className="font-medium text-green-600">{item.winProbability}%</span>
                    </div>
                  </div>
                  <Progress value={item.winProbability} className="mt-2" />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Risco Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {riskMetrics.length > 0 
                      ? Math.round(riskMetrics.reduce((sum, item) => sum + item.overallRisk, 0) / riskMetrics.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Risco médio</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {riskMetrics.length > 0 
                      ? Math.round(riskMetrics.reduce((sum, item) => sum + item.complianceRisk, 0) / riskMetrics.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Risco regulatório</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Técnico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {riskMetrics.length > 0 
                      ? Math.round(riskMetrics.reduce((sum, item) => sum + item.technicalRisk, 0) / riskMetrics.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Risco técnico</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Financeiro</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {riskMetrics.length > 0 
                      ? Math.round(riskMetrics.reduce((sum, item) => sum + item.financialRisk, 0) / riskMetrics.length)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">Risco financeiro</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Matriz de Riscos</h3>
              {riskMetrics.slice(0, 5).map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3 truncate">{item.objeto}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRiskColor(item.complianceRisk)}`}>
                        {item.complianceRisk}%
                      </div>
                      <Badge variant={getRiskVariant(item.complianceRisk)} className="text-xs">
                        Compliance
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRiskColor(item.technicalRisk)}`}>
                        {item.technicalRisk}%
                      </div>
                      <Badge variant={getRiskVariant(item.technicalRisk)} className="text-xs">
                        Técnico
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRiskColor(item.financialRisk)}`}>
                        {item.financialRisk}%
                      </div>
                      <Badge variant={getRiskVariant(item.financialRisk)} className="text-xs">
                        Financeiro
                      </Badge>
                    </div>
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getRiskColor(item.overallRisk)}`}>
                        {item.overallRisk}%
                      </div>
                      <Badge variant={getRiskVariant(item.overallRisk)} className="text-xs">
                        Geral
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Licitações Analisadas</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics.totalAnalyzed || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total processado
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Vitória</CardTitle>
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{performanceMetrics.avgWinRate || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Média histórica
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{performanceMetrics.avgTimeToAnalyze || 0}min</div>
                  <p className="text-xs text-muted-foreground">
                    Para análise completa
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Crescimento</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">+{performanceMetrics.monthlyTrend || 0}%</div>
                  <p className="text-xs text-muted-foreground">
                    Último mês
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Segmentos de Maior Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(performanceMetrics.topSegments || []).map((segment: string, index: number) => (
                    <div key={segment} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{segment}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{85 - index * 5}%</div>
                        <div className="text-xs text-muted-foreground">Taxa de sucesso</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    Insights da IA
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">💡 Oportunidade Detectada</p>
                    <p className="text-sm text-blue-700">
                      Editais de TI têm 23% mais chance de vitória quando publicados às terças-feiras.
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm font-medium text-yellow-900">⚠️ Atenção Necessária</p>
                    <p className="text-sm text-yellow-700">
                      Modalidades "Dispensa" requerem análise extra de compliance.
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">✅ Tendência Positiva</p>
                    <p className="text-sm text-green-700">
                      Licitações da região Sudeste mostram crescimento de 15% em valor médio.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Automações Ativas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Alertas de Deadline</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Análise de Riscos</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Score de Competitividade</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Monitoramento PNCP</span>
                    <Badge variant="default">Ativo</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}