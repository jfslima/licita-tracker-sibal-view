import { useQuery } from "@tanstack/react-query";
import { listFiles, parsePncpId, fileUrl } from "../lib/pncp-files";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface PncpDocsProps {
  pncpId: string;
}

export function PncpDocs({ pncpId }: PncpDocsProps) {
  const { data: arquivos, isLoading, error } = useQuery({
    queryKey: ["arquivos", pncpId],
    queryFn: () => listFiles(pncpId),
    staleTime: 1000 * 60 * 30,
    enabled: !!pncpId
  });

  const handleDownload = (arquivo: any) => {
    try {
      const { cnpj, ano, seq } = parsePncpId(pncpId);
      const url = fileUrl(cnpj, ano, seq, arquivo.sequencialDocumento);
      
      // Abrir em nova aba para download
      window.open(url, '_blank', 'noopener,noreferrer');
      
      toast.success(`Iniciando download: ${arquivo.titulo || arquivo.nomeArquivo}`);
    } catch (err) {
      toast.error("Erro ao iniciar download do arquivo");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos do Edital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando anexos...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos do Edital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive">Erro ao carregar documentos</p>
        </CardContent>
      </Card>
    );
  }

  if (!arquivos?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentos do Edital
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Nenhum arquivo publicado pelo órgão.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Documentos do Edital ({arquivos.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {arquivos.map((arquivo) => (
            <div 
              key={arquivo.sequencialDocumento}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-2 flex-1">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {arquivo.titulo || arquivo.nomeArquivo}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownload(arquivo)}
                className="flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Download
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}