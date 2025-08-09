-- Migração para SIBAL MCP Unificado
-- Criação das tabelas e políticas RLS para o sistema MCP

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Tabela principal de editais (notices)
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    organ TEXT NOT NULL,
    modality TEXT NOT NULL,
    estimated_value DECIMAL(15,2),
    opening_date TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled', 'suspended')),
    url TEXT,
    
    -- Campos de análise IA
    risk_level TEXT CHECK (risk_level IN ('baixo', 'médio', 'alto', 'crítico')),
    risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_analysis JSONB,
    summary TEXT,
    detailed_summary JSONB,
    
    -- Metadados
    source_system TEXT DEFAULT 'sibal',
    external_id TEXT,
    document_urls TEXT[],
    tags TEXT[],
    
    -- Campos de auditoria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_notices_organ ON notices(organ);
CREATE INDEX IF NOT EXISTS idx_notices_modality ON notices(modality);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_submission_deadline ON notices(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_notices_estimated_value ON notices(estimated_value);
CREATE INDEX IF NOT EXISTS idx_notices_risk_level ON notices(risk_level);
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON notices(created_at);

-- Índice de busca textual
CREATE INDEX IF NOT EXISTS idx_notices_search ON notices USING GIN (
    to_tsvector('portuguese', title || ' ' || COALESCE(description, ''))
);

-- Índice para busca por similaridade
CREATE INDEX IF NOT EXISTS idx_notices_title_trgm ON notices USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_notices_description_trgm ON notices USING GIN (description gin_trgm_ops);

-- Tabela de seguimentos de usuários
CREATE TABLE IF NOT EXISTS user_follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    company_id TEXT,
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    
    -- Configurações de alerta
    alert_types TEXT[] DEFAULT ARRAY['deadline', 'status_change', 'new_documents'],
    notification_preferences JSONB DEFAULT '{
        "email": true,
        "push": true,
        "sms": false,
        "days_before_deadline": [1, 3, 7]
    }'::jsonb,
    
    -- Metadados
    followed_at TIMESTAMPTZ DEFAULT NOW(),
    last_notification_sent TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true
);

-- Índices para user_follows
CREATE INDEX IF NOT EXISTS idx_user_follows_user_id ON user_follows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_company_id ON user_follows(company_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_notice_id ON user_follows(notice_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_follows_unique ON user_follows(user_id, notice_id);

-- Tabela de resultados de processamento de documentos
CREATE TABLE IF NOT EXISTS document_processing_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    document_id TEXT NOT NULL,
    document_type TEXT NOT NULL CHECK (document_type IN ('edital', 'anexo', 'ata', 'resultado')),
    document_url TEXT,
    
    -- Resultado do processamento
    processing_result JSONB NOT NULL,
    processing_status TEXT DEFAULT 'success' CHECK (processing_status IN ('success', 'partial', 'failed')),
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processing_time_ms INTEGER,
    file_size_bytes BIGINT,
    file_hash TEXT
);

-- Índices para document_processing_results
CREATE INDEX IF NOT EXISTS idx_doc_processing_notice_id ON document_processing_results(notice_id);
CREATE INDEX IF NOT EXISTS idx_doc_processing_type ON document_processing_results(document_type);
CREATE INDEX IF NOT EXISTS idx_doc_processing_status ON document_processing_results(processing_status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_doc_processing_unique ON document_processing_results(notice_id, document_id);

-- Tabela de insights de propostas
CREATE TABLE IF NOT EXISTS proposal_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notice_id UUID NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
    company_id TEXT,
    
    -- Insights gerados
    insights JSONB NOT NULL,
    win_probability_score INTEGER CHECK (win_probability_score >= 0 AND win_probability_score <= 100),
    recommended_bid_value DECIMAL(15,2),
    
    -- Metadados
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true
);

-- Índices para proposal_insights
CREATE INDEX IF NOT EXISTS idx_proposal_insights_notice_id ON proposal_insights(notice_id);
CREATE INDEX IF NOT EXISTS idx_proposal_insights_company_id ON proposal_insights(company_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_proposal_insights_unique ON proposal_insights(notice_id, company_id) WHERE is_active = true;

-- Tabela de resultados de monitoramento de prazos
CREATE TABLE IF NOT EXISTS deadline_monitoring_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id TEXT NOT NULL,
    
    -- Resultado do monitoramento
    monitoring_result JSONB NOT NULL,
    total_deadlines INTEGER DEFAULT 0,
    critical_deadlines INTEGER DEFAULT 0,
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    monitoring_date DATE DEFAULT CURRENT_DATE
);

-- Índices para deadline_monitoring_results
CREATE INDEX IF NOT EXISTS idx_deadline_monitoring_company_id ON deadline_monitoring_results(company_id);
CREATE INDEX IF NOT EXISTS idx_deadline_monitoring_date ON deadline_monitoring_results(monitoring_date);

-- Tabela de logs do MCP
CREATE TABLE IF NOT EXISTS mcp_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id TEXT,
    user_id UUID,
    company_id TEXT,
    
    -- Dados da requisição
    method TEXT NOT NULL,
    tool_name TEXT,
    parameters JSONB,
    
    -- Dados da resposta
    response_status TEXT NOT NULL CHECK (response_status IN ('success', 'error', 'timeout')),
    response_data JSONB,
    error_message TEXT,
    
    -- Métricas
    execution_time_ms INTEGER,
    tokens_used INTEGER,
    cost_estimate DECIMAL(10,6),
    
    -- Metadados
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Índices para mcp_logs
CREATE INDEX IF NOT EXISTS idx_mcp_logs_created_at ON mcp_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_user_id ON mcp_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_company_id ON mcp_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_tool_name ON mcp_logs(tool_name);
CREATE INDEX IF NOT EXISTS idx_mcp_logs_response_status ON mcp_logs(response_status);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_notices_updated_at BEFORE UPDATE ON notices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_insights_updated_at BEFORE UPDATE ON proposal_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security)
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_processing_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadline_monitoring_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE mcp_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para notices (leitura pública, escrita restrita)
CREATE POLICY "Notices são visíveis para todos" ON notices
    FOR SELECT USING (true);

