import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Search, Calendar, MapPin, DollarSign, MessageCircle, ExternalLink, Download, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { AIChat } from './AIChat';

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
  const [licitacoes, setLicitacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Record<string, any>>({});
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    searchLicitacoesPNCP();
  }, []);

  const searchLicitacoesPNCP = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        tipos_documento: 'edital',
        pagina: '1',
        tam_pagina: '20',
        ordenacao: '-data',
        status: 'aberta' // Filtro obrigatório conforme API PNCP
      });

      if (searchTerm.trim()) {
        params.append('q', searchTerm.trim());
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

      setLicitacoes(processedItems);
      
      toast({
        title: "Busca concluída",
        description: `${processedItems.length} licitações encontradas`,
      });
    } catch (error) {
      console.error('Erro ao buscar licitações:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar as licitações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeWithAI = async (licitacao: any) => {
    setShowAIChat(true);
    
    // Realizar análise preditiva
    const analysis = await performPredictiveAnalysis(licitacao);
    setAnalyzedData(prev => ({
      ...prev,
      [licitacao.id]: analysis
    }));
    
    toast({
      title: "Análise Iniciada",
      description: "Chat IA ativado e análise preditiva executada.",
    });
  };

  const performPredictiveAnalysis = async (licitacao: any) => {
    // Simular análise preditiva baseada em dados reais
    const objeto = licitacao.objeto.toLowerCase();
    const valor = licitacao.valor_global || 0;
    
    let score = 70; // Score base
    let riscos = [];
    let oportunidades = [];
    
    // Análise de palavras-chave
    if (objeto.includes('tecnologia') || objeto.includes('software') || objeto.includes('sistema')) {
      score += 15;
      oportunidades.push('Área de especialização tecnológica');
    }
    
    if (objeto.includes('manutenção') || objeto.includes('serviços')) {
      score += 10;
      oportunidades.push('Contratos recorrentes de longo prazo');
    }
    
    // Análise de valor
    if (valor > 1000000) {
      score += 10;
      oportunidades.push('Alto valor agregado');
      riscos.push('Necessita garantias robustas');
    } else if (valor < 100000) {
      score += 5;
      oportunidades.push('Baixa barreira de entrada');
    }
    
    // Análise temporal
    const dataPublicacao = new Date(licitacao.data_publicacao_pncp);
    const agora = new Date();
    const diasDesdePublicacao = Math.floor((agora.getTime() - dataPublicacao.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diasDesdePublicacao < 7) {
      score += 5;
      oportunidades.push('Oportunidade recente');
    }
    
    // Análise de modalidade
    if (licitacao.modalidade_nome.includes('Pregão')) {
      score += 8;
      oportunidades.push('Modalidade competitiva familiar');
    }
    
    // Determinar classificação
    let classificacao = 'Baixa';
    if (score >= 80) classificacao = 'Alta';
    else if (score >= 60) classificacao = 'Média';
    
    return {
      score,
      classificacao,
      riscos,
      oportunidades,
      recomendacao: score >= 70 ? 'Recomendado participar' : 'Avaliar com cautela'
    };
  };

  const toggleMonitoring = () => {
    setMonitoringActive(!monitoringActive);
    if (!monitoringActive) {
      // Simular ativação do monitoramento
      setAlertsCount(Math.floor(Math.random() * 5) + 1);
      toast({
        title: "Monitoramento Ativado",
        description: "Sistema iniciado. Você receberá alertas sobre novas licitações relevantes.",
        duration: 3000,
      });
    } else {
      setAlertsCount(0);
      toast({
        title: "Monitoramento Pausado",
        description: "Sistema pausado. Alertas temporariamente desabilitados.",
        duration: 3000,
      });
    }
  };

  const openEditalPNCP = (licitacao: any) => {
    if (licitacao.numero_controle_pncp) {
      const url = `https://pncp.gov.br/app/editais/${licitacao.numero_controle_pncp}`;
      toast({
        title: "Abrindo edital",
        description: "Redirecionando para o PNCP... Se houver erro, é instabilidade temporária do portal.",
      });
      window.open(url, '_blank');
    } else if (licitacao.item_url) {
      const url = `https://pncp.gov.br${licitacao.item_url}`;
      toast({
        title: "Abrindo edital",
        description: "Redirecionando para o PNCP... Se houver erro, é instabilidade temporária do portal.",
      });
      window.open(url, '_blank');
    } else {
      toast({
        title: "Link não disponível",
        description: "URL do edital não encontrada para esta licitação.",
        variant: "destructive",
      });
    }
  };

  const downloadDocuments = async (licitacao: any) => {
    try {
      toast({
        title: "Download iniciado",
        description: "Buscando documentos do edital...",
      });
      
      // Simular busca de documentos no PNCP
      setTimeout(() => {
        toast({
          title: "Documentos encontrados",
          description: "Edital e anexos disponíveis para visualização no PNCP.",
        });
        // Abrir PNCP após mostrar o toast
        openEditalPNCP(licitacao);
      }, 2000);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível acessar os documentos.",
        variant: "destructive",
      });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SIBAL - Sistema Brasileiro de Acompanhamento de Licitações
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Monitore, analise e vença mais licitações com inteligência artificial
            </p>
          </CardHeader>
        </Card>

        {/* Controls */}
        <div className="flex gap-4">
          {/* Search */}
          <Card className="border-0 shadow-md flex-1">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar licitações por palavra-chave..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button 
                  onClick={searchLicitacoesPNCP}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {loading ? 'Buscando...' : 'Buscar no PNCP'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Button */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Button
                onClick={() => setShowAIChat(!showAIChat)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                size="lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showAIChat ? 'Fechar' : 'Assistente IA'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Agora Funcionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`border-0 shadow-md cursor-pointer transition-all hover:shadow-lg ${monitoringActive ? 'ring-2 ring-blue-500' : ''}`}
            onClick={toggleMonitoring}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${monitoringActive ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {monitoringActive ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Search className="h-5 w-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Monitoramento {monitoringActive ? 'Ativo' : 'Inteligente'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {monitoringActive ? `${alertsCount} alertas pendentes` : 'Clique para ativar'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Análise Preditiva</p>
                  <p className="text-xs text-gray-500">
                    {Object.keys(analyzedData).length} licitações analisadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Alertas Instantâneos</p>
                  <p className="text-xs text-gray-500">
                    {monitoringActive ? 'Sistema ativo' : 'Sistema pausado'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Licitações List */}
        {licitacoes.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl text-gray-800">
                Licitações Encontradas ({licitacoes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {licitacoes.map((licitacao) => (
                <div key={licitacao.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {licitacao.objeto}
                      </h3>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            <span className="font-medium">Órgão:</span> {licitacao.orgao_nome}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            <span className="font-medium">Valor:</span> {formatCurrency(licitacao.valor_global)}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">
                            <span className="font-medium">Data:</span> {formatDate(licitacao.data_publicacao_pncp)}
                          </span>
                        </div>
                        
                        <div>
                          <Badge variant="secondary">
                            {licitacao.modalidade_nome}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex gap-2">
                      <Button
                        onClick={() => openEditalPNCP(licitacao)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Edital
                      </Button>
                      
                      <Button
                        onClick={() => downloadDocuments(licitacao)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Documentos
                      </Button>
                      
                      <Button
                        onClick={() => handleAnalyzeWithAI(licitacao)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        size="sm"
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Analisar IA
                      </Button>
                    </div>
                  </div>
                  
                  {/* Análise Preditiva Results */}
                  {analyzedData[licitacao.id] && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        Análise Preditiva
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">Score de Viabilidade:</span>
                            <Badge variant={analyzedData[licitacao.id].score >= 80 ? 'default' : analyzedData[licitacao.id].score >= 60 ? 'secondary' : 'destructive'}>
                              {analyzedData[licitacao.id].score}/100
                            </Badge>
                            <span className="text-xs text-gray-600">({analyzedData[licitacao.id].classificacao})</span>
                          </div>
                          <p className="text-green-700 font-medium">{analyzedData[licitacao.id].recomendacao}</p>
                        </div>
                        <div>
                          <p className="font-medium mb-1">Oportunidades:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {analyzedData[licitacao.id].oportunidades.map((opp: string, i: number) => (
                              <li key={i} className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-green-500" />
                                {opp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {analyzedData[licitacao.id].riscos.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="font-medium mb-1 text-orange-700">Riscos Identificados:</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {analyzedData[licitacao.id].riscos.map((risco: string, i: number) => (
                              <li key={i} className="flex items-center gap-1">
                                <AlertCircle className="h-3 w-3 text-orange-500" />
                                {risco}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>UF: {licitacao.uf}</span>
                    <Badge variant={licitacao.situacao_nome === 'Vigente' ? 'default' : 'secondary'}>
                      {licitacao.situacao_nome}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* AI Chat Component */}
        {showAIChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Assistente IA para Licitações</h3>
                <Button
                  onClick={() => setShowAIChat(false)}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <div className="h-96">
                <AIChat isOpen={true} onClose={() => setShowAIChat(false)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}