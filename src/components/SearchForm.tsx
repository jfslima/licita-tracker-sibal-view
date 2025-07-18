import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Search, Filter, Loader2 } from 'lucide-react';
import { FilterPanel } from './FilterPanel';

type SearchFormProps = {
  tipoDoc: string;
  setTipoDoc: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  keyword: string;
  setKeyword: (value: string) => void;
  filters: any;
  setFilters: (value: any) => void;
  filterOptions: any;
  loadingFilters: boolean;
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  handleSearch: () => void;
  loading: boolean;
  tiposDocumento: Array<{value: string; label: string; icon: any}>;
  statusOptions: any;
};

export function SearchForm({
  tipoDoc, setTipoDoc, status, setStatus, keyword, setKeyword, filters, setFilters,
  filterOptions, loadingFilters, showFilters, setShowFilters, handleSearch, loading,
  tiposDocumento, statusOptions
}: SearchFormProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <Label htmlFor="tipo-documento">Tipo de Documento</Label>
          <Select value={tipoDoc} onValueChange={setTipoDoc}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tiposDocumento.map((tipo) => {
                const Icon = tipo.icon;
                return (
                  <SelectItem key={tipo.value} value={tipo.value}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {tipo.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
        <div className="md:col-span-3 space-y-2">
          <Label htmlFor="keyword">Palavra-chave</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              id="keyword"
              placeholder="Digite palavras-chave para buscar..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10 h-11"
            />
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <Label>Status</Label>
        <RadioGroup value={status} onValueChange={setStatus} className="flex flex-wrap gap-4">
          {statusOptions[tipoDoc].map((option: {value: string; label: string}) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem value={option.value} id={option.value} />
              <Label htmlFor={option.value}>{option.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <Button
        variant="outline"
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2"
      >
        <Filter className="h-4 w-4" />
        Filtros Avançados
      </Button>
      {showFilters && (
        <FilterPanel
          filterOptions={filterOptions}
          filters={filters}
          onFiltersChange={setFilters}
          tipoDoc={tipoDoc}
          loading={loadingFilters}
        />
      )}
      <Button onClick={handleSearch} disabled={loading}>
        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
        Consultar
      </Button>
    </div>
  );
}