CREATE POLICY "Apenas sistema pode inserir notices" ON notices
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Apenas sistema pode atualizar notices" ON notices
    FOR UPDATE USING (auth.role() = 'service_role');

-- Políticas para user_follows (usuário só vê seus próprios seguimentos)
CREATE POLICY "Usuários veem apenas seus seguimentos" ON user_follows
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus seguimentos" ON user_follows
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus seguimentos" ON user_follows
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus seguimentos" ON user_follows
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para document_processing_results (leitura pública)
CREATE POLICY "Resultados de processamento são visíveis para todos" ON document_processing_results
    FOR SELECT USING (true);

CREATE POLICY "Apenas sistema pode inserir resultados de processamento" ON document_processing_results
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Políticas para proposal_insights (baseado em company_id)
CREATE POLICY "Insights visíveis para empresa proprietária" ON proposal_insights
    FOR SELECT USING (
        company_id IS NULL OR 
        company_id = current_setting('app.current_company_id', true)
    );

CREATE POLICY "Sistema pode inserir insights" ON proposal_insights
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Sistema pode atualizar insights" ON proposal_insights
    FOR UPDATE USING (auth.role() = 'service_role');

-- Políticas para deadline_monitoring_results (baseado em company_id)
CREATE POLICY "Monitoramento visível para empresa proprietária" ON deadline_monitoring_results
    FOR SELECT USING (
        company_id = current_setting('app.current_company_id', true)
    );

CREATE POLICY "Sistema pode inserir monitoramento" ON deadline_monitoring_results
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Políticas para mcp_logs (apenas sistema)
CREATE POLICY "Apenas sistema pode acessar logs" ON mcp_logs
    FOR ALL USING (auth.role() = 'service_role');

-- Views úteis
CREATE OR REPLACE VIEW notices_with_stats AS
SELECT 
    n.*,
    COUNT(uf.id) as followers_count,
    COUNT(dpr.id) as documents_processed,
    COUNT(pi.id) as insights_generated,
    EXTRACT(EPOCH FROM (n.submission_deadline - NOW())) / 86400 as days_until_deadline
FROM notices n
LEFT JOIN user_follows uf ON n.id = uf.notice_id AND uf.is_active = true
LEFT JOIN document_processing_results dpr ON n.id = dpr.notice_id
LEFT JOIN proposal_insights pi ON n.id = pi.notice_id AND pi.is_active = true
GROUP BY n.id;

-- View para dashboard de métricas
CREATE OR REPLACE VIEW mcp_metrics_dashboard AS
SELECT 
    DATE(created_at) as date,
    tool_name,
    response_status,
    COUNT(*) as requests_count,
    AVG(execution_time_ms) as avg_execution_time,
    SUM(tokens_used) as total_tokens,
    SUM(cost_estimate) as total_cost
FROM mcp_logs
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), tool_name, response_status
ORDER BY date DESC, requests_count DESC;

-- Função para busca semântica de editais
CREATE OR REPLACE FUNCTION search_notices(
    search_query TEXT,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    organ TEXT,
    modality TEXT,
    estimated_value DECIMAL(15,2),
    submission_deadline TIMESTAMPTZ,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.title,
        n.description,
        n.organ,
        n.modality,
        n.estimated_value,
        n.submission_deadline,
        ts_rank(
            to_tsvector('portuguese', n.title || ' ' || COALESCE(n.description, '')),
            plainto_tsquery('portuguese', search_query)
        ) as rank
    FROM notices n
    WHERE 
        to_tsvector('portuguese', n.title || ' ' || COALESCE(n.description, '')) 
        @@ plainto_tsquery('portuguese', search_query)
        AND n.status = 'active'
    ORDER BY rank DESC, n.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$ LANGUAGE plpgsql;

-- Comentários nas tabelas
COMMENT ON TABLE notices IS 'Tabela principal de editais de licitação';
COMMENT ON TABLE user_follows IS 'Seguimentos de usuários em editais específicos';
COMMENT ON TABLE document_processing_results IS 'Resultados do processamento de documentos com IA';
COMMENT ON TABLE proposal_insights IS 'Insights gerados para elaboração de propostas';
COMMENT ON TABLE deadline_monitoring_results IS 'Resultados do monitoramento de prazos';
COMMENT ON TABLE mcp_logs IS 'Logs de requisições do servidor MCP';

-- Inserir dados de exemplo (apenas em desenvolvimento)
-- INSERT INTO notices (title, description, organ, modality, estimated_value, submission_deadline) VALUES
-- ('Aquisição de Material de Escritório', 'Licitação para aquisição de material de escritório para o ano de 2024', 'Prefeitura Municipal', 'Pregão Eletrônico', 50000.00, NOW() + INTERVAL '15 days'),
-- ('Contratação de Serviços de Limpeza', 'Contratação de empresa para prestação de serviços de limpeza', 'Governo do Estado', 'Concorrência', 120000.00, NOW() + INTERVAL '30 days');

COMMIT;