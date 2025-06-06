
import React from 'react';
import { TrendingUp, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  const handleNavigation = (section: string) => {
    window.location.hash = section;
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => handleNavigation('')}>
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">SIBAL</h3>
                <p className="text-sm text-gray-400">Sistema Brasileiro de Acompanhamento de Licitações</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              A plataforma mais avançada para monitoramento e análise de licitações públicas no Brasil.
            </p>
            <div className="flex gap-4">
              <Facebook 
                className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" 
                onClick={() => handleExternalLink('https://facebook.com/sibal')}
              />
              <Twitter 
                className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors"
                onClick={() => handleExternalLink('https://twitter.com/sibal')}
              />
              <Linkedin 
                className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors"
                onClick={() => handleExternalLink('https://linkedin.com/company/sibal')}
              />
              <Instagram 
                className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors"
                onClick={() => handleExternalLink('https://instagram.com/sibal')}
              />
            </div>
          </div>

          {/* Produtos */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Produtos</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#dashboard" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('dashboard'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a 
                  href="#licitacoes" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('licitacoes'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Monitoramento
                </a>
              </li>
              <li>
                <a 
                  href="#alertas" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('alertas'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Alertas
                </a>
              </li>
              <li>
                <a 
                  href="#relatorios" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('relatorios'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Relatórios
                </a>
              </li>
              <li>
                <a 
                  href="#api" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('api'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#sobre" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('sobre'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <a 
                  href="#carreiras" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('carreiras'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Carreiras
                </a>
              </li>
              <li>
                <a 
                  href="#imprensa" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('imprensa'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Imprensa
                </a>
              </li>
              <li>
                <a 
                  href="#parceiros" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('parceiros'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Parceiros
                </a>
              </li>
              <li>
                <a 
                  href="#blog" 
                  onClick={(e) => { e.preventDefault(); handleNavigation('blog'); }}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <a 
                  href="mailto:contato@sibal.com.br"
                  className="hover:text-blue-400 transition-colors"
                >
                  contato@sibal.com.br
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <a 
                  href="tel:+551130000000"
                  className="hover:text-blue-400 transition-colors"
                >
                  (11) 3000-0000
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4" />
                <span>São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SIBAL. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a 
                href="#termos" 
                onClick={(e) => { e.preventDefault(); handleNavigation('termos'); }}
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors cursor-pointer"
              >
                Termos de Uso
              </a>
              <a 
                href="#privacidade" 
                onClick={(e) => { e.preventDefault(); handleNavigation('privacidade'); }}
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors cursor-pointer"
              >
                Política de Privacidade
              </a>
              <a 
                href="#suporte" 
                onClick={(e) => { e.preventDefault(); handleNavigation('suporte'); }}
                className="text-gray-400 hover:text-blue-400 text-sm transition-colors cursor-pointer"
              >
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
