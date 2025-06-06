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

  const openDocument = (item: any) => {
    console.log('Item completo:', item);
    
    // Primeiro, tenta usar a URL direta se disponível (aceita ambos os formatos)
    const directUrl = item.item_url ?? item.itemUrl;
    if (directUrl) {
      const fullUrl = `https://pncp.gov.br${directUrl}`;
      console.log('Tentando abrir URL direta:', fullUrl);
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Captura todas as variações de campos que o PNCP pode usar
    const orgao = item.orgao_cnpj ?? item.orgaoCnpj ?? item.cnpjOrgaoGerenciador;

    // --- ano -----------------------------------------------------------------
    let ano =
      item.ano ??
      item.anoPublicacao ??
      (item.data_publicacao_pncp
        ? new Date(item.data_publicacao_pncp).getFullYear()
        : undefined);
    if (!ano || Number.isNaN(ano) || ano < 1900) ano = ''; // força vazio em caso de erro

    // --- sequenciais ---------------------------------------------------------
    const val = (v: any) => (v && v !== '0' ? v : '');      // tira zero/vazio

    const seq    = val(item.numero_sequencial)
                || val(item.numeroSequencial)
                || val(item.numeroEdital)
                || val(item.numeroContratoApostilamento);

    const seqAta = val(item.numero_sequencial_compra_ata)
                || val(item.numeroSequencialCompraAta)
                || val(item.numeroControleAta);
    
    const numeroControle = item.numero_controle_pncp ?? item.numeroControlePncp;
    
    console.log('Dados extraídos:', { orgao, ano, seq, seqAta, numeroControle, tipoDoc });
    
    // Tenta construir URLs específicas baseado no tipo de documento
    if (tipoDoc === 'edital' && orgao && ano && seq) {
      const constructedUrl = `https://pncp.gov.br/compras/${orgao}/${ano}/${seq}`;
      console.log('URL construída para edital:', constructedUrl);
      window.open(constructedUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (tipoDoc === 'ata' && orgao && ano && seqAta) {
      const constructedUrl = `https://pncp.gov.br/atas/${orgao}/${ano}/${seqAta}`;
      console.log('URL construída para ata:', constructedUrl);
      window.open(constructedUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (tipoDoc === 'contrato' && orgao && ano && seq) {
      const constructedUrl = `https://pncp.gov.br/contratos/${orgao}/${ano}/${seq}`;
      console.log('URL construída para contrato:', constructedUrl);
      window.open(constructedUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // fallback para rotas "hash" que o PNCP usa em alguns editais/atas
    if (orgao && numeroControle) {
      const hashUrl = `https://pncp.gov.br/#/contratacoes/${orgao}/${numeroControle}`;
      console.log('Tentando URL com hash:', hashUrl);
      window.open(hashUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Se não conseguiu construir URL específica, tenta busca no PNCP
    if (numeroControle) {
      const searchUrl = `https://pncp.gov.br/app/busca?q=${encodeURIComponent(numeroControle)}`;
      console.log('Fazendo busca por número de controle:', searchUrl);
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Último recurso: busca pelo título/descrição
    const searchTerm = item.title || item.description || item.objeto || '';
    if (searchTerm) {
      const searchUrl = `https://pncp.gov.br/app/busca?q=${encodeURIComponent(searchTerm)}`;
      console.log('Fazendo busca por termo:', searchUrl);
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Exibe os campos analisados quando falhar
      console.warn('Falha de rotas: campos analisados', { orgao, ano, seq, seqAta, numeroControle });
      console.error('Não foi possível determinar a URL para o documento:', item);
      alert('Não foi possível abrir o documento. Tente novamente ou verifique se o documento ainda está disponível no PNCP.');
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
                      onClick={() => openDocument(item)}
                      className="hover:bg-blue-100 hover:text-blue-700 transition-colors"
                      title="Abrir documento no PNCP"
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
