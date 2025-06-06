
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableBody } from '@/components/ui/table';
import { LicitacaoTableHeader } from './table/TableHeader';
import { LicitacaoTableRow } from './table/LicitacaoTableRow';
import { TablePagination } from './table/TablePagination';
import { EmptyState } from './table/EmptyState';
import { LoadingState } from './table/LoadingState';

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
  const navigate = useNavigate();

  const openDocument = (item: any) => {
    console.log('Item completo:', item);
    
    // 👉 1. Caminho exato já enviado pela API?
    if (item.item_url) {
      const rel = item.item_url.replace(/^\/app\/?/, ''); // tira /app
      return navigate(`/pncp/doc/${encodeURIComponent(rel)}`);
    }

    // 👉 2. fallback antigo (continua valendo p/ dados incompletos)
    const orgao = item.orgao_cnpj ?? item.orgaoCnpj;
    const ano = item.ano ?? new Date(item.data_publicacao_pncp ?? '').getFullYear();
    const seq = item.numero_sequencial ?? item.numeroSequencial;
    const seqAta = item.numero_sequencial_compra_ata ?? item.numeroSequencialCompraAta;
    const numCtrl = item.numero_controle_pncp ?? item.numeroControlePncp;

    if (tipoDoc === 'edital' && orgao && ano && seq) {
      return navigate(`/pncp/edital/${orgao}/${ano}/${seq}`);
    }

    if (tipoDoc === 'ata' && orgao && ano && seqAta) {
      return navigate(`/pncp/ata/${orgao}/${ano}/${seqAta}`);
    }

    if (tipoDoc === 'contrato' && orgao && ano && seq) {
      return navigate(`/pncp/contrato/${orgao}/${ano}/${seq}`);
    }

    if (numCtrl) {
      return navigate(`/pncp/contratacao/${orgao}/${numCtrl}`);
    }

    console.error('Não foi possível determinar a rota para o documento:', item);
    alert('Não foi possível abrir este documento.');
  };

  if (loading) {
    return <LoadingState pageSize={pageSize} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-6">
      {/* Tabela */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <Table>
          <LicitacaoTableHeader />
          <TableBody>
            {data.map((item, index) => (
              <LicitacaoTableRow
                key={item.id}
                item={item}
                index={index}
                onOpenDocument={openDocument}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      <TablePagination
        page={page}
        pageSize={pageSize}
        rowCount={rowCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
}
