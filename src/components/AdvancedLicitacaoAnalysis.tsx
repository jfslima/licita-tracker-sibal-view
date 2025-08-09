import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedMcp, LicitacaoAnalysis } from '@/hooks/useAdvancedMcp';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  FileText, 
  Scale, 
  BarChart3,
  Loader2
} from 'lucide-react';

interface AdvancedLicitacaoAnalysisProps {
  licitacaoId: string;
  licitacaoData?: {
    id: string;
    titulo: string;
    orgao: string;
    valor: number;
    dataPublicacao: string;
  };
  empresaPerfil?: {
    cnpj: string;
    porte: string;
    atividades: string[];
    certificacoes: string[];
    capacidade_financeira: number;
    equipe_tecnica: number;
  };
}

export function AdvancedLicitacaoAnalysis({ licitacaoId, licitacaoData, empresaPerfil }: AdvancedLicitacaoAnalysisProps) {
  const [analysis, setAnalysis] = useState<LicitacaoAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const { analyzeLicitacao, loading } = useAdvancedMcp();

  const handleAnalyze = async (tipoAnalise: 'completa' | 'viabilidade' | 'competitividade' | 'riscos' = 'completa') => {
    try {
      const result = await analyzeLicitacao(licitacaoId, empresaPerfil, tipoAnalise);
      setAnalysis(result);
    } catch (error) {
      console.error('Erro na análise:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header com informações da licitação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            Análise Avançada com IA
          </CardTitle>
          {licitacaoData ? (
            <>
              <p className="text-sm text-gray-600">
                {licitacaoData.titulo}
              </p>
              <div className="flex gap-2 text-xs text-gray-500">
                <span>Órgão: {licitacaoData.orgao}</span>
                <span>•</span>
                <span>Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(licitacaoData.valor)}</span>
                <span>•</span>
                <span>Data: {new Date(licitacaoData.dataPublicacao).toLocaleDateString('pt-BR')}</span>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-600">
              Licitação ID: {licitacaoId}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => handleAnalyze('completa')} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
              Análise Completa
            </Button>
            <Button 
              onClick={() => handleAnalyze('viabilidade')} 
              disabled={loading}
              variant="outline"
            >
              <Target className="h-4 w-4 mr-2" />
              Viabilidade
            </Button>
            <Button 
              onClick={() => handleAnalyze('competitividade')} 
              disabled={loading}
              variant="outline"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Competitividade
            </Button>
            <Button 
              onClick={() => handleAnalyze('riscos')} 
              disabled={loading}
              variant="outline"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Riscos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados da análise */}
      {analysis && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="risks">Riscos</TabsTrigger>
            <TabsTrigger value="opportunities">Oportunidades</TabsTrigger>
            <TabsTrigger value="technical">Técnico</TabsTrigger>
            <TabsTrigger value="legal">Jurídico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Score de Viabilidade */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${getScoreColor(analysis.viabilityScore)}`}>
                      {analysis.viabilityScore}%
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Score de Viabilidade</p>
                    <Progress value={analysis.viabilityScore} className="h-2" />
                    <Badge 
                      variant={getScoreBadgeVariant(analysis.viabilityScore)} 
                      className="mt-2"
                    >
                      {analysis.viabilityScore >= 80 ? 'Alta' : analysis.viabilityScore >= 60 ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Nível de Concorrência */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-lg font-semibold">{analysis.competitionLevel}</div>
                    <p className="text-sm text-gray-600">Nível de Concorrência</p>
                  </div>
                </CardContent>
              </Card>

              {/* Custo Estimado */}
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-green-600">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(analysis.estimatedCost)}
                    </div>
                    <p className="text-sm text-gray-600">Custo Estimado</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recomendações Principais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Recomendações Estratégicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Análise de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.risks.map((risk, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-red-800">{risk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Oportunidades Identificadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.opportunities.map((opportunity, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium text-green-800">{opportunity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Requisitos Técnicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.technicalRequirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-600" />
                  Aspectos Jurídicos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analysis.legalAspects.map((aspect, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <Scale className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{aspect}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}