
import { TableHead, TableHeader as ShadcnTableHeader, TableRow } from '@/components/ui/table';

export function LicitacaoTableHeader() {
  return (
    <ShadcnTableHeader>
      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50">
        <TableHead className="font-semibold text-gray-700">Processo/Número</TableHead>
        <TableHead className="font-semibold text-gray-700">Objeto</TableHead>
        <TableHead className="font-semibold text-gray-700">Órgão</TableHead>
        <TableHead className="font-semibold text-gray-700">Data</TableHead>
        <TableHead className="font-semibold text-gray-700">Status</TableHead>
        <TableHead className="font-semibold text-gray-700">Valor</TableHead>
        <TableHead className="text-right font-semibold text-gray-700">Ações</TableHead>
      </TableRow>
    </ShadcnTableHeader>
  );
}
