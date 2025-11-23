import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Brain, Search, Calendar, MapPin, DollarSign, MessageCircle, ExternalLink, Download, TrendingUp, AlertCircle, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { AIChat } from './AIChat';
import { Link } from 'react-router-dom';
import { gerarUrlPncp } from '@/utils/pncpUtils';
import { useMcpAI } from '../hooks/useMcpAI';
import { useSupabaseMcp } from '../hooks/useSupabaseMcp';
import { PNCP_SEARCH } from '@/config/api';

interface LicitacaoPNCP {
  id: string;
  numero_controle_pncp: string;
  objeto: string;
  orgao_nome: string;
  valor_global?: number;
  situacao_nome: string;
  data_publicacao_pncp: string;
  data_atualizacao_pncp?: string;
  modalidade_nome: string;
  modalidade_licitacao_nome?: string;
  uf: string;
  item_url?: string;
}

interface AnalysisResult {
  score: number;
  classificacao: string;
  riscos: string[];
  oportunidades: string[];
  recomendacao: string;
}

export function LicitacaoMcpDashboard() {
  const [licitacoes, setLicitacoes] = useState<LicitacaoPNCP[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<Record<string, AnalysisResult>>({});
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedLicitacao, setSelectedLicitacao] = useState<LicitacaoPNCP | null>(null);
  const [showAdvancedMcp, setShowAdvancedMcp] = useState(false);
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [alertsCount, setAlertsCount] = useState(0);

  const { toast } = useToast();

  // Função otimizada para decodificar caracteres especiais da API do PNCP
  const decodeHtmlEntities = useCallback((text: string | null | undefined): string => {
    if (!text || typeof text !== 'string') return '';
    
    // Mapeamento de caracteres mal codificados
    const charMap: Record<string, string> = {
      'Ã£': 'ã', 'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó',
      'Ãº': 'ú', 'Ã§': 'ç', 'Ã ': 'à', 'Ã´': 'ô', 'Ãª': 'ê',
      'Ã¢': 'â', 'Ã¨': 'è', 'Ã¬': 'ì', 'Ã²': 'ò', 'Ã¹': 'ù'
    };
    
    let decoded = text;
    Object.entries(charMap).forEach(([wrong, correct]) => {
      decoded = decoded.replace(new RegExp(wrong, 'g'), correct);
    });
    
    // Fallback para HTML entities
    try {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = decoded;
      return textarea.value.trim();
    } catch {
      return decoded.trim();
    }
  }, []);

  // Função para formatar nome da modalidade
  const formatModalidade = useCallback((modalidade: string | null | undefined): string => {
    if (!modalidade) return 'Não informado';
    const decoded = decodeHtmlEntities(modalidade);
    // Capitalizar primeira letra de cada palavra e limpar espaços extras
    return decoded
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\s+/g, ' ')
      .trim();
  }, [decodeHtmlEntities]);

  const searchLicitacoesPNCP = useCallback(async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Termo de busca obrigatório",
        description: "Por favor, insira um termo para buscar licitações.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      
      // Parâmetros compatíveis com o proxy local
      const params = new URLSearchParams({
        tipos_documento: 'edital',
        pagina: '1',
        tam_pagina: '20',
        ordenacao: '-data',
        status: 'aberta'
      });

      if (searchTerm.trim()) {
        params.append('q', searchTerm.trim());
      }

      // Usar proxy local em vez da API direta do PNCP
      let response;
      try {
        response = await fetch(`http://localhost:3002/api/pncp/search?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });
      } catch (apiError) {
         console.error('Erro ao conectar com a API do PNCP:', apiError);
         throw new Error('Não foi possível conectar com a API oficial do PNCP. Verifique sua conexão com a internet.');
       }

      if (!response.ok) {
        throw new Error(`Erro na API PNCP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      const items = data.data || data.dados || data.items || [];
      
      console.log('Dados recebidos da API:', data);
      console.log('Items encontrados:', items.length);
      
      if (!Array.isArray(items) || items.length === 0) {
        toast({
          title: "Nenhuma licitação encontrada",
          description: `Não foram encontradas licitações para o termo "${searchTerm}" na base oficial do PNCP.`,
        });
        setLicitacoes([]);
        return;
      }
      
      // Processar dados reais da API do PNCP conforme estrutura oficial
      const processedItems = items.map((item: any, index: number) => {
        // Validar dados obrigatórios da API PNCP
        if (!item.numeroControlePNCP && !item.numero_controle_pncp && !item.id) {
          console.warn('Item sem identificador válido:', item);
          return null;
        }
        
        return {
          id: item.numeroControlePNCP || item.numero_controle_pncp || item.id || `pncp-${Date.now()}-${index}`,
          numero_controle_pncp: item.numeroControlePNCP || item.numero_controle_pncp || item.id || 'Não informado',
          objeto: decodeHtmlEntities(item.objeto || item.titulo || item.description || 'Objeto não informado'),
          orgao_nome: decodeHtmlEntities(item.orgaoEntidade?.razaoSocial || item.orgao_nome || item.orgao_entidade?.nome || item.entidade || 'Órgão não informado'),
          valor_global: parseFloat(item.valorTotalEstimado || item.valor_estimado || item.valor_global || item.valor || '0') || null,
          situacao_nome: decodeHtmlEntities(item.situacaoCompraNome || item.status || item.situacao_nome || item.situacao || 'Status não informado'),
          data_publicacao_pncp: item.dataPublicacaoPncp || item.data_fim_proposta || item.data_publicacao_pncp || item.data_publicacao || item.created_at || new Date().toISOString(),
          modalidade_nome: decodeHtmlEntities(item.modalidadeNome || item.modalidade_nome || item.modalidade?.nome || item.modalidade_licitacao_nome || 'Modalidade não informada'),
          modalidade_licitacao_nome: decodeHtmlEntities(item.modalidadeNome || item.modalidade_nome || item.modalidade_licitacao_nome || item.modalidade?.nome || 'Modalidade não informada'),
          data_atualizacao_pncp: item.dataAtualizacao || item.data_atualizacao_pncp || item.updated_at,
          uf: item.unidadeOrgao?.ufSigla || item.uf || item.unidade_federativa || item.estado || 'UF não informada',
          item_url: item.linkProcessoEletronico || item.url_documento || item.url || item.link || item.item_url
        };
      }).filter(Boolean); // Remove itens nulos

      setLicitacoes(processedItems);
      
      toast({
        title: "Busca concluída",
        description: `${processedItems.length} licitações encontradas para "${searchTerm}".`,
      });
    } catch (error) {
      console.error('Erro ao buscar licitações:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      toast({
        title: "Erro na busca",
        description: `Não foi possível buscar as licitações: ${errorMessage}`,
        variant: "destructive",
      });
      setLicitacoes([]);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, toast, decodeHtmlEntities]);

  // Busca será acionada apenas pelo botão de busca

  const performPredictiveAnalysis = useCallback(async (licitacao: any) => {
    try {
      // Simular análise preditiva baseada em dados reais
      const objeto = (licitacao.objeto || '').toLowerCase();
      const valor = licitacao.valor_global || 0;
      
      let score = 70; // Score base
      let riscos: string[] = [];
      let oportunidades: string[] = [];
      
      // Análise de palavras-chave
      if (objeto.includes('tecnologia') || objeto.includes('software') || objeto.includes('sistema')) {
        score += 15;
        oportunidades.push('Área de especialização tecnológica');
      }
      
      if (objeto.includes('manutenção') || objeto.includes('serviços')) {
        score += 10;
        oportunidades.push('Contratos recorrentes de longo prazo');
      }
      
      if (objeto.includes('consultoria') || objeto.includes('assessoria')) {
        score += 8;
        oportunidades.push('Serviços especializados de alto valor');
      }
      
      // Análise de valor
      if (valor > 1000000) {
        score += 10;
        oportunidades.push('Alto valor agregado');
        riscos.push('Necessita garantias robustas');
      } else if (valor < 100000) {
        score += 5;
        oportunidades.push('Baixa barreira de entrada');
      } else if (valor === 0) {
        riscos.push('Valor não informado - verificar edital');
        score -= 5;
      }
      
      // Análise temporal
      try {
        const dataPublicacao = new Date(licitacao.data_publicacao_pncp);
        const agora = new Date();
        const diasDesdePublicacao = Math.floor((agora.getTime() - dataPublicacao.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diasDesdePublicacao < 7) {
          score += 5;
          oportunidades.push('Oportunidade recente');
        } else if (diasDesdePublicacao > 60) {
          riscos.push('Licitação antiga - verificar validade');
          score -= 10;
        }
      } catch {
        riscos.push('Data de publicação inválida');
        score -= 5;
      }
      
      // Análise de modalidade
      const modalidade = formatModalidade(licitacao.modalidade_nome || licitacao.modalidade_licitacao_nome);
      if (modalidade.includes('Pregão')) {
        score += 8;
        oportunidades.push('Modalidade competitiva familiar');
      } else if (modalidade.includes('Concorrência')) {
        score += 5;
        oportunidades.push('Modalidade para contratos de maior valor');
      }
      
      // Análise da situação
      const situacao = (licitacao.situacao_nome || '').toLowerCase();
      if (situacao.includes('aberta') || situacao.includes('publicada')) {
        score += 10;
        oportunidades.push('Licitação ativa para participação');
      } else if (situacao.includes('encerrada') || situacao.includes('cancelada')) {
        score -= 30;
        riscos.push('Licitação não está mais disponível');
      }
      
      // Garantir que o score esteja entre 0 e 100
      score = Math.max(0, Math.min(100, score));
      
      // Determinar classificação
      let classificacao = 'Baixa';
      if (score >= 80) classificacao = 'Alta';
      else if (score >= 60) classificacao = 'Média';
      
      const recomendacao = score >= 70 
        ? 'Recomendado participar' 
        : score >= 50
        ? 'Avaliar com cautela'
        : 'Não recomendado participar';
      
      return {
        score,
        classificacao,
        riscos,
        oportunidades,
        recomendacao
      };
    } catch (error) {
      console.error('Erro na análise preditiva:', error);
      return {
        score: 0,
        classificacao: 'Erro',
        riscos: ['Erro ao processar análise'],
        oportunidades: [],
        recomendacao: 'Erro na análise'
      };
    }
  }, [formatModalidade]);

  const handleAnalyzeWithAI = useCallback(async (licitacao: LicitacaoPNCP) => {
    if (!licitacao) {
      toast({
        title: "Erro na análise",
        description: "Dados da licitação não disponíveis.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Realizar análise preditiva primeiro
      const analysis = await performPredictiveAnalysis(licitacao);
      
      if (analysis && typeof analysis.score === 'number') {
        setAnalyzedData(prev => ({
          ...prev,
          [licitacao.id]: analysis
        }));
        
        // Abrir chat e enviar análise automática para IA
        setShowAIChat(true);
        
        // Preparar contexto avançado da licitação para IA
        const contexto = `🏛️ LICITAÇÃO PARA ANÁLISE PROFUNDA SIBAL Pro

📋 INFORMAÇÕES BÁSICAS:
• Objeto: ${licitacao.objeto}
• Órgão: ${licitacao.orgao_nome}
• UF: ${licitacao.uf}
• Modalidade: ${formatModalidade(licitacao.modalidade_licitacao_nome)}
• Situação: ${licitacao.situacao_nome}
• Número de Controle PNCP: ${licitacao.numero_controle_pncp}

💰 DADOS FINANCEIROS:
• Valor Global: ${licitacao.valor_global ? `R$ ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(licitacao.valor_global)}` : 'Não informado'}

📅 CRONOGRAMA:
• Data de Publicação: ${new Date(licitacao.data_publicacao_pncp).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
• Data de Atualização: ${new Date(licitacao.data_atualizacao_pncp).toLocaleDateString('pt-BR')}

🎯 ANÁLISE PREDITIVA SIBAL:
• Score de Competitividade: ${analysis.score}% (${analysis.score >= 80 ? 'ALTO POTENCIAL' : analysis.score >= 60 ? 'MODERADO' : 'BAIXO POTENCIAL'})
• Categoria de Risco: ${analysis.riscos.length > 2 ? 'ALTO RISCO' : analysis.riscos.length > 0 ? 'RISCO MODERADO' : 'BAIXO RISCO'}

⚠️ PRINCIPAIS RISCOS IDENTIFICADOS:
${analysis.riscos.map((risco, i) => `${i + 1}. ${risco}`).join('\n')}

🎯 OPORTUNIDADES DETECTADAS:
${analysis.oportunidades.map((oport, i) => `${i + 1}. ${oport}`).join('\n')}

🎯 SOLICITAÇÃO:
Realize uma ANÁLISE PROFUNDA E ESTRATÉGICA desta licitação, incluindo:

1. 📊 Análise de viabilidade e competitividade
2. ⚖️ Aspectos jurídicos e normativos relevantes
3. 💡 Estratégias de participação otimizadas
4. 🎯 Recomendações específicas para maximizar chances de sucesso
5. ⚠️ Pontos críticos de atenção e compliance
6. 📈 Análise de mercado e concorrência
7. 🛡️ Gestão de riscos e contingências

Forneça insights avançados e recomendações práticas para decisão estratégica.`;

        // Contexto preparado para análise IA
        
        toast({
          title: "Análise Iniciada",
          description: `Chat IA ativado. Score: ${analysis.score}/100 - ${analysis.classificacao}`,
        });
      } else {
        throw new Error('Resultado de análise inválido');
      }
    } catch (error) {
      console.error('Erro na análise:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      toast({
        title: "Erro na análise",
        description: `Não foi possível realizar a análise: ${errorMessage}`,
        variant: "destructive",
      });
    }
  }, [formatModalidade, toast, performPredictiveAnalysis]);

  const toggleMonitoring = useCallback(() => {
    const newMonitoringState = !monitoringActive;
    setMonitoringActive(newMonitoringState);
    
    if (newMonitoringState) {
      // Simular ativação do monitoramento
      setAlertsCount(Math.floor(Math.random() * 5) + 1);
      toast({
        title: "Monitoramento Ativado",
        description: "Sistema iniciado. Você receberá alertas sobre novas licitações relevantes.",
        duration: 3000,
        variant: "default",
      });
      
      // Configurar monitoramento com termo de busca se disponível
      if (searchTerm.trim()) {
        setTimeout(() => {
          toast({
            title: "Monitoramento configurado",
            description: `Monitorando licitações com termo: "${searchTerm}"`
          });
        }, 1000);
      }
    } else {
      setAlertsCount(0);
      toast({
        title: "Monitoramento Pausado",
        description: "Sistema pausado. Alertas temporariamente desabilitados.",
        duration: 3000,
        variant: "destructive",
      });
    }
  }, [monitoringActive, searchTerm, toast]);



  const openEditalPNCP = useCallback((licitacao: any) => {
    if (!licitacao.numero_controle_pncp || licitacao.numero_controle_pncp === 'Não informado') {
      toast({
        title: "Erro ao abrir edital",
        description: "Número de controle PNCP não disponível.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { url, isOptimized, searchUrl } = gerarUrlPncp(licitacao.numero_controle_pncp);
      
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast({
        title: isOptimized ? "Edital aberto" : "Edital aberto (formato legado)",
        description: isOptimized 
          ? "O edital foi aberto em uma nova aba com URL otimizada."
          : "Usando formato original. Se houver erro, é limitação do portal PNCP.",
      });
      
    } catch (error) {
      console.error('Erro ao abrir edital:', error);
      
      // Fallback para busca no PNCP
      const { searchUrl } = gerarUrlPncp(licitacao.numero_controle_pncp);
      if (searchUrl) {
        window.open(searchUrl, '_blank', 'noopener,noreferrer');
        
        toast({
          title: "Redirecionado para busca",
          description: "Abrindo página de busca do PNCP como alternativa.",
        });
      } else if (licitacao.item_url) {
        // Último fallback: item_url se disponível
        try {
          const fallbackUrl = `https://pncp.gov.br${licitacao.item_url}`;
          window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          toast({
            title: "Edital aberto (URL alternativa)",
            description: "Usando URL alternativa do PNCP.",
          });
        } catch (fallbackError) {
          console.error('Erro no fallback:', fallbackError);
          toast({
            title: "Erro ao abrir edital",
            description: "Não foi possível abrir o edital. Tente copiar o número de controle e buscar manualmente no PNCP.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Erro ao abrir edital",
          description: "Não foi possível abrir o edital. Tente copiar o número de controle e buscar manualmente no PNCP.",
          variant: "destructive",
        });
      }
    }
  }, [toast]);

  const downloadDocuments = useCallback(async (licitacao: any) => {
    if (!licitacao.numero_controle_pncp || licitacao.numero_controle_pncp === 'Não informado') {
      toast({
        title: "Erro no download",
        description: "Número de controle PNCP não disponível.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      toast({
        title: "Download iniciado",
        description: "Redirecionando para a página de documentos...",
      });
      
      const { url } = gerarUrlPncp(licitacao.numero_controle_pncp, true); // true para incluir /documentos
      
      window.open(url, '_blank', 'noopener,noreferrer');
      
      // Feedback adicional após um delay
      setTimeout(() => {
        toast({
          title: "Documentos acessados",
          description: "Página de documentos aberta. Verifique a nova aba.",
        });
      }, 1000);
    } catch (error) {
      console.error('Erro ao acessar documentos:', error);
      toast({
        title: "Erro no download",
        description: "Não foi possível acessar os documentos. Tente novamente.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const formatCurrency = useCallback((value: number | string | null | undefined): string => {
    if (!value || value === 0) return 'Não informado';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue) || numValue === 0) return 'Não informado';
    try {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(numValue);
    } catch {
      return `R$ ${numValue.toFixed(2).replace('.', ',')}`;
    }
  }, []);

  const formatDate = useCallback((dateString: string | null | undefined): string => {
    if (!dateString) return 'Não informado';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return 'Data inválida';
    }
  }, []);

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

          {/* Consulta de Documentos Button */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Button asChild className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700" size="lg">
                <Link to="/consulta-documentos">
                  <FileText className="h-4 w-4 mr-2" />
                  Consulta de Documentos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* MCP Avançado Button */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <Button
                onClick={() => setShowAdvancedMcp(true)}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                size="lg"
              >
                <Brain className="h-4 w-4 mr-2" />
                MCP Avançado
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards - Otimizados com useMemo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`border-0 shadow-md cursor-pointer transition-all hover:shadow-lg ${monitoringActive ? 'ring-2 ring-blue-500' : ''}`}
            onClick={toggleMonitoring}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${monitoringActive ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {monitoringActive ? <CheckCircle className="h-5 w-5 text-green-600 animate-pulse" /> : <Search className="h-5 w-5 text-blue-600" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Monitoramento {monitoringActive ? 'Ativo' : 'Inteligente'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {monitoringActive ? `${alertsCount} alertas pendentes` : 'Clique para ativar'}
                  </p>
                  {loading && (
                    <div className="flex items-center mt-1">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin text-blue-500" />
                      <span className="text-xs text-blue-500">Processando...</span>
                    </div>
                  )}
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
                  <div className="mt-1">
                    <span className="text-lg font-bold text-purple-600">
                      {Object.values(analyzedData).filter(a => a.score >= 70).length}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">alta qualidade</span>
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center mt-1">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin text-purple-500" />
                      <span className="text-xs text-purple-500">Analisando...</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Calendar className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Resultados da Busca</p>
                  <p className="text-xs text-gray-500">
                    {licitacoes.length > 0 ? `${licitacoes.length} licitações encontradas` : 'Nenhuma licitação'}
                  </p>
                  <div className="mt-1">
                    <span className="text-lg font-bold text-green-600">
                      {licitacoes.filter(l => l.situacao_nome?.toLowerCase().includes('aberta') || l.situacao_nome?.toLowerCase().includes('publicada')).length}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">abertas</span>
                  </div>
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
                            <span className="font-medium">Órgão:</span> {decodeHtmlEntities(licitacao.orgao_nome) || 'Órgão não informado'}
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
                            {formatModalidade(licitacao.modalidade_licitacao_nome || licitacao.modalidade_nome)}
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
                        disabled={!licitacao.numero_controle_pncp || licitacao.numero_controle_pncp === 'Não informado'}
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Edital
                      </Button>
                      
                      <Button
                        onClick={() => downloadDocuments(licitacao)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={!licitacao.numero_controle_pncp || licitacao.numero_controle_pncp === 'Não informado'}
                      >
                        <Download className="h-4 w-4" />
                        Documentos
                      </Button>
                      
                      <Button
                        onClick={() => handleAnalyzeWithAI(licitacao)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white"
                        size="sm"
                        disabled={!licitacao.objeto}
                      >
                        <Brain className="h-4 w-4 mr-1" />
                        Analisar IA
                      </Button>
                      
                      <Button
                        onClick={() => {
                          setSelectedLicitacao(licitacao);
                          setShowAdvancedMcp(true);
                        }}
                        size="sm"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        MCP Avançado
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
                    <Badge 
                      variant={
                        licitacao.situacao_nome?.toLowerCase().includes('aberta') || 
                        licitacao.situacao_nome?.toLowerCase().includes('publicada') ? 'default' : 
                        licitacao.situacao_nome?.toLowerCase().includes('encerrada') || 
                        licitacao.situacao_nome?.toLowerCase().includes('cancelada') ? 'destructive' : 
                        'secondary'
                      }
                      className={`text-xs ${
                        licitacao.situacao_nome?.toLowerCase().includes('aberta') || 
                        licitacao.situacao_nome?.toLowerCase().includes('publicada') 
                          ? 'bg-green-100 text-green-800 hover:bg-green-200' : 
                        licitacao.situacao_nome?.toLowerCase().includes('encerrada') || 
                        licitacao.situacao_nome?.toLowerCase().includes('cancelada') 
                          ? 'bg-red-100 text-red-800 hover:bg-red-200' : 
                          'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                        {decodeHtmlEntities(licitacao.situacao_nome) || 'Status não informado'}
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
              <div className="h-[600px]">
                <AIChat 
                  onClose={() => setShowAIChat(false)}
                  className="h-full border-0 shadow-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* MCP Avançado */}
        {showAdvancedMcp && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Brain className="h-5 w-5 text-orange-600" />
                  SIBAL MCP - Funcionalidades Avançadas
                </h3>
                <Button
                  onClick={() => {
                    setShowAdvancedMcp(false);
                    setSelectedLicitacao(null);
                  }}
                  variant="ghost"
                  size="sm"
                >
                  ✕
                </Button>
              </div>
              <div className="flex-1 overflow-auto p-4">
                {selectedLicitacao && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{selectedLicitacao.objeto}</h3>
                    <p className="text-sm text-muted-foreground">Órgão: {selectedLicitacao.orgao_nome}</p>
                    <p className="text-sm">Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedLicitacao.valor_global || 0)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
