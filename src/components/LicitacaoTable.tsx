
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface LicitacaoTableProps {
  data: any[];
  tipoDoc: string;
  loading: boolean;
  page: number;
  pageSize: number;
  rowCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export function LicitacaoTable({
  data,
  tipoDoc,
  loading,
  page,
  pageSize,
  rowCount,
  onPageChange,
  onPageSizeChange,
}: LicitacaoTableProps) {
  const totalPages = Math.ceil(rowCount / pageSize);
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, rowCount);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'vigente':
      case 'recebendo_proposta':
        return 'bg-green-100 text-green-800';
      case 'em_julgamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'encerrada':
      case 'nao_vigente':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'vigente': 'Vigente',
      'nao_vigente': 'Não Vigente',
      'recebendo_proposta': 'Recebendo Proposta',
      'em_julgamento': 'Em Julgamento',
      'encerrada': 'Encerrada',
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="space-y-2">
          {Array.from({ length: pageSize }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">Nenhum resultado encontrado</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tente ajustar os filtros ou termos de busca.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Processo/Número</TableHead>
              <TableHead>Objeto</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.numeroProcesso || item.numeroAta || item.numeroContrato}
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="truncate" title={item.objeto}>
                      {item.objeto}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="truncate text-sm" title={item.orgao}>
                      {item.orgao}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {item.dataPublicacao || item.vigenciaInicial}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(item.status)}>
                    {formatStatus(item.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {item.valor || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">Linhas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">
            {startItem}-{endItem} de {rowCount}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
