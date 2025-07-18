// Mock service para sistema de notificações
export const notificationSystem = {
  initialize() {
    console.log('🔔 NotificationSystem inicializado (mock)');
  },

  getNotifications(userId: string) {
    console.log('📬 Carregando notificações para:', userId);
    return [
      {
        id: 'notif_1',
        title: 'Nova licitação encontrada',
        message: 'Encontramos uma nova licitação que pode interessar',
        type: 'opportunity',
        read: false,
        createdAt: new Date().toISOString(),
        data: { licitacaoId: 'lic_001' }
      },
      {
        id: 'notif_2',
        title: 'Prazo se aproximando',
        message: 'Licitação XYZ tem prazo em 2 dias',
        type: 'deadline',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        data: { licitacaoId: 'lic_002' }
      }
    ];
  },

  markAsRead(notificationId: string) {
    console.log('✅ Marcando notificação como lida:', notificationId);
    return Promise.resolve();
  },

  createNotification(notification: any) {
    console.log('➕ Criando nova notificação:', notification.title);
    return Promise.resolve({
      id: 'notif_' + Date.now(),
      ...notification,
      createdAt: new Date().toISOString()
    });
  },

  deleteNotification(notificationId: string) {
    console.log('🗑️ Removendo notificação:', notificationId);
    return Promise.resolve();
  }
};

export default notificationSystem;