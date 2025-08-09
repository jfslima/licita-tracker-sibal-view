import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Bell, AlertTriangle, CheckCircle, Clock, Settings, Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alerta {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'info' | 'warning' | 'success' | 'error';
  ativo: boolean;
  dataCreated: string;
  keywords: string[];
}

export function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([
    {
      id: '1',
      titulo: 'Licitações de Tecnologia',
      descricao: 'Alertas para licitações relacionadas a tecnologia, software e sistemas',
      tipo: 'info',
      ativo: true,
      dataCreated: '2024-01-15',
      keywords: ['tecnologia', 'software', 'sistema', 'TI']
    },
    {
      id: '2',
      titulo: 'Contratos Acima de R$ 1M',
      descricao: 'Notificações para licitações com valor superior a 1 milhão',
      tipo: 'warning',
      ativo: true,
      dataCreated: '2024-01-10',
      keywords: ['alto valor']
    },
    {
      id: '3',
      titulo: 'Pregões Eletrônicos SP',
      descricao: 'Pregões eletrônicos específicos do estado de São Paulo',
      tipo: 'success',
      ativo: false,
      dataCreated: '2024-01-08',
      keywords: ['pregão', 'são paulo', 'SP']
    }
  ]);
  
  const [novoAlerta, setNovoAlerta] = useState({
    titulo: '',
    descricao: '',
    keywords: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();

  const toggleAlerta = (id: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === id ? { ...alerta, ativo: !alerta.ativo } : alerta
    ));
    
    const alerta = alertas.find(a => a.id === id);
    toast({
      title: alerta?.ativo ? 'Alerta Desativado' : 'Alerta Ativado',
      description: `${alerta?.titulo} foi ${alerta?.ativo ? 'desativado' : 'ativado'} com sucesso.`,
    });
  };

  const criarAlerta = () => {
    if (!novoAlerta.titulo.trim() || !novoAlerta.descricao.trim()) {
      toast({
        title: 'Erro',
        description: 'Título e descrição são obrigatórios.',
        variant: 'destructive'
      });
      return;
    }

    const alerta: Alerta = {
      id: Date.now().toString(),
      titulo: novoAlerta.titulo,
      descricao: novoAlerta.descricao,
      tipo: 'info',
      ativo: true,
      dataCreated: new Date().toISOString().split('T')[0],
      keywords: novoAlerta.keywords.split(',').map(k => k.trim()).filter(k => k)
    };

    setAlertas(prev => [alerta, ...prev]);
    setNovoAlerta({ titulo: '', descricao: '', keywords: '' });
    setShowForm(false);
    
    toast({
      title: 'Alerta Criado',
      description: 'Novo alerta configurado com sucesso.',
    });
  };

  const removerAlerta = (id: string) => {
    setAlertas(prev => prev.filter(alerta => alerta.id !== id));
    toast({
      title: 'Alerta Removido',
      description: 'Alerta removido com sucesso.',
    });
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Bell className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Central de Alertas</h1>
        <p className="text-gray-600">Configure e gerencie seus alertas personalizados para licitações</p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
                <p className="text-2xl font-bold text-gray-900">{alertas.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
                <p className="text-2xl font-bold text-green-600">{alertas.filter(a => a.ativo).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Alertas Inativos</p>
                <p className="text-2xl font-bold text-gray-500">{alertas.filter(a => !a.ativo).length}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Notificações Hoje</p>
                <p className="text-2xl font-bold text-blue-600">12</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botão Criar Alerta */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Criar Novo Alerta
        </Button>
      </div>

      {/* Formulário de Novo Alerta */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Criar Novo Alerta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Título do Alerta</label>
              <Input
                value={novoAlerta.titulo}
                onChange={(e) => setNovoAlerta(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Licitações de Tecnologia"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Descrição</label>
              <Input
                value={novoAlerta.descricao}
                onChange={(e) => setNovoAlerta(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva o que este alerta monitora"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Palavras-chave (separadas por vírgula)</label>
              <Input
                value={novoAlerta.keywords}
                onChange={(e) => setNovoAlerta(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="tecnologia, software, sistema"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={criarAlerta}>Criar Alerta</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {alertas.map((alerta) => (
          <Card key={alerta.id} className={`border-l-4 ${
            alerta.ativo ? 'border-l-green-500' : 'border-l-gray-300'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {getIconByType(alerta.tipo)}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{alerta.titulo}</h3>
                    <p className="text-gray-600 mb-3">{alerta.descricao}</p>
                    
                    {alerta.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {alerta.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500">
                      Criado em {new Date(alerta.dataCreated).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Ativo</span>
                    <Switch
                      checked={alerta.ativo}
                      onCheckedChange={() => toggleAlerta(alerta.id)}
                    />
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removerAlerta(alerta.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {alertas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum alerta configurado</h3>
            <p className="text-gray-600 mb-4">Crie seu primeiro alerta para começar a monitorar licitações</p>
            <Button onClick={() => setShowForm(true)}>Criar Primeiro Alerta</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}