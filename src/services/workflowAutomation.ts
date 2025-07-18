// Mock service para automação de workflow
export const workflowAutomation = {
  initialize() {
    console.log('⚙️ WorkflowAutomation inicializado (mock)');
  },

  getWorkflows() {
    console.log('📋 Carregando workflows disponíveis');
    return [
      {
        id: 'workflow_1',
        name: 'Análise Automática de Licitação',
        description: 'Analisa automaticamente novas licitações e gera relatórios',
        status: 'active',
        steps: [
          { id: 'step_1', name: 'Coleta de dados', status: 'completed' },
          { id: 'step_2', name: 'Análise de viabilidade', status: 'running' },
          { id: 'step_3', name: 'Geração de relatório', status: 'pending' }
        ],
        createdAt: new Date().toISOString(),
        lastRun: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'workflow_2',
        name: 'Monitoramento de Prazos',
        description: 'Monitora prazos de licitações e envia alertas',
        status: 'active',
        steps: [
          { id: 'step_1', name: 'Verificação de prazos', status: 'completed' },
          { id: 'step_2', name: 'Envio de notificações', status: 'completed' }
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        lastRun: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  },

  createWorkflow(workflow: any) {
    console.log('➕ Criando novo workflow:', workflow.name);
    return Promise.resolve({
      id: 'workflow_' + Date.now(),
      ...workflow,
      status: 'active',
      createdAt: new Date().toISOString()
    });
  },

  executeWorkflow(workflowId: string) {
    console.log('▶️ Executando workflow:', workflowId);
    return Promise.resolve({
      executionId: 'exec_' + Date.now(),
      workflowId,
      status: 'running',
      startedAt: new Date().toISOString(),
      progress: 0
    });
  },

  getWorkflowStatus(workflowId: string) {
    console.log('📊 Verificando status do workflow:', workflowId);
    return {
      id: workflowId,
      status: 'completed',
      progress: 100,
      completedSteps: 3,
      totalSteps: 3,
      lastUpdate: new Date().toISOString(),
      results: {
        processedItems: 15,
        successfulItems: 14,
        failedItems: 1,
        warnings: 2
      }
    };
  },

  pauseWorkflow(workflowId: string) {
    console.log('⏸️ Pausando workflow:', workflowId);
    return Promise.resolve({ success: true });
  },

  resumeWorkflow(workflowId: string) {
    console.log('▶️ Retomando workflow:', workflowId);
    return Promise.resolve({ success: true });
  },

  stopWorkflow(workflowId: string) {
    console.log('⏹️ Parando workflow:', workflowId);
    return Promise.resolve({ success: true });
  },

  getWorkflowLogs(workflowId: string) {
    console.log('📝 Carregando logs do workflow:', workflowId);
    return [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: 'Workflow iniciado com sucesso',
        step: 'initialization'
      },
      {
        timestamp: new Date(Date.now() - 60000).toISOString(),
        level: 'info',
        message: 'Processando licitação ID: LIC001',
        step: 'processing'
      },
      {
        timestamp: new Date(Date.now() - 30000).toISOString(),
        level: 'warning',
        message: 'Documento não encontrado para licitação LIC002',
        step: 'validation'
      },
      {
        timestamp: new Date(Date.now() - 10000).toISOString(),
        level: 'success',
        message: 'Workflow concluído com sucesso',
        step: 'completion'
      }
    ];
  },

  getAutomationRules() {
    console.log('📜 Carregando regras de automação');
    return [
      {
        id: 'rule_1',
        name: 'Auto-análise de licitações de TI',
        description: 'Analisa automaticamente licitações da área de tecnologia',
        trigger: 'new_licitation',
        conditions: {
          keywords: ['tecnologia', 'software', 'hardware', 'TI'],
          minValue: 10000
        },
        actions: ['analyze', 'notify', 'generate_report'],
        active: true,
        lastTriggered: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'rule_2',
        name: 'Alerta de prazo crítico',
        description: 'Envia alertas quando restam menos de 3 dias para o prazo',
        trigger: 'deadline_approaching',
        conditions: {
          daysRemaining: 3
        },
        actions: ['send_alert', 'highlight'],
        active: true,
        lastTriggered: new Date(Date.now() - 1800000).toISOString()
      }
    ];
  },

  createAutomationRule(rule: any) {
    console.log('➕ Criando nova regra de automação:', rule.name);
    return Promise.resolve({
      id: 'rule_' + Date.now(),
      ...rule,
      active: true,
      createdAt: new Date().toISOString()
    });
  },

  toggleAutomationRule(ruleId: string) {
    console.log('🔄 Alternando status da regra:', ruleId);
    return Promise.resolve({ success: true });
  },

  getMetrics() {
    console.log('📈 Carregando métricas de automação');
    return {
      totalWorkflows: 12,
      activeWorkflows: 8,
      completedToday: 25,
      failedToday: 2,
      averageExecutionTime: '2.5 min',
      successRate: 92.5,
      totalAutomationRules: 15,
      activeRules: 12,
      triggeredToday: 48,
      savedHours: 156.5
    };
  }
};

export default workflowAutomation;