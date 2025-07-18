import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!   // server role
);

async function fetchPncpPage(page = 1) {
  const { data } = await axios.get(
    `https://apipcp.portaldecompraspublicas.com.br/publico/licitacoes?page=${page}`
  );
  return data?.items ?? [];
}

(async () => {
  const items = await fetchPncpPage();
  const upsert = items.map((it: any) => ({
    numero: it.numero,
    orgao: it.orgao,
    modalidade: it.modalidade,
    objeto: it.objeto,
    publicado_em: it.publicacao,
    data_abertura: it.abertura,
    json_raw: it
  }));
  const { error } = await supabase
    .from('licitacoes')
    .upsert(upsert, { onConflict: 'numero,orgao' });
  if (error) console.error(error);
  else console.log(`Upserted ${upsert.length} registros`);
})();
