
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

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
      [field]: value || undefined,
    }));
  };

  const SelectFilter = ({ 
    label, 
    field, 
    list, 
    labelKey = 'descricao', 
    valueKey = 'id',
    placeholder = "Selecione..." 
  }: {
    label: string;
    field: string;
    list?: any[];
    labelKey?: string;
    valueKey?: string;
    placeholder?: string;
  }) => {
    if (loading) {
      return (
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <Label htmlFor={field}>{label}</Label>
        <Select
          value={filters[field] || ''}
          onValueChange={(value) => handleFilterChange(field, value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos</SelectItem>
            {list?.map((item) => {
              const value = item[valueKey] || item;
              const label = item[labelKey] || item.nome || item;
              return (
                <SelectItem key={value} value={String(value)}>
                  {String(label)}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Filter className="h-4 w-4" />
          Filtros Avançados
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {/* Órgão */}
          <SelectFilter
            label="Órgão"
            field="orgao"
            list={filterOptions.orgaos}
            labelKey="nome"
            valueKey="codigo"
            placeholder="Selecione o órgão"
          />

          {/* UF */}
          <SelectFilter
            label="UF"
            field="uf"
            list={filterOptions.ufs?.map((uf: string) => ({ id: uf, descricao: uf }))}
            placeholder="Selecione a UF"
          />

          {/* Município */}
          <SelectFilter
            label="Município"
            field="municipio"
            list={filterOptions.municipios}
            placeholder="Selecione o município"
          />

          {/* Modalidade */}
          <SelectFilter
            label="Modalidade"
            field="modalidade"
            list={filterOptions.modalidadesContratacao}
            placeholder="Selecione a modalidade"
          />

          {/* Esfera */}
          <SelectFilter
            label="Esfera"
            field="esfera"
            list={filterOptions.esferas}
            placeholder="Selecione a esfera"
          />

          {/* Poder */}
          <SelectFilter
            label="Poder"
            field="poder"
            list={filterOptions.poderes}
            placeholder="Selecione o poder"
          />

          {/* Fonte Orçamentária */}
          <SelectFilter
            label="Fonte Orçamentária"
            field="fonteOrcamentaria"
            list={filterOptions.fontesOrcamentarias}
            placeholder="Selecione a fonte"
          />

          {/* Tipo de Contrato (apenas para contratos) */}
          {tipoDoc === 'contrato' && (
            <SelectFilter
              label="Tipo de Contrato"
              field="tipoContrato"
              list={filterOptions.tiposContrato}
              placeholder="Selecione o tipo"
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
