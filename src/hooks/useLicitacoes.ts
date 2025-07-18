import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Licitacao {
  id: string;
  numero: string;
  orgao: string;
  modalidade: string;
  objeto: string;
  publicado_em: string;
  data_abertura: string;
}

export function useLicitacoes() {
  const [rows, setRows] = useState<Licitacao[]>([]);
  const [loading, setLoading] = useState(true);

  // 1ª carga
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('licitacoes')
        .select('*')
        .order('publicado_em', { ascending: false });
      if (error) console.error(error);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);

  // subscribe a inserts no canal realtime
  useEffect(() => {
    const channel = supabase
      .channel('licita_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'licitacoes' },
        payload => setRows(prev => [payload.new as Licitacao, ...prev])
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { rows, loading };
}
