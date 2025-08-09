-- Criação simplificada da tabela notices
CREATE TABLE notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    organ TEXT NOT NULL,
    modality TEXT NOT NULL,
    estimated_value DECIMAL(15,2),
    opening_date TIMESTAMPTZ,
    submission_deadline TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'active',
    url TEXT,
    risk_level TEXT,
    risk_score INTEGER,
    risk_analysis JSONB,
    summary TEXT,
    detailed_summary JSONB,
    source_system TEXT DEFAULT 'sibal',
    external_id TEXT,
    document_urls TEXT[],
    tags TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Inserir dados de exemplo
INSERT INTO notices (title, description, organ, modality, estimated_value, submission_deadline) VALUES
('Aquisição de Drones para Monitoramento', 'Licitação para aquisição de drones para monitoramento urbano', 'Prefeitura Municipal', 'Pregão Eletrônico', 150000.00, NOW() + INTERVAL '15 days'),
('Contratação de Serviços de Tecnologia', 'Contratação de empresa para desenvolvimento de sistema', 'Governo do Estado', 'Concorrência', 300000.00, NOW() + INTERVAL '30 days'),
('Aquisição de Equipamentos de Segurança', 'Licitação para compra de equipamentos de segurança com drones', 'Secretaria de Segurança', 'Pregão Presencial', 75000.00, NOW() + INTERVAL '20 days');