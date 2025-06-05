
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, FileText, FileCheck, FileContract, Loader2 } from 'lucide-react';
import { LicitacaoTable } from './LicitacaoTable';
import { FilterPanel } from './FilterPanel';
import { useToast } from '@/hooks/use-toast';

// Tipos de documento disponíveis
const tiposDocumento = [
  { value: 'edital', label: 'Editais', icon: FileText },
  { value: 'ata', label: 'Atas', icon: FileCheck },
  { value: 'contrato', label: 'Contratos', icon: FileContract },
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

// Utility function para converter snake_case para camelCase
const toCamel = (str: string) => str.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
const camelizeKeys = (obj: any) =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [toCamel(k), v]));

export function LicitacaoSystem() {
  const [tipoDoc, setTipoDoc] = useState('edital');
  const [status, setStatus] = useState(statusOptions.edital[0].value);
  const [keyword, setKeyword] = useState('');
  const [filterOptions, setFilterOptions] = useState<any>({});
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [rowCount, setRowCount] = useState(0);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  
  const { toast } = useToast();

  // Carrega filtros quando muda o tipo de documento
  useEffect(() => {
    const loadFilters = async () => {
      setLoadingFilters(true);
      try {
        // Simulação da API do PNCP para filtros
        const mockFilters = {
          orgaos: [
            { codigo: '123', nome: 'Ministério da Educação' },
            { codigo: '456', nome: 'Ministério da Saúde' },
            { codigo: '789', nome: 'Prefeitura Municipal' },
          ],
          ufs: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'],
          municipios: [
            { id: '1', descricao: 'São Paulo' },
            { id: '2', descricao: 'Rio de Janeiro' },
            { id: '3', descricao: 'Brasília' },
            { id: '4', descricao: 'Salvador' },
          ],
          modalidadesContratacao: [
            { id: '1', descricao: 'Pregão Eletrônico' },
            { id: '2', descricao: 'Concorrência' },
            { id: '3', descricao: 'Tomada de Preços' },
            { id: '4', descricao: 'Convite' },
          ],
          esferas: [
            { id: '1', descricao: 'Federal' },
            { id: '2', descricao: 'Estadual' },
            { id: '3', descricao: 'Municipal' },
          ],
          poderes: [
            { id: '1', descricao: 'Executivo' },
            { id: '2', descricao: 'Legislativo' },
            { id: '3', descricao: 'Judiciário' },
          ],
        };
        
        setFilterOptions(mockFilters);
      } catch (error) {
        console.error('Erro ao carregar filtros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os filtros. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilters();
    // Reset quando muda tipo
    setStatus(statusOptions[tipoDoc as keyof typeof statusOptions][0].value);
    setFilters({});
    setRows([]);
    setPage(0);
  }, [tipoDoc, toast]);

  // Monta parâmetros da consulta
  const buildParams = useCallback(() => {
    const params: any = {
      tipos_documento: tipoDoc,
      status,
      ordenacao: '-data',
      pagina: page + 1,
      tam_pagina: pageSize,
    };
    
    if (keyword.trim()) {
      params.q = keyword.trim();
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params[key] = value;
      }
    });
    
    return params;
  }, [tipoDoc, status, keyword, filters, page, pageSize]);

  // Função de busca
  const fetchData = async () => {
    setLoading(true);
    try {
      // Simulação da API do PNCP
      const mockData = {
        total: 150,
        conteudo: Array.from({ length: pageSize }, (_, i) => {
          const id = page * pageSize + i + 1;
          return {
            id,
            numeroProcesso: `${id.toString().padStart(8, '0')}/2024`,
            objeto: `Objeto da licitação ${id} - ${keyword || 'Aquisição de materiais e serviços'}`,
            dataPublicacao: new Date().toLocaleDateString('pt-BR'),
            valor: (Math.random() * 1000000).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            status: status === 'todos' ? ['Vigente', 'Encerrada', 'Em andamento'][Math.floor(Math.random() * 3)] : status,
            orgao: filterOptions.orgaos?.[Math.floor(Math.random() * (filterOptions.orgaos?.length || 1))]?.nome || 'Órgão Público',
          };
        }),
      };
      
      setRows(mockData.conteudo);
      setRowCount(mockData.total);
      
      toast({
        title: "Consulta realizada",
        description: `${mockData.total} registros encontrados`,
      });
    } catch (error) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro na consulta",
        description: "Não foi possível realizar a consulta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    fetchData();
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  // Busca automática quando mudamos página
  useEffect(() => {
    if (rows.length > 0) {
      fetchData();
    }
  }, [page, pageSize]);

  const currentTypeIcon = tiposDocumento.find(t => t.value === tipoDoc)?.icon || FileText;
  const IconComponent = currentTypeIcon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Search className="h-6 w-6" />
            Sistema de Acompanhamento de Licitações
          </CardTitle>
          <CardDescription className="text-blue-100">
            Consulte editais, atas e contratos do Portal Nacional de Contratações Públicas (PNCP)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconComponent className="h-5 w-5" />
            Filtros de Consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de Documento */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo-documento">Tipo de Documento</Label>
              <Select value={tipoDoc} onValueChange={setTipoDoc}>
                <SelectTrigger>
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

            {/* Palavra-chave */}
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="keyword">Palavra-chave</Label>
              <Input
                id="keyword"
                placeholder="Digite palavras-chave para buscar..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <RadioGroup
              value={status}
              onValueChange={setStatus}
              className="flex flex-wrap gap-4"
            >
              {statusOptions[tipoDoc as keyof typeof statusOptions].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <Separator />

          {/* Filtros Avançados */}
          <FilterPanel
            filterOptions={filterOptions}
            filters={filters}
            onFiltersChange={setFilters}
            tipoDoc={tipoDoc}
            loading={loadingFilters}
          />

          {/* Botão de Busca */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Consultando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Consultar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {rows.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resultados da Consulta</CardTitle>
              <Badge variant="secondary">
                {rowCount} registros encontrados
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <LicitacaoTable
              data={rows}
              tipoDoc={tipoDoc}
              loading={loading}
              page={page}
              pageSize={pageSize}
              rowCount={rowCount}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
