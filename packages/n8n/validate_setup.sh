#!/bin/bash

# 🔍 Script de Validação - n8n SIBAL Setup
# Verifica se todas as configurações estão corretas antes do deploy

set -e

echo "🔍 Iniciando validação do setup n8n SIBAL..."
echo "================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
SUCCESS=0

# Função para log
log_error() {
    echo -e "${RED}❌ ERRO: $1${NC}"
    ((ERRORS++))
}

log_warning() {
    echo -e "${YELLOW}⚠️  AVISO: $1${NC}"
    ((WARNINGS++))
}

log_success() {
    echo -e "${GREEN}✅ OK: $1${NC}"
    ((SUCCESS++))
}

echo "\n📁 1. Verificando arquivos necessários..."

# Verificar arquivos obrigatórios
if [ -f "docker-compose.yml" ]; then
    log_success "docker-compose.yml encontrado"
else
    log_error "docker-compose.yml não encontrado"
fi

if [ -f ".env.n8n.example" ]; then
    log_success ".env.n8n.example encontrado"
else
    log_error ".env.n8n.example não encontrado"
fi

if [ -f ".env.n8n" ]; then
    log_success ".env.n8n encontrado"
else
    log_warning ".env.n8n não encontrado - copie de .env.n8n.example"
fi

if [ -f "workflows/alerta_high_risk.json" ]; then
    log_success "Workflow alerta_high_risk.json encontrado"
else
    log_error "Workflow alerta_high_risk.json não encontrado"
fi

echo "\n🔧 2. Verificando configurações do Docker..."

# Verificar se Docker está rodando
if docker info > /dev/null 2>&1; then
    log_success "Docker está rodando"
else
    log_error "Docker não está rodando ou não está acessível"
fi

# Verificar se docker-compose está disponível
if command -v docker-compose > /dev/null 2>&1; then
    log_success "docker-compose está disponível"
else
    log_error "docker-compose não está instalado"
fi

echo "\n🔐 3. Verificando variáveis de ambiente..."

