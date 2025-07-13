import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SibalProDashboard } from '@/components/SibalProDashboard';
import { ConsultaDocumentos } from '@/pages/ConsultaDocumentos';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SibalProDashboard />} />
          <Route path="/consulta-documentos" element={<ConsultaDocumentos />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;