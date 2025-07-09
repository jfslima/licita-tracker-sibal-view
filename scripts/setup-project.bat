
@echo off
echo 🔧 Configurando projeto SIBAL Licita Tracker para Windows...

REM Verificar se estamos no diretório correto
if not exist "package.json" (
  echo ❌ Erro: package.json não encontrado na raiz
  echo Execute este script na raiz do projeto
  pause
  exit /b 1
)

REM Criar package-lock.json se não existir
if not exist "package-lock.json" (
  echo 📦 Criando package-lock.json...
  npm install --legacy-peer-deps
  echo ✅ package-lock.json criado com sucesso
) else (
  echo 📦 package-lock.json já existe, atualizando...
  del package-lock.json
  npm install --legacy-peer-deps
)

REM Verificar estrutura do backend
if not exist "src\backend" (
  echo ❌ Diretório src\backend não encontrado
  pause
  exit /b 1
)

REM Instalar dependências do backend
echo 📦 Instalando dependências do backend...
cd src\backend
npm install --legacy-peer-deps
cd ..\..

REM Verificar se o build funciona
echo 🔨 Testando build do frontend...
npm run build

echo 🔨 Testando build do backend...
cd src\backend
npm run build
cd ..\..

echo.
echo ✅ CONFIGURAÇÃO CONCLUÍDA!
echo.
echo 📋 Próximos passos:
echo 1. Commit das mudanças:
echo    git add .
echo    git commit -m "Fix: Estrutura do projeto e dependências"
echo    git push
echo.
echo 2. Deploy no Render:
echo    - Vá para https://render.com
echo    - Clique em 'New +' → 'Blueprint'
echo    - Conecte seu repositório GitHub
echo    - Configure GROQ_API_KEY no painel
echo.
echo 🔗 Estrutura final:
echo    - Frontend: raiz do projeto (React + Vite)
echo    - Backend: src/backend/ (MCP Server)
echo    - Ambos com --legacy-peer-deps para resolver conflitos
pause
