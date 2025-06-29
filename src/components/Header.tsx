
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Database } from 'lucide-react';
import { LovableChat } from '@/components/LovableChat';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleNavigation = (section: string) => {
    window.location.hash = section;
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <a href="#" onClick={() => handleNavigation('')} className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Sibal</span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#" onClick={() => handleNavigation('')} className="text-gray-700 hover:text-blue-600 font-medium">
                Início
              </a>
              <a href="#licitacoes" onClick={() => handleNavigation('licitacoes')} className="text-gray-700 hover:text-blue-600 font-medium">
                Licitações
              </a>
              <a href="#dashboard" onClick={() => handleNavigation('dashboard')} className="text-gray-700 hover:text-blue-600 font-medium">
                Dashboard
              </a>
              <a href="#precos" onClick={() => handleNavigation('precos')} className="text-gray-700 hover:text-blue-600 font-medium">
                Preços
              </a>
              <a href="#alertas" onClick={() => handleNavigation('alertas')} className="text-gray-700 hover:text-blue-600 font-medium">
                Alertas
              </a>
              <a href="#relatorios" onClick={() => handleNavigation('relatorios')} className="text-gray-700 hover:text-blue-600 font-medium">
                Relatórios
              </a>
              
              {/* Botão Busca Inteligente */}
              <Button
                onClick={() => setIsChatOpen(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white shadow-lg"
              >
                <Database className="h-4 w-4" />
                Busca Inteligente
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Button
                onClick={() => setIsChatOpen(true)}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-blue-700 hover:from-purple-700 hover:to-blue-800 text-white"
              >
                <Database className="h-4 w-4" />
              </Button>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-4">
                <a href="#" onClick={() => handleNavigation('')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Início
                </a>
                <a href="#licitacoes" onClick={() => handleNavigation('licitacoes')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Licitações
                </a>
                <a href="#dashboard" onClick={() => handleNavigation('dashboard')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </a>
                <a href="#precos" onClick={() => handleNavigation('precos')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Preços
                </a>
                <a href="#alertas" onClick={() => handleNavigation('alertas')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Alertas
                </a>
                <a href="#relatorios" onClick={() => handleNavigation('relatorios')} className="text-gray-700 hover:text-blue-600 font-medium">
                  Relatórios
                </a>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Chat Modal */}
      <LovableChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
}
