import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, FileText, FileCheck, Loader2, Filter, Calendar, Download, Bell, Settings, Plus, Eye, Clock, DollarSign, Building, MapPin, User, TrendingUp, AlertCircle, CheckCircle, BarChart3, Brain, Workflow, Upload, Target, MessageSquare } from 'lucide-react';
import { LicitacaoTable } from './LicitacaoTable';
import { FilterPanel } from './FilterPanel';
import { AIChat } from './AIChat';
import { AIButton } from './AIButton';
import { AIAssistant } from './AIAssistant';
import { AdvancedDashboard } from './AdvancedDashboard';
import { WorkflowManager } from './WorkflowManager';
import { DocumentAnalyzer } from './DocumentAnalyzer';
import { NotificationCenter } from './NotificationCenter';
import { licitationApiIntegration } from '@/services/licitationApiIntegration';
import { advancedLicitationAnalyzer } from '@/services/advancedLicitationAnalyzer';
import { notificationSystem } from '@/services/notificationSystem';
import { workflowAutomation } from '@/services/workflowAutomation';
import { camelizeKeys } from '../utils/camelizeKeys';
import { useToast } from '@/hooks/use-toast';
import { SearchForm } from './SearchForm';

// Tipos de documento disponíveis
const tiposDocumento = [
  { value: 'edital', label: 'Editais', icon: FileText },
  { value: 'ata', label: 'Atas', icon: FileCheck },
  { value: 'contrato', label: 'Contratos', icon: FileText },
];

// Opções de status por tipo de documento
const statusOptions = {
  edital: [
    { value: 'recebendo_proposta', label: 'Recebendo Proposta' },
    { value: 'em_julgamento', label: 'Em Julgamento' },
    { value: 'encerrada', label: 'Encerrada' },
    { value: 'todos', label: 'Todos' },
  ],
  ata: [
    { value: 'vigente', label: 'Vigentes' },
    { value: 'nao_vigente', label: 'Não Vigentes' },
    { value: 'todos', label: 'Todos' },
  ],
  contrato: [
    { value: 'vigente', label: 'Vigentes' },
    { value: 'nao_vigente', label: 'Não Vigentes' },
    { value: 'todos', label: 'Todos' },
  ],
};

export function LicitacaoSystem() {
  const [tipoDoc, setTipoDoc] = useState('edital');
  const [status, setStatus] = useState(statusOptions.edital[0].value);
  const [keyword, setKeyword] = useState('');
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiDocumentContext, setAiDocumentContext] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLicitation, setSelectedLicitation] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    opportunities: 0,
    workflows: 0,
    notifications: 0
  });
  const abortController = useRef(new AbortController());
  
  const { toast } = useToast();

  // Carrega filtros e dados dos serviços quando muda o tipo de documento
  useEffect(() => {
    const loadFilters = async () => {
      try {
        await licitationApiIntegration.initialize();
        notificationSystem.initialize();
        workflowAutomation.initialize();
        
        const response = await fetch(`http://localhost:3002/api/pncp/search/filters?tipos_documento=${tipoDoc}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFilterOptions(camelizeKeys(data));
        
        const workflows = workflowAutomation.getWorkflows();
        const notifications = notificationSystem.getNotifications('default');
        const activeWorkflows = workflows.filter(w => w.status === 'active');
        const unreadNotifications = notifications.filter(n => !n.read);
        
        setStats(prev => ({
          ...prev,
          workflows: activeWorkflows.length,
          notifications: unreadNotifications.length
        }));
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os filtros. Verifique sua conexão.",
          variant: "destructive",
        });
      }
    };

    loadFilters();
    setStatus(statusOptions[tipoDoc][0].value);
    setFilters({});
    setPage(0);
  }, [tipoDoc]);

  const buildParams = useCallback(() => {
    const params = {
      tipos_documento: tipoDoc,
      status: status === 'todos' ? undefined : status,
      ordenacao: '-data',
      pagina: page + 1,
      tam_pagina: pageSize,
      q: keyword.trim() || undefined,
      ...filters
    };
    Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
    return params;
  }, [tipoDoc, status, keyword, filters, page, pageSize]);

  const fetchData = async () => {
    abortController.current.abort();
    abortController.current = new AbortController();
    const params = buildParams();
    const queryString = new URLSearchParams(params).toString();
    const url = `http://localhost:3002/api/pncp/search?${queryString}`;
    const response = await fetch(url, { signal: abortController.current.signal });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  };

  const { data: queryData, isLoading, isError, refetch } = useQuery({
    queryKey: ['pncpData', tipoDoc, status, keyword, filters, page, pageSize],
    queryFn: fetchData,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (queryData) {
      const resultados = queryData.items || [];
      const processedRows = resultados.map((item, index) => ({
        ...item,
        id: item.id || `${index}`,
        numeroProcesso: item.numero_controle_pncp || item.numeroProcesso,
        objeto: item.description || item.objeto,
        orgao: item.orgao_nome || item.orgao,
        dataPublicacao: item.data_publicacao_pncp ? new Date(item.data_publicacao_pncp).toLocaleDateString('pt-BR') : item.dataPublicacao,
        status: item.situacao_nome || item.status,
        valor: item.valor_global || item.valor || '-'
      }));
      const activeCount = processedRows.filter(item => item.status === 'open' || item.situacao_nome === 'Recebendo Proposta').length;
      const opportunitiesCount = processedRows.filter(item => parseFloat(item.valor) > 0 && parseFloat(item.valor) < 500000).length;
      setStats(prev => ({ ...prev, total: processedRows.length, active: activeCount, opportunities: opportunitiesCount }));
    }
  }, [queryData]);

  if (isError) {
    toast({ title: "Erro", description: "Falha na consulta. Tente novamente.", variant: "destructive" });
  }

  const handleSearch = () => {
    setPage(0);
    refetch();
  };

  // Carrega dados iniciais
  useEffect(() => {
    refetch();
  }, [tipoDoc, status, page, pageSize]);

  const openAIWithDocument = (document) => {
    setAiDocumentContext(document);
    setShowAIChat(true);
  };

  const openGeneralAI = () => {
    setAiDocumentContext(null);
    setShowAIChat(true);
  };

  const currentTypeIcon = tiposDocumento.find(t => t.value === tipoDoc)?.icon || FileText;
  const IconComponent = currentTypeIcon;

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Botão flutuante de IA */}
      <Button
        onClick={openGeneralAI}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-200"
        size="lg"
      >
        <Brain className="h-6 w-6 text-white" />
      </Button>
      
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Consulta de Documentos</CardTitle>
            <Button
              onClick={openGeneralAI}
              variant="outline"
              className="flex items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
            >
              <Brain className="h-4 w-4" />
              Assistente IA
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SearchForm
            tipoDoc={tipoDoc}
            setTipoDoc={setTipoDoc}
            status={status}
            setStatus={setStatus}
            keyword={keyword}
            setKeyword={setKeyword}
            filters={filters}
            setFilters={setFilters}
            filterOptions={filterOptions}
            loadingFilters={false}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            handleSearch={handleSearch}
            loading={isLoading}
            tiposDocumento={tiposDocumento}
            statusOptions={statusOptions}
          />
        </CardContent>
      </Card>
      <LicitacaoTable
        data={queryData?.items || []}
        tipoDoc={tipoDoc}
        loading={isLoading}
        page={page}
        pageSize={pageSize}
        rowCount={queryData?.total || 0}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        onAskAI={openAIWithDocument}
      />
      {/* Componente de IA */}
      {showAIChat && (
        <AIChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          documentContext={aiDocumentContext}
        />
      )}
    </div>
  );
}
