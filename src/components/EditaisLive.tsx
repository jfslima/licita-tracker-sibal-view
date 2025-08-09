import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  ExternalLink, 
  Calendar,
  MapPin,
  Building,
  DollarSign,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Play,
  Pause,
  Zap
} from 'lucide-react';
import { pncpService, PNCPEdital } from '@/services/pncpService';
import { PNCP_CONFIG } from '@/config/pncp';

interface EditaisLiveProps {
  className?: string;
  maxItems?: number;
}

export function EditaisLive({ className, maxItems = 10 }: EditaisLiveProps) {
  const [editais, setEditais] = useState<PNCPEdital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<'todos' | 'alto_valor' | 'vencimento_proximo' | 'pregao'>('todos');
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [updateInterval, setUpdateInterval] = useState<NodeJS.Timeout | null>(null);
  const [nextUpdateIn, setNextUpdateIn] = useState<number>(120);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  const carregarEditais = async (filtro: typeof filtroAtivo = 'todos') => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`🔄 Carregando editais com filtro: ${filtro}`);
      
      // Limpar cache para garantir dados frescos
      pncpService.limparCache();
      console.log('🗑️ Cache limpo para garantir dados atualizados');
      
      let response;
      
      switch (filtro) {
        case 'alto_valor':
          response = await pncpService.buscarEditaisAltoValor(1);
          break;
        case 'vencimento_proximo':
          // Buscar editais dos próximos 7 dias
          const hoje = new Date();
          const proximaSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
          response = await pncpService.buscarEditaisPorPeriodo(
            hoje.toISOString().split('T')[0],
            proximaSemana.toISOString().split('T')[0],
            1
          );
          break;
        case 'pregao':
          response = await pncpService.buscarPregaoEletronico(1);
          break;
        default:
          response = await pncpService.buscarEditaisAtivos(1);
      }
      
      const editaisLimitados = response.items.slice(0, maxItems);
      setEditais(editaisLimitados);
      setLastUpdate(new Date());
      
      console.log(`✅ ${editaisLimitados.length} editais carregados com sucesso`);
      console.log('📊 Dados dos editais:', editaisLimitados.map(e => ({
        sequencial: e.sequencial,
        numeroControlePNCP: e.numeroControlePNCP,
        objeto: e.objetoContratacao?.substring(0, 50) + '...',
        orgao: e.unidadeOrgao?.nomeOrgao?.substring(0, 30) + '...'
      })));
      
    } catch (error) {
      console.error('❌ Erro ao carregar editais:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 useEffect disparado - carregando editais...');
    carregarEditais(filtroAtivo);
  }, [filtroAtivo, maxItems]);

  // Log para debug dos editais carregados
  useEffect(() => {
    if (editais.length > 0) {
      console.log('📋 Editais atuais no estado:', editais.length);
      console.log('📋 Primeiro edital:', editais[0]);
    }
  }, [editais]);

  // Effect para atualização automática em tempo real
  useEffect(() => {
    if (autoUpdate) {
      // Atualizar imediatamente
      carregarEditais(filtroAtivo);
      setNextUpdateIn(120);
      
      // Configurar contador regressivo
      const countdown = setInterval(() => {
        setNextUpdateIn(prev => {
          if (prev <= 1) {
            return 120; // Reset para 2 minutos
          }
          return prev - 1;
        });
      }, 1000); // Atualizar a cada segundo
      
      // Configurar intervalo de 2 minutos para atualizações automáticas
      const interval = setInterval(() => {
        console.log('🔄 Atualizando editais automaticamente...');
        carregarEditais(filtroAtivo);
        setNextUpdateIn(120); // Reset do contador
      }, 120000); // 2 minutos
      
      setUpdateInterval(interval);
      setCountdownInterval(countdown);
      
      return () => {
        if (interval) {
          clearInterval(interval);
        }
        if (countdown) {
          clearInterval(countdown);
        }
      };
    } else {
      // Limpar intervalos se auto-update estiver desabilitado
      if (updateInterval) {
        clearInterval(updateInterval);
        setUpdateInterval(null);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
        setCountdownInterval(null);
      }
    }
  }, [autoUpdate, filtroAtivo]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (updateInterval) {
        clearInterval(updateInterval);
      }
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
    };
  }, []);

  const formatarValor = (valor?: number): string => {
    if (!valor) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  const formatarData = (dataStr?: string): string => {
    if (!dataStr) return 'Não informado';
    
    try {
      const data = new Date(dataStr);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(data);
    } catch {
      return 'Data inválida';
    }
  };

  const calcularDiasRestantes = (dataStr?: string): number | null => {
    if (!dataStr) return null;
    
    try {
      const dataFinal = new Date(dataStr);
      const hoje = new Date();
      const diffTime = dataFinal.getTime() - hoje.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const getStatusColor = (diasRestantes: number | null): string => {
    if (diasRestantes === null) return 'bg-gray-500';
    if (diasRestantes <= 1) return 'bg-red-500';
    if (diasRestantes <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filtros = [
    { key: 'todos', label: 'Todos', icon: Search },
    { key: 'alto_valor', label: 'Alto Valor', icon: DollarSign },
    { key: 'vencimento_proximo', label: 'Vence em Breve', icon: Clock },
    { key: 'pregao', label: 'Pregão Eletrônico', icon: TrendingUp }
  ] as const;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>Editais em Tempo Real</span>
              {autoUpdate && (
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4 text-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
            {lastUpdate && (
              <Badge variant="outline" className="text-xs">
                {editais.length} editais
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              variant={autoUpdate ? "default" : "outline"}
              onClick={() => setAutoUpdate(!autoUpdate)}
              className="text-xs"
            >
              {autoUpdate ? (
                <>
                  <Pause className="h-3 w-3 mr-1" />
                  Pausar
                </>
              ) : (
                <>
                  <Play className="h-3 w-3 mr-1" />
                  Iniciar
                </>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                console.log('🔄 Botão Atualizar clicado!');
                carregarEditais(filtroAtivo);
              }}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={() => {
                console.log('🧪 Teste direto da API!');
                pncpService.limparCache();
                pncpService.buscarEditaisAtivos(1).then(result => {
                  console.log('🧪 Resultado do teste direto:', result);
                  setEditais(result.items.slice(0, maxItems));
                  setLastUpdate(new Date());
                }).catch(err => {
                  console.error('🧪 Erro no teste direto:', err);
                });
              }}
              disabled={isLoading}
            >
              🧪 Teste
            </Button>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap gap-2 mt-4">
          {filtros.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              size="sm"
              variant={filtroAtivo === key ? 'default' : 'outline'}
              onClick={() => setFiltroAtivo(key)}
              className="text-xs"
            >
              <Icon className="h-3 w-3 mr-1" />
              {label}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações de tempo real */}
        <div className="flex items-center justify-between text-xs">
          {lastUpdate && (
            <div className="text-gray-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última atualização: {formatarData(lastUpdate.toISOString())}
            </div>
          )}
          {autoUpdate && (
             <div className="text-blue-600 flex items-center gap-1">
               <RefreshCw className="h-3 w-3" />
               Próxima atualização em: {Math.floor(nextUpdateIn / 60)}:{(nextUpdateIn % 60).toString().padStart(2, '0')}
             </div>
           )}
        </div>
        
        {/* Status de tempo real */}
        {autoUpdate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <div className="flex items-center gap-2 text-xs text-green-700">
              <Zap className="h-3 w-3" />
              <span className="font-medium">Modo Tempo Real Ativo</span>
              <span>•</span>
              <span>Atualizações automáticas a cada 2 minutos</span>
              <span>•</span>
              <span>Dados diretos do PNCP</span>
            </div>
          </div>
        )}

        {/* Erro */}
        {error && (
          <Alert>
            <AlertDescription className="text-sm">
              <strong>Erro:</strong> {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Lista de editais */}
        {!isLoading && editais.length > 0 && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {editais.map((edital, index) => {
              const diasRestantes = calcularDiasRestantes(edital.dataVigenciaFim);
              
              return (
                <div key={`${edital.numeroControlePNCP}-${index}`} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">
                        {edital.objetoContratacao || 'Objeto não informado'}
                      </h4>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          <span className="truncate">
                            {edital.unidadeOrgao?.nomeOrgao || 'Órgão não informado'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>
                            {edital.unidadeOrgao?.municipioNome || 'N/A'} - {edital.unidadeOrgao?.ufSigla || 'N/A'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatarValor(edital.valorEstimadoTotal)}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Publicado: {formatarData(edital.dataPublicacaoPncp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {/* Status de vencimento */}
                      {diasRestantes !== null && (
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(diasRestantes)}`} 
                             title={`${diasRestantes} dias restantes`} />
                      )}
                      
                      {/* Modalidade */}
                      <Badge variant="secondary" className="text-xs">
                        {edital.modalidadeNome || 'N/A'}
                      </Badge>
                      
                      {/* Link para o edital */}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-6 w-6 p-0"
                        onClick={() => {
                          const url = edital.linkSistemaOrigem || `https://pncp.gov.br/app/editais/${edital.sequencial}`;
                          window.open(url, '_blank');
                        }}
                        title="Ver no PNCP"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Nenhum edital encontrado */}
        {!isLoading && editais.length === 0 && !error && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Nenhum edital encontrado</p>
            <p className="text-xs">Tente alterar os filtros ou atualizar</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}