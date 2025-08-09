/**
 * Página de Integração MCP
 * Demonstra a integração completa do MCP Server com o sistema SIBAL
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Zap, Shield, Search, AlertTriangle, CheckCircle, Code, Webhook } from 'lucide-react';
import MCPDemoSimulation from '@/components/MCPDemoSimulation';

const MCPIntegration: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900 flex items-center justify-center gap-3">
          <Bot className="w-10 h-10 text-blue-600" />
          Integração MCP Server
          <Badge className="bg-blue-100 text-blue-800">SIBAL</Badge>
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Integração real do Model Context Protocol (MCP) Server com o sistema SIBAL via N8N
        </p>
      </div>

      {/* Status da Integração */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="w-5 h-5" />
            Status da Integração MCP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Webhook className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Webhook MCP</div>
                <div className="text-sm text-green-600">Configurado e Ativo</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Busca de Editais</div>
                <div className="text-sm text-green-600">Funcional</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-green-600" />
              <div>
                <div className="font-medium text-green-800">Análise de Risco</div>
                <div className="text-sm text-green-600">Operacional</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Funcionalidades MCP Integradas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-600" />
                fetch_notices
              </h3>
              <p className="text-sm text-gray-600">
                Busca inteligente de editais de licitação com filtros avançados e análise automática de relevância.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Parâmetros:</strong> query (opcional), limit (padrão: 10)
              </div>
              <div className="text-xs text-gray-500">
                <strong>Retorna:</strong> Lista de editais com metadados completos
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                risk_classifier
              </h3>
              <p className="text-sm text-gray-600">
                Classificação automática de risco de editais usando IA, com análise de fatores e recomendações.
              </p>
              <div className="text-xs text-gray-500">
                <strong>Parâmetros:</strong> content (texto do edital)
              </div>
              <div className="text-xs text-gray-500">
                <strong>Retorna:</strong> Nível de risco, score e recomendações
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arquitetura Técnica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Arquitetura da Integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Bot className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h4 className="font-medium">MCP Server</h4>
                <p className="text-sm text-gray-600">N8N Workflow</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Webhook className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium">Webhook API</h4>
                <p className="text-sm text-gray-600">HTTP/JSON</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h4 className="font-medium">Frontend React</h4>
                <p className="text-sm text-gray-600">Interface SIBAL</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Endpoint MCP:</strong> http://localhost:5678/webhook/mcp</p>
              <p><strong>Método:</strong> POST</p>
              <p><strong>Formato:</strong> JSON com tool e args</p>
              <p><strong>Autenticação:</strong> Configurável via N8N</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demonstração Interativa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Interface Interativa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MCPDemoSimulation />
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-800">Próximos Passos para Produção</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            <span className="text-sm">Configurar webhook de produção no N8N</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            <span className="text-sm">Implementar autenticação e segurança</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            <span className="text-sm">Conectar com fontes reais de dados de licitação</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            <span className="text-sm">Configurar monitoramento e logs</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
            <span className="text-sm">Implementar cache e otimizações de performance</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPIntegration;