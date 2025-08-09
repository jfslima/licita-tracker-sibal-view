import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface MonitorDeadlinesArgs {
  company_id: string;
  days_ahead?: number;
  deadline_types?: ('opening' | 'proposal_submission' | 'public_session' | 'appeal')[];
}

interface DeadlineAlert {
  notice_id: string;
  notice_title: string;
  organ: string;
  deadline_type: string;
  deadline_date: string;
  days_remaining: number;
  urgency_level: 'baixa' | 'média' | 'alta' | 'crítica';
  status: 'upcoming' | 'today' | 'overdue';
  estimated_value?: number;
  actions_required: string[];
  preparation_checklist: {
    item: string;
    completed: boolean;
    deadline: string;
    priority: 'alta' | 'média' | 'baixa';
  }[];
}

interface DeadlineMonitoringResult {
  company_id: string;
  monitoring_date: string;
  total_deadlines: number;
  critical_deadlines: number;
  alerts: DeadlineAlert[];
  summary: {
    today: number;
    this_week: number;
    next_week: number;
    overdue: number;
  };
  recommendations: {
    priority: 'alta' | 'média' | 'baixa';
    action: string;
    deadline: string;
    impact: string;
  }[];
  calendar_events: {
    title: string;
    date: string;
    type: string;
    description: string;
    reminder_settings: {
      days_before: number[];
      notification_types: string[];
    };
  }[];
}

export async function monitorDeadlines(
  supabase: SupabaseClient,
  args: MonitorDeadlinesArgs
): Promise<DeadlineMonitoringResult> {
  try {
    const daysAhead = args.days_ahead || 7;
    const deadlineTypes = args.deadline_types || ['proposal_submission', 'public_session'];
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + daysAhead);

    // Buscar licitações relevantes
    const { data: notices, error: noticesError } = await supabase
      .from('notices')
      .select('*')
      .gte('submission_deadline', currentDate.toISOString())
      .lte('submission_deadline', futureDate.toISOString())
      .order('submission_deadline', { ascending: true });

    if (noticesError) {
      throw new Error(`Erro ao buscar licitações: ${noticesError.message}`);
    }

    // Buscar seguimentos da empresa
    const { data: follows, error: followsError } = await supabase
      .from('user_follows')
      .select('notice_id')
      .eq('company_id', args.company_id);

    if (followsError) {
      console.warn('Erro ao buscar seguimentos:', followsError.message);
    }

    const followedNoticeIds = follows?.map(f => f.notice_id) || [];

    // Processar alertas de prazo
    const alerts: DeadlineAlert[] = [];
    const summary = {
      today: 0,
      this_week: 0,
      next_week: 0,
      overdue: 0
    };

    for (const notice of notices || []) {
      const deadlineAlerts = generateDeadlineAlerts(notice, deadlineTypes, currentDate);
      
      for (const alert of deadlineAlerts) {
        // Priorizar licitações seguidas pela empresa
        if (followedNoticeIds.includes(notice.id)) {
          alert.urgency_level = enhanceUrgencyLevel(alert.urgency_level);
        }

        alerts.push(alert);

        // Atualizar resumo
        if (alert.days_remaining === 0) summary.today++;
        else if (alert.days_remaining <= 7) summary.this_week++;
        else if (alert.days_remaining <= 14) summary.next_week++;
        else if (alert.days_remaining < 0) summary.overdue++;
      }
    }

    // Ordenar alertas por urgência e prazo
    alerts.sort((a, b) => {
      const urgencyOrder = { 'crítica': 4, 'alta': 3, 'média': 2, 'baixa': 1 };
      const urgencyDiff = urgencyOrder[b.urgency_level] - urgencyOrder[a.urgency_level];
      if (urgencyDiff !== 0) return urgencyDiff;
      return a.days_remaining - b.days_remaining;
    });

    // Gerar recomendações
    const recommendations = generateRecommendations(alerts);

    // Gerar eventos de calendário
    const calendarEvents = generateCalendarEvents(alerts);

    // Contar prazos críticos
    const criticalDeadlines = alerts.filter(a => 
      a.urgency_level === 'crítica' || a.days_remaining <= 2
    ).length;

    const result: DeadlineMonitoringResult = {
      company_id: args.company_id,
      monitoring_date: currentDate.toISOString(),
      total_deadlines: alerts.length,
      critical_deadlines: criticalDeadlines,
      alerts: alerts.slice(0, 50), // Limitar a 50 alertas
      summary,
      recommendations,
      calendar_events: calendarEvents
    };

    // Salvar resultado do monitoramento
    await saveMonitoringResult(supabase, args.company_id, result);

    return result;

  } catch (error) {
    console.error('Erro em monitorDeadlines:', error);
    throw new Error(`Falha no monitoramento de prazos: ${error.message}`);
  }
}

