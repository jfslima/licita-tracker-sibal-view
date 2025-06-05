
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, MapPin, Building2, Globe, Scale } from 'lucide-react';

interface FilterPanelProps {
  filterOptions: any;
  filters: any;
  onFiltersChange: (filters: any) => void;
  tipoDoc: string;
  loading: boolean;
}

export function FilterPanel({ filterOptions, filters, onFiltersChange, tipoDoc, loading }: FilterPanelProps) {
  const handleFilterChange = (field: string, value: string) => {
    onFiltersChange((prev: any) => ({
      ...prev,
      [field]: value === 'todos' ? undefined : value,
    }));
  };

  const SelectFilter = ({ 
    label, 
    field, 
    list, 
    labelKey = 'descricao', 
    valueKey = 'id',
    placeholder = "Selecione...",
    icon: Icon = Filter
  }: {
    label: string;
    field: string;
    list?: any[];
    labelKey?: string;
    valueKey?: string;
    placeholder?: string;
    icon?: React.ComponentType<any>;
  }) => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-11 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          {label}
        </Label>
        <Select
          value={filters[field] || 'todos'}
          onValueChange={(value) => handleFilterChange(field, value)}
        >
          <SelectTrigger className="h-11 border-2 border-gray-200 focus:border-blue-500 bg-white">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="todos" className="font-medium">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                Todos
              </div>
            </SelectItem>
            {list?.map((item) => {
              const value = item[valueKey] || item;
              const label = item[labelKey] || item.nome || item;
              return (
                <SelectItem key={value} value={String(value)}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {String(label)}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-5 w-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-800">Filtros Avançados</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Órgão */}
        <SelectFilter
          label="Órgão"
          field="orgao"
          list={filterOptions.orgaos}
          labelKey="nome"
          valueKey="codigo"
          placeholder="Selecione o órgão"
          icon={Building2}
        />

        {/* UF */}
        <SelectFilter
          label="UF"
          field="uf"
          list={filterOptions.ufs?.map((uf: string) => ({ id: uf, descricao: uf }))}
          placeholder="Selecione a UF"
          icon={MapPin}
        />

        {/* Município */}
        <SelectFilter
          label="Município"
          field="municipio"
          list={filterOptions.municipios}
          placeholder="Selecione o município"
          icon={MapPin}
        />

        {/* Modalidade */}
        <SelectFilter
          label="Modalidade"
          field="modalidade"
          list={filterOptions.modalidadesContratacao}
          placeholder="Selecione a modalidade"
          icon={Scale}
        />

        {/* Esfera */}
        <SelectFilter
          label="Esfera"
          field="esfera"
          list={filterOptions.esferas}
          placeholder="Selecione a esfera"
          icon={Globe}
        />

        {/* Poder */}
        <SelectFilter
          label="Poder"
          field="poder"
          list={filterOptions.poderes}
          placeholder="Selecione o poder"
          icon={Scale}
        />

        {/* Fonte Orçamentária */}
        <SelectFilter
          label="Fonte Orçamentária"
          field="fonteOrcamentaria"
          list={filterOptions.fontesOrcamentarias}
          placeholder="Selecione a fonte"
          icon={Building2}
        />

        {/* Tipo de Contrato (apenas para contratos) */}
        {tipoDoc === 'contrato' && (
          <SelectFilter
            label="Tipo de Contrato"
            field="tipoContrato"
            list={filterOptions.tiposContrato}
            placeholder="Selecione o tipo"
            icon={Scale}
          />
        )}
      </div>
    </div>
  );
}
