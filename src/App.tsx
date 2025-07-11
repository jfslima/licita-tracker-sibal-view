import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { LicitacaoMcpDashboard } from '@/components/LicitacaoMcpDashboard';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
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
            <LicitacaoMcpDashboard />
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
              <LicitacaoMcpDashboard />
            </div>
            <PricingSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        {renderContent()}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;