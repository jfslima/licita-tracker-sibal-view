import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAdvancedMcp, MarketReportResult } from '@/hooks/useAdvancedMcp';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  FileText, 
  Download, 
  Calendar, 
  MapPin, 
  Building, 
  DollarSign, 
  Users, 
  Target, 
  Loader2,
  Filter,
  Eye,
  Share
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MarketReportsProps {
  defaultFilters?: {
    startDate?: string;
    endDate?: string;
    segments?: string[];
    regions?: string[];
  };
}

export function MarketReports({ defaultFilters }: MarketReportsProps) {
  const [startDate, setStartDate] = useState(defaultFilters?.startDate || '');
  const [endDate, setEndDate] = useState(defaultFilters?.endDate || '');
  const [selectedSegments, setSelectedSegments] = useState<string[]>(defaultFilters?.segments || []);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(defaultFilters?.regions || []);
  const [reportType, setReportType] = useState<'overview' | 'trends' | 'competition' | 'opportunities'>('overview');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [reportData, setReportData] = useState<MarketReportResult | null>(null);
  const [activeTab, setActiveTab] = useState('config');
  
  const { generateMarketReport, loading } = useAdvancedMcp();
  const { toast } = useToast();

  const availableSegments = [
    'Tecnologia da Informação',
    'Construção Civil',
    'Saúde',
    'Educação',
    'Transporte',
    'Segurança',
    'Meio Ambiente',
    'Consultoria',
    'Equipamentos',
    'Serviços Gerais'
  ];

  const availableRegions = [
    'Norte',
    'Nordeste',
    'Centro-Oeste',
    'Sudeste',
    'Sul',
    'Nacional'
  ];

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o período do relatório.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateMarketReport(
        {
          startDate,
          endDate,
          segments: selectedSegments,
          regions: selectedRegions
        },
        reportType,
        {
          includeCharts,
          includeDetails
        }
      );
      
      setReportData(result);
      setActiveTab('results');
      
      toast({
        title: "Relatório Gerado",
        description: "Relatório de inteligência de mercado disponível.",
      });
    } catch (error) {
      console.error('Erro na geração do relatório:', error);
    }
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const data = {
      filters: {
        startDate,
        endDate,
        segments: selectedSegments,
        regions: selectedRegions,
        reportType
      },
      report: reportData,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_mercado_${reportType}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleSegment = (segment: string) => {
    setSelectedSegments(prev => 
      prev.includes(segment) 
        ? prev.filter(s => s !== segment)
        : [...prev, segment]
    );
  };

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region)
        : [...prev, region]
    );
  };

  const getTrendIcon = (trend: string) => {
    switch (trend.toLowerCase()) {
      case 'crescimento':
      case 'alta':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'queda':
      case 'baixa':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            Relatórios de Inteligência de Mercado
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gere análises detalhadas do mercado de licitações com insights estratégicos
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
          <TabsTrigger value="results">Relatório</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração do Relatório</CardTitle>
              <p className="text-sm text-gray-600">
                Configure os filtros e parâmetros para gerar seu relatório personalizado
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Período */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Período de Análise</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Data Inicial</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">Data Final</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tipo de relatório */}
              <div className="space-y-2">
                <Label>Tipo de Relatório</Label>
                <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Visão Geral do Mercado</SelectItem>
                    <SelectItem value="trends">Análise de Tendências</SelectItem>
                    <SelectItem value="competition">Análise Competitiva</SelectItem>
                    <SelectItem value="opportunities">Oportunidades de Negócio</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Segmentos */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Segmentos de Mercado</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableSegments.map((segment) => (
                    <div key={segment} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedSegments.includes(segment)}
                        onCheckedChange={() => toggleSegment(segment)}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => toggleSegment(segment)}>
                        {segment}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Selecione os segmentos de interesse (deixe vazio para incluir todos)
                </p>
              </div>

              {/* Regiões */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Regiões</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {availableRegions.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <Label className="text-sm cursor-pointer" onClick={() => toggleRegion(region)}>
                        {region}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Opções do relatório */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Opções do Relatório</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked as boolean)}
                    />
                    <Label className="text-sm">Incluir gráficos e visualizações</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={includeDetails}
                      onCheckedChange={(checked) => setIncludeDetails(checked as boolean)}
                    />
                    <Label className="text-sm">Incluir análises detalhadas</Label>
                  </div>
                </div>
              </div>

              {/* Botão de geração */}
              <Button 
                onClick={handleGenerateReport}
                disabled={loading || !startDate || !endDate}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Relatório...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Pré-visualização da Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Período</Label>
                    <p className="text-sm text-gray-600">
                      {startDate && endDate 
                        ? `${new Date(startDate).toLocaleDateString('pt-BR')} até ${new Date(endDate).toLocaleDateString('pt-BR')}`
                        : 'Não definido'
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo de Relatório</Label>
                    <Badge variant="outline">{reportType}</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Segmentos Selecionados ({selectedSegments.length})</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedSegments.length > 0 ? (
                      selectedSegments.map((segment) => (
                        <Badge key={segment} variant="secondary" className="text-xs">
                          {segment}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Todos os segmentos</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Regiões Selecionadas ({selectedRegions.length})</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedRegions.length > 0 ? (
                      selectedRegions.map((region) => (
                        <Badge key={region} variant="secondary" className="text-xs">
                          {region}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">Todas as regiões</span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Opções</Label>
                  <div className="flex gap-4 text-sm">
                    <span className={includeCharts ? 'text-green-600' : 'text-gray-500'}>
                      {includeCharts ? '✓' : '✗'} Gráficos
                    </span>
                    <span className={includeDetails ? 'text-green-600' : 'text-gray-500'}>
                      {includeDetails ? '✓' : '✗'} Análises Detalhadas
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {reportData ? (
            <>
              {/* Cabeçalho do relatório */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-purple-600" />
                      Relatório de Inteligência de Mercado
                    </span>
                    <div className="flex gap-2">
                      <Button onClick={downloadReport} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share className="h-4 w-4 mr-2" />
                        Compartilhar
                      </Button>
                    </div>
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Tipo: {reportType}</span>
                    <span>Período: {startDate} até {endDate}</span>
                    <span>Gerado em: {new Date().toLocaleDateString('pt-BR')}</span>
                  </div>
                </CardHeader>
              </Card>

              {/* Estatísticas gerais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {reportData.statistics.totalLicitacoes}
                    </div>
                    <div className="text-sm text-gray-600">Total de Licitações</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(reportData.statistics.totalValue)}
                    </div>
                    <div className="text-sm text-gray-600">Valor Total</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {formatCurrency(reportData.statistics.averageValue)}
                    </div>
                    <div className="text-sm text-gray-600">Valor Médio</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {reportData.statistics.activeOrgaos}
                    </div>
                    <div className="text-sm text-gray-600">Órgãos Ativos</div>
                  </CardContent>
                </Card>
              </div>

              {/* Tendências */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Principais Tendências
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.trends.map((trend, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        {getTrendIcon(trend.direction)}
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{trend.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{trend.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="font-medium">Impacto: {trend.impact}</span>
                            <span>Período: {trend.period}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {trend.direction}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Oportunidades */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-yellow-600" />
                    Oportunidades Identificadas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.opportunities.map((opportunity, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{opportunity.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              opportunity.priority === 'Alta' ? 'border-red-500 text-red-700' :
                              opportunity.priority === 'Média' ? 'border-yellow-500 text-yellow-700' :
                              'border-green-500 text-green-700'
                            }`}
                          >
                            {opportunity.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-3">{opportunity.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="font-medium">Segmento:</span> {opportunity.segment}
                          </div>
                          <div>
                            <span className="font-medium">Valor Estimado:</span> {formatCurrency(opportunity.estimatedValue)}
                          </div>
                          <div>
                            <span className="font-medium">Prazo:</span> {opportunity.timeframe}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Análise competitiva */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Análise Competitiva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Principais Competidores</Label>
                        <div className="space-y-1">
                          {reportData.competitiveAnalysis.topCompetitors.map((competitor, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <span className="text-sm">{competitor.name}</span>
                              <div className="text-xs text-gray-600">
                                {competitor.marketShare}% • {competitor.wins} vitórias
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Segmentos Mais Competitivos</Label>
                        <div className="space-y-1">
                          {reportData.competitiveAnalysis.competitiveSegments.map((segment, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                              <span className="text-sm">{segment.name}</span>
                              <div className="text-xs text-gray-600">
                                {segment.competitionLevel} • {segment.avgParticipants} participantes
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Insights Estratégicos</Label>
                      <div className="space-y-1">
                        {reportData.competitiveAnalysis.insights.map((insight, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{insight}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendações */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-yellow-600" />
                    Recomendações Estratégicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {reportData.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                        <Target className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                          <p className="text-xs text-gray-600">{recommendation.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {recommendation.impact}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Nenhum relatório disponível</p>
                <p className="text-sm text-gray-400">Configure e gere um relatório primeiro</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}