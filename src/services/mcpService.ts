/**
 * Serviço de integração com o MCP Server
 * Fornece interface tipada para comunicação com o servidor MCP via webhook
 */

import axios, { AxiosResponse } from 'axios';

// Tipos para o protocolo MCP
export interface MCPRequest {
  method: string;
  params?: any;
}

export interface MCPResponse {
  content?: Array<{
    type: string;
    text: string;
  }>;
  tools?: Array<{
    name: string;
    description: string;
    inputSchema: any;
  }>;
  error?: {
    code: number;
    message: string;
  };
  isError?: boolean;
  protocolVersion?: string;
  capabilities?: any;
  serverInfo?: {
    name: string;
    version: string;
  };
}

// Tipos específicos para as ferramentas SIBAL
export interface Notice {
  id: string;
  title: string;
  description: string;
  status: string;
  deadline: string;
  value: number;
}

export interface FetchNoticesParams {
  query?: string;
  limit?: number;
  status?: string;
}

export interface FetchNoticesResponse {
  notices: Notice[];
  total: number;
}

export interface RiskClassifierParams {
  notice_content: string;
  notice_id?: string;
}

export interface RiskClassifierResponse {
  risk_level: 'low' | 'medium' | 'high';
  risk_score: number;
  risk_factors: string[];
  recommendations: string[];
}

class MCPService {
  private readonly webhookUrl: string;
  private readonly timeout: number;

  constructor(webhookUrl: string = 'http://localhost:5678/webhook/mcp', timeout: number = 10000) {
    this.webhookUrl = webhookUrl;
    this.timeout = timeout;
  }

  /**
   * Faz uma chamada genérica para o MCP Server
   */
  private async callMCP(method: string, params?: any): Promise<MCPResponse | null> {
    try {
      const response: AxiosResponse<MCPResponse> = await axios.post(
        this.webhookUrl,
        { method, params },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: this.timeout,
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao chamar MCP método ${method}:`, error);
      if (axios.isAxiosError(error)) {
        throw new Error(`MCP Error: ${error.response?.data?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Inicializa a conexão com o MCP Server
   */
  async initialize(): Promise<MCPResponse> {
    const response = await this.callMCP('initialize');
    if (!response) {
      throw new Error('Falha ao inicializar MCP Server');
    }
    return response;
  }

  /**
   * Lista todas as ferramentas disponíveis no MCP Server
   */
  async listTools(): Promise<Array<{ name: string; description: string; inputSchema: any }>> {
    const response = await this.callMCP('tools/list');
    if (!response || !response.tools) {
      throw new Error('Falha ao listar ferramentas do MCP');
    }
    return response.tools;
  }

  /**
   * Busca editais de licitação com filtros opcionais
   */
  async fetchNotices(params: FetchNoticesParams = {}): Promise<FetchNoticesResponse> {
    const response = await this.callMCP('tools/call', {
      name: 'fetch_notices',
      arguments: params
    });

    if (!response || response.isError) {
      throw new Error(response?.content?.[0]?.text || 'Erro ao buscar editais');
    }

    try {
      const result = JSON.parse(response.content?.[0]?.text || '{}');
      return result as FetchNoticesResponse;
    } catch (error) {
      throw new Error('Erro ao processar resposta da busca de editais');
    }
  }

  /**
   * Classifica o risco de um edital de licitação
   */
  async classifyRisk(params: RiskClassifierParams): Promise<RiskClassifierResponse> {
    const response = await this.callMCP('tools/call', {
      name: 'risk_classifier',
      arguments: params
    });

    if (!response || response.isError) {
      throw new Error(response?.content?.[0]?.text || 'Erro ao classificar risco');
    }

    try {
      const result = JSON.parse(response.content?.[0]?.text || '{}');
      return result as RiskClassifierResponse;
    } catch (error) {
      throw new Error('Erro ao processar resposta da classificação de risco');
    }
  }

  /**
   * Verifica se o MCP Server está disponível
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.initialize();
      return true;
    } catch (error) {
      console.warn('MCP Server não está disponível:', error);
      return false;
    }
  }

  /**
   * Busca editais com classificação de risco automática
   */
  async fetchNoticesWithRisk(params: FetchNoticesParams = {}): Promise<Array<Notice & { risk?: RiskClassifierResponse }>> {
    const noticesResponse = await this.fetchNotices(params);
    
    const noticesWithRisk = await Promise.all(
      noticesResponse.notices.map(async (notice) => {
        try {
          const risk = await this.classifyRisk({
            notice_content: `${notice.title} - ${notice.description}`,
            notice_id: notice.id
          });
          return { ...notice, risk };
        } catch (error) {
          console.warn(`Erro ao classificar risco do edital ${notice.id}:`, error);
          return notice;
        }
      })
    );

    return noticesWithRisk;
  }
}

// Instância singleton do serviço
export const mcpService = new MCPService();

// Hook React para usar o MCP Service
export function useMCPService() {
  return mcpService;
}

export default MCPService;