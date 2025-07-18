import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Plus,
  Clock,
  Users,
  FileText,
  CheckCircle,
  AlertCircle,
  Calendar,
  Target,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  Upload,
  Eye,
  MessageSquare
} from 'lucide-react';
import {
  WorkflowInstance,
  WorkflowTemplate,
  WorkflowStep,
  workflowAutomation
} from '@/services/workflowAutomation';
import { LicitationData } from '@/services/licitationApiIntegration';

interface WorkflowManagerProps {
  licitation?: LicitationData;
}

export const WorkflowManager: React.FC<WorkflowManagerProps> = ({ licitation }) => {
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowInstance | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isStepDialogOpen, setIsStepDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
    // Removido intervalo automático para evitar loops infinitos
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const allWorkflows = workflowAutomation.getWorkflows();
      const allTemplates = workflowAutomation.getTemplates();
      
      setWorkflows(allWorkflows);
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      workflow.licitation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const handleCreateWorkflow = async (templateId: string, licitationData: LicitationData) => {
    try {
      const workflowId = workflowAutomation.createWorkflow(templateId, licitationData);
      await loadData();
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating workflow:', error);
    }
  };

  const handleStartWorkflow = async (workflowId: string) => {
    try {
      workflowAutomation.startWorkflow(workflowId);
      await loadData();
    } catch (error) {
      console.error('Error starting workflow:', error);
    }
  };

  const handleCompleteStep = async (workflowId: string, stepId: string, notes?: string) => {
    try {
      workflowAutomation.completeStep(workflowId, stepId, 'user', notes);
      await loadData();
      setIsStepDialogOpen(false);
    } catch (error) {
      console.error('Error completing step:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'active': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStepStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciador de Workflows</h1>
          <p className="text-muted-foreground">
            Gerencie e monitore workflows de licitação
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Workflow</DialogTitle>
                <DialogDescription>
                  Selecione um template e configure o workflow para a licitação
                </DialogDescription>
              </DialogHeader>
              <CreateWorkflowForm
                templates={templates}
                licitation={licitation}
                onSubmit={handleCreateWorkflow}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="draft">Rascunho</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="on_hold">Em Pausa</SelectItem>
            <SelectItem value="cancelled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Mais Filtros
        </Button>
      </div>

      {/* Workflows List */}
      <div className="grid gap-6">
        {filteredWorkflows.map((workflow) => (
          <Card key={workflow.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-lg">{workflow.licitation.title}</CardTitle>
                    <Badge className={getStatusColor(workflow.status)}>
                      {workflow.status}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-4">
                    <span>{workflow.templateName}</span>
                    <span>•</span>
                    <span>{workflow.licitation.entity.name}</span>
                    <span>•</span>
                    <span>Criado em {formatDate(workflow.createdAt)}</span>
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {workflow.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleStartWorkflow(workflow.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Iniciar
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedWorkflow(workflow)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detalhes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progresso</span>
                  <span>{workflow.progress.toFixed(1)}%</span>
                </div>
                <Progress value={workflow.progress} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Etapas:</span>
                  <div className="font-medium">
                    {workflow.steps.filter(s => s.status === 'completed').length} / {workflow.steps.length}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Prazo:</span>
                  <div className="font-medium">
                    {formatDate(workflow.timeline.endDate)}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Equipe:</span>
                  <div className="font-medium">
                    {workflow.team.length} membros
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Valor:</span>
                  <div className="font-medium">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0
                    }).format(workflow.licitation.value.estimated)}
                  </div>
                </div>
              </div>

              {/* Current Steps */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Próximas Etapas</h4>
                <div className="space-y-2">
                  {workflow.steps
                    .filter(s => s.status === 'in_progress' || s.status === 'pending')
                    .slice(0, 3)
                    .map((step) => (
                      <div key={step.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/50">
                        {getStepStatusIcon(step.status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{step.name}</span>
                            <Badge variant="outline" className={getPriorityColor(step.priority)}>
                              {step.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{step.description}</p>
                        </div>
                        {step.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedStep(step);
                              setIsStepDialogOpen(true);
                            }}
                          >
                            Concluir
                          </Button>
                        )}
                      </div>
                    ))
                  }
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workflow Details Dialog */}
      {selectedWorkflow && (
        <Dialog open={!!selectedWorkflow} onOpenChange={() => setSelectedWorkflow(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedWorkflow.licitation.title}</DialogTitle>
              <DialogDescription>
                {selectedWorkflow.templateName} • {selectedWorkflow.licitation.entity.name}
              </DialogDescription>
            </DialogHeader>
            <WorkflowDetails
              workflow={selectedWorkflow}
              onStepAction={(step) => {
                setSelectedStep(step);
                setIsStepDialogOpen(true);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Step Action Dialog */}
      {selectedStep && (
        <Dialog open={isStepDialogOpen} onOpenChange={setIsStepDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Concluir Etapa</DialogTitle>
              <DialogDescription>
                {selectedStep.name}
              </DialogDescription>
            </DialogHeader>
            <StepActionForm
              step={selectedStep}
              onSubmit={(notes) => {
                if (selectedWorkflow) {
                  handleCompleteStep(selectedWorkflow.id, selectedStep.id, notes);
                }
              }}
              onCancel={() => setIsStepDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Create Workflow Form Component
interface CreateWorkflowFormProps {
  templates: WorkflowTemplate[];
  licitation?: LicitationData;
  onSubmit: (templateId: string, licitation: LicitationData) => void;
  onCancel: () => void;
}

const CreateWorkflowForm: React.FC<CreateWorkflowFormProps> = ({
  templates,
  licitation,
  onSubmit,
  onCancel
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [licitationData, setLicitationData] = useState<Partial<LicitationData>>(licitation || {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate && licitationData) {
      onSubmit(selectedTemplate, licitationData as LicitationData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template">Template do Workflow</Label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.id}>
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-sm text-muted-foreground">{template.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!licitation && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Licitação</Label>
            <Input
              id="title"
              value={licitationData.title || ''}
              onChange={(e) => setLicitationData({ ...licitationData, title: e.target.value })}
              placeholder="Digite o título da licitação"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={licitationData.description || ''}
              onChange={(e) => setLicitationData({ ...licitationData, description: e.target.value })}
              placeholder="Descrição da licitação"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!selectedTemplate}>
          Criar Workflow
        </Button>
      </div>
    </form>
  );
};

// Workflow Details Component
interface WorkflowDetailsProps {
  workflow: WorkflowInstance;
  onStepAction: (step: WorkflowStep) => void;
}

const WorkflowDetails: React.FC<WorkflowDetailsProps> = ({ workflow, onStepAction }) => {
  return (
    <Tabs defaultValue="steps" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="steps">Etapas</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="team">Equipe</TabsTrigger>
        <TabsTrigger value="documents">Documentos</TabsTrigger>
      </TabsList>
      
      <TabsContent value="steps" className="space-y-4">
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {workflow.steps.map((step, index) => (
              <div key={step.id} className="flex items-start space-x-4 p-4 rounded-lg border">
                <div className="flex flex-col items-center">
                  {getStepStatusIcon(step.status)}
                  {index < workflow.steps.length - 1 && (
                    <div className="w-px h-8 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{step.name}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getPriorityColor(step.priority)}>
                        {step.priority}
                      </Badge>
                      <Badge variant="outline">
                        {step.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                  
                  {/* Checklist */}
                  {step.checklist.length > 0 && (
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium">Checklist:</h5>
                      {step.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <Checkbox checked={item.completed} disabled />
                          <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                            {item.item}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {step.status === 'in_progress' && (
                    <Button size="sm" onClick={() => onStepAction(step)}>
                      Concluir Etapa
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="timeline" className="space-y-4">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <p className="text-sm">{formatDate(workflow.timeline.startDate)}</p>
            </div>
            <div>
              <Label>Prazo Final</Label>
              <p className="text-sm">{formatDate(workflow.timeline.endDate)}</p>
            </div>
          </div>
          
          {workflow.milestones.length > 0 && (
            <div>
              <Label>Marcos Importantes</Label>
              <div className="space-y-2 mt-2">
                {workflow.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded border">
                    <span className="text-sm">{milestone.name}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(milestone.date)}
                      </span>
                      {milestone.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="team" className="space-y-4">
        <div className="space-y-4">
          {workflow.team.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum membro da equipe atribuído
            </p>
          ) : (
            workflow.team.map((member) => (
              <div key={member.userId} className="flex items-center justify-between p-3 rounded border">
                <div>
                  <h4 className="font-medium">{member.name}</h4>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <Badge variant="outline">
                  {member.permissions.length} permissões
                </Badge>
              </div>
            ))
          )}
        </div>
      </TabsContent>
      
      <TabsContent value="documents" className="space-y-4">
        <div className="space-y-4">
          {workflow.steps.map((step) => (
            <div key={step.id} className="space-y-2">
              <h4 className="font-medium">{step.name}</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <Label>Requeridos</Label>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {step.documents.required.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label>Gerados</Label>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {step.documents.generated.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <Label>Enviados</Label>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {step.documents.uploaded.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

// Step Action Form Component
interface StepActionFormProps {
  step: WorkflowStep;
  onSubmit: (notes: string) => void;
  onCancel: () => void;
}

const StepActionForm: React.FC<StepActionFormProps> = ({ step, onSubmit, onCancel }) => {
  const [notes, setNotes] = useState('');
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    step.checklist.map(item => item.completed)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(notes);
  };

  const allItemsChecked = checkedItems.every(checked => checked);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Descrição da Etapa</Label>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>

      {step.checklist.length > 0 && (
        <div className="space-y-2">
          <Label>Checklist</Label>
          <div className="space-y-2">
            {step.checklist.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  checked={checkedItems[index]}
                  onCheckedChange={(checked) => {
                    const newCheckedItems = [...checkedItems];
                    newCheckedItems[index] = checked as boolean;
                    setCheckedItems(newCheckedItems);
                  }}
                />
                <span className="text-sm">{item.item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Adicione observações sobre a conclusão desta etapa..."
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={!allItemsChecked}>
          Concluir Etapa
        </Button>
      </div>
    </form>
  );
};

const getStepStatusIcon = (status: string) => {
  switch (status) {
    case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
    case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
    default: return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical': return 'text-red-600 bg-red-50';
    case 'high': return 'text-orange-600 bg-orange-50';
    case 'medium': return 'text-yellow-600 bg-yellow-50';
    case 'low': return 'text-green-600 bg-green-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

export default WorkflowManager;