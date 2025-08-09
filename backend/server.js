const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Função de análise de risco usando IA local
const analyzeRiskWithAI = (content, noticeId) => {
  const factors = [];
  const recommendations = [];
  let score = 15; // Score base
  
  // Análise avançada de palavras-chave e padrões
  const riskPatterns = {
    // Urgência e emergência
    'urgente|emergencial|calamidade|estado.*emergência': {
      points: 40,
      factor: 'Situação de urgência ou emergência identificada',
      recommendation: 'Verificar documentação de emergência e prazos reduzidos'
    },
    
    // Complexidade técnica
    'complexo|complexa|alta.*complexidade|sofisticado|avançado': {
      points: 35,
      factor: 'Alta complexidade técnica do projeto',
      recommendation: 'Formar equipe técnica especializada e considerar parcerias'
    },
    
    // Prazos críticos
    'prazo.*curto|15.*dias|30.*dias|cronograma.*apertado': {
      points: 30,
      factor: 'Prazo de execução muito restrito',
      recommendation: 'Avaliar viabilidade do cronograma e recursos necessários'
    },
    
    // Tecnologias emergentes
    'inteligência.*artificial|machine.*learning|blockchain|iot|5g': {
      points: 25,
      factor: 'Tecnologias emergentes ou inovadoras',
      recommendation: 'Garantir expertise em tecnologias de ponta'
    },
    
    // Infraestrutura crítica
    'infraestrutura.*crítica|segurança.*nacional|dados.*sensíveis': {
      points: 35,
      factor: 'Infraestrutura crítica ou dados sensíveis',
      recommendation: 'Implementar medidas de segurança rigorosas'
    },
    
    // Valores elevados
    'milhões|bilhões|valor.*elevado|grande.*porte': {
      points: 20,
      factor: 'Projeto de alto valor financeiro',
      recommendation: 'Análise financeira detalhada e garantias adequadas'
    },
    
    // Documentação extensa
    'documentação.*extensa|requisitos.*rigorosos|certificações': {
      points: 15,
      factor: 'Documentação e certificações extensas',
      recommendation: 'Preparar documentação completa e certificações'
    },
    
    // Integração complexa
    'integração.*sistemas|interoperabilidade|múltiplas.*plataformas': {
      points: 25,
      factor: 'Integração complexa entre sistemas',
      recommendation: 'Mapear todas as integrações e dependências'
    },
    
    // Compliance e regulamentações
    'lgpd|gdpr|compliance|auditoria|regulamentação': {
      points: 20,
      factor: 'Requisitos de compliance e regulamentação',
      recommendation: 'Garantir conformidade com todas as regulamentações'
    }
  };
  
  // Analisar cada padrão
  for (const [pattern, config] of Object.entries(riskPatterns)) {
    const regex = new RegExp(pattern, 'i');
    if (regex.test(content)) {
      score += config.points;
      factors.push(config.factor);
      recommendations.push(config.recommendation);
    }
  }
  
  // Análise de sentimento e contexto
  const positiveWords = ['oportunidade', 'inovação', 'modernização', 'eficiência'];
  const negativeWords = ['risco', 'problema', 'dificuldade', 'limitação'];
  
  let sentimentScore = 0;
  positiveWords.forEach(word => {
    if (content.toLowerCase().includes(word)) sentimentScore += 5;
  });
  negativeWords.forEach(word => {
    if (content.toLowerCase().includes(word)) sentimentScore -= 5;
  });
  
  score += sentimentScore;
  
  // Recomendações baseadas no score final
  if (score > 80) {
    recommendations.push('Risco muito alto - Considerar não participação ou parceria estratégica');
    recommendations.push('Análise jurídica e técnica detalhada obrigatória');
  } else if (score > 60) {
    recommendations.push('Alto risco - Preparação extensiva necessária');
    recommendations.push('Considerar parceria ou consórcio');
  } else if (score > 40) {
    recommendations.push('Risco moderado - Preparação cuidadosa requerida');
    recommendations.push('Análise detalhada de requisitos');
  } else {
    recommendations.push('Baixo risco - Procedimentos padrão aplicáveis');
    recommendations.push('Oportunidade interessante para participação');
  }
  
  // Determinar nível de risco
  let risk_level;
  if (score >= 70) risk_level = 'high';
  else if (score >= 40) risk_level = 'medium';
  else risk_level = 'low';
  
  return {
    risk_level,
    risk_score: Math.min(score, 100),
    risk_factors: factors.length > 0 ? factors : ['Análise padrão - fatores de risco baixos'],
    recommendations: [...new Set(recommendations)], // Remove duplicatas
    analysis_timestamp: new Date().toISOString(),
    confidence_level: 0.85,
    source: 'SIBAL AI Risk Analyzer',
    notice_id: noticeId,
    sentiment_score: sentimentScore
  };
};

// Endpoint para análise de risco
app.post('/api/analyze-risk', (req, res) => {
  try {
    const { content, notice_id, analysis_type } = req.body;
    
    if (!content) {
      return res.status(400).json({
        error: 'Conteúdo do edital é obrigatório',
        code: 'MISSING_CONTENT'
      });
    }
    
    const analysis = analyzeRiskWithAI(content, notice_id || 'unknown');
    
    res.json({
      success: true,
      analysis,
      metadata: {
        analysis_type: analysis_type || 'comprehensive',
        processed_at: new Date().toISOString(),
        content_length: content.length
      }
    });
    
  } catch (error) {
    console.error('Erro na análise de risco:', error);
    res.status(500).json({
      error: 'Erro interno na análise de risco',
      code: 'ANALYSIS_ERROR',
      message: error.message
    });
  }
});

// Endpoint de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SIBAL Risk Analyzer',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Endpoint para listar capacidades
app.get('/api/capabilities', (req, res) => {
  res.json({
    services: [
      {
        name: 'Risk Analysis',
        endpoint: '/api/analyze-risk',
        description: 'Análise inteligente de risco para editais de licitação',
        methods: ['POST']
      }
    ],
    features: [
      'Análise de padrões de risco',
      'Detecção de complexidade técnica',
      'Avaliação de prazos críticos',
      'Identificação de tecnologias emergentes',
      'Análise de compliance',
      'Recomendações inteligentes'
    ]
  });
});

app.listen(port, () => {
  console.log(`🚀 SIBAL Risk Analyzer rodando em http://localhost:${port}`);
  console.log(`📊 Endpoint de análise: http://localhost:${port}/api/analyze-risk`);
  console.log(`❤️  Health check: http://localhost:${port}/api/health`);
});

module.exports = app;