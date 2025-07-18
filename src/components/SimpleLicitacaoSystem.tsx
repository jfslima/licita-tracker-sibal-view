import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, FileText, FileCheck, Loader2, ExternalLink, Calendar, DollarSign, Building, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export function SimpleLicitacaoSystem() {
  const [tipoDoc, setTipoDoc] = useState('edital');
  const [status, setStatus] = useState(statusOptions.edital[0].value);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  
  const { toast } = useToast();

  // Atualiza status quando muda tipo de documento
  const handleTipoDocChange = (newTipo: string) => {
    setTipoDoc(newTipo);
    setStatus(statusOptions[newTipo as keyof typeof statusOptions][0].value);
    setResults([]);
    setTotalResults(0);
  };

  // Função de busca simplificada
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Digite uma palavra-chave para buscar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Construir parâmetros da consulta
      const params = new URLSearchParams({
        tipos_documento: tipoDoc,
        q: keyword.trim(),
        ordenacao: '-data',
        pagina: '1',
        tam_pagina: '20',
      });
      
      if (status !== 'todos') {
        params.append('status', status);
      }
      
      const url = `https://pncp.gov.br/api/search/?${params.toString()}`;
      console.log('🔍 Fazendo consulta:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📊 Dados recebidos:', data);
      
      // Processar resultados
      const items = data.items || data.conteudo || data.resultados || [];
      const processedResults = items.map((item: any, index: number) => ({
        ...item,
        id: item.id || item.uid || item.numero_controle_pncp || `result_${index}`,
        titulo: item.description || item.objeto || item.titulo || 'Sem título',
        orgao: item.orgao_nome || item.orgao || 'Não informado',
        dataPublicacao: item.data_publicacao_pncp ? 
          new Date(item.data_publicacao_pncp).toLocaleDateString('pt-BR') : 
          (item.dataPublicacao || 'Não informado'),
        statusFormatado: item.situacao_nome || item.status || 'Não informado',
        valor: item.valor_global || item.valor || 0,
        link: item.item_url || item.itemUrl || '#'
      }));
      
      setResults(processedResults);
      setTotalResults(data.total || data.count || processedResults.length);
      
      toast({
        title: "✅ Consulta realizada",
        description: `${processedResults.length} registros encontrados`,
      });
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      toast({
        title: "Erro na consulta",
        description: error instanceof Error ? error.message : "Erro desconhecido. Tente novamente.",
        variant: "destructive",
      });
      setResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  }, [tipoDoc, status, keyword, toast]);

  // Função para abrir documento
  const openDocument = (item: any) => {
    const baseUrl = 'https://pncp.gov.br';
    let url = item.link;
    
    if (url && url !== '#') {
      if (!url.startsWith('http')) {
        url = baseUrl + (url.startsWith('/') ? url : '/' + url);
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Link não disponível",
        description: "Este documento não possui link direto.",
        variant: "destructive",
      });
    }
  };

  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    if (!value || value === 0) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const currentTypeIcon = tiposDocumento.find(t => t.value === tipoDoc)?.icon || FileText;
  const IconComponent = currentTypeIcon;

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
              <Search className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sistema de Licitações SIBAL</h1>
              <p className="text-blue-100 text-lg">Portal Nacional de Contratações Públicas (PNCP)</p>
            </div>
          </div>
          {totalResults > 0 && (
            <div className="flex items-center gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-lg">{totalResults}</div>
                <div className="text-blue-100">Resultados</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-lg">{results.length}</div>
                <div className="text-blue-100">Exibidos</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formulário de Busca */}
      <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5 text-blue-600" />
            <span className="text-xl">Consulta de Documentos</span>
          </CardTitle>
          <CardDescription>
            Busque por editais, atas e contratos no Portal Nacional de Contratações Públicas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controles Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tipo-documento" className="text-sm font-medium text-gray-700">
                Tipo de Documento
              </Label>
              <Select value={tipoDoc} onValueChange={handleTipoDocChange}>
                <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposDocumento.map((tipo) => {
                    const Icon = tipo.icon;
                    return (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {tipo.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="keyword" className="text-sm font-medium text-gray-700">
                Palavra-chave *
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="keyword"
                  placeholder="Digite palavras-chave para buscar..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !loading && handleSearch()}
                  className="pl-10 h-11 border-2 border-gray-200 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="flex flex-wrap gap-4"
            >
              {statusOptions[tipoDoc as keyof typeof statusOptions].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} className="border-2" />
                  <Label htmlFor={option.value} className="cursor-pointer text-sm font-medium">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Botão de Busca */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleSearch} 
              disabled={loading || !keyword.trim()}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Consultar Documentos
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 && (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Resultados da Consulta</CardTitle>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1 text-sm font-medium">
                {totalResults} registros encontrados
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {results.map((item, index) => (
                <div key={item.id || index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {item.titulo}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-4 w-4" />
                          <span>{item.orgao}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{item.dataPublicacao}</span>
                        </div>
                        {item.valor > 0 && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>{formatCurrency(item.valor)}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary" 
                          className="bg-blue-100 text-blue-800"
                        >
                          {item.statusFormatado}
                        </Badge>
                        <Badge variant="outline">
                          {tiposDocumento.find(t => t.value === tipoDoc)?.label}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDocument(item)}
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Ver Documento
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!loading && results.length === 0 && keyword && (
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum resultado encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros ou usar palavras-chave diferentes.
            </p>
            <Button variant="outline" onClick={() => setKeyword('')}>
              Limpar busca
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}