import jwt from 'jsonwebtoken';

const SEGREDOS_INSEGUROS = ['dev-secret', 'troque-este-segredo-em-producao'];

// Em producao, exige um JWT_SECRET real e forte: sem isso, qualquer um que
// descubra o segredo padrao consegue forjar tokens (inclusive de GESTOR).
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || SEGREDOS_INSEGUROS.includes(process.env.JWT_SECRET)) {
    throw new Error(
      'JWT_SECRET ausente ou inseguro em producao. Defina um segredo forte e unico na variavel de ambiente JWT_SECRET.'
    );
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET fraco: use um valor com pelo menos 32 caracteres em producao.');
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}
