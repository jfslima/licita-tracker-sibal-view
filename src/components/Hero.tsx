
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Target, TrendingUp, Shield, Zap, BarChart3, Bell, FileText } from 'lucide-react';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            🚀 Nova versão disponível
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            A Plataforma de{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Licitações
            </span>
            <br />
            Mais Avançada do Brasil
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Monitore, analise e vença mais licitações com inteligência artificial. 
            Acesso completo ao PNCP com alertas em tempo real e análises preditivas.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8">
              Começar Gratuitamente
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="px-8">
              Assistir Demo
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Dados Seguros
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Tempo Real
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-500" />
              Analytics Avançado
            </div>
          </div>
        </div>

        {/* Cards de Recursos */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Monitoramento Inteligente</h3>
              <p className="text-gray-600">
                Acompanhe todas as licitações relevantes com filtros avançados e alertas personalizados.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Análise Preditiva</h3>
              <p className="text-gray-600">
                IA que analisa padrões e prevê as melhores oportunidades para sua empresa.
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <Bell className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Alertas Instantâneos</h3>
              <p className="text-gray-600">
                Seja o primeiro a saber sobre novas oportunidades com notificações em tempo real.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">50K+</div>
              <div className="text-gray-600">Licitações Monitoradas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">1.2K+</div>
              <div className="text-gray-600">Empresas Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">98%</div>
              <div className="text-gray-600">Taxa de Sucesso</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">R$ 2.5B</div>
              <div className="text-gray-600">Em Contratos</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
