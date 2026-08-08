import { Router } from 'express';
import { participanteController } from '../controllers/participanteController.js';
import { validate } from '../middlewares/validate.js';
import { auth, requireCliente } from '../middlewares/auth.js';
import {
  criarParticipanteSchema,
  atualizarParticipanteSchema,
  participanteIdSchema,
} from '../validators/index.js';

const router = Router();

// So o cliente dono da reserva adiciona participantes.
router.post('/', auth, requireCliente, validate(criarParticipanteSchema), participanteController.criar);

// Cliente dono OU gestor podem atualizar (confirmado/pago/nome/telefone) — checagem no service.
router.patch('/:id', auth, validate(atualizarParticipanteSchema), participanteController.atualizar);

// So o cliente dono da reserva remove participantes.
router.delete('/:id', auth, requireCliente, validate(participanteIdSchema), participanteController.remover);

export default router;
