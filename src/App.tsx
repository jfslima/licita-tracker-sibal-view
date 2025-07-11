import React from 'react';
import { LicitacaoMcpDashboard } from '@/components/LicitacaoMcpDashboard';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        <LicitacaoMcpDashboard />
      </main>
      <Toaster />
    </div>
  );
}

export default App;