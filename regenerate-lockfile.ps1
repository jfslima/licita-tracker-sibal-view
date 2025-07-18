Write-Host "Removendo lockfile antigo..."
if (Test-Path pnpm-lock.yaml) {
    Remove-Item -Force pnpm-lock.yaml
}

Write-Host "Garantindo versão correta do pnpm (8.15.1)..."
$pnpmVersion = pnpm -v
if ($pnpmVersion -ne "8.15.1") {
    Write-Host "Versão do pnpm não é 8.15.1, instalando versão correta..."
    npm install -g pnpm@8.15.1
}

Write-Host "Gerando novo lockfile..."
pnpm install --no-frozen-lockfile

Write-Host "Verificando se o lockfile foi gerado corretamente..."
if (Test-Path pnpm-lock.yaml) {
    $content = Get-Content -Path pnpm-lock.yaml
    if ($content.Count -gt 1) {
        Write-Host "Lockfile gerado com sucesso com múltiplas linhas!"
    } else {
        Write-Host "ERRO: Lockfile gerado como uma única linha!"
        exit 1
    }
} else {
    Write-Host "ERRO: Lockfile não foi gerado!"
    exit 1
}
