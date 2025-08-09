# Script para iniciar SIBAL MCP Server
# Executa N8N e ativa o workflow MCP automaticamente

Write-Host "INICIANDO SIBAL MCP SERVER" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Verificar se Node.js esta instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js nao encontrado. Instale Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se N8N esta instalado
try {
    $n8nVersion = npx n8n --version
    Write-Host "N8N detectado: $n8nVersion" -ForegroundColor Green
} catch {
    Write-Host "N8N nao encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g n8n
}

Write-Host ""
Write-Host "Configurando variaveis de ambiente..." -ForegroundColor Cyan

# Configurar variaveis de ambiente para N8N
$env:N8N_HOST = "localhost"
$env:N8N_PORT = "5678"
$env:N8N_PROTOCOL = "http"
$env:WEBHOOK_URL = "http://localhost:5678/"
$env:N8N_BASIC_AUTH_ACTIVE = "false"
$env:N8N_SECURE_COOKIE = "false"

Write-Host "Variaveis configuradas:" -ForegroundColor Green
Write-Host "   - Host: localhost:5678" -ForegroundColor Gray
Write-Host "   - Webhook: http://localhost:5678/webhook/mcp" -ForegroundColor Gray
Write-Host ""

# Funcao para verificar se N8N esta rodando
function Test-N8NRunning {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5678" -TimeoutSec 5 -UseBasicParsing
        return $true
    } catch {
        return $false
    }
}

# Verificar se N8N ja esta rodando
if (Test-N8NRunning) {
    Write-Host "N8N ja esta rodando em http://localhost:5678" -ForegroundColor Green
} else {
    Write-Host "Iniciando N8N..." -ForegroundColor Cyan
    Write-Host "   Aguarde alguns segundos para o N8N inicializar..." -ForegroundColor Gray
    
    # Iniciar N8N em background
    $n8nProcess = Start-Process -FilePath "npx" -ArgumentList "n8n", "start" -PassThru -WindowStyle Hidden
    
    # Aguardar N8N inicializar
    $timeout = 30
    $elapsed = 0
    
    while (-not (Test-N8NRunning) -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
    
    Write-Host ""
    
    if (Test-N8NRunning) {
        Write-Host "N8N iniciado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "Timeout ao iniciar N8N. Verifique os logs." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "URLs importantes:" -ForegroundColor Cyan
Write-Host "   - Interface N8N: http://localhost:5678" -ForegroundColor Gray
Write-Host "   - Webhook MCP: http://localhost:5678/webhook/mcp" -ForegroundColor Gray
Write-Host ""

# Testar conectividade do webhook
Write-Host "Testando webhook MCP..." -ForegroundColor Cyan

try {
    $testPayload = @{
        jsonrpc = "2.0"
        method = "initialize"
        id = 1
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:5678/webhook/mcp" -Method Post -Body $testPayload -ContentType "application/json" -TimeoutSec 10
    
    if ($response.jsonrpc -eq "2.0") {
        Write-Host "Webhook MCP funcionando!" -ForegroundColor Green
        Write-Host "   Resposta: $($response | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } else {
        Write-Host "Webhook respondeu, mas formato inesperado" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Webhook nao esta funcionando. Verifique se o workflow esta ativo." -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "PROXIMOS PASSOS MANUAIS:" -ForegroundColor Yellow
    Write-Host "1. Acesse http://localhost:5678" -ForegroundColor Gray
    Write-Host "2. Importe o workflow MCP se necessario" -ForegroundColor Gray
    Write-Host "3. Ative o workflow" -ForegroundColor Gray
    Write-Host "4. Execute novamente: node mcp-external-connection.cjs" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Para testar a integracao externa:" -ForegroundColor Cyan
Write-Host "   node mcp-external-connection.cjs" -ForegroundColor Gray
Write-Host ""
Write-Host "Para mais informacoes:" -ForegroundColor Cyan
Write-Host "   Consulte: GUIA-INTEGRACAO-MCP-EXTERNA.md" -ForegroundColor Gray
Write-Host ""
Write-Host "SIBAL MCP Server configurado!" -ForegroundColor Green