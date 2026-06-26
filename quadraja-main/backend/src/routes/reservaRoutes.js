import { Router } from 'express';
import { reservaController } from '../controllers/reservaController.js';
import { validate } from '../middlewares/validate.js';
import { auth, requireCliente, requireGestor } from '../middlewares/auth.js';
import {
  criarReservaSchema,
  listarReservasSchema,
  reservaIdSchema,
} from '../validators/index.js';

const router = Router();

// Cliente cria uma solicitacao de reserva.
router.post('/', auth, requireCliente, validate(criarReservaSchema), reservaController.criar);

// Gestor: filtra todas. Cliente: as suas (filtros ignorados).
router.get('/', auth, validate(listarReservasSchema), reservaController.listar);

// Resumo por status (cards do dashboard do gestor).
router.get('/resumo', auth, requireGestor, reservaController.resumo);

// Acoes do gestor.
router.patch('/:id/confirmar', auth, requireGestor, validate(reservaIdSchema), reservaController.confirmar);
router.patch('/:id/recusar', auth, requireGestor, validate(reservaIdSchema), reservaController.recusar);
router.delete('/:id', auth, requireGestor, validate(reservaIdSchema), reservaController.cancelar);

export default router;
