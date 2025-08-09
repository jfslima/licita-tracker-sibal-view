import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdvancedLicitacaoAnalysis } from './AdvancedLicitacaoAnalysis';
import { DocumentProcessor } from './DocumentProcessor';
import { ProposalInsights } from './ProposalInsights';
import { DeadlineMonitor } from './DeadlineMonitor';
import { MarketReports } from './MarketReports';
import { AdvancedLicitacaoSearch } from './AdvancedLicitacaoSearch';
import { useAdvancedMcp } from '@/hooks/useAdvancedMcp';
import { useSupabaseMcp } from '@/hooks/useSupabaseMcp';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  FileText, 
  Lightbulb, 
  Clock, 
  BarChart3, 
  Search, 
  Zap, 
  Target, 
  TrendingUp, 
  Shield,
  CheckCircle,
  AlertTriangle,
  Database,
  Activity,
  DollarSign
} from 'lucide-react';

interface AdvancedMcpDashboardProps {
  selectedLicitacao?: {
    id: string;
    titulo: string;
    orgao: string;
    valor: number;
    dataPublicacao: string;
  };
}

export function AdvancedMcpDashboard({ selectedLicitacao }: AdvancedMcpDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedLicitacaoIds, setSelectedLicitacaoIds] = useState<string[]>(
    selectedLicitacao ? [selectedLicitacao.id] : []
  );
  const { populateWithSampleData, loading, fetchRealLicitacoes } = useAdvancedMcp();
  const { loading: mcpLoading, error: mcpError } = useSupabaseMcp();
  
  // Estados para dados reais
  const [realStats, setRealStats] = useState({
    totalLicitacoes: 0,
    valorTotal: 0,
    licitacoesRecentes: 0,
    alertasPrazo: 0,
    loading: true
  });
  
  // Buscar estatísticas reais do Supabase
  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        setRealStats(prev => ({ ...prev, loading: true }));
        
        // Buscar dados do Supabase
        const { data: licitacoes, error } = await supabase
          .from('licitacoes')
          .select('*')
          .order('criado_em', { ascending: false });
        
        if (!error && licitacoes) {
          const now = new Date();
          const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          
          const totalLicitacoes = licitacoes.length;
          const valorTotal = licitacoes.reduce((sum, item) => sum + (item.valor || 0), 0);
          const licitacoesRecentes = licitacoes.filter(item => 
            new Date(item.criado_em) >= last30Days
          ).length;
          
          // Calcular alertas de prazo (licitações com prazo nos próximos 7 dias)
          const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          const alertasPrazo = licitacoes.filter(item => {
            if (!item.data_abertura_proposta) return false;
            const dataAbertura = new Date(item.data_abertura_proposta);
            return dataAbertura >= now && dataAbertura <= next7Days;
          }).length;
          
          setRealStats({
            totalLicitacoes,
            valorTotal,
            licitacoesRecentes,
            alertasPrazo,
            loading: false
          });
        } else {
          // Fallback para dados padrão se não houver dados no Supabase
          setRealStats({
            totalLicitacoes: 0,
            valorTotal: 0,
            licitacoesRecentes: 0,
            alertasPrazo: 0,
            loading: false
          });
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        setRealStats(prev => ({ ...prev, loading: false }));
      }
    };
    
    fetchRealStats();
   }, []);
   
   // Função para atualizar estatísticas manualmente
   const refreshStats = useCallback(async () => {
     try {
       setRealStats(prev => ({ ...prev, loading: true }));
       
       const { data: licitacoes, error } = await supabase
         .from('licitacoes')
         .select('*')
         .order('criado_em', { ascending: false });
       
       if (!error && licitacoes) {
         const now = new Date();
         const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
         
         const totalLicitacoes = licitacoes.length;
         const valorTotal = licitacoes.reduce((sum, item) => sum + (item.valor || 0), 0);
         const licitacoesRecentes = licitacoes.filter(item => 
           new Date(item.criado_em) >= last30Days
         ).length;
         
         const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
         const alertasPrazo = licitacoes.filter(item => {
           if (!item.data_abertura_proposta) return false;
           const dataAbertura = new Date(item.data_abertura_proposta);
           return dataAbertura >= now && dataAbertura <= next7Days;
         }).length;
         
         setRealStats({
           totalLicitacoes,
           valorTotal,
           licitacoesRecentes,
           alertasPrazo,
           loading: false
         });
       }
     } catch (error) {
       console.error('Erro ao atualizar estatísticas:', error);
       setRealStats(prev => ({ ...prev, loading: false }));
     }
   }, []);

  const features = [
    {
      id: 'search',
      title: 'Busca Avançada de Licitações',
      description: 'Sistema de busca inteligente com filtros avançados e múltiplos critérios',
      icon: Search,
      color: 'blue',
      status: 'active'
    },
    {
      id: 'analysis',
      title: 'Análise Avançada de Licitações',
      description: 'Análise completa com IA para avaliar viabilidade, competitividade e riscos',
      icon: Brain,
      color: 'green',
      status: 'active'
    },
    {
      id: 'documents',
      title: 'Processamento de Documentos',
      description: 'Extração inteligente de informações de editais, anexos e documentos',
      icon: FileText,
      color: 'yellow',
      status: 'active'
    },
    {
      id: 'insights',
      title: 'Insights para Propostas',
      description: 'Recomendações estratégicas personalizadas para suas propostas',
      icon: Lightbulb,
      color: 'purple',
      status: 'active'
    },
    {
      id: 'deadlines',
      title: 'Monitoramento de Prazos',
      description: 'Alertas inteligentes e acompanhamento de prazos críticos',
      icon: Clock,
      color: 'indigo',
      status: 'active'
    },
    {
      id: 'reports',
      title: 'Relatórios de Mercado',
      description: 'Inteligência de mercado com análises e tendências do setor',
      icon: BarChart3,
      color: 'pink',
      status: 'active'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
      pink: 'text-pink-600 bg-pink-50 border-pink-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-blue-600" />
                SIBAL MCP - Funcionalidades Avançadas
              </CardTitle>
              <p className="text-gray-600">
                Plataforma completa de inteligência artificial para análise e gestão de licitações
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={async () => {
                  try {
                    await fetchRealLicitacoes();
                    await refreshStats();
                  } catch (error) {
                    console.error('Erro ao buscar dados reais:', error);
                  }
                }}
                disabled={loading || realStats.loading}
                variant="default"
                size="sm"
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Database className="h-4 w-4" />
                {loading ? 'Buscando...' : 'Buscar Dados Reais (PNCP)'}
              </Button>
              <Button 
                onClick={refreshStats}
                disabled={realStats.loading}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                {realStats.loading ? 'Atualizando...' : 'Atualizar Estatísticas'}
              </Button>
              <Button 
                onClick={populateWithSampleData}
                disabled={loading}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                {loading ? 'Populando...' : 'Dados de Exemplo'}
              </Button>
            </div>
          </div>
          {selectedLicitacao && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Licitação Selecionada:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-800">
                <div><span className="font-medium">ID:</span> {selectedLicitacao.id}</div>
                <div><span className="font-medium">Órgão:</span> {selectedLicitacao.orgao}</div>
                <div><span className="font-medium">Valor:</span> R$ {(selectedLicitacao.valor || 0).toLocaleString('pt-BR')}</div>
                <div><span className="font-medium">Publicação:</span> {new Date(selectedLicitacao.dataPublicacao).toLocaleDateString('pt-BR')}</div>
              </div>
              <p className="text-sm text-blue-700 mt-2 font-medium">{selectedLicitacao.titulo}</p>
            </div>
          )}
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="search">Busca Avançada</TabsTrigger>
          <TabsTrigger value="analysis">Análise</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="deadlines">Prazos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cards de funcionalidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <Card key={feature.id} className={`border-2 ${getColorClasses(feature.color)}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IconComponent className="h-5 w-5" />
                        <span className="text-sm font-medium">{feature.title}</span>
                      </div>
                      {getStatusIcon(feature.status)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-gray-600 mb-4">{feature.description}</p>
                    <Button 
                      onClick={() => setActiveTab(feature.id)}
                      size="sm" 
                      className="w-full"
                      variant="outline"
                    >
                      Acessar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Estatísticas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Estatísticas do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {realStats.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      (realStats.totalLicitacoes || 0).toLocaleString('pt-BR')
                    )}
                  </div>
                  <div className="text-xs text-blue-800">Total de</div>
                  <div className="text-xs text-gray-600">Licitações</div>
                  {!realStats.loading && realStats.totalLicitacoes === 0 && (
                    <div className="text-xs text-gray-500 mt-1">Nenhum dado</div>
                  )}
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {realStats.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      `R$ ${(realStats.valorTotal / 1000000).toFixed(1)}M`
                    )}
                  </div>
                  <div className="text-xs text-green-800">Valor</div>
                  <div className="text-xs text-gray-600">Total</div>
                  {!realStats.loading && realStats.valorTotal === 0 && (
                    <div className="text-xs text-gray-500 mt-1">Sem dados</div>
                  )}
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {realStats.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      realStats.licitacoesRecentes
                    )}
                  </div>
                  <div className="text-xs text-orange-800">Últimos</div>
                  <div className="text-xs text-gray-600">30 dias</div>
                  {!realStats.loading && realStats.licitacoesRecentes === 0 && (
                    <div className="text-xs text-gray-500 mt-1">Nenhuma</div>
                  )}
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <div className={`text-2xl font-bold ${
                    realStats.alertasPrazo > 0 ? 'text-red-600' : 'text-gray-400'
                  }`}>
                    {realStats.loading ? (
                      <span className="animate-pulse">...</span>
                    ) : (
                      realStats.alertasPrazo
                    )}
                  </div>
                  <div className="text-xs text-red-800">Alertas</div>
                  <div className="text-xs text-gray-600">de Prazo</div>
                  {!realStats.loading && realStats.alertasPrazo === 0 && (
                    <div className="text-xs text-gray-500 mt-1">Nenhum</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status das funcionalidades */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-600" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Status das Conexões */}
                <div>
                  <h4 className="font-medium mb-2">Conexões</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Supabase Database</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">API PNCP</span>
                    </div>
                  </div>
                </div>
                
                {/* Status das Funcionalidades */}
                <div>
                  <h4 className="font-medium mb-2">Funcionalidades</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Busca Avançada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Análise IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Processamento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Insights</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Monitoramento</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Relatórios</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guia rápido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Guia Rápido de Uso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <h4 className="font-medium text-sm">Busca Avançada</h4>
                    <p className="text-xs text-gray-600">Use filtros inteligentes para encontrar licitações específicas do seu interesse.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <h4 className="font-medium text-sm">Análise de Licitações</h4>
                    <p className="text-xs text-gray-600">Analise licitações específicas para obter insights de viabilidade e competitividade.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <h4 className="font-medium text-sm">Processamento de Documentos</h4>
                    <p className="text-xs text-gray-600">Faça upload de editais e documentos para extração automática de informações importantes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <h4 className="font-medium text-sm">Geração de Insights</h4>
                    <p className="text-xs text-gray-600">Configure seu perfil empresarial para receber recomendações personalizadas para propostas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">5</div>
                  <div>
                    <h4 className="font-medium text-sm">Monitoramento de Prazos</h4>
                    <p className="text-xs text-gray-600">Configure alertas para não perder prazos importantes de licitações de seu interesse.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-600 text-white rounded-full flex items-center justify-center text-xs font-bold">6</div>
                  <div>
                    <h4 className="font-medium text-sm">Relatórios de Mercado</h4>
                    <p className="text-xs text-gray-600">Gere relatórios de inteligência de mercado para identificar tendências e oportunidades.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search">
          <AdvancedLicitacaoSearch 
            onLicitacaoSelect={(licitacao) => {
              setSelectedLicitacao({
                id: licitacao.id,
                titulo: licitacao.objeto,
                orgao: licitacao.orgao,
                valor: licitacao.valorEstimado || 0,
                dataPublicacao: licitacao.dataPublicacao
              });
              setActiveTab('analysis');
            }}
          />
        </TabsContent>

        <TabsContent value="analysis">
          {selectedLicitacao ? (
            <AdvancedLicitacaoAnalysis 
              licitacaoId={selectedLicitacao.id}
              licitacaoData={selectedLicitacao}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Selecione uma licitação</p>
                <p className="text-sm text-gray-400">Para realizar análise avançada com IA</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="documents">
          <DocumentProcessor 
            licitacaoId={selectedLicitacao?.id}
          />
        </TabsContent>

        <TabsContent value="insights">
          {selectedLicitacao ? (
            <ProposalInsights 
              licitacaoId={selectedLicitacao.id}
              editalData={selectedLicitacao}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Selecione uma licitação</p>
                <p className="text-sm text-gray-400">Para gerar insights personalizados para sua proposta</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="deadlines">
          <DeadlineMonitor 
            licitacaoIds={selectedLicitacaoIds}
          />
        </TabsContent>

        <TabsContent value="reports">
          <MarketReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}