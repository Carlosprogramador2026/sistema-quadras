import { reservaService } from '../services/reservaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Role } from '../utils/constants.js';

export const reservaController = {
  criar: asyncHandler(async (req, res) => {
    const result = await reservaService.criar({
      clienteId: req.user.id,
      ...req.body,
    });
    res.status(201).json(result);
  }),

  // Gestor lista todas (com filtros); cliente lista as suas.
  listar: asyncHandler(async (req, res) => {
    if (req.user.role === Role.GESTOR) {
      const reservas = await reservaService.listarParaGestor(req.query);
      return res.json(reservas);
    }
    const reservas = await reservaService.listarDoCliente(req.user.id);
    res.json(reservas);
  }),

  resumo: asyncHandler(async (_req, res) => {
    const resumo = await reservaService.resumoStatus();
    res.json(resumo);
  }),

  confirmar: asyncHandler(async (req, res) => {
    const reserva = await reservaService.confirmar(req.params.id);
    res.json(reserva);
  }),

  recusar: asyncHandler(async (req, res) => {
    const reserva = await reservaService.recusar(req.params.id);
    res.json(reserva);
  }),

  cancelar: asyncHandler(async (req, res) => {
    const result = await reservaService.cancelar(req.params.id);
    res.json(result);
  }),
};
