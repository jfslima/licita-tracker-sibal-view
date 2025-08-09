FROM n8nio/n8n:latest

# Definir variáveis de ambiente
ENV N8N_BASIC_AUTH_ACTIVE=true
ENV N8N_BASIC_AUTH_USER=sibal
ENV N8N_BASIC_AUTH_PASSWORD=SibalN8n2024!@#$
ENV N8N_HOST=localhost
ENV WEBHOOK_TUNNEL_URL=http://localhost:5678/
ENV N8N_PORT=5678
ENV N8N_PROTOCOL=http
ENV NODE_ENV=production

# Expor porta 5678
EXPOSE 5678

# Criar diretório para workflows
USER root
RUN mkdir -p /home/node/.n8n/workflows
RUN chown -R node:node /home/node/.n8n
USER node

# Comando padrão
CMD ["n8n", "start"]