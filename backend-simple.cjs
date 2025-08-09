const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: f }) => f(...args));

const app = express();
app.use(cors({ origin: ["http://localhost:3000", "http://localhost:5173"] }));

// Rate limiting robusto coordenado com frontend
const requestCounts = new Map();
const lastRequestTime = new Map();
const RATE_LIMIT = 50; // requests por 15 minutos (aumentado)
const WINDOW_MS = 15 * 60 * 1000;
const MIN_REQUEST_INTERVAL = 2000; // 2 segundos entre requisições (coordenado com frontend)

function rateLimiter(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  
  // Verificar intervalo mínimo entre requisições
  const lastRequest = lastRequestTime.get(ip) || 0;
  const timeSinceLastRequest = now - lastRequest;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    console.log(`⏳ Rate limit: IP ${ip} deve aguardar ${waitTime}ms`);
    return res.status(429).json({ 
      error: 'Requisições muito frequentes. Aguarde alguns segundos.',
      waitTime: waitTime,
      retryAfter: Math.ceil(waitTime / 1000)
    });
  }
  
  // Verificar limite de janela
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const requests = requestCounts.get(ip).filter(time => time > windowStart);
  
  if (requests.length >= RATE_LIMIT) {
    console.log(`🚫 Rate limit: IP ${ip} excedeu limite de ${RATE_LIMIT} requisições`);
    return res.status(429).json({ 
      error: 'Limite de requisições excedido. Tente novamente em alguns minutos.',
      retryAfter: Math.ceil(WINDOW_MS / 1000)
    });
  }
  
  requests.push(now);
  requestCounts.set(ip, requests);
  lastRequestTime.set(ip, now);
  
  console.log(`✅ Requisição permitida para IP ${ip} (${requests.length}/${RATE_LIMIT})`);
  next();
}

app.use('/api/pncp', rateLimiter);

/* ------------------------------------------------------------------ */
/* 1. rota ESPECÍFICA – precisa vir antes do middleware genérico      */
/* ------------------------------------------------------------------ */

// Função para retry com backoff exponencial
const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 10000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (result.status === 429) {
        if (attempt === maxRetries) {
          console.error(`🚫 PNCP 429: Máximo de tentativas (${maxRetries}) atingido`);
          throw new Error('PNCP 429: Rate limit excedido após múltiplas tentativas');
        }
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ PNCP 429: Tentativa ${attempt}/${maxRetries}, aguardando ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      return result;
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`⚠️ Erro na tentativa ${attempt}/${maxRetries}, aguardando ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Handler comum para busca PNCP
const handlePNCPSearch = async (req, res) => {
  // Adicionar parâmetros obrigatórios se não fornecidos
  const params = new URLSearchParams(req.query);
  
  // tipos_documento é obrigatório
  if (!params.has('tipos_documento')) {
    params.set('tipos_documento', 'edital');
  }
  
  // status é obrigatório
  if (!params.has('status')) {
    params.set('status', 'aberta');
  }
  
  // pagina é obrigatório
  if (!params.has('pagina')) {
    params.set('pagina', '1');
  }
  
  // tamanhoPagina deve ser pelo menos 10
  if (!params.has('tamanhoPagina') || parseInt(params.get('tamanhoPagina')) < 10) {
    params.set('tamanhoPagina', '10');
  }
  
  const target = `https://pncp.gov.br/api/search?${params.toString()}`;
  console.log(`🔍 Buscando PNCP: ${target}`);

  try {
    const response = await retryWithBackoff(async () => {
      return await fetch(target, {
        headers: { Accept: "application/json", "User-Agent": "SibalBot/1.0" },
        timeout: 30_000,
      });
    });

    const ct = response.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      console.error("[PNCP] Resposta não‑JSON", await response.text().catch(() => ""));
      return res.status(502).send("PNCP devolveu conteúdo inesperado (não JSON)");
    }

    if (response.status === 429) {
      console.error("🚫 PNCP 429: Rate limit excedido após todas as tentativas");
      return res.status(429).json({ 
        error: "PNCP 429 Too Many Requests", 
        message: "API do PNCP está limitando requisições. Tente novamente em alguns minutos.",
        retryAfter: 300 // 5 minutos
      });
    }

    const data = await response.json();
    console.log(`✅ PNCP resposta: ${response.status}, ${data.items?.length || 0} itens de ${data.total || 0} total`);
    res.status(response.status).json(data);
  } catch (e) {
    console.error("[Proxy] Erro PNCP:", e);
    if (e.message.includes('429')) {
      return res.status(429).json({ 
        error: "PNCP 429 Too Many Requests", 
        message: "API do PNCP está limitando requisições. Tente novamente em alguns minutos.",
        retryAfter: 300
      });
    }
    res.status(503).json({ error: "PNCP indisponível, tente mais tarde" });
  }
};

// Rotas que usam o handler comum
app.get("/api/pncp/search", handlePNCPSearch);  // rota existente
app.get("/search", handlePNCPSearch);           // alias compatível

// Rota específica para filtros
app.get("/api/pncp/search/filters", async (req, res) => {
  const qs = new URLSearchParams(req.query).toString();
  const target = `https://pncp.gov.br/api/search/filters?${qs}`;

  try {
    const r = await fetch(target, {
      headers: { Accept: "application/json", "User-Agent": "SibalBot/1.0" },
      timeout: 30_000,
    });

    const ct = r.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      console.error("[PNCP Filtros] Resposta não‑JSON", await r.text().catch(() => ""));
      return res.status(502).send("PNCP devolveu conteúdo inesperado (não JSON)");
    }

    res.status(r.status).json(await r.json());
  } catch (e) {
    console.error("[Proxy] Erro PNCP Filtros:", e);
    res.status(503).json({ error: "PNCP filtros indisponível, tente mais tarde" });
  }
});

/* ------------------------------------------------------------------ */
/* 2. middleware GENÉRICO – fica depois, para qualquer outra rota     */
/* ------------------------------------------------------------------ */
app.use(
  "/api/pncp",
  createProxyMiddleware({
    target: "https://pncp.gov.br",
    changeOrigin: true,
    pathRewrite: { "^/api/pncp": "/api/consulta" },
    onProxyReq: (proxyReq) => {
      proxyReq.setHeader("User-Agent", "SibalBot/1.0");
      proxyReq.setHeader("Accept", "application/json");
    },
    logLevel: "warn",
  }),
);

app.get("/health", (_, res) => res.json({ status: "OK" }));
app.listen(3002, () => console.log("🚀 Proxy PNCP em http://localhost:3002"));