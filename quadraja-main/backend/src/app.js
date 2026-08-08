import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { apiLimiter } from './middlewares/rateLimit.js';

// Origens permitidas no CORS. Sem CORS_ORIGIN configurado, so libera os
// hosts padrao de desenvolvimento (nunca "*" — a API usa Authorization
// header, entao um CORS aberto facilitaria abuso da API por terceiros).
const origensPermitidas = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

export function createApp() {
  const app = express();

  // Atras de proxy/load balancer (Render, Railway, Nginx etc.) e preciso
  // confiar no cabecalho X-Forwarded-For para IP correto no rate limit.
  if (process.env.TRUST_PROXY === 'true') {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      // API JSON consumida por um frontend em outra origem (produção pode
      // hospedar front/back em domínios diferentes) — CORP "same-origin"
      // bloquearia o navegador de ler a resposta mesmo com CORS liberado.
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: origensPermitidas,
    })
  );
  app.use(express.json({ limit: '10kb' }));

  app.use('/api', apiLimiter);
  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
