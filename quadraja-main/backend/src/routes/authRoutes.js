import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { validate } from '../middlewares/validate.js';
import { auth } from '../middlewares/auth.js';
import { cadastroClienteSchema, loginSchema } from '../validators/index.js';

const router = Router();

router.post('/clientes', validate(cadastroClienteSchema), authController.cadastrarCliente);
router.post('/clientes/login', validate(loginSchema), authController.loginCliente);
router.post('/gestores/login', validate(loginSchema), authController.loginGestor);
router.get('/eu', auth, authController.eu);

export default router;
