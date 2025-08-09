import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useAdvancedMcp } from '../hooks/useAdvancedMcp';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  FileText, 
  Clock,
  Loader2,
  Download,
  Eye,
  Brain
} from 'lucide-react';

interface AdvancedSearchFilters {
  termo?: string;
  modalidade?: string[];
  situacao?: string[];
  valorMin?: number;
  valorMax?: number;
  dataInicio?: string;
  dataFim?: string;
  orgao?: string;
  uf?: string;
  municipio?: string;
  cnpjOrgao?: string;
  codigoUnidade?: string;
  ordenacao?: string;
  direcao?: 'asc' | 'desc';
  pagina?: number;
  limite?: number;
}

interface AdvancedLicitacaoSearchProps {
  onLicitacaoSelect?: (licitacao: any) => void;
}

export function AdvancedLicitacaoSearch({ onLicitacaoSelect }: AdvancedLicitacaoSearchProps) {
  const { searchLicitacoes, loading } = useAdvancedMcp();
  const [filters, setFilters] = useState<AdvancedSearchFilters>({
    limite: 20,
    pagina: 1,
    ordenacao: 'dataPublicacao',
    direcao: 'desc'
  });
  const [results, setResults] = useState<any[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const modalidades = [
    'Pregão Eletrônico',
    'Concorrência',
    'Tomada de Preços',
    'Convite',
    'Concurso',
    'Leilão',
    'Registro de Preços',
    'Credenciamento'
  ];

  const situacoes = [
    'Publicada',
    'Aberta',
    'Em Andamento',
    'Homologada',
    'Adjudicada',
    'Revogada',
    'Anulada',
    'Deserta',
    'Fracassada'
  ];

  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleSearch = async () => {
    try {
      const offset = ((filters.pagina || 1) - 1) * (filters.limite || 20);
      const response = await searchLicitacoes(filters, {
        limit: filters.limite || 20,
        offset: offset,
        sortBy: filters.ordenacao || 'dataPublicacao',
        sortOrder: filters.direcao || 'desc'
      });
      if (response.success) {
        setResults(response.data.licitacoes || []);
        setTotalResults(response.data.total || 0);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  const handleFilterChange = (key: keyof AdvancedSearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleModalidadeChange = (modalidade: string, checked: boolean) => {
    const currentModalidades = filters.modalidade || [];
    if (checked) {
      handleFilterChange('modalidade', [...currentModalidades, modalidade]);
    } else {
      handleFilterChange('modalidade', currentModalidades.filter(m => m !== modalidade));
    }
  };

  const handleSituacaoChange = (situacao: string, checked: boolean) => {
    const currentSituacoes = filters.situacao || [];
    if (checked) {
      handleFilterChange('situacao', [...currentSituacoes, situacao]);
    } else {
      handleFilterChange('situacao', currentSituacoes.filter(s => s !== situacao));
    }
  };

  const clearFilters = () => {
    setFilters({
      limite: 20,
      pagina: 1,
      ordenacao: 'dataPublicacao',
      direcao: 'desc'
    });
    setResults([]);
    setTotalResults(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Filtros de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Busca Avançada de Licitações
            </div>
            <Button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline"
              size="sm"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showAdvancedFilters ? 'Ocultar' : 'Mostrar'} Filtros
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca básica */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Digite palavras-chave para buscar..."
                value={filters.termo || ''}
                onChange={(e) => handleFilterChange('termo', e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Buscar
            </Button>
            <Button onClick={clearFilters} variant="outline">
              Limpar
            </Button>
          </div>

          {/* Filtros avançados */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Valor */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Faixa de Valor
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Valor mínimo"
                    value={filters.valorMin || ''}
                    onChange={(e) => handleFilterChange('valorMin', parseFloat(e.target.value) || undefined)}
                  />
                  <Input
                    type="number"
                    placeholder="Valor máximo"
                    value={filters.valorMax || ''}
                    onChange={(e) => handleFilterChange('valorMax', parseFloat(e.target.value) || undefined)}
                  />
                </div>
              </div>

              {/* Data */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período de Publicação
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={filters.dataInicio || ''}
                    onChange={(e) => handleFilterChange('dataInicio', e.target.value)}
                  />
                  <Input
                    type="date"
                    value={filters.dataFim || ''}
                    onChange={(e) => handleFilterChange('dataFim', e.target.value)}
                  />
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </Label>
                <Select value={filters.uf || ''} onValueChange={(value) => handleFilterChange('uf', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {ufs.map(uf => (
                      <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Município"
                  value={filters.municipio || ''}
                  onChange={(e) => handleFilterChange('municipio', e.target.value)}
                />
              </div>

              {/* Órgão */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Órgão
                </Label>
                <Input
                  placeholder="Nome do órgão"
                  value={filters.orgao || ''}
                  onChange={(e) => handleFilterChange('orgao', e.target.value)}
                />
                <Input
                  placeholder="CNPJ do órgão"
                  value={filters.cnpjOrgao || ''}
                  onChange={(e) => handleFilterChange('cnpjOrgao', e.target.value)}
                />
              </div>

              {/* Modalidades */}
              <div className="space-y-2">
                <Label>Modalidades</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {modalidades.map(modalidade => (
                    <div key={modalidade} className="flex items-center space-x-2">
                      <Checkbox
                        id={modalidade}
                        checked={filters.modalidade?.includes(modalidade) || false}
                        onCheckedChange={(checked) => handleModalidadeChange(modalidade, checked as boolean)}
                      />
                      <Label htmlFor={modalidade} className="text-xs">{modalidade}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Situações */}
              <div className="space-y-2">
                <Label>Situações</Label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {situacoes.map(situacao => (
                    <div key={situacao} className="flex items-center space-x-2">
                      <Checkbox
                        id={situacao}
                        checked={filters.situacao?.includes(situacao) || false}
                        onCheckedChange={(checked) => handleSituacaoChange(situacao, checked as boolean)}
                      />
                      <Label htmlFor={situacao} className="text-xs">{situacao}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resultados da Busca ({totalResults} encontrados)</span>
              <div className="flex items-center gap-2">
                <Select 
                  value={filters.ordenacao} 
                  onValueChange={(value) => handleFilterChange('ordenacao', value)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dataPublicacao">Data de Publicação</SelectItem>
                    <SelectItem value="valorEstimado">Valor Estimado</SelectItem>
                    <SelectItem value="objeto">Objeto</SelectItem>
                    <SelectItem value="orgao">Órgão</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => {
                    handleFilterChange('direcao', filters.direcao === 'asc' ? 'desc' : 'asc');
                    handleSearch();
                  }}
                  variant="outline"
                  size="sm"
                >
                  {filters.direcao === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((licitacao, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-2 line-clamp-2">
                          {licitacao.objeto || 'Objeto não informado'}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600">
                          <div>
                            <span className="font-medium">Órgão:</span>
                            <br />
                            {licitacao.orgao || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Valor:</span>
                            <br />
                            {licitacao.valorEstimado ? formatCurrency(licitacao.valorEstimado) : 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Modalidade:</span>
                            <br />
                            {licitacao.modalidade || 'N/A'}
                          </div>
                          <div>
                            <span className="font-medium">Situação:</span>
                            <br />
                            <Badge variant="outline" className="text-xs">
                              {licitacao.situacao || 'N/A'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        Publicado em: {licitacao.dataPublicacao ? formatDate(licitacao.dataPublicacao) : 'N/A'}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver Detalhes
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Documentos
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => onLicitacaoSelect?.(licitacao)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Brain className="h-3 w-3 mr-1" />
                          Analisar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Paginação */}
            {totalResults > (filters.limite || 20) && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  onClick={() => {
                    handleFilterChange('pagina', Math.max(1, (filters.pagina || 1) - 1));
                    handleSearch();
                  }}
                  disabled={filters.pagina === 1}
                  variant="outline"
                  size="sm"
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {filters.pagina || 1} de {Math.ceil(totalResults / (filters.limite || 20))}
                </span>
                <Button
                  onClick={() => {
                    handleFilterChange('pagina', (filters.pagina || 1) + 1);
                    handleSearch();
                  }}
                  disabled={(filters.pagina || 1) >= Math.ceil(totalResults / (filters.limite || 20))}
                  variant="outline"
                  size="sm"
                >
                  Próxima
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!loading && results.length === 0 && filters.termo && (
        <Card>
          <CardContent className="text-center py-8">
            <Search className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Nenhuma licitação encontrada</p>
            <p className="text-sm text-gray-400">Tente ajustar os filtros de busca</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}