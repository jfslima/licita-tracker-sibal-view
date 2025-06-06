
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { LicitacaoSystem } from '@/components/LicitacaoSystem';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import DetalhePNCP from '@/pages/DetalhePNCP';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  // Monitora mudanças na URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove o #
      if (hash) {
        setCurrentView(hash);
      } else {
        setCurrentView('home');
      }
    };

    // Define view inicial baseada na URL
    handleHashChange();

    // Escuta mudanças no hash
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Dashboard />
          </div>
        );
      case 'licitacoes':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LicitacaoSystem />
          </div>
        );
      case 'precos':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PricingSection />
          </div>
        );
      case 'alertas':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Alertas</h2>
              <p className="text-gray-600">Sistema de alertas em desenvolvimento</p>
            </div>
          </div>
        );
      case 'relatorios':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Relatórios</h2>
              <p className="text-gray-600">Sistema de relatórios em desenvolvimento</p>
            </div>
          </div>
        );
      default:
        return (
          <>
            <Hero />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <LicitacaoSystem />
            </div>
            <PricingSection />
          </>
        );
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Header />
        
        <main>
          <Routes>
            {/* Nova rota coringa para capturar qualquer caminho do PNCP */}
            <Route path="/pncp/doc/*" element={<DetalhePNCP />} />
            
            {/* Rotas do PNCP (mantidas como fallback) */}
            <Route path="/pncp/edital/:orgao/:ano/:seq" element={<DetalhePNCP />} />
            <Route path="/pncp/ata/:orgao/:ano/:seq" element={<DetalhePNCP />} />
            <Route path="/pncp/contrato/:orgao/:ano/:seq" element={<DetalhePNCP />} />
            <Route path="/pncp/contratacao/:orgao/:numeroControle" element={<DetalhePNCP />} />
            
            {/* Rota padrão */}
            <Route path="*" element={renderContent()} />
          </Routes>
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
