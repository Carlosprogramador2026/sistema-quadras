import { reservaRecorrenteService } from '../services/reservaRecorrenteService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const reservaRecorrenteController = {
  criar: asyncHandler(async (req, res) => {
    const resultado = await reservaRecorrenteService.criar({
      clienteId: req.user.id,
      ...req.body,
    });
    res.status(201).json(resultado);
  }),

  listar: asyncHandler(async (req, res) => {
    const recorrencias = await reservaRecorrenteService.listarDoCliente(req.user.id);
    res.json(recorrencias);
  }),

  cancelar: asyncHandler(async (req, res) => {
    const resultado = await reservaRecorrenteService.cancelar({
      id: req.params.id,
      clienteId: req.user.id,
    });
    res.json(resultado);
  }),
};
