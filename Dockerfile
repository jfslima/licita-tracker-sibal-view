
# ./Dockerfile  (raiz do repo)
FROM ghcr.io/qdrant/mcp-server-qdrant:latest
WORKDIR /app
COPY mcp-server-qdrant /app
ENV PORT=8000
CMD ["uvicorn", "mcp_server.main:app", "--host", "0.0.0.0", "--port", "8000"]
