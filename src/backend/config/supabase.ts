import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-key';

// Cliente público (frontend)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente com privilégios administrativos (backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configurações do banco de dados
export const dbConfig = {
  // Tabelas principais
  tables: {
    licitacoes: 'licitacoes',
    empresas: 'empresas',
    documentos: 'documentos',
    analises: 'analises',
    workflows: 'workflows',
    notificacoes: 'notificacoes',
    usuarios: 'usuarios',
    configuracoes: 'configuracoes'
  },
  
  // Buckets de armazenamento
  storage: {
    documentos: 'documentos',
    anexos: 'anexos',
    relatorios: 'relatorios'
  },
  
  // Funções do banco
  functions: {
    searchLicitacoes: 'search_licitacoes',
    analyzeLicitacao: 'analyze_licitacao',
    processDocument: 'process_document',
    sendNotification: 'send_notification'
  }
};

// Tipos para o banco de dados
export interface Database {
  public: {
    Tables: {
      licitacoes: {
        Row: {
          id: string;
          numero: string;
          objeto: string;
          orgao: string;
          modalidade: string;
          valor_estimado: number;
          data_abertura: string;
          data_encerramento: string;
          situacao: string;
          fonte: string;
          url_original: string;
          dados_originais: any;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['licitacoes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['licitacoes']['Insert']>;
      };
      
      empresas: {
        Row: {
          id: string;
          cnpj: string;
          razao_social: string;
          nome_fantasia: string;
          porte: string;
          atividades: string[];
          endereco: any;
          contatos: any;
          certificacoes: string[];
          experiencias: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['empresas']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['empresas']['Insert']>;
      };
      
      documentos: {
        Row: {
          id: string;
          licitacao_id: string;
          nome: string;
          tipo: string;
          tamanho: number;
          url: string;
          conteudo_extraido: string;
          metadados: any;
          processado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['documentos']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documentos']['Insert']>;
      };
      
      analises: {
        Row: {
          id: string;
          licitacao_id: string;
          empresa_id: string;
          tipo_analise: string;
          resultado: any;
          pontuacao_viabilidade: number;
          nivel_concorrencia: string;
          custo_estimado: number;
          riscos: string[];
          oportunidades: string[];
          recomendacoes: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['analises']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['analises']['Insert']>;
      };
      
      workflows: {
        Row: {
          id: string;
          licitacao_id: string;
          empresa_id: string;
          template_id: string;
          nome: string;
          status: string;
          etapas: any[];
          etapa_atual: number;
          data_inicio: string;
          data_fim: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['workflows']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['workflows']['Insert']>;
      };
      
      notificacoes: {
        Row: {
          id: string;
          usuario_id: string;
          tipo: string;
          titulo: string;
          mensagem: string;
          dados: any;
          canal: string;
          status: string;
          lida: boolean;
          enviada_em: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notificacoes']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['notificacoes']['Insert']>;
      };
    };
    
    Functions: {
      search_licitacoes: {
        Args: {
          search_query: string;
          filters: any;
          limit_count: number;
          offset_count: number;
        };
        Returns: any[];
      };
      
      analyze_licitacao: {
        Args: {
          licitacao_id: string;
          empresa_id: string;
          tipo_analise: string;
        };
        Returns: any;
      };
    };
  };
}

// Utilitários para trabalhar com o Supabase
export class SupabaseService {
  static async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('licitacoes').select('count').limit(1);
      return !error;
    } catch {
      return false;
    }
  }
  
  static async setupDatabase(): Promise<void> {
    // Script SQL para criar as tabelas necessárias
    const createTablesSQL = `
      -- Criar extensões necessárias
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      
      -- Tabela de licitações
      CREATE TABLE IF NOT EXISTS licitacoes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        numero VARCHAR(100) NOT NULL,
        objeto TEXT NOT NULL,
        orgao VARCHAR(255) NOT NULL,
        modalidade VARCHAR(100) NOT NULL,
        valor_estimado DECIMAL(15,2),
        data_abertura TIMESTAMP WITH TIME ZONE,
        data_encerramento TIMESTAMP WITH TIME ZONE,
        situacao VARCHAR(100) NOT NULL,
        fonte VARCHAR(100) NOT NULL,
        url_original TEXT,
        dados_originais JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_licitacoes_numero ON licitacoes(numero);
      CREATE INDEX IF NOT EXISTS idx_licitacoes_orgao ON licitacoes(orgao);
      CREATE INDEX IF NOT EXISTS idx_licitacoes_modalidade ON licitacoes(modalidade);
      CREATE INDEX IF NOT EXISTS idx_licitacoes_situacao ON licitacoes(situacao);
      CREATE INDEX IF NOT EXISTS idx_licitacoes_data_abertura ON licitacoes(data_abertura);
      CREATE INDEX IF NOT EXISTS idx_licitacoes_objeto_gin ON licitacoes USING gin(to_tsvector('portuguese', objeto));
      
      -- Outras tabelas...
      -- (Adicionar conforme necessário)
    `;
    
    console.log('SQL para criação das tabelas:', createTablesSQL);
    console.log('Execute este SQL no painel do Supabase para configurar o banco de dados.');
  }
}