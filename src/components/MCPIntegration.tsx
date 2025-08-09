/**
 * Componente de integração MCP para o sistema SIBAL
 * Demonstra o uso das ferramentas MCP no frontend
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { mcpService, Notice, RiskClassifierResponse } from '@/services/mcpService';

interface MCPIntegrationProps {
  className?: string;
}

const MCPIntegration: React.FC<MCPIntegrationProps> = ({ className }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [tools, setTools] = useState<Array<{ name: string; description: string }>>([]);
  
  // Estados para busca de editais
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchLimit, setSearchLimit] = useState<number>(10);
  const [notices, setNotices] = useState<Array<Notice & { risk?: RiskClassifierResponse }>>([]);
  
  // Estados para classificação de risco
  const [riskContent, setRiskContent] = useState<string>('');
  const [riskResult, setRiskResult] = useState<RiskClassifierResponse | null>(null);

  // Verificar conexão com MCP na inicialização
  useEffect(() => {
    checkMCPConnection();
  }, []);

  const checkMCPConnection = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const isHealthy = await mcpService.healthCheck();
      setIsConnected(isHealthy);
      
      if (isHealthy) {
        const availableTools = await mcpService.listTools();
        setTools(availableTools);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com MCP Server');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchNotices = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await mcpService.fetchNoticesWithRisk({
        query: searchQuery || undefined,
        limit: searchLimit,
        status: 'active'
      });
      setNotices(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar editais');
    } finally {
      setLoading(false);
    }
  };

  const handleClassifyRisk = async () => {
    if (!riskContent.trim()) {
      setError('Por favor, insira o conteúdo do edital para classificação');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await mcpService.classifyRisk({
        notice_content: riskContent,
        notice_id: `manual-${Date.now()}`
      });
      setRiskResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao classificar risco');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'high': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Status da Conexão MCP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status do MCP Server
            {isConnected ? (
              <Badge className="bg-green-100 text-green-800">Conectado</Badge>
            ) : (
              <Badge className="bg-red-100 text-red-800">Desconectado</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button 
              onClick={checkMCPConnection} 
              disabled={loading}
              variant="outline"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Verificar Conexão
            </Button>
            
            {tools.length > 0 && (
              <div className="text-sm text-gray-600">
                {tools.length} ferramenta(s) disponível(is)
              </div>
            )}
          </div>
          
          {tools.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Ferramentas Disponíveis:</h4>
              <div className="space-y-1">
                {tools.map((tool, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{tool.name}:</span> {tool.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Busca de Editais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Buscar Editais com Análise de Risco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="search-query">Termo de Busca</Label>
              <Input
                id="search-query"
                placeholder="Ex: tecnologia, software, desenvolvimento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="search-limit">Limite de Resultados</Label>
              <Input
                id="search-limit"
                type="number"
                min="1"
                max="50"
                value={searchLimit}
                onChange={(e) => setSearchLimit(parseInt(e.target.value) || 10)}
              />
            </div>
          </div>
          
          <Button 
            onClick={handleSearchNotices} 
            disabled={loading || !isConnected}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Buscar Editais
          </Button>
          
          {notices.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Resultados ({notices.length} editais):</h4>
              {notices.map((notice, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium">{notice.title}</h5>
                      {notice.risk && notice.risk.risk_level && (
                        <Badge className={`flex items-center gap-1 ${getRiskBadgeColor(notice.risk.risk_level)}`}>
                          {getRiskIcon(notice.risk.risk_level)}
                          Risco {notice.risk.risk_level.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notice.description}</p>
                    <div className="text-xs text-gray-500">
                      <span>ID: {notice.id}</span> | 
                      <span> Status: {notice.status}</span> | 
                      <span> Prazo: {notice.deadline}</span>
                    </div>
                    {notice.risk && (
                      <div className="mt-2 text-xs">
                        <div>Score: {notice.risk.risk_score}/100</div>
                        {notice.risk.risk_factors.length > 0 && (
                          <div>Fatores: {notice.risk.risk_factors.join(', ')}</div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Classificação de Risco Manual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Classificação de Risco Manual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="risk-content">Conteúdo do Edital</Label>
            <Textarea
              id="risk-content"
              placeholder="Cole aqui o texto do edital para análise de risco..."
              value={riskContent}
              onChange={(e) => setRiskContent(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleClassifyRisk} 
            disabled={loading || !isConnected || !riskContent.trim()}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Classificar Risco
          </Button>
          
          {riskResult && (
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`flex items-center gap-1 ${getRiskBadgeColor(riskResult.risk_level)}`}>
                    {getRiskIcon(riskResult.risk_level)}
                    Risco {riskResult.risk_level?.toUpperCase() || 'N/A'}
                  </Badge>
                  <span className="text-sm text-gray-600">Score: {riskResult.risk_score}/100</span>
                </div>
                
                {riskResult.risk_factors && riskResult.risk_factors.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-sm mb-1">Fatores de Risco:</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {riskResult.risk_factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {riskResult.recommendations && riskResult.recommendations.length > 0 && (
                  <div>
                    <h5 className="font-medium text-sm mb-1">Recomendações:</h5>
                    <ul className="text-sm text-gray-600 list-disc list-inside">
                      {riskResult.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Exibição de Erros */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="w-4 h-4" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MCPIntegration;