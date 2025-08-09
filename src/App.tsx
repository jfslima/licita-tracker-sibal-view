import React, { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/toaster';
import { LicitacaoMcpDashboard } from './components/LicitacaoMcpDashboard';
import { Dashboard } from './components/Dashboard';
import { AlertasPage } from './components/AlertasPage';
import { RelatoriosPage } from './components/RelatoriosPage';
import { PrecosPage } from './components/PrecosPage';
import { McpDemo } from './components/McpDemo';
import MCPIntegration from './pages/MCPIntegration';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1); // Remove o #
      setCurrentPage(hash || 'home');
    };

    // Escutar mudanças no hash
    window.addEventListener('hashchange', handleHashChange);
    
    // Definir página inicial baseada no hash atual
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'licitacoes':
        return <LicitacaoMcpDashboard />;
      case 'alertas':
        return <AlertasPage />;
      case 'relatorios':
        return <RelatoriosPage />;
      case 'precos':
        return <PrecosPage />;
      case 'mcp-demo':
        return <McpDemo />;
      case 'mcp-integration':
        return <MCPIntegration />;
      default:
        return (
          <>
            <Hero />
            <LicitacaoMcpDashboard />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {renderCurrentPage()}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;