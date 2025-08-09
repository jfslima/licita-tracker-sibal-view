# Script de Testes do MCP Unificado SIBAL
# Valida todas as funcionalidades após a migração

param(
    [string]$Environment = "development",
    [string]$ProjectUrl,
    [switch]$Verbose,
    [switch]$SkipPerformance,
    [int]$Timeout = 30
)

# Configurações
$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$LogFile = "$ProjectRoot\logs\test-mcp-$(Get-Date -Format 'yyyyMMdd-HHmmss').log"
$TestResults = @()

# Criar diretório de logs se não existir
if (!(Test-Path "$ProjectRoot\logs")) {
    New-Item -ItemType Directory -Path "$ProjectRoot\logs" -Force
}

# Função de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogMessage = "[$Timestamp] [$Level] $Message"
    if ($Verbose -or $Level -in @("ERROR", "WARN", "SUCCESS", "FAIL")) {
        Write-Host $LogMessage
    }
    Add-Content -Path $LogFile -Value $LogMessage
}

# Função para registrar resultado de teste
function Add-TestResult {
    param(
        [string]$TestName,
        [bool]$Passed,
        [string]$Message = "",
        [hashtable]$Metrics = @{}
    )
    
    $result = @{
        TestName = $TestName
        Passed = $Passed
        Message = $Message
        Timestamp = Get-Date
        Metrics = $Metrics
    }
    
    $script:TestResults += $result
    
    $status = if ($Passed) { "✅ PASS" } else { "❌ FAIL" }
    Write-Log "$status - $TestName: $Message" $(if ($Passed) { "SUCCESS" } else { "FAIL" })
}

# Obter URL do projeto
function Get-ProjectUrl {
    if ($ProjectUrl) {
        return $ProjectUrl
    }
    
    try {
        $status = supabase status --output json | ConvertFrom-Json
        return $status.api_url
    } catch {
        Write-Log "❌ Erro ao obter URL do projeto. Use o parâmetro -ProjectUrl" "ERROR"
        return $null
    }
}

# Teste de conectividade básica
function Test-BasicConnectivity {
    param([string]$BaseUrl)
    
    $functionUrl = "$BaseUrl/functions/v1/mcp"
    
    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $functionUrl -Method GET -TimeoutSec $Timeout
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        $success = $response -and $response.name -eq "sibal-licita-tracker-mcp"
        
        Add-TestResult -TestName "Conectividade Básica" -Passed $success -Message "Tempo de resposta: $([math]::Round($responseTime, 2))ms" -Metrics @{ ResponseTime = $responseTime }
        
        return $success
    } catch {
        Add-TestResult -TestName "Conectividade Básica" -Passed $false -Message "Erro: $($_.Exception.Message)"
        return $false
    }
}

# Teste de ferramenta específica
function Test-Tool {
    param(
        [string]$BaseUrl,
        [string]$ToolName,
        [hashtable]$Arguments,
        [string]$ExpectedField = $null
    )
    
    $functionUrl = "$BaseUrl/functions/v1/mcp"
    
    $payload = @{
        method = "tools/call"
        params = @{
            name = $ToolName
            arguments = $Arguments
        }
    } | ConvertTo-Json -Depth 5
    
    try {
        $startTime = Get-Date
        $response = Invoke-RestMethod -Uri $functionUrl -Method POST -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
        $endTime = Get-Date
        $responseTime = ($endTime - $startTime).TotalMilliseconds
        
        $success = $response -and $response.result
        
        if ($ExpectedField -and $success) {
            $success = $response.result.PSObject.Properties.Name -contains $ExpectedField
        }
        
        $message = if ($success) {
            "Tempo: $([math]::Round($responseTime, 2))ms"
        } else {
            "Falha na resposta ou campo esperado '$ExpectedField' não encontrado"
        }
        
        Add-TestResult -TestName "Ferramenta: $ToolName" -Passed $success -Message $message -Metrics @{ ResponseTime = $responseTime }
        
        return $success
    } catch {
        Add-TestResult -TestName "Ferramenta: $ToolName" -Passed $false -Message "Erro: $($_.Exception.Message)"
        return $false
    }
}

