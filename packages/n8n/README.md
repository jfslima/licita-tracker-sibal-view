# N8N Service - SIBAL

Serviço de automação e workflows para o projeto SIBAL usando n8n.

## 🚀 Setup Rápido

### Pré-requisitos
- Docker e Docker Compose instalados
- Arquivo `.env.n8n` configurado na raiz do projeto

### Iniciar o serviço

```bash
# Na raiz do projeto
pnpm n8n:dev

# Ou diretamente no diretório
cd packages/n8n
docker compose up -d
```

### Acessar a interface
- URL: http://localhost:5678
- Usuário: `sibal`
- Senha: `SibalN8n2024!@#$`

## 📁 Estrutura de Arquivos

```
packages/n8n/
├── Dockerfile              # Imagem customizada do n8n
├── docker-compose.yml      # Configuração para desenvolvimento
├── .env.n8n.example       # Variáveis de ambiente (template)
├── workflows/              # Workflows pré-configurados
│   └── alerta_high_risk.json
├── SECURITY_SETUP.md       # Guia de segurança e configuração avançada
├── validate_setup.sh       # Script de validação do setup
└── README.md              # Este arquivo
```

## ⚙️ Configuração

### Variáveis de Ambiente (.env.n8n)

```env
# N8N Configuration
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=sibal
N8N_BASIC_AUTH_PASSWORD=SibalN8n2024!@#$
N8N_HOST=localhost
WEBHOOK_TUNNEL_URL=http://localhost:5678/

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PROJECT_REF=your-project-ref
SUPABASE_DB_PASSWORD=your-db-password

# Telegram Configuration (opcional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-chat-id

# MCP Backend URL
MCP_BACKEND_URL=http://localhost:3002
```

### Credenciais no n8n

Para configurar a conexão com Supabase:

1. Acesse Settings > Credentials
2. Adicione nova credencial

#### Opção A: Credencial Postgres (Recomendado para melhor performance)

3. Selecione **Postgres**
4. Configure:

| Campo    | Valor                                                                       |
|----------|-----------------------------------------------------------------------------|
| Host     | `db.<PROJECT_REF>.supabase.co` (produção) ou `host.docker.internal` (local) |
| Port     | `5432` (prod) / `54322` (local)                                             |
| Database | `postgres`                                                                  |
| User     | `postgres` (ou usuário limitado)                                            |
| Password | `${SUPABASE_DB_PASSWORD}`                                                   |
| SSL      | ON (produção)                                                               |

#### Opção B: Credencial Supabase (via REST API)

3. Selecione **Supabase**
4. Configure:
   - **URL**: `https://<project-ref>.supabase.co`
   - **Service Role Key**: Sua chave `service_role`
   - **Name**: `Supabase SIBAL`

5. Teste a conexão e salve

> **Boa prática de segurança:** Criar um usuário restrito em vez de usar `postgres`:
> ```sql
> create user n8n_user with password 'SenhaForte!';
> grant usage on schema public to n8n_user;
> grant select, insert on alerts to n8n_user;
> ```

### Schema da tabela alerts

```sql
create table if not exists alerts (
  id bigserial primary key,
  notice_id text,
  title text,
  risk_score numeric(4,3),
  alert_type text,
  metadata jsonb,
  created_at timestamptz default now(),
  constraint risk_score_range check (risk_score between 0 and 1)
);
create index if not exists idx_alerts_notice_id on alerts (notice_id);
```

## 🔄 Workflows Disponíveis

### 1. Alerta High Risk (`alerta_high_risk.json`)

**Descrição**: Monitora editais de alto risco e envia alertas.

**Funcionamento**:
- **Trigger**: Cron job a cada 15 minutos
- **Busca**: POST para `/mcp/run/fetch_notices` com keyword "drones"
- **Filtro**: Risk score > 0.8
- **Ações**: 
  - Insere alerta no Supabase (tabela `alerts`)
  - Envia notificação via Telegram

**Importar workflow**:
1. Acesse n8n > Workflows
2. Clique em "Import from file"
3. Selecione `workflows/alerta_high_risk.json`
4. Configure as credenciais necessárias

## 💾 Backup e Restore

### Backup do volume n8n_data

```bash
# Criar backup
docker run --rm -v sibal_n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Listar backups
ls -la n8n_backup_*.tar.gz
```

### Restore do backup

```bash
# Parar o serviço
docker compose down

# Restaurar backup (substitua BACKUP_FILE pelo arquivo desejado)
docker run --rm -v sibal_n8n_data:/data -v $(pwd):/backup alpine sh -c "cd /data && tar xzf /backup/BACKUP_FILE"

# Reiniciar o serviço
docker compose up -d
```

### Backup de workflows específicos

