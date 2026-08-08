import rateLimit from 'express-rate-limit';

// Limite geral da API: protege contra abuso/DoS basico em todas as rotas.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas requisicoes. Tente novamente em alguns minutos.' },
});

// Limite estrito para login/cadastro: dificulta forca bruta e credential stuffing.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});
