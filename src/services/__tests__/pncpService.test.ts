// Testes automatizados para o serviço PNCP

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { pncpService } from '../pncpService';
import { cache } from '../../utils/cache';
import { logger } from '../../utils/logger';
import { metrics } from '../../utils/metrics';

// Mock das dependências
vi.mock('../../utils/cache');
vi.mock('../../utils/logger');
vi.mock('../../utils/metrics');

// Mock do fetch global
const mockFetch = vi.fn() as Mock;
global.fetch = mockFetch;

describe('PNCPService', () => {
  const mockCacheGet = vi.mocked(cache.get);
  const mockCacheSet = vi.mocked(cache.set);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('buscarEditais', () => {
    it('deve aplicar parâmetros padrão quando opcionais não são fornecidos', async () => {
      // Quando nenhum parâmetro é passado o serviço deve usar DEFAULT_PARAMS e não lançar erro
      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [], meta: { total: 0 } }),
        status: 200
      });

      await expect(pncpService.buscarEditais({})).resolves.toEqual({ data: [], meta: { total: 0 } });
      expect(mockFetch).toHaveBeenCalled();
    });

    it('deve retornar dados do cache quando disponível', async () => {
      const mockData = {
        data: [{ sequencial: 1, numeroControlePNCP: 'test' }],
        meta: { total: 1, current_page: 1 }
      };

      mockCacheGet.mockReturnValue(mockData);

      const result = await pncpService.buscarEditais({ q: 'teste' });

      expect(result).toEqual(mockData);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('deve fazer requisição HTTP quando cache não disponível', async () => {
      const mockData = {
        data: [{ sequencial: 1, numeroControlePNCP: 'test' }],
        meta: { total: 1, current_page: 1 }
      };

      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData),
        status: 200
      });

      const result = await pncpService.buscarEditais({ q: 'teste' });

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=teste'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'User-Agent': expect.stringContaining('SIBAL-LicitaTracker')
          })
        })
      );
      expect(mockCacheSet).toHaveBeenCalled();
    });

    it('deve tratar erros HTTP adequadamente', async () => {
      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      });

      await expect(pncpService.buscarEditais({ q: 'teste' })).rejects.toThrow(
        expect.stringContaining('404')
      );
    });

    it('deve tratar timeout adequadamente', async () => {
      mockCacheGet.mockReturnValue(null);
      const abortError = new Error('Timeout');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValue(abortError);

      await expect(pncpService.buscarEditais({ q: 'teste' })).rejects.toThrow('Timeout');
    });
  });

  describe('buscarEditaisAtivos', () => {
    it('deve buscar editais com status recebendo_proposta', async () => {
      const mockData = {
        data: [{ sequencial: 1, situacaoEdital: 'recebendo_proposta' }],
        meta: { total: 1 }
      };

      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await pncpService.buscarEditaisAtivos();

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=recebendo_proposta'),
        expect.any(Object)
      );
    });
  });

  describe('buscarEditaisPorPeriodo', () => {
    it('deve validar formato de datas', async () => {
      await expect(
        pncpService.buscarEditaisPorPeriodo('data-invalida', '2024-01-01')
      ).rejects.toThrow('Formato de data inválido');
    });

    it('deve validar ordem das datas', async () => {
      await expect(
        pncpService.buscarEditaisPorPeriodo('2024-01-02', '2024-01-01')
      ).rejects.toThrow('Data de início deve ser anterior à data de fim');
    });

    it('deve buscar editais no período especificado', async () => {
      const mockData = {
        data: [{ sequencial: 1 }],
        meta: { total: 1 }
      };

      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const result = await pncpService.buscarEditaisPorPeriodo('2024-01-01', '2024-01-31');

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('data_inicio=2024-01-01'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('data_fim=2024-01-31'),
        expect.any(Object)
      );
    });
  });

  describe('obterFiltrosDisponiveis', () => {
    it('deve retornar filtros disponíveis', async () => {
      const mockFilters = {
        filters: {
          modalidades: [
            { id: '1', nome: 'Pregão Eletrônico', total: 100 }
          ],
          orgaos: [
            { id: '1', cnpj: '12345678000100', nome: 'Órgão Teste', total: 50 }
          ]
        }
      };

      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockFilters)
      });

      const result = await pncpService.obterFiltrosDisponiveis();

      expect(result).toEqual(mockFilters);
    });
  });

  describe('buscarEditaisAvancado', () => {
    it('deve construir query com filtros avançados', async () => {
      const mockData = {
        data: [{ sequencial: 1 }],
        meta: { total: 1 }
      };

      mockCacheGet.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockData)
      });

      const filtros = {
        modalidades: [1, 2],
        ufs: ['SP', 'RJ'],
        valorMin: 1000,
        valorMax: 50000,
        termo: 'equipamentos'
      };

      const result = await pncpService.buscarEditaisAvancado(filtros);

      expect(result).toEqual(mockData);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('modalidade_id=1%2C2'),
        expect.any(Object)
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('uf=SP%2CRJ'),
        expect.any(Object)
      );
    });
  });

  describe('converterEditalParaFormato', () => {
    it('deve converter edital PNCP para formato interno', () => {
      const editalPNCP = {
        sequencial: 123,
        numeroControlePNCP: 'PNCP123',
        linkSistemaOrigem: 'http://exemplo.com',
        dataPublicacaoPncp: '2024-01-15T10:00:00Z',
        situacaoEdital: 'recebendo_proposta',
        modalidadeId: 1,
        modalidadeNome: 'Pregão Eletrônico',
        unidadeOrgao: {
          ufNome: 'São Paulo',
          ufSigla: 'SP',
          municipioNome: 'São Paulo',
          codigoIbge: '3550308',
          nomeOrgao: 'Prefeitura Municipal',
          cnpj: '12345678000100',
          esferaId: 'M',
          poderId: 'E'
        },
        objetoContratacao: 'Aquisição de equipamentos',
        valorEstimadoTotal: 50000,
        srp: false,
        itens: [
          {
            numero: 1,
            descricao: 'Computador',
            quantidade: 10,
            unidadeMedida: 'UN',
            valorUnitarioEstimado: 2000,
            valorTotal: 20000
          }
        ]
      };

      const resultado = pncpService.converterEditalParaFormato(editalPNCP);

      expect(resultado).toEqual({
        id: 'PNCP123',
        sequencial: 123,
        titulo: 'Aquisição de equipamentos',
        objeto: 'Aquisição de equipamentos',
        orgao: 'Prefeitura Municipal',
        uf: 'SP',
        municipio: 'São Paulo',
        modalidade: 'Pregão Eletrônico',
        modalidadeId: 1,
        situacao: 'recebendo_proposta',
        valorEstimado: 50000,
        dataPublicacao: '15/01/2024',
        linkOrigem: 'http://exemplo.com',
        cnpjOrgao: '12345678000100',
        srp: false,
        itens: [
          {
            numero: 1,
            descricao: 'Computador',
            quantidade: 10,
            unidadeMedida: 'UN',
            valorUnitarioEstimado: 2000,
            valorTotal: 20000
          }
        ]
      });
    });
  });

  describe('calcularEstatisticas', () => {
    it('deve calcular estatísticas dos editais', () => {
      const editais = [
        {
          modalidade: 'Pregão Eletrônico',
          uf: 'SP',
          situacao: 'recebendo_proposta',
          valorEstimado: 10000
        },
        {
          modalidade: 'Pregão Eletrônico',
          uf: 'RJ',
          situacao: 'homologado',
          valorEstimado: 20000
        },
        {
          modalidade: 'Concorrência',
          uf: 'SP',
          situacao: 'recebendo_proposta',
          valorEstimado: 30000
        }
      ];

      const stats = pncpService.calcularEstatisticas(editais as any);

      expect(stats).toEqual({
        total: 3,
        valorTotal: 60000,
        porModalidade: {
          'Pregão Eletrônico': 2,
          'Concorrência': 1
        },
        porUF: {
          'SP': 2,
          'RJ': 1
        },
        porSituacao: {
          'recebendo_proposta': 2,
          'homologado': 1
        },
        mediaValor: 20000
      });
    });
  });

  describe('formatarValor', () => {
    it('deve formatar valores monetários corretamente', () => {
      expect(pncpService.formatarValor(1234.56)).toBe('R$ 1.234,56');
      expect(pncpService.formatarValor(0)).toBe('R$ 0,00');
      expect(pncpService.formatarValor(1000000)).toBe('R$ 1.000.000,00');
    });
  });

  describe('formatarData', () => {
    it('deve formatar datas ISO para formato brasileiro', () => {
      expect(pncpService.formatarData('2024-01-15T10:00:00Z')).toBe('15/01/2024');
      expect(pncpService.formatarData('2024-12-31')).toBe('31/12/2024');
    });

    it('deve retornar string vazia para datas inválidas', () => {
      expect(pncpService.formatarData('data-invalida')).toBe('');
      expect(pncpService.formatarData('')).toBe('');
    });
  });

  describe('limparCache', () => {
    it('deve limpar o cache', () => {
      const mockCacheClear = vi.fn();
      (cache as any).clear = mockCacheClear;

      pncpService.limparCache();

      expect(mockCacheClear).toHaveBeenCalled();
    });
  });

  describe('getEstatisticasCache', () => {
    it('deve retornar estatísticas do cache', () => {
      const mockStats = { size: 10, hits: 50, misses: 5 };
      (cache as any).getStats = vi.fn().mockReturnValue(mockStats);

      const stats = pncpService.getEstatisticasCache();

      expect(stats).toEqual(mockStats);
    });
  });
});

// Testes de integração (comentados por padrão)
/*
describe('PNCPService - Testes de Integração', () => {
  let pncpService: PNCPService;

  beforeEach(() => {
    pncpService = new PNCPService();
  });

  it('deve buscar editais reais da API PNCP', async () => {
    const resultado = await pncpService.buscarEditais({
      q: 'equipamentos',
      tam_pagina: 5
    });

    expect(resultado).toHaveProperty('data');
    expect(resultado).toHaveProperty('meta');
    expect(Array.isArray(resultado.data)).toBe(true);
  }, 30000); // 30 segundos timeout

  it('deve buscar filtros reais da API PNCP', async () => {
    const filtros = await pncpService.obterFiltrosDisponiveis();

    expect(filtros).toHaveProperty('filters');
    expect(filtros.filters).toHaveProperty('modalidades');
    expect(Array.isArray(filtros.filters.modalidades)).toBe(true);
  }, 30000);
});
*/