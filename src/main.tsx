
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';
import './index.css';
import { withLovable } from './lib/lovable';

const queryClient = new QueryClient();

console.log('🚀 Debug: main.tsx iniciando...');

try {
  const rootElement = document.getElementById("root");
  console.log('🔍 Debug: Elemento root encontrado:', rootElement);
  
  if (!rootElement) {
    throw new Error('Elemento root não encontrado!');
  }
  
  console.log('🔧 Debug: Criando root do React...');
  const root = createRoot(rootElement);
  
  console.log('🎨 Debug: Renderizando App...');
  root.render(
    withLovable(
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    )
  );
  
  console.log('✅ Debug: App renderizado com sucesso!');
  
  // Remove o fallback após renderização bem-sucedida
  setTimeout(() => {
    const fallback = rootElement.querySelector('div[style*="position: fixed"]');
    if (fallback) {
      console.log('🧹 Debug: Removendo fallback...');
      fallback.remove();
    }
  }, 1000);
  
} catch (error) {
  console.error('❌ Debug: Erro no main.tsx:', error);
  
  // Mostra erro na tela
  const rootElement = document.getElementById("root");
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #ff4444;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        font-family: Arial, sans-serif;
        padding: 40px;
        box-sizing: border-box;
      ">
        <h1>❌ Erro no SIBAL</h1>
        <p>Erro detectado: ${error.message}</p>
        <pre style="background: rgba(0,0,0,0.3); padding: 20px; border-radius: 5px; max-width: 80%; overflow: auto;">${error.stack || 'Stack trace não disponível'}</pre>
      </div>
    `;
  }
}
