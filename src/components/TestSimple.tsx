import React from 'react';

export function TestSimple() {
  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Teste Simples</h2>
      <p className="text-gray-600">Se você está vendo esta mensagem, o React está funcionando corretamente.</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
        <p className="text-green-800">✅ Componente carregado com sucesso!</p>
      </div>
    </div>
  );
}