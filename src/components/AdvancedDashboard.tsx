<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> 8dabf4e2f151a5e31cf2e38c9a3ebf3594a20831
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
<<<<<<< HEAD
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Bell,
  TrendingUp,
  FileText,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  BarChart3,
  Calendar,
  Filter,
  Search,
  Download,
  Settings,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import { LicitationData, SearchFilters, licitationApiIntegration } from '@/services/licitationApiIntegration';
import { LicitationAnalysis, advancedLicitationAnalyzer } from '@/services/advancedLicitationAnalyzer';
import { NotificationRule, Notification, notificationSystem } from '@/services/notificationSystem';
import { WorkflowInstance, WorkflowTemplate, workflowAutomation } from '@/services/workflowAutomation';

interface DashboardStats {
  totalLicitations: number;
  activeLicitations: number;
  wonLicitations: number;
  totalValue: number;
  averageScore: number;
  activeWorkflows: number;
  pendingNotifications: number;
  successRate: number;
}

interface OpportunityCard {
  licitation: LicitationData;
  analysis: LicitationAnalysis;
  priority: 'high' | 'medium' | 'low';
  daysUntilDeadline: number;
}

export const AdvancedDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalLicitations: 0,
    activeLicitations: 0,
    wonLicitations: 0,
    totalValue: 0,
    averageScore: 0,
    activeWorkflows: 0,
    pendingNotifications: 0,
    successRate: 0
  });
  
  const [opportunities, setOpportunities] = useState<OpportunityCard[]>([]);
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([]);
  const [activeWorkflows, setActiveWorkflows] = useState<WorkflowInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadDashboardData();
    // Removido intervalo automático para evitar loops infinitos
  }, [selectedTimeRange]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load basic stats
      await loadStats();
      
      // Load opportunities
      await loadOpportunities();
      
      // Load notifications
      loadNotifications();
      
      // Load workflows
      loadWorkflows();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    // Simulate API calls - in production, these would be real API calls
    const mockStats: DashboardStats = {
      totalLicitations: 1247,
      activeLicitations: 89,
      wonLicitations: 23,
      totalValue: 15750000,
      averageScore: 78.5,
      activeWorkflows: 12,
      pendingNotifications: 5,
      successRate: 18.4
    };
    
    setStats(mockStats);
  };

  const loadOpportunities = async () => {
    // Simulate loading high-priority opportunities
    const mockOpportunities: OpportunityCard[] = [
      {
        licitation: {
          id: 'lic_001',
          source: 'pncp',
          title: 'Aquisição de Equipamentos de TI para Secretaria de Educação',
          description: 'Pregão eletrônico para aquisição de computadores, notebooks e equipamentos de rede',
          modality: 'Pregão Eletrônico',
          status: 'open',
          entity: {
            name: 'Prefeitura Municipal de São Paulo',
            cnpj: '46.395.000/0001-39',
            city: 'São Paulo',
            state: 'SP'
          },
          value: {
            estimated: 2500000,
            currency: 'BRL'
          },
          dates: {
            publication: '2024-01-15',
            opening: '2024-02-01',
            deadline: '2024-01-30'
          },
          documents: [],
          categories: ['TI', 'Equipamentos'],
          keywords: ['computador', 'notebook', 'tecnologia'],
          metadata: {
            lastUpdated: new Date().toISOString(),
            confidence: 0.95,
            completeness: 0.9
          }
        },
        analysis: {
          viabilityScore: 87,
          competitionLevel: 'medium',
          estimatedCost: {
            min: 2200000,
            max: 2450000,
            recommended: 2350000
          },
          requirements: {
            technical: ['Certificação ISO 9001', 'Garantia mínima de 3 anos'],
            legal: ['Certidão de Regularidade Fiscal'],
            financial: ['Faturamento mínimo de R$ 5 milhões'],
            experience: ['Atestado de fornecimento similar']
          },
          timeline: [],
          risks: [],
          opportunities: [
            {
              type: 'legal',
              description: 'Benefícios para ME/EPP aplicáveis',
              impact: 'high'
            }
          ],
          recommendations: [],
          similarBids: []
        },
        priority: 'high',
        daysUntilDeadline: 5
      }
    ];
    
    setOpportunities(mockOpportunities);
  };

  const loadNotifications = () => {
    const notifications = notificationSystem.getNotifications(10);
    setRecentNotifications(notifications);
  };

  const loadWorkflows = () => {
    const workflows = workflowAutomation.getWorkflows({ status: ['active'] });
    setActiveWorkflows(workflows);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'on_hold': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard SIBAL</h1>
          <p className="text-muted-foreground">
            Visão geral das licitações e oportunidades
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Licitações</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalLicitations)}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}</div>
            <p className="text-xs text-muted-foreground">
              +5.2 pontos este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="opportunities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="opportunities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((opportunity, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge className={getPriorityColor(opportunity.priority)}>
                      {opportunity.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">
                      {opportunity.daysUntilDeadline} dias
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {opportunity.licitation.title}
                  </CardTitle>
                  <CardDescription>
                    {opportunity.licitation.entity.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Valor Estimado</span>
                    <span className="font-semibold">
                      {formatCurrency(opportunity.licitation.value.estimated)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Score de Viabilidade</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={opportunity.analysis.viabilityScore} className="w-16" />
                      <span className="text-sm font-medium">
                        {opportunity.analysis.viabilityScore}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Competição</span>
                    <Badge variant={opportunity.analysis.competitionLevel === 'low' ? 'default' : 'secondary'}>
                      {opportunity.analysis.competitionLevel}
                    </Badge>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar Workflow
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4">
            {activeWorkflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{workflow.licitation.title}</CardTitle>
                      <CardDescription>{workflow.templateName}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Progresso</span>
                    <span className="text-sm font-medium">{workflow.progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={workflow.progress} />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Etapas Concluídas:</span>
                      <span className="ml-2 font-medium">
                        {workflow.steps.filter(s => s.status === 'completed').length} / {workflow.steps.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Prazo:</span>
                      <span className="ml-2 font-medium">
                        {new Date(workflow.timeline.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4 mr-2" />
                      Ver Timeline
                    </Button>
                    <Button size="sm" variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Equipe
                    </Button>
                    <Button size="sm" variant="outline">
                      <Pause className="h-4 w-4 mr-2" />
                      Pausar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações Recentes</CardTitle>
              <CardDescription>
                Últimas notificações e alertas do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recentNotifications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma notificação recente</p>
                    </div>
                  ) : (
                    recentNotifications.map((notification) => (
                      <Alert key={notification.id}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>{notification.title}</AlertTitle>
                        <AlertDescription className="mt-2">
                          {notification.message}
                        </AlertDescription>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString('pt-BR')}
                        </div>
                      </Alert>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance por Modalidade</CardTitle>
                <CardDescription>
                  Taxa de sucesso por tipo de licitação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Pregão Eletrônico</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={22} className="w-20" />
                      <span className="text-sm font-medium">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Concorrência</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={15} className="w-20" />
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tomada de Preços</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={28} className="w-20" />
                      <span className="text-sm font-medium">28%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Tendências Mensais</CardTitle>
                <CardDescription>
                  Evolução das métricas principais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Licitações Analisadas</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">+12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taxa de Conversão</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">+2.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Valor Médio</span>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-500">+8%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;
=======
import { DocumentUpload } from '@/components/DocumentUpload';
import { PncpSearch } from '@/components/PncpSearch';
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
        <Tabs defaultValue="pncp" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="pncp" className="gap-2">
              <FileText className="h-4 w-4" />
              PNCP
            </TabsTrigger>
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

          <TabsContent value="pncp" className="space-y-4">
            <PncpSearch />
          </TabsContent>

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
>>>>>>> 8dabf4e2f151a5e31cf2e38c9a3ebf3594a20831
