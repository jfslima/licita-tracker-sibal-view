
import React from 'react';
import { TrendingUp, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Branding */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">LicitaBR Pro</h3>
                <p className="text-sm text-gray-400">Inteligência em Licitações</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              A plataforma mais avançada para monitoramento e análise de licitações públicas no Brasil.
            </p>
            <div className="flex gap-4">
              <Facebook className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
              <Linkedin className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 hover:text-blue-400 cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Produtos */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Produtos</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Dashboard</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Monitoramento</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Alertas</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Relatórios</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API</a></li>
            </ul>
          </div>

          {/* Empresa */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Carreiras</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Imprensa</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Parceiros</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4" />
                <span>contato@licitabr.pro</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4" />
                <span>(11) 3000-0000</span>
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
              © 2024 LicitaBR Pro. Todos os direitos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Termos de Uso
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 text-sm transition-colors">
                Suporte
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
