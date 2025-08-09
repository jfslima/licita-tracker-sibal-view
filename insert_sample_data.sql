-- Script para inserir dados de exemplo na tabela notices
-- Execute este script no Supabase Dashboard > SQL Editor

-- Inserir editais de exemplo
INSERT INTO notices (title, description, organ, modality, estimated_value, submission_deadline, status, url) VALUES
(
    'Aquisição de Material de Escritório',
    'Licitação para aquisição de material de escritório para o ano de 2024, incluindo papel, canetas, grampeadores, pastas e demais materiais necessários para o funcionamento administrativo.',
    'Prefeitura Municipal de São Paulo',
    'Pregão Eletrônico',
    50000.00,
    NOW() + INTERVAL '15 days',
    'active',
    'https://exemplo.gov.br/licitacao/001'
),
(
    'Contratação de Serviços de Limpeza',
    'Contratação de empresa para prestação de serviços de limpeza e conservação predial para os prédios públicos municipais.',
    'Governo do Estado de São Paulo',
    'Concorrência',
    120000.00,
    NOW() + INTERVAL '30 days',
    'active',
    'https://exemplo.gov.br/licitacao/002'
),
(
    'Aquisição de Equipamentos de Informática',
    'Pregão eletrônico para aquisição de computadores, impressoras, monitores e equipamentos de rede para modernização do parque tecnológico.',
    'Ministério da Educação',
    'Pregão Eletrônico',
    250000.00,
    NOW() + INTERVAL '20 days',
    'active',
    'https://exemplo.gov.br/licitacao/003'
),
(
    'Serviços de Manutenção Predial',
    'Contratação de empresa especializada em manutenção predial, incluindo serviços elétricos, hidráulicos e estruturais.',
    'Tribunal de Justiça',
    'Tomada de Preços',
    80000.00,
    NOW() + INTERVAL '25 days',
    'active',
    'https://exemplo.gov.br/licitacao/004'
),
(
    'Aquisição de Drones para Monitoramento',
    'Pregão para aquisição de drones equipados com câmeras de alta resolução para monitoramento ambiental e de segurança pública.',
    'Secretaria de Segurança Pública',
    'Pregão Eletrônico',
    180000.00,
    NOW() + INTERVAL '18 days',
    'active',
    'https://exemplo.gov.br/licitacao/005'
),
(
    'Contratação de Software de Gestão',
    'Licitação para contratação de licenças de software de gestão empresarial (ERP) para modernização dos processos administrativos.',
    'Prefeitura Municipal do Rio de Janeiro',
    'Concorrência',
    300000.00,
    NOW() + INTERVAL '35 days',
    'active',
    'https://exemplo.gov.br/licitacao/006'
);

-- Verificar os dados inseridos
SELECT 
    id,
    title,
    organ,
    modality,
    estimated_value,
    submission_deadline,
    status,
    created_at
FROM notices
ORDER BY created_at DESC;

-- Estatísticas dos dados inseridos
SELECT 
    COUNT(*) as total_notices,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_notices,
    SUM(estimated_value) as total_value,
    AVG(estimated_value) as avg_value,
    COUNT(DISTINCT organ) as unique_organs,
    COUNT(DISTINCT modality) as unique_modalities
FROM notices;