function generateDeadlineAlerts(
  notice: any,
  deadlineTypes: string[],
  currentDate: Date
): DeadlineAlert[] {
  const alerts: DeadlineAlert[] = [];

  // Prazo de entrega de propostas
  if (deadlineTypes.includes('proposal_submission') && notice.submission_deadline) {
    const submissionDate = new Date(notice.submission_deadline);
    const daysRemaining = Math.ceil(
      (submissionDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let urgencyLevel: 'baixa' | 'média' | 'alta' | 'crítica';
    let status: 'upcoming' | 'today' | 'overdue';

    if (daysRemaining < 0) {
      urgencyLevel = 'crítica';
      status = 'overdue';
    } else if (daysRemaining === 0) {
      urgencyLevel = 'crítica';
      status = 'today';
    } else if (daysRemaining <= 2) {
      urgencyLevel = 'alta';
      status = 'upcoming';
    } else if (daysRemaining <= 5) {
      urgencyLevel = 'média';
      status = 'upcoming';
    } else {
      urgencyLevel = 'baixa';
      status = 'upcoming';
    }

    alerts.push({
      notice_id: notice.id,
      notice_title: notice.title,
      organ: notice.organ,
      deadline_type: 'Entrega de Propostas',
      deadline_date: notice.submission_deadline,
      days_remaining: daysRemaining,
      urgency_level: urgencyLevel,
      status: status,
      estimated_value: notice.estimated_value,
      actions_required: generateActionsRequired('proposal_submission', daysRemaining),
      preparation_checklist: generatePreparationChecklist('proposal_submission', daysRemaining)
    });
  }

  // Data de abertura
  if (deadlineTypes.includes('opening') && notice.opening_date) {
    const openingDate = new Date(notice.opening_date);
    const daysRemaining = Math.ceil(
      (openingDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining >= -1 && daysRemaining <= 7) {
      alerts.push({
        notice_id: notice.id,
        notice_title: notice.title,
        organ: notice.organ,
        deadline_type: 'Abertura das Propostas',
        deadline_date: notice.opening_date,
        days_remaining: daysRemaining,
        urgency_level: daysRemaining <= 1 ? 'alta' : 'média',
        status: daysRemaining === 0 ? 'today' : daysRemaining < 0 ? 'overdue' : 'upcoming',
        estimated_value: notice.estimated_value,
        actions_required: generateActionsRequired('opening', daysRemaining),
        preparation_checklist: generatePreparationChecklist('opening', daysRemaining)
      });
    }
  }

  return alerts;
}

function generateActionsRequired(deadlineType: string, daysRemaining: number): string[] {
  const actions: string[] = [];

  if (deadlineType === 'proposal_submission') {
    if (daysRemaining <= 0) {
      actions.push('URGENTE: Prazo vencido - verificar possibilidade de recurso');
    } else if (daysRemaining === 1) {
      actions.push('CRÍTICO: Finalizar e entregar proposta hoje');
      actions.push('Verificar documentação completa');
      actions.push('Confirmar forma de entrega');
    } else if (daysRemaining <= 3) {
      actions.push('Revisar proposta técnica');
      actions.push('Finalizar proposta comercial');
      actions.push('Preparar documentação de habilitação');
    } else if (daysRemaining <= 7) {
      actions.push('Elaborar proposta técnica');
      actions.push('Calcular custos e preços');
      actions.push('Reunir documentação necessária');
    } else {
      actions.push('Analisar edital detalhadamente');
      actions.push('Avaliar viabilidade de participação');
      actions.push('Formar equipe de elaboração');
    }
  } else if (deadlineType === 'opening') {
    if (daysRemaining <= 0) {
      actions.push('Acompanhar resultado da abertura');
    } else if (daysRemaining === 1) {
      actions.push('Preparar para acompanhar abertura');
      actions.push('Verificar local e horário');
    } else {
      actions.push('Aguardar data de abertura');
      actions.push('Monitorar possíveis alterações');
    }
  }

  return actions;
}

function generatePreparationChecklist(
  deadlineType: string,
  daysRemaining: number
): { item: string; completed: boolean; deadline: string; priority: 'alta' | 'média' | 'baixa' }[] {
  const checklist = [];
  const baseDate = new Date();

  if (deadlineType === 'proposal_submission') {
    checklist.push(
      {
        item: 'Análise completa do edital',
        completed: false,
        deadline: new Date(baseDate.getTime() + Math.max(1, daysRemaining - 5) * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'alta' as const
      },
      {
        item: 'Proposta técnica elaborada',
        completed: false,
        deadline: new Date(baseDate.getTime() + Math.max(1, daysRemaining - 3) * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'alta' as const
      },
      {
        item: 'Proposta comercial finalizada',
        completed: false,
        deadline: new Date(baseDate.getTime() + Math.max(1, daysRemaining - 2) * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'alta' as const
      },
      {
        item: 'Documentação de habilitação reunida',
        completed: false,
        deadline: new Date(baseDate.getTime() + Math.max(1, daysRemaining - 2) * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'média' as const
      },
      {
        item: 'Revisão final da proposta',
        completed: false,
        deadline: new Date(baseDate.getTime() + Math.max(1, daysRemaining - 1) * 24 * 60 * 60 * 1000).toISOString(),
        priority: 'alta' as const
      }
    );
  }

  return checklist;
}

function enhanceUrgencyLevel(currentLevel: 'baixa' | 'média' | 'alta' | 'crítica'): 'baixa' | 'média' | 'alta' | 'crítica' {
  const levels = ['baixa', 'média', 'alta', 'crítica'];
  const currentIndex = levels.indexOf(currentLevel);
  const enhancedIndex = Math.min(currentIndex + 1, levels.length - 1);
  return levels[enhancedIndex] as 'baixa' | 'média' | 'alta' | 'crítica';
}

function generateRecommendations(alerts: DeadlineAlert[]): any[] {
  const recommendations = [];
  const criticalAlerts = alerts.filter(a => a.urgency_level === 'crítica');
  const todayAlerts = alerts.filter(a => a.days_remaining === 0);
  const upcomingAlerts = alerts.filter(a => a.days_remaining > 0 && a.days_remaining <= 3);

  if (criticalAlerts.length > 0) {
    recommendations.push({
      priority: 'alta',
      action: `Ação imediata necessária para ${criticalAlerts.length} prazo(s) crítico(s)`,
      deadline: 'Imediato',
      impact: 'Evitar perda de oportunidades'
    });
  }

  if (todayAlerts.length > 0) {
    recommendations.push({
      priority: 'alta',
      action: `Finalizar ${todayAlerts.length} proposta(s) com prazo hoje`,
      deadline: 'Hoje',
      impact: 'Participação nas licitações'
    });
  }

  if (upcomingAlerts.length > 0) {
    recommendations.push({
      priority: 'média',
      action: `Acelerar preparação de ${upcomingAlerts.length} proposta(s) com prazo próximo`,
      deadline: '3 dias',
      impact: 'Qualidade das propostas'
    });
  }

  if (alerts.length > 10) {
    recommendations.push({
      priority: 'baixa',
      action: 'Considerar priorização de licitações mais estratégicas',
      deadline: '1 semana',
      impact: 'Otimização de recursos'
    });
  }

  return recommendations;
}

function generateCalendarEvents(alerts: DeadlineAlert[]): any[] {
  const events = [];

  for (const alert of alerts) {
    if (alert.days_remaining >= 0 && alert.days_remaining <= 14) {
      events.push({
        title: `${alert.deadline_type}: ${alert.notice_title}`,
        date: alert.deadline_date,
        type: alert.deadline_type,
        description: `${alert.organ} - Valor: R$ ${alert.estimated_value?.toLocaleString('pt-BR') || 'N/A'}`,
        reminder_settings: {
          days_before: alert.urgency_level === 'crítica' ? [0, 1, 3] : [1, 3, 7],
          notification_types: ['email', 'push', 'sms']
        }
      });
    }
  }

  return events;
}

async function saveMonitoringResult(
  supabase: SupabaseClient,
  companyId: string,
  result: DeadlineMonitoringResult
): Promise<void> {
  try {
    const { error } = await supabase
      .from('deadline_monitoring_results')
      .insert({
        company_id: companyId,
        monitoring_result: result,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao salvar resultado do monitoramento:', error);
    }
  } catch (error) {
    console.error('Erro ao salvar no banco:', error);
  }
}