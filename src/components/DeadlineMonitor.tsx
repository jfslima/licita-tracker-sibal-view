import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedMcp, DeadlineMonitoringResult } from '@/hooks/useAdvancedMcp';
import { 
  Clock, 
  Bell, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Plus,
  Trash2,
  Settings,
  Mail,
  Smartphone,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeadlineMonitorProps {
  licitacaoIds?: string[];
}

interface AlertConfig {
  id: string;
  name: string;
  daysBeforeDeadline: number;
  enabled: boolean;
  emailNotification: boolean;
  smsNotification: boolean;
  channels: string[];
}

export function DeadlineMonitor({ licitacaoIds = [] }: DeadlineMonitorProps) {
  const [monitoringData, setMonitoringData] = useState<DeadlineMonitoringResult | null>(null);
  const [alertConfigs, setAlertConfigs] = useState<AlertConfig[]>(() => [
    {
      id: '1',
      name: 'Alerta Crítico',
      daysBeforeDeadline: 1,
      enabled: true,
      emailNotification: true,
      smsNotification: true,
      channels: ['email', 'sms']
    },
    {
      id: '2',
      name: 'Alerta Urgente',
      daysBeforeDeadline: 3,
      enabled: true,
      emailNotification: true,
      smsNotification: false,
      channels: ['email']
    },
    {
      id: '3',
      name: 'Alerta Preventivo',
      daysBeforeDeadline: 7,
      enabled: true,
      emailNotification: true,
      smsNotification: false,
      channels: ['email']
    }
  ]);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'expired' | 'upcoming'>('all');
  const [filterDays, setFilterDays] = useState('');
  const [activeTab, setActiveTab] = useState('monitor');
  
  const { monitorDeadlines, loading } = useAdvancedMcp();
  const { toast } = useToast();

  const loadMonitoringData = useCallback(async () => {
    try {
      const result = await monitorDeadlines(licitacaoIds, alertConfigs);
      setMonitoringData(result);
    } catch (error) {
      console.error('Erro no monitoramento:', error);
    }
  }, [licitacaoIds, alertConfigs, monitorDeadlines]);

  useEffect(() => {
    if (licitacaoIds.length > 0) {
      loadMonitoringData();
    }
  }, [licitacaoIds, alertConfigs]);

  const addAlertConfig = () => {
    const newAlert: AlertConfig = {
      id: Date.now().toString(),
      name: `Novo Alerta ${alertConfigs.length + 1}`,
      daysBeforeDeadline: 5,
      enabled: true,
      emailNotification: true,
      smsNotification: false,
      channels: ['email']
    };
    setAlertConfigs([...alertConfigs, newAlert]);
  };

  const updateAlertConfig = (id: string, updates: Partial<AlertConfig>) => {
    setAlertConfigs(configs => 
      configs.map(config => 
        config.id === id ? { ...config, ...updates } : config
      )
    );
  };

  const removeAlertConfig = (id: string) => {
    setAlertConfigs(configs => configs.filter(config => config.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ativo': return 'bg-green-100 text-green-800';
      case 'expirado': return 'bg-red-100 text-red-800';
      case 'próximo': return 'bg-yellow-100 text-yellow-800';
      case 'crítico': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (daysRemaining: number) => {
    if (daysRemaining < 0) return <XCircle className="h-4 w-4 text-red-600" />;
    if (daysRemaining <= 1) return <AlertTriangle className="h-4 w-4 text-red-600" />;
    if (daysRemaining <= 3) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const filteredDeadlines = monitoringData?.deadlines.filter(deadline => {
    if (filterStatus !== 'all' && deadline.status.toLowerCase() !== filterStatus) {
      return false;
    }
    if (filterDays && deadline.daysRemaining > parseInt(filterDays)) {
      return false;
    }
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            Monitoramento de Prazos
          </CardTitle>
          <p className="text-sm text-gray-600">
            Acompanhe prazos críticos e configure alertas inteligentes
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor">Monitoramento</TabsTrigger>
          <TabsTrigger value="alerts">Configurar Alertas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          {/* Estatísticas gerais */}
          {monitoringData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {monitoringData.summary.total}
                  </div>
                  <div className="text-sm text-gray-600">Total</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {monitoringData.summary.active}
                  </div>
                  <div className="text-sm text-gray-600">Ativos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {monitoringData.summary.upcoming}
                  </div>
                  <div className="text-sm text-gray-600">Próximos</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {monitoringData.summary.expired}
                  </div>
                  <div className="text-sm text-gray-600">Expirados</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="upcoming">Próximos</SelectItem>
                      <SelectItem value="expired">Expirados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Máximo de dias</Label>
                  <Input
                    type="number"
                    placeholder="Ex: 30"
                    value={filterDays}
                    onChange={(e) => setFilterDays(e.target.value)}
                    className="w-32"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={loadMonitoringData} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Clock className="h-4 w-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de prazos */}
          <Card>
            <CardHeader>
              <CardTitle>Prazos Monitorados ({filteredDeadlines.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {filteredDeadlines.map((deadline, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{deadline.title}</h4>
                          <p className="text-xs text-gray-600 mb-2">{deadline.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>ID: {deadline.licitacaoId}</span>
                            <span>Tipo: {deadline.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={getStatusColor(deadline.status)}>
                            {deadline.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getUrgencyIcon(deadline.daysRemaining)}
                          <span className="text-sm font-medium">
                            {deadline.daysRemaining < 0 
                              ? `Expirado há ${Math.abs(deadline.daysRemaining)} dias`
                              : deadline.daysRemaining === 0
                              ? 'Expira hoje'
                              : `${deadline.daysRemaining} dias restantes`
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(deadline.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                      
                      {deadline.alerts && deadline.alerts.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 mb-2">
                            <Bell className="h-3 w-3 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Alertas Configurados</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {deadline.alerts.map((alert, alertIndex) => (
                              <Badge key={alertIndex} variant="outline" className="text-xs">
                                {alert.name} ({alert.daysBeforeDeadline}d)
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum prazo encontrado</p>
                  <p className="text-sm">Ajuste os filtros ou adicione licitações para monitorar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuração de Alertas
                </span>
                <Button onClick={addAlertConfig} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Alerta
                </Button>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Configure alertas personalizados para diferentes tipos de prazos
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertConfigs.map((config) => (
                  <div key={config.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={config.enabled}
                          onCheckedChange={(checked) => 
                            updateAlertConfig(config.id, { enabled: checked as boolean })
                          }
                        />
                        <Input
                          value={config.name}
                          onChange={(e) => updateAlertConfig(config.id, { name: e.target.value })}
                          className="font-medium"
                        />
                      </div>
                      <Button
                        onClick={() => removeAlertConfig(config.id)}
                        variant="outline"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Dias antes do prazo</Label>
                        <Input
                          type="number"
                          value={config.daysBeforeDeadline}
                          onChange={(e) => 
                            updateAlertConfig(config.id, { 
                              daysBeforeDeadline: parseInt(e.target.value) || 0 
                            })
                          }
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Canais de notificação</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={config.emailNotification}
                              onCheckedChange={(checked) => 
                                updateAlertConfig(config.id, { emailNotification: checked as boolean })
                              }
                            />
                            <Mail className="h-4 w-4" />
                            <Label className="text-sm">Email</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={config.smsNotification}
                              onCheckedChange={(checked) => 
                                updateAlertConfig(config.id, { smsNotification: checked as boolean })
                              }
                            />
                            <Smartphone className="h-4 w-4" />
                            <Label className="text-sm">SMS</Label>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <Badge 
                          variant={config.enabled ? "default" : "secondary"}
                          className="w-fit"
                        >
                          {config.enabled ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <Button 
                  onClick={loadMonitoringData}
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Aplicando Configurações...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Aplicar Configurações
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monitoringData?.alertHistory && monitoringData.alertHistory.length > 0 ? (
                <div className="space-y-3">
                  {monitoringData.alertHistory.map((alert, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {new Date(alert.timestamp).toLocaleDateString('pt-BR')}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Tipo: {alert.type}</span>
                        <span>Canal: {alert.channel}</span>
                        <span>Status: {alert.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum alerta no histórico</p>
                  <p className="text-sm">Os alertas enviados aparecerão aqui</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}