# Testes de todas as ferramentas MCP
function Test-AllTools {
    param([string]$BaseUrl)
    
    Write-Log "🔧 Testando todas as ferramentas MCP..." "INFO"
    
    $tools = @(
        @{
            Name = "fetch_notices"
            Arguments = @{ query = "teste"; limit = 5 }
            ExpectedField = "notices"
        },
        @{
            Name = "risk_classifier"
            Arguments = @{ notice_id = "00000000-0000-0000-0000-000000000000" }
            ExpectedField = "risk_level"
        },
        @{
            Name = "summarize_notice"
            Arguments = @{ notice_id = "00000000-0000-0000-0000-000000000000" }
            ExpectedField = "summary"
        },
        @{
            Name = "process_document"
            Arguments = @{ 
                notice_id = "00000000-0000-0000-0000-000000000000"
                document_url = "https://example.com/test.pdf"
                document_type = "edital"
            }
            ExpectedField = "extracted_text"
        },
        @{
            Name = "generate_proposal_insights"
            Arguments = @{ 
                notice_id = "00000000-0000-0000-0000-000000000000"
                company_profile = @{
                    name = "Empresa Teste"
                    sector = "tecnologia"
                    size = "media"
                    experience_years = 10
                }
            }
            ExpectedField = "insights"
        },
        @{
            Name = "monitor_deadlines"
            Arguments = @{ 
                company_id = "00000000-0000-0000-0000-000000000000"
                days_ahead = 30
            }
            ExpectedField = "alerts"
        }
    )
    
    $passedTools = 0
    foreach ($tool in $tools) {
        if (Test-Tool -BaseUrl $BaseUrl -ToolName $tool.Name -Arguments $tool.Arguments -ExpectedField $tool.ExpectedField) {
            $passedTools++
        }
        Start-Sleep -Milliseconds 500  # Evitar rate limiting
    }
    
    $allPassed = $passedTools -eq $tools.Count
    Add-TestResult -TestName "Todas as Ferramentas" -Passed $allPassed -Message "$passedTools/$($tools.Count) ferramentas funcionando"
    
    return $allPassed
}

# Teste de performance
function Test-Performance {
    param([string]$BaseUrl)
    
    if ($SkipPerformance) {
        Write-Log "⏭️ Pulando testes de performance (--SkipPerformance)" "WARN"
        return $true
    }
    
    Write-Log "⚡ Executando testes de performance..." "INFO"
    
    $functionUrl = "$BaseUrl/functions/v1/mcp"
    $payload = @{
        method = "tools/call"
        params = @{
            name = "fetch_notices"
            arguments = @{ query = "teste"; limit = 10 }
        }
    } | ConvertTo-Json -Depth 3
    
    $times = @()
    $successCount = 0
    $testCount = 5
    
    for ($i = 1; $i -le $testCount; $i++) {
        try {
            $startTime = Get-Date
            $response = Invoke-RestMethod -Uri $functionUrl -Method POST -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            
            $times += $responseTime
            if ($response -and $response.result) {
                $successCount++
            }
            
            Write-Log "Teste $i/$testCount: $([math]::Round($responseTime, 2))ms" "DEBUG"
        } catch {
            Write-Log "Teste $i/$testCount: FALHOU - $($_.Exception.Message)" "WARN"
        }
        
        Start-Sleep -Milliseconds 200
    }
    
    if ($times.Count -gt 0) {
        $avgTime = ($times | Measure-Object -Average).Average
        $maxTime = ($times | Measure-Object -Maximum).Maximum
        $minTime = ($times | Measure-Object -Minimum).Minimum
        
        $performanceGood = $avgTime -lt 5000 -and $successCount -ge ($testCount * 0.8)
        
        $message = "Média: $([math]::Round($avgTime, 2))ms, Min: $([math]::Round($minTime, 2))ms, Max: $([math]::Round($maxTime, 2))ms, Sucesso: $successCount/$testCount"
        
        Add-TestResult -TestName "Performance" -Passed $performanceGood -Message $message -Metrics @{
            AverageTime = $avgTime
            MinTime = $minTime
            MaxTime = $maxTime
            SuccessRate = $successCount / $testCount
        }
        
        return $performanceGood
    } else {
        Add-TestResult -TestName "Performance" -Passed $false -Message "Nenhum teste de performance bem-sucedido"
        return $false
    }
}

# Teste de rate limiting
function Test-RateLimiting {
    param([string]$BaseUrl)
    
    Write-Log "🚦 Testando rate limiting..." "INFO"
    
    $functionUrl = "$BaseUrl/functions/v1/mcp"
    $payload = @{
        method = "tools/call"
        params = @{
            name = "fetch_notices"
            arguments = @{ query = "teste"; limit = 1 }
        }
    } | ConvertTo-Json -Depth 3
    
    $rateLimitHit = $false
    $requestCount = 0
    
    # Fazer muitas requisições rapidamente
    for ($i = 1; $i -le 20; $i++) {
        try {
            $response = Invoke-RestMethod -Uri $functionUrl -Method POST -Body $payload -ContentType "application/json" -TimeoutSec 5
            $requestCount++
        } catch {
            if ($_.Exception.Message -match "429|rate.limit|too.many") {
                $rateLimitHit = $true
                break
            }
        }
    }
    
    # Rate limiting deve estar ativo para proteger o sistema
    $message = if ($rateLimitHit) {
        "Rate limiting ativo após $requestCount requisições"
    } else {
        "Rate limiting não detectado em $requestCount requisições"
    }
    
    Add-TestResult -TestName "Rate Limiting" -Passed $rateLimitHit -Message $message
    
    return $rateLimitHit
}

