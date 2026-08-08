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

// Detalhe de uma reserva (participantes + rateio). Precisa vir depois de /resumo,
// senao "/resumo" seria capturado por "/:id". Cliente so ve a propria; gestor ve todas.
router.get('/:id', auth, validate(reservaIdSchema), reservaController.detalhar);

// Sorteia 2 times entre os confirmados. Dono cliente ou gestor (checado no service).
router.post('/:id/sorteio', auth, validate(reservaIdSchema), reservaController.sortear);

// Acoes do gestor.
router.patch('/:id/confirmar', auth, requireGestor, validate(reservaIdSchema), reservaController.confirmar);
router.patch('/:id/recusar', auth, requireGestor, validate(reservaIdSchema), reservaController.recusar);
router.delete('/:id', auth, requireGestor, validate(reservaIdSchema), reservaController.cancelar);

export default router;
