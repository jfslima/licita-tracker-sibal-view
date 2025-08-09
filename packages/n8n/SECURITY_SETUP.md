# 🔒 Guia de Segurança e Configuração Avançada - n8n SIBAL

## 📋 Checklist de Segurança

### ✅ Configuração Inicial Segura

1. **Gerar chave de criptografia única**
   ```bash
   # Gerar chave aleatória de 32 bytes
   openssl rand -hex 32
   # Ou usar Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Configurar `.env.n8n` (NÃO committar)**
   ```bash
   cp .env.n8n.example .env.n8n
   # Editar com valores reais
   ```

3. **Trocar senha padrão**
   ```bash
   # Substituir SibalN8n2024!@#$ por senha forte
   N8N_BASIC_AUTH_PASSWORD=SuaSenhaForteAqui123!@#
   ```

### 🔐 Usuário SQL Dedicado (Recomendado)

```sql
-- 1. Criar usuário específico para n8n
CREATE USER n8n_user WITH PASSWORD 'SenhaForteN8N2024!';

-- 2. Conceder permissões mínimas necessárias
GRANT USAGE ON SCHEMA public TO n8n_user;
GRANT SELECT, INSERT ON alerts TO n8n_user;
GRANT USAGE, SELECT ON SEQUENCE alerts_id_seq TO n8n_user;

-- 3. (Opcional) Permissões para outras tabelas futuras
-- GRANT SELECT ON notices TO n8n_user;
-- GRANT SELECT ON classifications TO n8n_user;

-- 4. Verificar permissões
\dp alerts
```

### 🌐 Configuração de Produção

#### Reverse Proxy com Nginx

```nginx
server {
    listen 443 ssl;
    server_name n8n.sibal.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Restringir acesso por IP (opcional)
    allow 192.168.1.0/24;
    allow 10.0.0.0/8;
    deny all;
}
```

#### Docker Compose para Produção

```yaml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_BASIC_AUTH_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=${N8N_HOST}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - N8N_LOG_LEVEL=info
      - N8N_METRICS=true
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - sibal-network
    # Não expor porta diretamente em produção
    # ports:
    #   - "5678:5678"
    
volumes:
  n8n_data:
    driver: local
    
networks:
  sibal-network:
    external: true
```

## 🔍 Monitoramento e Auditoria

### Logs Estruturados

```bash
# Visualizar logs em tempo real
docker compose logs -f n8n

# Filtrar por nível de log
docker compose logs n8n | grep ERROR
docker compose logs n8n | grep WARN

# Exportar logs para análise
docker compose logs --since 24h n8n > n8n_logs_$(date +%Y%m%d).log
```

### Métricas de Execução

```sql
-- Monitorar inserções de alertas
SELECT 
    DATE(created_at) as data,
    COUNT(*) as total_alertas,
    AVG(risk_score) as risk_medio,
    MAX(risk_score) as risk_maximo
FROM alerts 
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY data DESC;

-- Verificar alertas duplicados
SELECT notice_id, COUNT(*) as duplicatas
FROM alerts
GROUP BY notice_id
HAVING COUNT(*) > 1;
```

### Alertas de Sistema

```bash
# Script de monitoramento (cron a cada 5 min)
#!/bin/bash
CONTAINER_STATUS=$(docker compose ps n8n --format json | jq -r '.State')

if [ "$CONTAINER_STATUS" != "running" ]; then
    curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
         -d "chat_id=${TELEGRAM_CHAT_ID}" \
         -d "text=🚨 n8n SIBAL está DOWN! Status: $CONTAINER_STATUS"
fi
```

## 🔄 Backup e Recuperação

### Backup Automático

```bash
#!/bin/bash
# backup_n8n.sh
BACKUP_DIR="/backup/n8n"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do volume Docker
docker run --rm -v n8n_data:/data -v $BACKUP_DIR:/backup alpine \
    tar czf /backup/n8n_data_$DATE.tar.gz -C /data .

# Backup das credenciais (criptografadas)
cp .env.n8n $BACKUP_DIR/env_backup_$DATE

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "n8n_data_*.tar.gz" -mtime +7 -delete
```

### Restauração

```bash
#!/bin/bash
# restore_n8n.sh
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <arquivo_backup.tar.gz>"
    exit 1
fi

# Parar n8n
docker compose down

# Restaurar dados
docker run --rm -v n8n_data:/data -v $(pwd):/backup alpine \
    tar xzf /backup/$BACKUP_FILE -C /data

# Reiniciar n8n
docker compose up -d
```

## 🚀 Otimizações de Performance

### Configurações Avançadas

```yaml
# docker-compose.yml - seção environment
N8N_EXECUTIONS_DATA_PRUNE=true
N8N_EXECUTIONS_DATA_MAX_AGE=168  # 7 dias
N8N_EXECUTIONS_DATA_PRUNE_MAX_COUNT=10000
N8N_LOG_LEVEL=warn  # Reduzir logs em produção
N8N_METRICS=true
N8N_QUEUE_BULL_REDIS_HOST=redis  # Se usar Redis
```

### Limpeza Periódica

```sql
-- Limpar execuções antigas (executar semanalmente)
DELETE FROM execution_entity 
WHERE "startedAt" < NOW() - INTERVAL '30 days';

-- Limpar logs antigos
DELETE FROM execution_data 
WHERE "executionId" NOT IN (
    SELECT id FROM execution_entity
);
```

## 📊 Checklist de Deploy

- [ ] Chave de criptografia única gerada
- [ ] Senha padrão alterada
- [ ] Usuário SQL dedicado criado
- [ ] Reverse proxy configurado
- [ ] SSL/TLS ativado
- [ ] Firewall configurado
- [ ] Backup automático ativo
- [ ] Monitoramento configurado
- [ ] Logs estruturados ativados
- [ ] Workflow testado em staging
- [ ] Credenciais validadas
- [ ] Alertas de sistema configurados

## 🆘 Troubleshooting Avançado

### Problemas Comuns

1. **Erro de conexão Postgres**
   ```bash
   # Verificar conectividade
   docker exec -it n8n_container psql -h db.xxx.supabase.co -U postgres -d postgres
   ```

2. **Credenciais não funcionam**
   ```bash
   # Verificar variáveis de ambiente
   docker exec -it n8n_container env | grep SUPABASE
   ```

3. **Workflow não executa**
   ```bash
   # Verificar logs detalhados
   docker compose logs n8n | grep -A 10 -B 10 "alerta-high-risk"
   ```

4. **Performance lenta**
   ```sql
   -- Verificar índices
   \d+ alerts
   
   -- Analisar queries lentas
   SELECT query, mean_exec_time, calls 
   FROM pg_stat_statements 
   WHERE query LIKE '%alerts%'
   ORDER BY mean_exec_time DESC;
   ```

---

**⚠️ Importante:** Sempre teste as configurações em ambiente de desenvolvimento antes de aplicar em produção.