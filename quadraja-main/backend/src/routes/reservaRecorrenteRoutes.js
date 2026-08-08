import { Router } from 'express';
import { reservaRecorrenteController } from '../controllers/reservaRecorrenteController.js';
import { validate } from '../middlewares/validate.js';
import { auth, requireCliente } from '../middlewares/auth.js';
import { criarReservaRecorrenteSchema, recorrenteIdSchema } from '../validators/index.js';

const router = Router();

router.post(
  '/',
  auth,
  requireCliente,
  validate(criarReservaRecorrenteSchema),
  reservaRecorrenteController.criar
);
router.get('/', auth, requireCliente, reservaRecorrenteController.listar);
router.delete('/:id', auth, requireCliente, validate(recorrenteIdSchema), reservaRecorrenteController.cancelar);

export default router;
