import { Router } from 'express';
import { cupomController } from '../controllers/cupomController.js';
import { validate } from '../middlewares/validate.js';
import { auth, requireGestor, requireCliente } from '../middlewares/auth.js';
import { criarCupomSchema, atualizarCupomSchema, validarCupomSchema } from '../validators/index.js';

const router = Router();

// Gestao de cupons (somente gestor).
router.get('/', auth, requireGestor, cupomController.listar);
router.post('/', auth, requireGestor, validate(criarCupomSchema), cupomController.criar);
router.patch('/:id', auth, requireGestor, validate(atualizarCupomSchema), cupomController.atualizar);

// Cliente valida um codigo antes de confirmar a reserva.
router.post('/validar', auth, requireCliente, validate(validarCupomSchema), cupomController.validar);

export default router;
