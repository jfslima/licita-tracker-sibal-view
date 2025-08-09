// Serviço mock para simular dados do PNCP quando a API real não estiver disponível

export interface EditalPNCP {
  id: string;
  numero: string;
  objeto: string;
  valorEstimado: number;
  dataPublicacao: string;
  dataFinalProposta: string;
  modalidade: string;
  orgao: string;
  status: string;
  linkEdital: string;
}

export interface PNCPResponse {
  data: EditalPNCP[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Dados simulados de editais
const EDITAIS_MOCK: EditalPNCP[] = [
  {
    id: '1',
    numero: '001/2024',
    objeto: 'Aquisição de equipamentos de informática para modernização do parque tecnológico',
    valorEstimado: 250000.00,
    dataPublicacao: '2024-01-15',
    dataFinalProposta: '2024-02-15',
    modalidade: 'Pregão Eletrônico',
    orgao: 'Secretaria Municipal de Tecnologia',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/1'
  },
  {
    id: '2',
    numero: '002/2024',
    objeto: 'Contratação de serviços de limpeza e conservação predial',
    valorEstimado: 180000.00,
    dataPublicacao: '2024-01-20',
    dataFinalProposta: '2024-02-20',
    modalidade: 'Pregão Eletrônico',
    orgao: 'Prefeitura Municipal',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/2'
  },
  {
    id: '3',
    numero: '003/2024',
    objeto: 'Aquisição de medicamentos para unidades básicas de saúde',
    valorEstimado: 450000.00,
    dataPublicacao: '2024-01-25',
    dataFinalProposta: '2024-02-25',
    modalidade: 'Concorrência',
    orgao: 'Secretaria Municipal de Saúde',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/3'
  },
  {
    id: '4',
    numero: '004/2024',
    objeto: 'Reforma e ampliação de escola municipal',
    valorEstimado: 850000.00,
    dataPublicacao: '2024-01-30',
    dataFinalProposta: '2024-03-01',
    modalidade: 'Concorrência',
    orgao: 'Secretaria Municipal de Educação',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/4'
  },
  {
    id: '5',
    numero: '005/2024',
    objeto: 'Aquisição de veículos para transporte escolar',
    valorEstimado: 320000.00,
    dataPublicacao: '2024-02-01',
    dataFinalProposta: '2024-03-03',
    modalidade: 'Pregão Eletrônico',
    orgao: 'Secretaria Municipal de Educação',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/5'
  },
  {
    id: '6',
    numero: '006/2024',
    objeto: 'Contratação de empresa para pavimentação asfáltica',
    valorEstimado: 1200000.00,
    dataPublicacao: '2024-02-05',
    dataFinalProposta: '2024-03-05',
    modalidade: 'Concorrência',
    orgao: 'Secretaria Municipal de Obras',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/6'
  },
  {
    id: '7',
    numero: '007/2024',
    objeto: 'Aquisição de uniformes escolares',
    valorEstimado: 95000.00,
    dataPublicacao: '2024-02-08',
    dataFinalProposta: '2024-03-08',
    modalidade: 'Pregão Eletrônico',
    orgao: 'Secretaria Municipal de Educação',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/7'
  },
  {
    id: '8',
    numero: '008/2024',
    objeto: 'Serviços de consultoria em gestão pública',
    valorEstimado: 150000.00,
    dataPublicacao: '2024-02-10',
    dataFinalProposta: '2024-03-10',
    modalidade: 'Pregão Eletrônico',
    orgao: 'Gabinete do Prefeito',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/8'
  },
  {
    id: '9',
    numero: '009/2024',
    objeto: 'Aquisição de equipamentos médicos hospitalares',
    valorEstimado: 680000.00,
    dataPublicacao: '2024-02-12',
    dataFinalProposta: '2024-03-12',
    modalidade: 'Concorrência',
    orgao: 'Hospital Municipal',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/9'
  },
  {
    id: '10',
    numero: '010/2024',
    objeto: 'Contratação de serviços de segurança patrimonial',
    valorEstimado: 280000.00,
    dataPublicacao: '2024-02-14',
    dataFinalProposta: '2024-03-14',
    modalidade: 'Pregão Eletrônico',
    orgao: 'Secretaria Municipal de Administração',
    status: 'recebendo_proposta',
    linkEdital: 'https://pncp.gov.br/app/editais/10'
  }
];

export class PNCPMockService {
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async buscarEditais(params: any = {}): Promise<PNCPResponse> {
    // Simular delay de rede
    await this.delay(500 + Math.random() * 1000);

    const {
      pagina = 1,
      tamanhoPagina = 20,
      valorEstimadoMin,
      modalidadeId,
      dataFinalPropostaInicio,
      dataFinalPropostaFim
    } = params;

    let editaisFiltrados = [...EDITAIS_MOCK];

    // Aplicar filtros
    if (valorEstimadoMin) {
      editaisFiltrados = editaisFiltrados.filter(e => e.valorEstimado >= valorEstimadoMin);
    }

    if (modalidadeId === 1) { // Pregão Eletrônico
      editaisFiltrados = editaisFiltrados.filter(e => e.modalidade === 'Pregão Eletrônico');
    }

    if (dataFinalPropostaInicio && dataFinalPropostaFim) {
      editaisFiltrados = editaisFiltrados.filter(e => {
        const dataFinal = new Date(e.dataFinalProposta);
        const inicio = new Date(dataFinalPropostaInicio);
        const fim = new Date(dataFinalPropostaFim);
        return dataFinal >= inicio && dataFinal <= fim;
      });
    }

    // Paginação
    const startIndex = (pagina - 1) * tamanhoPagina;
    const endIndex = startIndex + tamanhoPagina;
    const editaisPaginados = editaisFiltrados.slice(startIndex, endIndex);

    return {
      data: editaisPaginados,
      totalElements: editaisFiltrados.length,
      totalPages: Math.ceil(editaisFiltrados.length / tamanhoPagina),
      currentPage: pagina,
      size: tamanhoPagina
    };
  }

  static async buscarEditaisAtivos(params: any = {}): Promise<PNCPResponse> {
    return this.buscarEditais({ ...params, status: 'recebendo_proposta' });
  }

  static async buscarEditaisPorModalidade(modalidadeId: number, params: any = {}): Promise<PNCPResponse> {
    return this.buscarEditais({ ...params, modalidadeId });
  }

  static async buscarEditaisPorPeriodo(dataInicio: string, dataFim: string, params: any = {}): Promise<PNCPResponse> {
    return this.buscarEditais({ 
      ...params, 
      dataFinalPropostaInicio: dataInicio, 
      dataFinalPropostaFim: dataFim 
    });
  }

  static async buscarEditaisPorTermo(termo: string, params: any = {}): Promise<PNCPResponse> {
    await this.delay(500 + Math.random() * 1000);
    
    const editaisFiltrados = EDITAIS_MOCK.filter(e => 
      e.objeto.toLowerCase().includes(termo.toLowerCase()) ||
      e.orgao.toLowerCase().includes(termo.toLowerCase())
    );

    const { pagina = 1, tamanhoPagina = 20 } = params;
    const startIndex = (pagina - 1) * tamanhoPagina;
    const endIndex = startIndex + tamanhoPagina;
    const editaisPaginados = editaisFiltrados.slice(startIndex, endIndex);

    return {
      data: editaisPaginados,
      totalElements: editaisFiltrados.length,
      totalPages: Math.ceil(editaisFiltrados.length / tamanhoPagina),
      currentPage: pagina,
      size: tamanhoPagina
    };
  }

  static async buscarEditaisAltoValor(params: any = {}): Promise<PNCPResponse> {
    return this.buscarEditais({ ...params, valorEstimadoMin: 100000 });
  }

  static async buscarEditaisVencimentoProximo(params: any = {}): Promise<PNCPResponse> {
    const hoje = new Date().toISOString().split('T')[0];
    const proximosSete = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    return this.buscarEditais({ 
      ...params, 
      dataFinalPropostaInicio: hoje, 
      dataFinalPropostaFim: proximosSete 
    });
  }

  static async buscarPregaoEletronico(params: any = {}): Promise<PNCPResponse> {
    return this.buscarEditais({ ...params, modalidadeId: 1 });
  }

  static async testarConexao(): Promise<{ sucesso: boolean; mensagem: string; dados?: any }> {
    await this.delay(1000);
    
    return {
      sucesso: true,
      mensagem: 'Conexão simulada com sucesso! Usando dados de exemplo.',
      dados: {
        totalEditais: EDITAIS_MOCK.length,
        ultimaAtualizacao: new Date().toISOString(),
        versaoAPI: 'mock-v1.0.0'
      }
    };
  }

  static limparCache(): void {
    // No mock service, não há cache real para limpar
    console.log('Cache simulado limpo');
  }

  static getEstatisticasCache(): any {
    return {
      tamanho: 0,
      hits: 0,
      misses: 0,
      ultimaLimpeza: new Date().toISOString()
    };
  }
}