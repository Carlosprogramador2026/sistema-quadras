import { Router } from 'express';
import authRoutes from './authRoutes.js';
import quadraRoutes from './quadraRoutes.js';
import disponibilidadeRoutes from './disponibilidadeRoutes.js';
import reservaRoutes from './reservaRoutes.js';
import listaEsperaRoutes from './listaEsperaRoutes.js';
import participanteRoutes from './participanteRoutes.js';
import cupomRoutes from './cupomRoutes.js';
import reservaRecorrenteRoutes from './reservaRecorrenteRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));

router.use('/', authRoutes); // /api/clientes, /api/gestores/login, /api/eu
router.use('/quadras', quadraRoutes);
router.use('/disponibilidade', disponibilidadeRoutes);
router.use('/reservas', reservaRoutes);
router.use('/lista-espera', listaEsperaRoutes);
router.use('/participantes', participanteRoutes);
router.use('/cupons', cupomRoutes);
router.use('/reservas-recorrentes', reservaRecorrenteRoutes);

export default router;
