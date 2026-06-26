import { AppError } from '../utils/AppError.js';

// Tratamento de erro central: garante um formato de resposta consistente.
export function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      details: err.details ?? undefined,
    });
  }

  // Violacao de unique do Prisma (ex: email ja cadastrado).
  if (err?.code === 'P2002') {
    const campo = err.meta?.target?.[0] ?? 'campo';
    return res.status(409).json({ error: `Ja existe um registro com esse ${campo}.` });
  }

  // Erros HTTP conhecidos do Express/body-parser:
  // JSON malformado (400), payload acima do limite (413), etc.
  const statusHttp = err?.statusCode ?? err?.status;
  if (Number.isInteger(statusHttp) && statusHttp >= 400 && statusHttp < 500) {
    return res.status(statusHttp).json({ error: err.message || 'Requisicao invalida.' });
  }

  console.error('[erro nao tratado]', err);
  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

// 404 para rotas inexistentes.
export function notFound(req, res) {
  res.status(404).json({ error: `Rota nao encontrada: ${req.method} ${req.originalUrl}` });
}