```bash
# Exportar workflow via API
curl -u sibal:SibalN8n2024!@#$ \
  http://localhost:5678/api/v1/workflows/export \
  -o workflows_backup.json
```

## 🔧 Comandos Úteis

```bash
# Verificar logs
docker compose logs -f n8n

# Reiniciar serviço
docker compose restart n8n

# Parar serviço
docker compose down

# Limpar volumes (CUIDADO: apaga todos os dados)
docker compose down -v

# Rebuild da imagem
docker compose build --no-cache
```

## 🔐 Segurança

### Práticas Recomendadas

- **Nunca** commit a versão real de `.env.n8n` (apenas `.example`)
- Troque a senha exposta `SibalN8n2024!@#$` em produção
- Restrinja acesso à porta `5678` (reverse proxy + auth básica)
- Se usar `service_role` no n8n, ele ignora RLS: prefira usuário SQL dedicado
- Use `N8N_ENCRYPTION_KEY` para criptografar credenciais no volume
- Autenticação básica ativada por padrão
- Backup automático dos workflows

### Autenticação Básica
- **Usuário**: `sibal`
- **Senha**: `SibalN8n2024!@#$`

### Recomendações
1. **Altere a senha padrão** em produção
2. **Use HTTPS** em produção
3. **Configure firewall** para restringir acesso
4. **Faça backups regulares**
5. **Monitore logs** de acesso

### Validação Automática do Setup

Use o script de validação para verificar se tudo está configurado corretamente:

```bash
# Tornar o script executável
chmod +x validate_setup.sh

# Executar validação
./validate_setup.sh
```

O script verifica:
- ✅ Arquivos necessários
- ✅ Configurações do Docker
- ✅ Variáveis de ambiente
- ✅ Conectividade com serviços
- ✅ Estrutura do banco
- ✅ Configurações de segurança
- ✅ Validação do workflow JSON
- ✅ Status dos serviços

### Testes de Aceite

Depois de subir o n8n:

```sql
-- Verificar inserts
select * from alerts order by created_at desc limit 5;
```

Log do n8n (via docker):

```bash
docker compose -f packages/n8n/docker-compose.yml logs -f n8n
```

### Configuração Avançada

Para configurações de segurança, produção e troubleshooting avançado, consulte:

📖 **[SECURITY_SETUP.md](./SECURITY_SETUP.md)** - Guia completo de segurança e configuração avançada

## 🚀 Deploy em Produção

### Railway

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login e deploy
railway login
railway link
railway up
```

### Render

1. Conecte o repositório
2. Configure as variáveis de ambiente
3. Use o Dockerfile para build
4. Configure domínio personalizado

## 📊 Monitoramento

### Health Check

```bash
# Verificar se n8n está respondendo
curl -f http://localhost:5678/healthz || echo "N8N não está respondendo"
```

### Métricas
- Acesse http://localhost:5678/metrics (se habilitado)
- Monitore logs via `docker compose logs`
- Use ferramentas como Grafana + Prometheus

## 🚀 Próximas Evoluções

| Feature                    | Como fazer                                                                |
|----------------------------|--------------------------------------------------------------------------|
| Exportar relatório semanal | Novo workflow: Cron → Postgres SELECT → Google Sheets                     |
| Rotação de API Keys        | Guardar em Supabase Secrets + n8n "HTTP Request" chama Edge que lê secret |
| Deduplicação               | Adicionar índice único: `create unique index on alerts (notice_id);`      |
| Observabilidade            | Ativar "Save successful executions" (Settings › Execution data)           |

## 🆘 Troubleshooting

### Problemas Comuns

1. **Porta 5678 já em uso**
   ```bash
   # Verificar processo usando a porta
   netstat -tulpn | grep 5678
   # Alterar porta no docker-compose.yml
   ```

2. **Erro de permissão no volume**
   ```bash
   # Corrigir permissões
   docker run --rm -v sibal_n8n_data:/data alpine chown -R 1000:1000 /data
   ```

3. **Credenciais Supabase não funcionam**
   - Verifique se as variáveis estão corretas no `.env.n8n`
   - Teste conexão direta com psql
   - Verifique firewall do Supabase

4. **Workflow não executa**
   - Verifique se está ativo
   - Confira logs de execução
   - Teste manualmente cada nó

## 📚 Recursos Adicionais

- [Documentação oficial n8n](https://docs.n8n.io/)
- [Community nodes](https://n8n.io/integrations/)
- [n8n Templates](https://n8n.io/workflows/)
- [API Reference](https://docs.n8n.io/api/)

## 🤝 Contribuição

Para adicionar novos workflows:

1. Crie o workflow na interface n8n
2. Exporte como JSON
3. Salve em `workflows/`
4. Documente no README
5. Faça commit das alterações

---

**Nota**: Este serviço faz parte do ecossistema SIBAL e integra com o backend MCP e Supabase.