if [ -f ".env.n8n" ]; then
    source .env.n8n
    
    # Verificar variáveis críticas
    if [ -n "$N8N_ENCRYPTION_KEY" ]; then
        if [ ${#N8N_ENCRYPTION_KEY} -ge 32 ]; then
            log_success "N8N_ENCRYPTION_KEY configurada (${#N8N_ENCRYPTION_KEY} caracteres)"
        else
            log_warning "N8N_ENCRYPTION_KEY muito curta (${#N8N_ENCRYPTION_KEY} caracteres, recomendado: 32+)"
        fi
    else
        log_error "N8N_ENCRYPTION_KEY não configurada"
    fi
    
    if [ "$N8N_BASIC_AUTH_PASSWORD" = "SibalN8n2024!@#$" ]; then
        log_warning "Senha padrão detectada - altere em produção"
    elif [ -n "$N8N_BASIC_AUTH_PASSWORD" ]; then
        log_success "Senha personalizada configurada"
    else
        log_error "N8N_BASIC_AUTH_PASSWORD não configurada"
    fi
    
    if [ -n "$SUPABASE_URL" ]; then
        log_success "SUPABASE_URL configurada"
    else
        log_error "SUPABASE_URL não configurada"
    fi
    
    if [ -n "$SUPABASE_DB_PASSWORD" ]; then
        log_success "SUPABASE_DB_PASSWORD configurada"
    else
        log_error "SUPABASE_DB_PASSWORD não configurada"
    fi
    
    if [ -n "$MCP_BACKEND_URL" ]; then
        log_success "MCP_BACKEND_URL configurada"
    else
        log_warning "MCP_BACKEND_URL não configurada"
    fi
fi

echo "\n🌐 4. Verificando conectividade..."

# Verificar se MCP backend está acessível
if [ -n "$MCP_BACKEND_URL" ]; then
    if curl -s --connect-timeout 5 "$MCP_BACKEND_URL/health" > /dev/null 2>&1; then
        log_success "MCP Backend acessível em $MCP_BACKEND_URL"
    else
        log_warning "MCP Backend não acessível em $MCP_BACKEND_URL"
    fi
fi

# Verificar se Supabase está acessível
if [ -n "$SUPABASE_URL" ]; then
    if curl -s --connect-timeout 5 "$SUPABASE_URL/rest/v1/" > /dev/null 2>&1; then
        log_success "Supabase acessível em $SUPABASE_URL"
    else
        log_warning "Supabase não acessível em $SUPABASE_URL"
    fi
fi

echo "\n📊 5. Verificando estrutura do banco..."

# Verificar se consegue conectar no Postgres (se credenciais estão disponíveis)
if [ -n "$SUPABASE_PROJECT_REF" ] && [ -n "$SUPABASE_DB_PASSWORD" ]; then
    PGPASSWORD="$SUPABASE_DB_PASSWORD" psql -h "db.$SUPABASE_PROJECT_REF.supabase.co" -U postgres -d postgres -c "\dt alerts" > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        log_success "Tabela 'alerts' existe no banco"
    else
        log_warning "Não foi possível verificar tabela 'alerts' - verifique credenciais do banco"
    fi
else
    log_warning "Credenciais do banco não configuradas - pulando verificação"
fi

echo "\n🔒 6. Verificando segurança..."

# Verificar se .env.n8n está no .gitignore
if [ -f "../../.gitignore" ]; then
    if grep -q ".env.n8n" "../../.gitignore"; then
        log_success ".env.n8n está no .gitignore"
    else
        log_warning ".env.n8n não está no .gitignore - adicione para evitar commit de credenciais"
    fi
fi

# Verificar permissões de arquivos sensíveis
if [ -f ".env.n8n" ]; then
    PERMS=$(stat -c "%a" .env.n8n 2>/dev/null || stat -f "%A" .env.n8n 2>/dev/null || echo "unknown")
    if [ "$PERMS" = "600" ] || [ "$PERMS" = "0600" ]; then
        log_success "Permissões do .env.n8n estão seguras ($PERMS)"
    else
        log_warning "Permissões do .env.n8n podem ser inseguras ($PERMS) - considere chmod 600"
    fi
fi

echo "\n📋 7. Verificando workflow..."

# Validar JSON do workflow
if command -v jq > /dev/null 2>&1; then
    if jq empty workflows/alerta_high_risk.json > /dev/null 2>&1; then
        log_success "Workflow JSON é válido"
        
        # Verificar estrutura do workflow
        NODES_COUNT=$(jq '.nodes | length' workflows/alerta_high_risk.json)
        log_success "Workflow tem $NODES_COUNT nós"
        
        # Verificar se tem nó Cron
        if jq -e '.nodes[] | select(.type == "n8n-nodes-base.cron")' workflows/alerta_high_risk.json > /dev/null; then
            log_success "Nó Cron encontrado"
        else
            log_warning "Nó Cron não encontrado no workflow"
        fi
        
        # Verificar se tem nó Postgres
        if jq -e '.nodes[] | select(.type == "n8n-nodes-base.postgres")' workflows/alerta_high_risk.json > /dev/null; then
            log_success "Nó Postgres encontrado"
        else
            log_warning "Nó Postgres não encontrado no workflow"
        fi
    else
        log_error "Workflow JSON é inválido"
    fi
else
    log_warning "jq não instalado - pulando validação detalhada do JSON"
fi

echo "\n🚀 8. Verificando se n8n está rodando..."

# Verificar se container n8n está rodando
if docker ps | grep -q "n8n"; then
    log_success "Container n8n está rodando"
    
    # Verificar se porta está acessível
    if curl -s --connect-timeout 5 "http://localhost:5678" > /dev/null 2>&1; then
        log_success "n8n interface acessível em http://localhost:5678"
    else
        log_warning "n8n interface não acessível em http://localhost:5678"
    fi
else
    log_warning "Container n8n não está rodando"
fi

echo "\n================================================"
echo "📊 RESUMO DA VALIDAÇÃO:"
echo "================================================"
echo -e "${GREEN}✅ Sucessos: $SUCCESS${NC}"
echo -e "${YELLOW}⚠️  Avisos: $WARNINGS${NC}"
echo -e "${RED}❌ Erros: $ERRORS${NC}"

if [ $ERRORS -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 PERFEITO! Setup está 100% validado e pronto para produção!${NC}"
        exit 0
    else
        echo -e "\n${YELLOW}⚠️  Setup funcional, mas há avisos que devem ser revisados.${NC}"
        exit 1
    fi
else
    echo -e "\n${RED}❌ Há erros críticos que devem ser corrigidos antes do deploy.${NC}"
    exit 2
fi