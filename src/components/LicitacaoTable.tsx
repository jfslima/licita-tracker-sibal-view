
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
import { ChevronLeft, ChevronRight, FileText, ExternalLink, Eye, Download } from 'lucide-react';
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'em_julgamento':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'encerrada':
      case 'nao_vigente':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const formatCurrency = (value: any) => {
    if (!value || value === '-') return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(numValue);
  };

  const openDocument = (item: any) => {
    // Construir URL baseada no tipo de documento e dados disponíveis
    let url = '';
    
    if (tipoDoc === 'edital' && item.numeroProcesso) {
      // URL para editais no PNCP
      url = `https://pncp.gov.br/app/editais/${item.numeroProcesso}`;
    } else if (tipoDoc === 'ata' && item.numeroAta) {
      // URL para atas no PNCP
      url = `https://pncp.gov.br/app/atas/${item.numeroAta}`;
    } else if (tipoDoc === 'contrato' && item.numeroContrato) {
      // URL para contratos no PNCP
      url = `https://pncp.gov.br/app/contratos/${item.numeroContrato}`;
    } else if (item.link || item.url) {
      // Se tiver link direto nos dados
      url = item.link || item.url;
    } else {
      // Fallback: busca geral no PNCP
      const searchTerm = item.numeroProcesso || item.objeto || '';
      url = `https://pncp.gov.br/app/busca?q=${encodeURIComponent(searchTerm)}`;
    }
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {Array.from({ length: pageSize }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="p-4 bg-gray-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <FileText className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum resultado encontrado</h3>
        <p className="text-gray-500">
          Tente ajustar os filtros ou termos de busca para encontrar documentos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabela */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
              <TableHead className="font-semibold text-gray-700">Processo/Número</TableHead>
              <TableHead className="font-semibold text-gray-700">Objeto</TableHead>
              <TableHead className="font-semibold text-gray-700">Órgão</TableHead>
              <TableHead className="font-semibold text-gray-700">Data</TableHead>
              <TableHead className="font-semibold text-gray-700">Status</TableHead>
              <TableHead className="font-semibold text-gray-700">Valor</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={item.id} 
                className={`hover:bg-blue-50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="p-1 bg-blue-100 rounded">
                      <FileText className="h-3 w-3 text-blue-600" />
                    </div>
                    <span className="text-sm">
                      {item.numeroProcesso || item.numeroAta || item.numeroContrato || 'N/A'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-md">
                    <p className="text-sm line-clamp-2" title={item.objeto}>
                      {item.objeto || 'Objeto não informado'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-600 truncate" title={item.orgao}>
                      {item.orgao || 'Órgão não informado'}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600">
                    {item.dataPublicacao || item.vigenciaInicial || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${getStatusColor(item.status)} border font-medium`}>
                    {formatStatus(item.status) || 'N/A'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-green-700">
                    {formatCurrency(item.valor)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDocument(item)}
                      className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      title="Visualizar documento"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDocument(item)}
                      className="hover:bg-green-100 hover:text-green-700 transition-colors"
                      title="Abrir no PNCP"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação Moderna */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">Linhas por página:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-20 h-8 border-2">
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

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">
            {startItem}-{endItem} de {rowCount}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="hover:bg-blue-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="hover:bg-blue-100 disabled:opacity-50"
            >
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
