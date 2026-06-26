import { listaEsperaService } from '../services/listaEsperaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listaEsperaController = {
  entrar: asyncHandler(async (req, res) => {
    const item = await listaEsperaService.entrar({
      clienteId: req.user.id,
      ...req.body,
    });
    res.status(201).json(item);
  }),

  listar: asyncHandler(async (req, res) => {
    const itens = await listaEsperaService.listar(req.query);
    res.json(itens);
  }),
};
