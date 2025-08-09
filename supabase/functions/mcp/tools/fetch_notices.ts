import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

interface FetchNoticesArgs {
  query?: string;
  organ?: string;
  modality?: string;
  value_min?: number;
  value_max?: number;
  limit?: number;
}

interface Notice {
  id: string;
  title: string;
  description: string;
  organ: string;
  modality: string;
  estimated_value?: number;
  opening_date: string;
  submission_deadline: string;
  status: string;
  url: string;
  created_at: string;
  updated_at: string;
  risk_level?: string;
  summary?: string;
}

export async function fetchNotices(
  supabase: SupabaseClient,
  args: FetchNoticesArgs
): Promise<{ notices: Notice[]; total: number; filters_applied: any }> {
  try {
    let query = supabase
      .from('notices')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    const filtersApplied: any = {};

    // Aplicar filtros
    if (args.query) {
      query = query.or(`title.ilike.%${args.query}%,description.ilike.%${args.query}%`);
      filtersApplied.query = args.query;
    }

    if (args.organ) {
      query = query.ilike('organ', `%${args.organ}%`);
      filtersApplied.organ = args.organ;
    }

    if (args.modality) {
      query = query.eq('modality', args.modality);
      filtersApplied.modality = args.modality;
    }

    if (args.value_min !== undefined) {
      query = query.gte('estimated_value', args.value_min);
      filtersApplied.value_min = args.value_min;
    }

    if (args.value_max !== undefined) {
      query = query.lte('estimated_value', args.value_max);
      filtersApplied.value_max = args.value_max;
    }

    // Aplicar limite
    const limit = args.limit || 20;
    query = query.limit(limit);
    filtersApplied.limit = limit;

    const { data: notices, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar editais: ${error.message}`);
    }

    // Enriquecer dados com análise rápida
    const enrichedNotices = notices?.map(notice => {
      const daysUntilDeadline = Math.ceil(
        (new Date(notice.submission_deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      let urgencyLevel = 'baixa';
      if (daysUntilDeadline <= 3) urgencyLevel = 'alta';
      else if (daysUntilDeadline <= 7) urgencyLevel = 'média';

      return {
        ...notice,
        days_until_deadline: daysUntilDeadline,
        urgency_level: urgencyLevel,
        is_expired: daysUntilDeadline < 0
      };
    }) || [];

    // Estatísticas rápidas
    const stats = {
      total_value: enrichedNotices.reduce((sum, notice) => sum + (notice.estimated_value || 0), 0),
      avg_value: enrichedNotices.length > 0 
        ? enrichedNotices.reduce((sum, notice) => sum + (notice.estimated_value || 0), 0) / enrichedNotices.length 
        : 0,
      modalities: [...new Set(enrichedNotices.map(n => n.modality))],
      organs: [...new Set(enrichedNotices.map(n => n.organ))],
      urgent_count: enrichedNotices.filter(n => n.urgency_level === 'alta').length,
      expired_count: enrichedNotices.filter(n => n.is_expired).length
    };

    return {
      notices: enrichedNotices,
      total: count || 0,
      filters_applied: filtersApplied,
      statistics: stats,
      search_metadata: {
        execution_time: new Date().toISOString(),
        results_count: enrichedNotices.length,
        has_more: (count || 0) > limit
      }
    };

  } catch (error) {
    console.error('Erro em fetchNotices:', error);
    throw new Error(`Falha na busca de editais: ${error.message}`);
  }
}