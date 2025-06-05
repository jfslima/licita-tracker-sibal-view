
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Dashboard } from '@/components/Dashboard';
import { LicitacaoSystem } from '@/components/LicitacaoSystem';
import { PricingSection } from '@/components/PricingSection';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'licitacoes':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LicitacaoSystem />
          </div>
        );
      case 'precos':
        return <PricingSection />;
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
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Navigation Handler */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <div className="bg-white rounded-full shadow-lg p-2 border">
          <button
            onClick={() => setCurrentView('home')}
            className={`p-2 rounded-full transition-colors ${
              currentView === 'home' ? 'bg-blue-600 text-white' : 'text-gray-600'
            }`}
          >
            Home
          </button>
        </div>
      </div>

      <main>
        {renderContent()}
      </main>
      
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
