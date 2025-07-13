import { useState, useEffect } from 'react';
import { Search, Filter, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { usePncp } from '@/hooks/usePncp';
import { PncpSearch } from '@/components/PncpSearch';

interface PncpFilters {
  status: string[];
  modalidades: Array<{ codigo: number; descricao: string }>;
  ufs: string[];
}

export function ConsultaDocumentos() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900">Consulta de Documentos</h1>
            <div className="ml-auto flex items-center gap-2 text-slate-600">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filtros Avançados</span>
            </div>
          </div>
          <p className="text-slate-600">Portal Nacional de Contratações Públicas (PNCP)</p>
        </div>

        <PncpSearch />
      </div>
    </div>
  );
}