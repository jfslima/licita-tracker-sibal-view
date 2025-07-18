import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Bell,
  BellRing,
  Settings,
  Plus,
  Edit,
  Trash2,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Clock,
  Target,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Send,
  Pause,
  Play,
  BarChart3,
  Users,
  Calendar,
  DollarSign,
  FileText,
  Search,
  X,
  RefreshCw
} from 'lucide-react';
import {
  NotificationRule,
  NotificationChannel,
  Notification,
  NotificationTemplate,
  NotificationStats,
  notificationSystem
} from '@/services/notificationSystem';
import { LicitationData } from '@/services/licitationApiIntegration';

interface NotificationCenterProps {
  userId?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ userId = 'default' }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [selectedRule, setSelectedRule] = useState<NotificationRule | null>(null);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [isEditRuleOpen, setIsEditRuleOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Removido intervalo automático para evitar loops infinitos
  }, [userId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load notifications
      const userNotifications = notificationSystem.getNotifications(userId);
      setNotifications(userNotifications);
      
      // Load rules
      const userRules = notificationSystem.getRules(userId);
      setRules(userRules);
      
      // Load templates
      const allTemplates = notificationSystem.getTemplates();
      setTemplates(allTemplates);
      
      // Load stats
      const userStats = notificationSystem.getStats(userId);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading notification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filterType === 'all' || notification.type === filterType;
    const matchesPriority = filterPriority === 'all' || notification.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesPriority && matchesSearch;
  });

  const handleCreateRule = async (ruleData: Partial<NotificationRule>) => {
    try {
      const newRule: NotificationRule = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        name: ruleData.name || '',
        description: ruleData.description || '',
        isActive: true,
        filters: ruleData.filters || {},
        conditions: ruleData.conditions || [],
        channels: ruleData.channels || [],
        frequency: ruleData.frequency || 'immediate',
        template: ruleData.template || 'default',
        createdAt: new Date().toISOString(),
        lastTriggered: null
      };
      
      notificationSystem.createRule(newRule);
      await loadData();
      setIsCreateRuleOpen(false);
    } catch (error) {
      console.error('Error creating rule:', error);
    }
  };

  const handleUpdateRule = async (ruleId: string, updates: Partial<NotificationRule>) => {
    try {
      notificationSystem.updateRule(ruleId, updates);
      await loadData();
      setIsEditRuleOpen(false);
      setSelectedRule(null);
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      notificationSystem.deleteRule(ruleId);
      await loadData();
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      notificationSystem.updateRule(ruleId, { isActive });
      await loadData();
    } catch (error) {
      console.error('Error toggling rule:', error);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel.type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'push': return <Bell className="h-4 w-4" />;
      case 'webhook': return <Webhook className="h-4 w-4" />;
      case 'telegram': return <MessageSquare className="h-4 w-4" />;
      case 'whatsapp': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_licitation': return <FileText className="h-4 w-4" />;
      case 'deadline_reminder': return <Clock className="h-4 w-4" />;
      case 'status_change': return <RefreshCw className="h-4 w-4" />;
      case 'price_alert': return <DollarSign className="h-4 w-4" />;
      case 'document_update': return <FileText className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <BellRing className="h-8 w-8" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Central de Notificações</h1>
            <p className="text-muted-foreground">
              Gerencie alertas e notificações inteligentes
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateRuleOpen} onOpenChange={setIsCreateRuleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Regra de Notificação</DialogTitle>
                <DialogDescription>
                  Configure quando e como você deseja ser notificado
                </DialogDescription>
              </DialogHeader>
              <NotificationRuleForm
                templates={templates}
                onSubmit={handleCreateRule}
                onCancel={() => setIsCreateRuleOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Notificações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent}</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">Requer atenção</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules.filter(r => r.isActive).length}</div>
              <p className="text-xs text-muted-foreground">De {rules.length} total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        
        <TabsContent value="notifications" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar notificações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="new_licitation">Nova licitação</SelectItem>
                  <SelectItem value="deadline_reminder">Lembrete de prazo</SelectItem>
                  <SelectItem value="status_change">Mudança de status</SelectItem>
                  <SelectItem value="price_alert">Alerta de preço</SelectItem>
                  <SelectItem value="document_update">Atualização de documento</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas prioridades</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {unreadCount > 0 && (
              <Button variant="outline" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
          
          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma notificação encontrada</h3>
                    <p className="text-muted-foreground">
                      {searchTerm || filterType !== 'all' || filterPriority !== 'all'
                        ? 'Tente ajustar os filtros de busca'
                        : 'Você está em dia! Nenhuma notificação pendente.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`transition-all hover:shadow-md ${
                  !notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/50' : ''
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {getTypeIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className={`text-sm font-medium ${
                              !notification.read ? 'font-semibold' : ''
                            }`}>
                              {notification.title}
                            </h4>
                            <Badge className={getPriorityColor(notification.priority)}>
                              {notification.priority}
                            </Badge>
                            {!notification.read && (
                              <Badge variant="secondary">Nova</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(notification.createdAt)}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        {notification.data && (
                          <div className="text-xs text-muted-foreground">
                            {notification.data.licitationId && (
                              <span>ID da Licitação: {notification.data.licitationId}</span>
                            )}
                          </div>
                        )}
                        
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                            className="mt-2"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Marcar como lida
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="rules" className="space-y-4">
          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg">{rule.name}</CardTitle>
                        <Badge variant={rule.isActive ? 'default' : 'secondary'}>
                          {rule.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <CardDescription>{rule.description}</CardDescription>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) => handleToggleRule(rule.id, checked)}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRule(rule);
                          setIsEditRuleOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteRule(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Channels */}
                  <div>
                    <Label className="text-sm font-medium">Canais de Notificação</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      {rule.channels.map((channel, index) => (
                        <Badge key={index} variant="outline" className="flex items-center space-x-1">
                          {getChannelIcon(channel)}
                          <span>{channel.type}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {/* Conditions */}
                  <div>
                    <Label className="text-sm font-medium">Condições</Label>
                    <div className="text-sm text-muted-foreground mt-1">
                      {rule.conditions.length > 0 ? (
                        rule.conditions.map((condition, index) => (
                          <div key={index}>
                            {condition.field} {condition.operator} {condition.value}
                          </div>
                        ))
                      ) : (
                        'Nenhuma condição específica'
                      )}
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequência:</span>
                      <div className="font-medium">{rule.frequency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Criada em:</span>
                      <div className="font-medium">{formatDate(rule.createdAt)}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Último disparo:</span>
                      <div className="font-medium">
                        {rule.lastTriggered ? formatDate(rule.lastTriggered) : 'Nunca'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notificações por Tipo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(type)}
                          <span className="text-sm">{type}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Notificações por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.byChannel).map(([channel, count]) => (
                      <div key={channel} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getChannelIcon({ type: channel as any, config: {} })}
                          <span className="text-sm">{channel}</span>
                        </div>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Falhas de Entrega</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.failedDeliveries}</div>
                  <p className="text-sm text-muted-foreground">Últimos 30 dias</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Tempo Médio de Resposta</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.averageResponseTime}ms</div>
                  <p className="text-sm text-muted-foreground">Processamento de regras</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Rule Dialog */}
      {selectedRule && (
        <Dialog open={isEditRuleOpen} onOpenChange={setIsEditRuleOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Regra de Notificação</DialogTitle>
              <DialogDescription>
                Modifique as configurações da regra
              </DialogDescription>
            </DialogHeader>
            <NotificationRuleForm
              rule={selectedRule}
              templates={templates}
              onSubmit={(updates) => handleUpdateRule(selectedRule.id, updates)}
              onCancel={() => {
                setIsEditRuleOpen(false);
                setSelectedRule(null);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Notification Rule Form Component
interface NotificationRuleFormProps {
  rule?: NotificationRule;
  templates: NotificationTemplate[];
  onSubmit: (data: Partial<NotificationRule>) => void;
  onCancel: () => void;
}

const NotificationRuleForm: React.FC<NotificationRuleFormProps> = ({
  rule,
  templates,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<NotificationRule>>({
    name: rule?.name || '',
    description: rule?.description || '',
    filters: rule?.filters || {},
    conditions: rule?.conditions || [],
    channels: rule?.channels || [],
    frequency: rule?.frequency || 'immediate',
    template: rule?.template || 'default'
  });

  const [selectedChannels, setSelectedChannels] = useState<string[]>(
    rule?.channels.map(c => c.type) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const channels: NotificationChannel[] = selectedChannels.map(type => ({
      type: type as any,
      config: {}
    }));
    
    onSubmit({
      ...formData,
      channels
    });
  };

  const handleChannelToggle = (channelType: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels(prev => [...prev, channelType]);
    } else {
      setSelectedChannels(prev => prev.filter(c => c !== channelType));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Regra</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Alertas de licitação de TI"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequência</Label>
          <Select
            value={formData.frequency}
            onValueChange={(value) => setFormData({ ...formData, frequency: value as any })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediate">Imediata</SelectItem>
              <SelectItem value="hourly">A cada hora</SelectItem>
              <SelectItem value="daily">Diária</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descreva quando esta regra deve ser ativada"
        />
      </div>
      
      <div className="space-y-2">
        <Label>Canais de Notificação</Label>
        <div className="grid grid-cols-3 gap-4">
          {[
            { type: 'email', label: 'Email', icon: Mail },
            { type: 'sms', label: 'SMS', icon: Smartphone },
            { type: 'push', label: 'Push', icon: Bell },
            { type: 'webhook', label: 'Webhook', icon: Webhook },
            { type: 'telegram', label: 'Telegram', icon: MessageSquare },
            { type: 'whatsapp', label: 'WhatsApp', icon: MessageSquare }
          ].map(({ type, label, icon: Icon }) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={selectedChannels.includes(type)}
                onCheckedChange={(checked) => handleChannelToggle(type, checked as boolean)}
              />
              <Label htmlFor={type} className="flex items-center space-x-2 cursor-pointer">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="template">Template</Label>
        <Select
          value={formData.template}
          onValueChange={(value) => setFormData({ ...formData, template: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!formData.name || selectedChannels.length === 0}>
          {rule ? 'Atualizar' : 'Criar'} Regra
        </Button>
      </div>
    </form>
  );
};

export default NotificationCenter;