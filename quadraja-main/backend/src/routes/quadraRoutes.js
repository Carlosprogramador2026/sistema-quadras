import { Router } from 'express';
import { quadraController } from '../controllers/quadraController.js';
import { validate } from '../middlewares/validate.js';
import { auth, requireGestor } from '../middlewares/auth.js';
import { criarQuadraSchema, atualizarQuadraSchema } from '../validators/index.js';

const router = Router();

// Listagem publica (cliente precisa ver as quadras para reservar).
router.get('/', quadraController.listar);

// Gestao das quadras (somente gestor).
router.post('/', auth, requireGestor, validate(criarQuadraSchema), quadraController.criar);
router.patch('/:id', auth, requireGestor, validate(atualizarQuadraSchema), quadraController.atualizar);

export default router;
