
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye } from 'lucide-react';

interface LicitacaoTableRowProps {
  item: any;
  index: number;
  onOpenDocument: (item: any) => void;
}

export function LicitacaoTableRow({ item, index, onOpenDocument }: LicitacaoTableRowProps) {
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
      'divulgada_no_pncp': 'Divulgada no PNCP',
    };
    return statusMap[status?.toLowerCase()] || status;
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

  return (
    <TableRow 
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
            {item.numeroProcesso || item.numeroAta || item.numeroContrato || item.numero_controle_pncp || 'N/A'}
          </span>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-md">
          <p className="text-sm line-clamp-2" title={item.description || item.objeto}>
            {item.description || item.objeto || 'Objeto não informado'}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate" title={item.orgao_nome || item.orgao}>
            {item.orgao_nome || item.orgao || 'Órgão não informado'}
          </p>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">
          {item.data_publicacao_pncp ? 
            new Date(item.data_publicacao_pncp).toLocaleDateString('pt-BR') : 
            item.dataPublicacao || item.vigenciaInicial || 'N/A'
          }
        </span>
      </TableCell>
      <TableCell>
        <Badge className={`${getStatusColor(item.situacao_nome || item.status)} border font-medium`}>
          {formatStatus(item.situacao_nome || item.status) || 'N/A'}
        </Badge>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-green-700">
          {formatCurrency(item.valor_global || item.valor)}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDocument(item)}
            className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
            title="Ver detalhes do documento"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
