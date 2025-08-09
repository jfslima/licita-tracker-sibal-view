# 📝 Changelog - n8n SIBAL Integration

## [2.0.0] - 2024-01-15 - Revisão Técnica Completa

### 🔒 Segurança

#### Adicionado
- **N8N_ENCRYPTION_KEY**: Variável obrigatória para criptografar credenciais no volume
- **GENERIC_TIMEZONE**: Configuração de timezone para América/São Paulo
- **Guia de segurança completo**: `SECURITY_SETUP.md` com práticas recomendadas
- **Script de validação**: `validate_setup.sh` para verificar configurações
- **Usuário SQL dedicado**: Instruções para criar usuário restrito em vez de usar `postgres`
- **Configuração de produção**: Reverse proxy Nginx e Docker Compose otimizado

#### Alterado
- **Credenciais PostgreSQL**: Recomendação de usar conexão direta em vez de REST API para melhor performance
- **Estrutura de credenciais**: Documentação clara sobre Postgres vs Supabase REST
- **Práticas de segurança**: Avisos sobre não commitar `.env.n8n` real e trocar senhas padrão

### 🗄️ Banco de Dados

#### Adicionado
- **Constraint de validação**: `risk_score` deve estar entre 0 e 1
- **Índice otimizado**: `idx_alerts_notice_id` para melhor performance
- **SQL corrigido**: Formatação adequada sem quebras de linha problemáticas

#### Alterado
- **Schema da tabela alerts**: Versão corrigida com constraints e índices

### 🔄 Workflow

#### Adicionado
- **Nó Classify Risk**: Etapa dedicada para classificação de risco
- **Filtro aprimorado**: Condição `risk_score > 0.8` mais robusta
- **Variáveis de ambiente**: Uso de `$env.MCP_BACKEND_URL` em vez de URL hardcoded
- **Formato de data corrigido**: `YYYY-MM-DD` para compatibilidade
- **Range de datas**: `date_from` e `date_to` para busca mais precisa

#### Alterado
- **Estrutura do workflow**: 6 nós conectados em sequência lógica
- **Credenciais**: Referências atualizadas para `postgres-sibal` e `telegram-bot`
- **Mapeamento de dados**: Uso de `defineBelow` para melhor controle
- **Mensagem Telegram**: Formato mais limpo e informativo

### 📊 Monitoramento

#### Adicionado
- **Testes de aceite**: Queries SQL para verificar inserções
- **Logs estruturados**: Comandos para monitoramento via Docker
- **Métricas de execução**: Configurações para observabilidade
- **Alertas de sistema**: Script para monitorar status do container
- **Backup automático**: Scripts para backup e restore

### 🚀 Próximas Evoluções

#### Planejado
- **Exportar relatório semanal**: Workflow Cron → Postgres → Google Sheets
- **Rotação de API Keys**: Integração com Supabase Secrets
- **Deduplicação**: Índice único em `notice_id`
- **Observabilidade avançada**: Save successful executions

### 📁 Arquivos

#### Adicionado
- `SECURITY_SETUP.md` - Guia completo de segurança
- `validate_setup.sh` - Script de validação automática
- `CHANGELOG.md` - Este arquivo

#### Alterado
- `.env.n8n.example` - Variáveis de segurança e configurações completas
- `README.md` - Documentação atualizada com novas seções
- `alerta_high_risk.json` - Workflow completamente reescrito

### 🔧 Melhorias Técnicas

#### Performance
- Conexão direta PostgreSQL em vez de REST API
- Índices otimizados na tabela `alerts`
- Configurações de limpeza automática de execuções

#### Manutenibilidade
- Documentação estruturada e completa
- Scripts de automação para validação e backup
- Separação clara entre desenvolvimento e produção

#### Confiabilidade
- Validação automática de configurações
- Testes de aceite documentados
- Monitoramento proativo de falhas

---

## [1.0.0] - 2024-01-01 - Versão Inicial

### Adicionado
- Configuração básica do n8n via Docker
- Workflow inicial de alertas de alto risco
- Integração básica com Supabase
- Documentação inicial

---

## 📋 Checklist de Migração v1.0 → v2.0

### Antes da Atualização
- [ ] Fazer backup do volume n8n atual
- [ ] Exportar workflows existentes
- [ ] Anotar credenciais configuradas

### Durante a Atualização
- [ ] Atualizar `.env.n8n` com novas variáveis
- [ ] Gerar `N8N_ENCRYPTION_KEY` única
- [ ] Criar usuário SQL dedicado (opcional)
- [ ] Executar SQL atualizado da tabela `alerts`
- [ ] Importar workflow `alerta_high_risk.json` atualizado

### Após a Atualização
- [ ] Executar `./validate_setup.sh`
- [ ] Testar workflow manualmente
- [ ] Verificar logs e métricas
- [ ] Configurar backup automático

### Validação Final
- [ ] Workflow executa sem erros
- [ ] Alertas são inseridos na tabela `alerts`
- [ ] Notificações Telegram funcionam
- [ ] Logs estruturados estão ativos
- [ ] Todas as validações do script passam

---

**Nota**: Esta versão 2.0 representa uma revisão técnica completa baseada em feedback de produção e melhores práticas de segurança e performance.