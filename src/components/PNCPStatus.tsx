import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink,
  Database,
  Clock,
  TrendingUp
} from 'lucide-react';
import { pncpService } from '@/services/pncpService';

interface PNCPStatusProps {
  className?: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  totalEditais: number;
  isLoading: boolean;
  error: string | null;
}

export function PNCPStatus({ className }: PNCPStatusProps) {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastUpdate: null,
    totalEditais: 0,
    isLoading: false,
    error: null
  });

  const testConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('🔍 Testando conexão com PNCP...');
      
      // Limpar cache antes do teste
      pncpService.limparCache();
      
      const response = await pncpService.buscarEditaisAtivos(1);
      
      setStatus({
        isConnected: true,
        lastUpdate: new Date(),
        totalEditais: response.meta.total,
        isLoading: false,
        error: null
      });
      
      console.log('✅ Conexão com PNCP estabelecida com sucesso!', {
        total: response.meta.total,
        editais: response.items?.length || 0,
        cache: pncpService.getEstatisticasCache()
      });
      
    } catch (error) {
      console.error('❌ Erro ao conectar com PNCP:', error);
      
      setStatus({
        isConnected: false,
        lastUpdate: null,
        totalEditais: 0,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  useEffect(() => {
    // Testar conexão ao montar o componente
    testConnection();
  }, []);

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const getStatusColor = () => {
    if (status.isLoading) return 'bg-blue-500';
    if (status.isConnected) return 'bg-green-500';
    return 'bg-red-500';
  };

  const getStatusText = () => {
    if (status.isLoading) return 'Conectando...';
    if (status.isConnected) return 'Conectado';
    return 'Desconectado';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Status PNCP
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status.isLoading ? 'animate-pulse' : ''}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Conexão */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {status.isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">{getStatusText()}</span>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={testConnection}
            disabled={status.isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${status.isLoading ? 'animate-spin' : ''}`} />
            Testar
          </Button>
        </div>

        {/* Informações da Conexão */}
        {status.isConnected && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-1 text-gray-600">
                <Database className="h-3 w-3" />
                <span>Total de Editais:</span>
              </div>
              <div className="font-semibold">
                {(status.totalEditais || 0).toLocaleString('pt-BR')}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="h-3 w-3" />
                <span>Última Atualização:</span>
              </div>
              <div className="font-semibold text-xs">
                {formatLastUpdate(status.lastUpdate)}
              </div>
            </div>
          </div>
        )}

        {/* Erro */}
        {status.error && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Erro de Conexão:</strong> {status.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Link para o PNCP */}
        <div className="pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => window.open('https://pncp.gov.br/app/editais?status=recebendo_proposta', '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Acessar Portal PNCP
          </Button>
        </div>

        {/* Indicadores de Performance */}
        {status.isConnected && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Fonte de Dados:</span>
              <Badge variant="outline" className="text-xs">
                <TrendingUp className="h-3 w-3 mr-1" />
                Tempo Real
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">API Version:</span>
              <Badge variant="secondary" className="text-xs">
                v1.0
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600">Cache:</span>
              <Badge variant="outline" className="text-xs">
                {pncpService.getEstatisticasCache()?.tamanho || 0} itens
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}