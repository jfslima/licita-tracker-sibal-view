import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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