import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';
import { Role } from '../utils/constants.js';

// Le o token Bearer e popula req.user = { id, role, nome }.
export function auth(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Token de autenticacao ausente.', 401));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError('Token invalido ou expirado.', 401));
  }
}

// Exige que o usuario autenticado seja um gestor.
export function requireGestor(req, _res, next) {
  if (req.user?.role !== Role.GESTOR) {
    return next(new AppError('Acesso restrito ao gestor.', 403));
  }
  next();
}

// Exige que o usuario autenticado seja um cliente.
export function requireCliente(req, _res, next) {
  if (req.user?.role !== Role.CLIENTE) {
    return next(new AppError('Acesso restrito ao cliente.', 403));
  }
  next();
}
