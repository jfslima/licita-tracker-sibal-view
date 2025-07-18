
import React from 'react';
import './App.css';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/toaster';
import { LicitacaoSystem } from './components/LicitacaoSystem';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <LicitacaoSystem />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
