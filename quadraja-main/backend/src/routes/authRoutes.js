import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { auth } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';
import { cadastroClienteSchema, loginSchema } from '../validators/index.js';

const router = Router();

// authLimiter: throttla tentativas malsucedidas (forca bruta/credential stuffing).
router.post('/clientes', authLimiter, validate(cadastroClienteSchema), authController.cadastrarCliente);
router.post('/clientes/login', authLimiter, validate(loginSchema), authController.loginCliente);
router.post('/gestores/login', authLimiter, validate(loginSchema), authController.loginGestor);
router.get('/eu', auth, authController.eu);

export default router;
