
import { FileText } from 'lucide-react';

export function EmptyState() {
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
