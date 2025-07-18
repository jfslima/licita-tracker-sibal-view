// Mock service para integração com APIs de licitação
export const licitationApiIntegration = {
  async initialize() {
    console.log('🔧 LicitationApiIntegration inicializado (mock)');
    return Promise.resolve();
  },

  async search(params: any) {
    console.log('🔍 Buscando licitações:', params);
    // Retorna dados mock para desenvolvimento
    return {
      items: [],
      total: 0,
      page: 1,
      pageSize: 10
    };
  },

  async getFilters(tipoDoc: string) {
    console.log('📋 Carregando filtros para:', tipoDoc);
    return {
      orgaos: [],
      ufs: [],
      municipios: [],
      modalidades: []
    };
  }
};

export default licitationApiIntegration;