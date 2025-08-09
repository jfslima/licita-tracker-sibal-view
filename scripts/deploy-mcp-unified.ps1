# Script de Deploy do MCP Unificado SIBAL
# Executa a migração completa para a nova arquitetura

param(
    [string]$Environment = "development",
    [switch]$SkipMigration,
    [switch]$SkipFunction,
    [switch]$SkipSecrets,
    [switch]$DryRun
)

# Configurações
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogFile = "$ProjectRoot\logs\deploy-mcp-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"

# Criar diretório de logs se não existir
if (!(Test-Path "$ProjectRoot\logs")) {
    New-Item -ItemType Directory -Path "$ProjectRoot\logs" -Force
}

# Função de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    Write-Host $LogMessage
    Add-Content -Path $LogFile -Value $LogMessage
}

# Função para executar comandos com log
function Invoke-Command {
    param([string]$Command, [string]$Description)
    Write-Log "Executando: $Description" "INFO"
    Write-Log "Comando: $Command" "DEBUG"
    
    if ($DryRun) {
        Write-Log "[DRY RUN] Comando seria executado: $Command" "WARN"
        return $true
    }
    
    try {
        $result = Invoke-Expression $Command 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log "✅ $Description concluído com sucesso" "SUCCESS"
            return $true
        } else {
            Write-Log "❌ Erro ao executar: $Description" "ERROR"
            Write-Log "Saída: $result" "ERROR"
            return $false
        }
    } catch {
        Write-Log "❌ Exceção ao executar: $Description" "ERROR"
        Write-Log "Erro: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Verificar pré-requisitos
function Test-Prerequisites {
    Write-Log "🔍 Verificando pré-requisitos..." "INFO"
    
    # Verificar se Supabase CLI está instalado
    try {
        $supabaseVersion = supabase --version 2>&1
        Write-Log "✅ Supabase CLI encontrado: $supabaseVersion" "SUCCESS"
    } catch {
        Write-Log "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase" "ERROR"
        return $false
    }
    
    # Verificar se está logado no Supabase
    try {
        $authStatus = supabase auth status 2>&1
        if ($authStatus -match "Not logged in") {
            Write-Log "❌ Não está logado no Supabase. Execute: supabase auth login" "ERROR"
            return $false
        }
        Write-Log "✅ Autenticado no Supabase" "SUCCESS"
    } catch {
        Write-Log "❌ Erro ao verificar autenticação do Supabase" "ERROR"
        return $false
    }
    
    # Verificar se o projeto está linkado
    if (!(Test-Path "$ProjectRoot\.supabase\config.toml")) {
        Write-Log "❌ Projeto não está linkado ao Supabase. Execute: supabase link" "ERROR"
        return $false
    }
    Write-Log "✅ Projeto linkado ao Supabase" "SUCCESS"
    
    # Verificar arquivos necessários
    $requiredFiles = @(
        "supabase\migrations\20241201000001_mcp_unified_schema.sql",
        "supabase\functions\mcp\index.ts",
        "supabase\functions\mcp\deno.json"
    )
    
    foreach ($file in $requiredFiles) {
        $fullPath = Join-Path $ProjectRoot $file
        if (!(Test-Path $fullPath)) {
            Write-Log "❌ Arquivo necessário não encontrado: $file" "ERROR"
            return $false
        }
    }
    Write-Log "✅ Todos os arquivos necessários encontrados" "SUCCESS"
    
    return $true
}

# Aplicar migração do banco de dados
function Deploy-DatabaseMigration {
    if ($SkipMigration) {
        Write-Log "⏭️ Pulando migração do banco (--SkipMigration)" "WARN"
        return $true
    }
    
    Write-Log "🗄️ Aplicando migração do banco de dados..." "INFO"
    
    # Verificar status das migrações
    if (!(Invoke-Command "supabase db status" "Verificar status das migrações")) {
        return $false
    }
    
    # Aplicar migrações pendentes
    if (!(Invoke-Command "supabase db push" "Aplicar migrações do banco")) {
        return $false
    }
    
    Write-Log "✅ Migração do banco aplicada com sucesso" "SUCCESS"
    return $true
}

# Deploy da Edge Function
function Deploy-EdgeFunction {
    if ($SkipFunction) {
        Write-Log "⏭️ Pulando deploy da função (--SkipFunction)" "WARN"
        return $true
    }
    
    Write-Log "⚡ Fazendo deploy da Edge Function MCP..." "INFO"
    
    # Deploy da função
    if (!(Invoke-Command "supabase functions deploy mcp" "Deploy da função MCP")) {
        return $false
    }
    
    Write-Log "✅ Edge Function deployada com sucesso" "SUCCESS"
    return $true
}

# Configurar secrets
function Configure-Secrets {
    if ($SkipSecrets) {
        Write-Log "⏭️ Pulando configuração de secrets (--SkipSecrets)" "WARN"
        return $true
    }
    
    Write-Log "🔐 Configurando secrets..." "INFO"
    
    # Verificar se GROQ_API_KEY está definida
    $groqKey = $env:GROQ_API_KEY
    if (!$groqKey) {
        Write-Log "⚠️ GROQ_API_KEY não encontrada nas variáveis de ambiente" "WARN"
        $groqKey = Read-Host "Digite sua GROQ API Key"
    }
    
    if ($groqKey) {
        if (!(Invoke-Command "supabase secrets set GROQ_API_KEY='$groqKey'" "Configurar GROQ_API_KEY")) {
            return $false
        }
    }
    
    # Configurar outras variáveis
    $secrets = @{
        "MCP_LOG_LEVEL" = "info"
        "MCP_RATE_LIMIT" = "100"
        "MCP_TIMEOUT" = "30000"
    }
    
    foreach ($secret in $secrets.GetEnumerator()) {
        if (!(Invoke-Command "supabase secrets set $($secret.Key)='$($secret.Value)'" "Configurar $($secret.Key)")) {
            return $false
        }
    }
    
    Write-Log "✅ Secrets configurados com sucesso" "SUCCESS"
    return $true
}

# Executar testes de validação
function Test-Deployment {
    Write-Log "🧪 Executando testes de validação..." "INFO"
    
    # Obter URL do projeto
    try {
        $projectUrl = (supabase status --output json | ConvertFrom-Json).api_url
        if (!$projectUrl) {
            Write-Log "❌ Não foi possível obter URL do projeto" "ERROR"
            return $false
        }
    } catch {
        Write-Log "❌ Erro ao obter status do projeto" "ERROR"
        return $false
    }
    
    $functionUrl = "$projectUrl/functions/v1/mcp"
    Write-Log "🌐 URL da função: $functionUrl" "INFO"
    
    # Teste básico de conectividade
    try {
        $response = Invoke-RestMethod -Uri $functionUrl -Method GET -TimeoutSec 10
        Write-Log "✅ Função MCP respondendo corretamente" "SUCCESS"
        Write-Log "Resposta: $($response | ConvertTo-Json -Compress)" "DEBUG"
    } catch {
        Write-Log "❌ Erro ao testar função MCP: $($_.Exception.Message)" "ERROR"
        return $false
    }
    
    # Teste de ferramenta específica
    $testPayload = @{
        method = "tools/call"
        params = @{
            name = "fetch_notices"
            arguments = @{
                query = "teste"
                limit = 1
            }
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri $functionUrl -Method POST -Body $testPayload -ContentType "application/json" -TimeoutSec 30
        Write-Log "✅ Teste da ferramenta fetch_notices bem-sucedido" "SUCCESS"
    } catch {
        Write-Log "⚠️ Teste da ferramenta falhou (pode ser normal se não há dados): $($_.Exception.Message)" "WARN"
    }
    
    return $true
}

# Função principal
function Main {
    Write-Log "🚀 Iniciando deploy do MCP Unificado SIBAL" "INFO"
    Write-Log "Ambiente: $Environment" "INFO"
    Write-Log "Modo: $(if ($DryRun) { 'DRY RUN' } else { 'EXECUÇÃO' })" "INFO"
    
    # Verificar pré-requisitos
    if (!(Test-Prerequisites)) {
        Write-Log "❌ Pré-requisitos não atendidos. Abortando deploy." "ERROR"
        exit 1
    }
    
    # Executar etapas do deploy
    $steps = @(
        { Deploy-DatabaseMigration },
        { Deploy-EdgeFunction },
        { Configure-Secrets },
        { Test-Deployment }
    )
    
    foreach ($step in $steps) {
        if (!(& $step)) {
            Write-Log "❌ Deploy falhou. Verifique os logs para mais detalhes." "ERROR"
            exit 1
        }
    }
    
    Write-Log "🎉 Deploy do MCP Unificado concluído com sucesso!" "SUCCESS"
    Write-Log "📊 Próximos passos:" "INFO"
    Write-Log "   1. Testar as funcionalidades no frontend" "INFO"
    Write-Log "   2. Monitorar logs de performance" "INFO"
    Write-Log "   3. Configurar alertas de monitoramento" "INFO"
    Write-Log "   4. Treinar equipe nas novas funcionalidades" "INFO"
    
    Write-Log "📝 Log completo salvo em: $LogFile" "INFO"
}

# Executar script principal
try {
    Main
} catch {
    Write-Log "💥 Erro crítico durante o deploy: $($_.Exception.Message)" "FATAL"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "FATAL"
    exit 1
}