
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Crown } from 'lucide-react';

export function PricingSection() {
  const plans = [
    {
      name: 'Starter',
      price: 'R$ 297',
      period: '/mês',
      description: 'Perfeito para pequenas empresas',
      icon: Zap,
      popular: false,
      features: [
        'Até 100 licitações monitoradas',
        'Alertas por email',
        'Filtros básicos',
        'Suporte por email',
        'Dashboard básico',
        'Exportação em PDF'
      ]
    },
    {
      name: 'Professional',
      price: 'R$ 597',
      period: '/mês',
      description: 'Ideal para empresas em crescimento',
      icon: Star,
      popular: true,
      features: [
        'Licitações ilimitadas',
        'Alertas em tempo real',
        'Filtros avançados',
        'Análise preditiva',
        'Suporte prioritário',
        'API de integração',
        'Relatórios personalizados',
        'Dashboard avançado'
      ]
    },
    {
      name: 'Enterprise',
      price: 'R$ 1.297',
      period: '/mês',
      description: 'Para grandes organizações',
      icon: Crown,
      popular: false,
      features: [
        'Tudo do Professional',
        'IA personalizada',
        'Gerente de conta dedicado',
        'Treinamento especializado',
        'Integrações customizadas',
        'SLA garantido',
        'Consultoria estratégica',
        'White-label disponível'
      ]
    }
  ];

  return (
    <div className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-blue-100 text-blue-800 border-blue-200">
            💎 Planos e Preços
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Escolha o Plano Ideal
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Para Sua Empresa
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Planos flexíveis que crescem com seu negócio. Comece grátis e evolua conforme necessário.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={index} 
                className={`relative hover:shadow-xl transition-all duration-300 ${
                  plan.popular 
                    ? 'border-2 border-blue-500 scale-105' 
                    : 'border hover:border-blue-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      plan.popular ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600">{plan.description}</p>
                  <div className="flex items-end justify-center gap-1 mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 mb-1">{plan.period}</span>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <Button 
                    className={`w-full mb-6 ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                        : ''
                    }`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.popular ? 'Começar Agora' : 'Escolher Plano'}
                  </Button>
                  
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Todos os planos incluem teste gratuito de 14 dias • Sem compromisso • Cancele a qualquer momento
          </p>
          <Button variant="outline" size="lg">
            Comparar Todos os Recursos
          </Button>
        </div>
      </div>
    </div>
  );
}
