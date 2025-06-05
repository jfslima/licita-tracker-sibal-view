
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, User, Menu, TrendingUp, FileText, Award } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Branding */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  SIBAL
                </h1>
                <p className="text-xs text-gray-500">Sistema Brasileiro de Acompanhamento de Licitações</p>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
              BETA
            </Badge>
          </div>

          {/* Navegação Central */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#dashboard" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Dashboard
            </a>
            <a href="#licitacoes" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Licitações
            </a>
            <a href="#alertas" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Alertas
            </a>
            <a href="#relatorios" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Relatórios
            </a>
            <a href="#precos" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Preços
            </a>
          </nav>

          {/* Ações do Usuário */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              <Button variant="ghost" size="sm">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <User className="h-4 w-4 mr-2" />
                Conta
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Upgrade Pro
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
