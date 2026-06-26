import { Router } from 'express';
import { listaEsperaController } from '../controllers/listaEsperaController.js';
import { validate } from '../middlewares/validate.js';
import { auth, requireCliente, requireGestor } from '../middlewares/auth.js';
import { entrarListaEsperaSchema, listarReservasSchema } from '../validators/index.js';

const router = Router();

// Cliente entra na fila de um horario ocupado.
router.post('/', auth, requireCliente, validate(entrarListaEsperaSchema), listaEsperaController.entrar);

// Gestor visualiza as filas.
router.get('/', auth, requireGestor, validate(listarReservasSchema), listaEsperaController.listar);

export default router;
