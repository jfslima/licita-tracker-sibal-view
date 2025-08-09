import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAdvancedMcp, ProposalInsightsResult } from '@/hooks/useAdvancedMcp';
import { 
  Lightbulb, 
  Target, 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Download,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProposalInsightsProps {
  licitacaoId: string;
  editalData?: any;
}

export function ProposalInsights({ licitacaoId, editalData }: ProposalInsightsProps) {
  const [companyProfile, setCompanyProfile] = useState('');
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [analysisType, setAnalysisType] = useState<'completa' | 'estrategia' | 'precificacao' | 'cronograma'>('completa');
  const [insights, setInsights] = useState<ProposalInsightsResult | null>(null);
  const [activeTab, setActiveTab] = useState('config');
  
  const { generateProposalInsights, loading } = useAdvancedMcp();
  const { toast } = useToast();

  const handleGenerateInsights = async () => {
    if (!companyProfile.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o perfil da sua empresa.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await generateProposalInsights(
        licitacaoId,
        {
          companyProfile,
          budget: budget ? parseFloat(budget) : undefined,
          timeline,
          specialRequirements
        },
        analysisType
      );
      
      setInsights(result);
      setActiveTab('results');
      
      toast({
        title: "Insights Gerados",
        description: "Análise completa da proposta disponível.",
      });
    } catch (error) {
      console.error('Erro na geração de insights:', error);
    }
  };

  const downloadInsights = () => {
    if (!insights) return;
    
    const data = {
      licitacaoId,
      analysisType,
      companyProfile,
      insights,
      generatedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `insights_proposta_${licitacaoId}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'média': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Insights Inteligentes para Proposta
          </CardTitle>
          <p className="text-sm text-gray-600">
            Gere recomendações estratégicas personalizadas para sua proposta
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="preview">Pré-visualização</TabsTrigger>
          <TabsTrigger value="results">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuração da Análise</CardTitle>
              <p className="text-sm text-gray-600">
                Forneça informações sobre sua empresa para gerar insights personalizados
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Perfil da empresa */}
              <div className="space-y-2">
                <Label htmlFor="company-profile">Perfil da Empresa *</Label>
                <Textarea
                  id="company-profile"
                  placeholder="Descreva sua empresa: área de atuação, experiência, certificações, equipe, principais competências..."
                  value={companyProfile}
                  onChange={(e) => setCompanyProfile(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Quanto mais detalhado, melhores serão os insights gerados
                </p>
              </div>

              {/* Orçamento disponível */}
              <div className="space-y-2">
                <Label htmlFor="budget">Orçamento Disponível (R$)</Label>
                <Input
                  id="budget"
                  type="number"
                  placeholder="Ex: 150000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  Opcional: ajuda na estratégia de precificação
                </p>
              </div>

              {/* Cronograma */}
              <div className="space-y-2">
                <Label htmlFor="timeline">Cronograma Proposto</Label>
                <Input
                  id="timeline"
                  placeholder="Ex: 6 meses, 120 dias úteis"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                />
              </div>

              {/* Requisitos especiais */}
              <div className="space-y-2">
                <Label htmlFor="special-requirements">Requisitos Especiais</Label>
                <Textarea
                  id="special-requirements"
                  placeholder="Certificações específicas, experiência prévia, requisitos técnicos especiais..."
                  value={specialRequirements}
                  onChange={(e) => setSpecialRequirements(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Tipo de análise */}
              <div className="space-y-2">
                <Label>Tipo de Análise</Label>
                <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completa">Análise Completa</SelectItem>
                    <SelectItem value="estrategia">Foco em Estratégia</SelectItem>
                    <SelectItem value="precificacao">Foco em Precificação</SelectItem>
                    <SelectItem value="cronograma">Foco em Cronograma</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botão de geração */}
              <Button 
                onClick={handleGenerateInsights}
                disabled={loading || !companyProfile.trim()}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando Insights...
                  </>
                ) : (
                  <>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    Gerar Insights
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
                <FileText className="h-5 w-5" />
                Resumo da Configuração
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Licitação ID</Label>
                    <p className="text-sm text-gray-600">{licitacaoId}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo de Análise</Label>
                    <Badge variant="outline">{analysisType}</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Orçamento</Label>
                    <p className="text-sm text-gray-600">
                      {budget ? `R$ ${parseFloat(budget).toLocaleString('pt-BR')}` : 'Não informado'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Cronograma</Label>
                    <p className="text-sm text-gray-600">{timeline || 'Não informado'}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Perfil da Empresa</Label>
                  <div className="p-3 bg-gray-50 rounded text-sm">
                    {companyProfile || 'Não informado'}
                  </div>
                </div>
                
                {specialRequirements && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Requisitos Especiais</Label>
                    <div className="p-3 bg-gray-50 rounded text-sm">
                      {specialRequirements}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          {insights ? (
            <>
              {/* Score geral e resumo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-600" />
                      Análise Geral
                    </span>
                    <Button onClick={downloadInsights} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className={`text-center p-4 rounded-lg ${getScoreColor(insights.viabilityScore)}`}>
                      <div className="text-3xl font-bold">{insights.viabilityScore}%</div>
                      <div className="text-sm font-medium">Score de Viabilidade</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600">
                        R$ {(insights.suggestedPrice || 0).toLocaleString('pt-BR')}
                      </div>
                      <div className="text-sm font-medium text-blue-800">Preço Sugerido</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{insights.timeline}</div>
                      <div className="text-sm font-medium text-purple-800">Cronograma</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Resumo Executivo</Label>
                    <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Estratégia de preço */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Estratégia de Precificação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Preço Base</Label>
                        <p className="text-lg font-semibold text-green-600">
                          R$ {(insights.pricingStrategy?.basePrice || 0).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Margem Sugerida</Label>
                        <p className="text-lg font-semibold text-blue-600">
                          {insights.pricingStrategy.margin}%
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Justificativa</Label>
                      <p className="text-sm text-gray-700">{insights.pricingStrategy.justification}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Fatores de Risco no Preço</Label>
                      <div className="space-y-1">
                        {insights.pricingStrategy.riskFactors.map((factor, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            <span>{factor}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pontos fortes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-600" />
                    Pontos Fortes da Proposta
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Diferenciais competitivos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Diferenciais Competitivos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {insights.differentiators.map((diff, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                        <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{diff}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Cronograma detalhado */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Cronograma Detalhado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.detailedTimeline.map((phase, index) => (
                      <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{phase.phase}</h4>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {phase.duration}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{phase.description}</p>
                        {phase.deliverables && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Entregas:</p>
                            <ul className="text-xs text-gray-600 ml-4">
                              {phase.deliverables.map((deliverable, idx) => (
                                <li key={idx} className="list-disc">{deliverable}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Documentos necessários */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-600" />
                    Documentos Necessários
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {insights.requiredDocuments.map((doc, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{doc.name}</p>
                          <p className="text-xs text-gray-600">{doc.description}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(doc.priority)}`}
                        >
                          {doc.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Mitigação de riscos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Estratégias de Mitigação de Riscos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights.riskMitigation.map((risk, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm">{risk.risk}</h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getPriorityColor(risk.severity)}`}
                          >
                            {risk.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{risk.description}</p>
                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <span className="font-medium text-blue-800">Mitigação: </span>
                          <span className="text-blue-700">{risk.mitigation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Lightbulb className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p className="text-gray-500">Nenhum insight disponível</p>
                <p className="text-sm text-gray-400">Configure e gere os insights primeiro</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}