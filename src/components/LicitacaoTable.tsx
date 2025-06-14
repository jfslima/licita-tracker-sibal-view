import React, { useMemo, useCallback } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AIButton } from './AIButton';

/** ***************************************************************
 *  Types & Interfaces
 * ****************************************************************/
export interface PNCPItem {
  id: string;
  // Identificadores básicos
  item_url?: string;
  itemUrl?: string;
  orgao_cnpj?: string;
  orgaoCnpj?: string;
  orgao_nome?: string;
  orgao?: string;
  ano?: number;
  numero_sequencial?: string;
  numeroSequencial?: string;
  numero_sequencial_compra_ata?: string;
  numeroSequencialCompraAta?: string;
  numero_controle_pncp?: string;
  numeroControlePncp?: string;
  // Datas
  data_publicacao_pncp?: string;
  dataPublicacao?: string;
  vigenciaInicial?: string;
  // Descrição
  description?: string;
  objeto?: string;
  // Situação / Status
  situacao_nome?: string;
  status?: string;
  // Valores
  valor_global?: string | number;
  valor?: string | number;
  // Números específicos
  numeroProcesso?: string;
  numeroAta?: string;
  numeroContrato?: string;
}

interface LicitacaoTableProps {
  data: PNCPItem[];
  /** 'edital' | 'ata' | 'contrato' */
  tipoDoc: string;
  loading: boolean;
  page: number;
  pageSize: number;
  rowCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onAskAI?: (item: PNCPItem) => void;
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
  onAskAI,
}: LicitacaoTableProps) {
  /* -------------------------------------------------------------
   * Constantes & Helpers Memoizados
   * -----------------------------------------------------------*/
  const base = 'https://pncp.gov.br';

  const totalPages = useMemo(() => Math.ceil(rowCount / pageSize), [rowCount, pageSize]);
  const startItem = page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, rowCount);

  const STATUS_COLORS: Record<string, string> = useMemo(
    () => ({
      vigente: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      recebendo_proposta: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      em_julgamento: 'bg-amber-100 text-amber-800 border-amber-200',
      encerrada: 'bg-gray-100 text-gray-800 border-gray-200',
      nao_vigente: 'bg-gray-100 text-gray-800 border-gray-200',
    }),
    []
  );

  const STATUS_LABEL: Record<string, string> = useMemo(
    () => ({
      vigente: 'Vigente',
      nao_vigente: 'Não Vigente',
      recebendo_proposta: 'Recebendo Proposta',
      em_julgamento: 'Em Julgamento',
      encerrada: 'Encerrada',
      divulgada_no_pncp: 'Divulgada no PNCP',
    }),
    []
  );

  const formatCurrency = useCallback((value: string | number | undefined) => {
    if (!value || value === '-') return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (Number.isNaN(numValue)) return '-';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numValue);
  }, []);

  /** *************************************************************
   * Normaliza qualquer path vindo da API PNCP
   * *************************************************************/
  const normalizePath = useCallback((raw: string) => {
    if (!raw) return '';
    let path = raw.replace(/^\/+/, '');
    if (path.startsWith('compras/')) path = path.replace(/^compras/, 'editais');
    path = `app/${path}`.replace(/app\/app\//, 'app/').replace(/app\/#\//, 'app/');
    return `/${path}`;
  }, []);

  /** *************************************************************
   * Tenta abrir direto o primeiro arquivo do edital (/arquivos/1)
   * *************************************************************/
  const tryOpenFirstFile = useCallback(async (item: PNCPItem): Promise<boolean> => {
    if (tipoDoc !== 'edital') return false;
    const orgao = item.orgao_cnpj ?? item.orgaoCnpj;
    const ano = item.ano ?? new Date(item.data_publicacao_pncp ?? '').getFullYear();
    const seq = item.numero_sequencial ?? item.numeroSequencial;
    if (!orgao || !ano || !seq) return false;

    const downloadUrl = `${base}/pncp-api/v1/orgaos/${orgao}/compras/${ano}/${seq}/arquivos/1`;

    try {
      const res = await fetch(downloadUrl, { method: 'HEAD' });
      if (!res.ok) throw new Error('Arquivo não encontrado');
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      return true;
    } catch (err) {
      console.warn('[PNCP] Primeiro arquivo indisponível, fallback para página geral.');
      return false;
    }
  }, [base, tipoDoc]);

  /** *************************************************************
   * Função principal de abertura de documentos
   * *************************************************************/
  const openDocument = async (item: PNCPItem) => {
    // Tentativa rápida (apenas para editais)
    if (await tryOpenFirstFile(item)) return;

    // Estrutura tradicional
    const direct = item.item_url ?? item.itemUrl;
    if (direct) {
      const normalizedUrl = `${base}${normalizePath(direct)}`;
      window.open(normalizedUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    // Construção manual (fallback)
    const orgao = item.orgao_cnpj ?? item.orgaoCnpj;
    const ano = item.ano ?? new Date(item.data_publicacao_pncp ?? '').getFullYear();
    const seq = item.numero_sequencial ?? item.numeroSequencial;
    const seqAta = item.numero_sequencial_compra_ata ?? item.numeroSequencialCompraAta;
    const ctrl = item.numero_controle_pncp ?? item.numeroControlePncp;

    let path = '';
    switch (tipoDoc) {
      case 'edital':
        if (orgao && ano && seq) path = `/app/editais/${orgao}/${ano}/${seq}`;
        break;
      case 'ata':
        if (orgao && ano && seqAta) path = `/app/atas/${orgao}/${ano}/${seqAta}`;
        break;
      case 'contrato':
        if (orgao && ano && seq) path = `/app/contratos/${orgao}/${ano}/${seq}`;
        break;
    }

    if (path) {
      window.open(`${base}${path}`, '_blank', 'noopener,noreferrer');
    } else if (ctrl) {
      const searchUrl = `${base}/app/busca?q=${encodeURIComponent(ctrl)}`;
      window.open(searchUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('Não foi possível abrir este documento no PNCP.');
    }
  };

  /** *************************************************************
   * Renderização condicional: loading / vazio / tabela
   * *************************************************************/
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
        <p className="text-gray-500">Tente ajustar os filtros ou termos de busca para encontrar documentos.</p>
      </div>
    );
  }

  /** *************************************************************
   * JSX principal da tabela + paginação
   * *************************************************************/
  return (
    <div className="space-y-6">
      {/* Tabela */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
              <TableHead className="font-semibold text-gray-700" scope="col">Processo/Número</TableHead>
              <TableHead className="font-semibold text-gray-700" scope="col">Objeto</TableHead>
              <TableHead className="font-semibold text-gray-700" scope="col">Órgão</TableHead>
              <TableHead className="font-semibold text-gray-700" scope="col">Data</TableHead>
              <TableHead className="font-semibold text-gray-700" scope="col">Status</TableHead>
              <TableHead className="font-semibold text-gray-700" scope="col">Valor</TableHead>
              <TableHead className="text-right font-semibold text-gray-700" scope="col">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow
                key={item.id}
                className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
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
                    {item.data_publicacao_pncp
                      ? new Date(item.data_publicacao_pncp).toLocaleDateString('pt-BR')
                      : item.dataPublicacao || item.vigenciaInicial || 'N/A'}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${STATUS_COLORS[(item.situacao_nome || item.status || '').toLowerCase()] || 'bg-blue-100 text-blue-800 border-blue-200'} border font-medium`}>
                    {STATUS_LABEL[(item.situacao_nome || item.status || '').toLowerCase()] || 'N/A'}
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
                      aria-label="Abrir documento no PNCP"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    {onAskAI && (
                      <AIButton variant="icon" onClick={() => onAskAI(item)} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 font-medium">Linhas por página:</span>
          <Select value={String(pageSize)} onValueChange={(value) => {
            onPageSizeChange(Number(value));
            onPageChange(0); // resetar página ao mudar pageSize
          }}>
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
            {rowCount === 0 ? '0' : `${startItem}-${endItem}`} de {rowCount}
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
