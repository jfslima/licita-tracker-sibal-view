/**
 * Página de demonstração da integração MCP
 * Mostra todas as funcionalidades do MCP Server integradas ao SIBAL
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bot, Zap, Shield, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import MCPIntegration from '@/components/MCPIntegration';

const MCPDemo: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Bot className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">
            MCP Server Integration
          </h1>
          <Badge className="bg-blue-100 text-blue-800">SIBAL v2.0</Badge>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Demonstração da integração do Model Context Protocol (MCP) com o sistema SIBAL.
          Teste as ferramentas de busca de editais e classificação de risco em tempo real.
        </p>
      </div>

      {/* Funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Funcionalidades Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Busca Inteligente</h3>
                <p className="text-sm text-gray-600">
                  Busca editais de licitação com filtros avançados e análise automática de conteúdo.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Análise de Risco</h3>
                <p className="text-sm text-gray-600">
                  Classificação automática de risco baseada no conteúdo dos editais e histórico.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Integração Completa</h3>
                <p className="text-sm text-gray-600">
                  API RESTful via webhook para integração com sistemas externos e automações.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Arquitetura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Arquitetura da Integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold text-blue-600 mb-2">Frontend React</div>
                <div className="text-sm text-gray-600">Interface do usuário com TypeScript</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold text-green-600 mb-2">MCP Service</div>
                <div className="text-sm text-gray-600">Camada de abstração TypeScript</div>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-300"></div>
              </div>
            </div>
            
            <div className="text-center">
              <div className="inline-block p-4 border rounded-lg bg-purple-50">
                <div className="font-semibold text-purple-600 mb-2">N8N Webhook</div>
                <div className="text-sm text-gray-600">http://localhost:5678/webhook/mcp</div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
              <div className="p-4 border rounded-lg">
                <div className="font-semibold text-orange-600 mb-2">fetch_notices</div>
                <div className="text-sm text-gray-600">Busca e filtragem de editais</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-semibold text-red-600 mb-2">risk_classifier</div>
                <div className="text-sm text-gray-600">Análise e classificação de risco</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Componente de Integração */}
      <MCPIntegration />

      {/* Informações Técnicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informações Técnicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Tecnologias Utilizadas</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Model Context Protocol (MCP)</li>
                <li>• N8N Workflow Automation</li>
                <li>• React + TypeScript</li>
                <li>• Axios para requisições HTTP</li>
                <li>• Tailwind CSS + shadcn/ui</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Endpoints Disponíveis</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• <code>POST /webhook/mcp</code> - Endpoint principal</li>
                <li>• <code>initialize</code> - Inicialização do MCP</li>
                <li>• <code>tools/list</code> - Lista ferramentas</li>
                <li>• <code>tools/call</code> - Executa ferramentas</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Como Testar</h4>
            <ol className="text-sm space-y-1 text-gray-600">
              <li>1. Verifique se o N8N está rodando em localhost:5678</li>
              <li>2. Confirme que o workflow "MCP Server" está ativo</li>
              <li>3. Use a interface acima para testar as funcionalidades</li>
              <li>4. Monitore os logs do N8N para debug</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MCPDemo;