import { Router } from 'express';
import { disponibilidadeController } from '../controllers/disponibilidadeController.js';
import { validate } from '../middlewares/validate.js';
import { disponibilidadeSchema } from '../validators/index.js';

const router = Router();

// Publica: qualquer um pode consultar os horarios de um dia.
router.get('/', validate(disponibilidadeSchema), disponibilidadeController.listar);

export default router;
