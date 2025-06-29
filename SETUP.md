
# 🚀 Setup Completo - Sistema Licita Tracker

## ✅ Sistema Já Configurado!

Os arquivos de configuração já foram criados automaticamente:

- ✅ `mcp-server/.env` - Configuração do servidor MCP com API Groq
- ✅ `.env.local` - Configuração do frontend
- ✅ `start-system.sh` - Script para iniciar o sistema

## 🎯 Como Usar Agora

### Opção 1: Início Rápido (Recomendado)
```bash
# Tornar o script executável
chmod +x start-system.sh

# Executar o sistema completo
./start-system.sh
```

### Opção 2: Início Manual
```bash
# Terminal 1 - Servidor MCP
cd mcp-server
npm install
npm run dev

# Terminal 2 - Frontend (nova aba/janela)
npm run dev
```

## 🧪 Testando o Sistema

1. **Abra a aplicação** no navegador
2. **Clique em "Busca Inteligente"** (botão roxo/azul)
3. **Experimente estas perguntas**:
   - "Como funciona o processo licitatório no Brasil?"
   - "Quais são os tipos de modalidades de licitação?"
   - "Explique sobre a Lei 14.133/21"
   - "Busque licitações de drones com valor acima de R$ 1 milhão no DF"

## 🔧 Recursos Disponíveis

### IA Especializada
- ✅ Conhecimento em legislação brasileira (Lei 8.666/93, Lei 14.133/21)
- ✅ Orientações sobre PNCP (Portal Nacional de Contratações Públicas)
- ✅ Análise de documentos de licitação
- ✅ Busca inteligente por licitações

### Funcionalidades
- ✅ Chat com contexto especializado
- ✅ Busca semântica de licitações
- ✅ Resumo automático de documentos
- ✅ Análise de padrões e comparações

## 🆘 Resolução de Problemas

### Erro de Conexão
- Verifique se o servidor MCP está rodando na porta 8080
- Confirme se os arquivos `.env` estão corretos

### IA não Responde
- Verifique a chave da API Groq no arquivo `mcp-server/.env`
- Confirme se há conexão com a internet

### Portas em Uso
- MCP Server: porta 8080
- Frontend: porta definida pelo Vite (geralmente 5173)

## 📚 Próximos Passos

Agora você pode:
1. **Testar a IA** com perguntas sobre licitações
2. **Explorar as buscas avançadas** 
3. **Analisar documentos** específicos
4. **Comparar preços** entre regiões

---

**🎉 Sistema pronto para uso! Divirta-se explorando!**
