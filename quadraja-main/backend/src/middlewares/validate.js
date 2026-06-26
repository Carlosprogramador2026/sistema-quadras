import { AppError } from '../utils/AppError.js';

// Middleware que valida partes da requisicao com um schema Zod.
// Uso: validate({ body: schema, query: schema, params: schema })
export function validate(schemas) {
  return (req, _res, next) => {
    try {
      for (const parte of ['body', 'query', 'params']) {
        if (schemas[parte]) {
          req[parte] = schemas[parte].parse(req[parte]);
        }
      }
      next();
    } catch (err) {
      if (err?.issues) {
        const details = err.issues.map((i) => ({
          campo: i.path.join('.'),
          mensagem: i.message,
        }));
        return next(new AppError('Dados invalidos.', 422, details));
      }
      next(err);
    }
  };
}