# Teste de logs e monitoramento
function Test-Logging {
    param([string]$BaseUrl)
    
    Write-Log "📊 Testando sistema de logs..." "INFO"
    
    # Fazer uma requisição para gerar logs
    $functionUrl = "$BaseUrl/functions/v1/mcp"
    $payload = @{
        method = "tools/call"
        params = @{
            name = "fetch_notices"
            arguments = @{ query = "teste-logs"; limit = 1 }
        }
    } | ConvertTo-Json -Depth 3
    
    try {
        $response = Invoke-RestMethod -Uri $functionUrl -Method POST -Body $payload -ContentType "application/json" -TimeoutSec $Timeout
        
        # Verificar se a resposta contém informações de log
        $hasLogging = $response -and $response.result
        
        Add-TestResult -TestName "Sistema de Logs" -Passed $hasLogging -Message "Logs sendo gerados corretamente"
        
        return $hasLogging
    } catch {
        Add-TestResult -TestName "Sistema de Logs" -Passed $false -Message "Erro ao testar logs: $($_.Exception.Message)"
        return $false
    }
}

# Gerar relatório final
function Generate-Report {
    Write-Log "📋 Gerando relatório final..." "INFO"
    
    $totalTests = $TestResults.Count
    $passedTests = ($TestResults | Where-Object { $_.Passed }).Count
    $failedTests = $totalTests - $passedTests
    $successRate = if ($totalTests -gt 0) { ($passedTests / $totalTests) * 100 } else { 0 }
    
    $reportPath = "$ProjectRoot\logs\test-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    
    $report = @{
        Timestamp = Get-Date
        Environment = $Environment
        Summary = @{
            TotalTests = $totalTests
            PassedTests = $passedTests
            FailedTests = $failedTests
            SuccessRate = $successRate
        }
        Tests = $TestResults
        Metrics = @{
            AverageResponseTime = ($TestResults | Where-Object { $_.Metrics.ResponseTime } | ForEach-Object { $_.Metrics.ResponseTime } | Measure-Object -Average).Average
            MaxResponseTime = ($TestResults | Where-Object { $_.Metrics.ResponseTime } | ForEach-Object { $_.Metrics.ResponseTime } | Measure-Object -Maximum).Maximum
        }
    }
    
    $report | ConvertTo-Json -Depth 5 | Out-File -FilePath $reportPath -Encoding UTF8
    
    Write-Log "" "INFO"
    Write-Log "🎯 RELATÓRIO FINAL DE TESTES" "INFO"
    Write-Log "============================" "INFO"
    Write-Log "Total de testes: $totalTests" "INFO"
    Write-Log "Testes aprovados: $passedTests" "SUCCESS"
    Write-Log "Testes falharam: $failedTests" $(if ($failedTests -gt 0) { "FAIL" } else { "INFO" })
    Write-Log "Taxa de sucesso: $([math]::Round($successRate, 2))%" $(if ($successRate -ge 80) { "SUCCESS" } else { "WARN" })
    Write-Log "" "INFO"
    
    if ($failedTests -gt 0) {
        Write-Log "❌ TESTES FALHARAM:" "FAIL"
        $TestResults | Where-Object { -not $_.Passed } | ForEach-Object {
            Write-Log "   - $($_.TestName): $($_.Message)" "FAIL"
        }
        Write-Log "" "INFO"
    }
    
    Write-Log "📊 Relatório detalhado salvo em: $reportPath" "INFO"
    Write-Log "📝 Log completo salvo em: $LogFile" "INFO"
    
    return $successRate -ge 80
}

# Função principal
function Main {
    Write-Log "🧪 Iniciando testes do MCP Unificado SIBAL" "INFO"
    Write-Log "Ambiente: $Environment" "INFO"
    Write-Log "Timeout: $Timeout segundos" "INFO"
    
    # Obter URL do projeto
    $baseUrl = Get-ProjectUrl
    if (!$baseUrl) {
        Write-Log "❌ Não foi possível obter URL do projeto" "ERROR"
        exit 1
    }
    
    Write-Log "🌐 URL do projeto: $baseUrl" "INFO"
    Write-Log "" "INFO"
    
    # Executar todos os testes
    $allPassed = $true
    
    $allPassed = (Test-BasicConnectivity -BaseUrl $baseUrl) -and $allPassed
    $allPassed = (Test-AllTools -BaseUrl $baseUrl) -and $allPassed
    $allPassed = (Test-Performance -BaseUrl $baseUrl) -and $allPassed
    $allPassed = (Test-RateLimiting -BaseUrl $baseUrl) -and $allPassed
    $allPassed = (Test-Logging -BaseUrl $baseUrl) -and $allPassed
    
    # Gerar relatório
    $reportPassed = Generate-Report
    
    if ($reportPassed) {
        Write-Log "🎉 Todos os testes principais passaram! MCP Unificado está funcionando corretamente." "SUCCESS"
        exit 0
    } else {
        Write-Log "❌ Alguns testes falharam. Verifique o relatório para mais detalhes." "ERROR"
        exit 1
    }
}

# Executar script principal
try {
    Main
} catch {
    Write-Log "💥 Erro crítico durante os testes: $($_.Exception.Message)" "FATAL"
    Write-Log "Stack trace: $($_.ScriptStackTrace)" "FATAL"
    exit 1
}