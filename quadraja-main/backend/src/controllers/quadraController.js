import { quadraService } from '../services/quadraService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const quadraController = {
  listar: asyncHandler(async (req, res) => {
    // Por padrao a listagem publica traz so quadras ativas.
    const somenteAtivas = req.query.todas !== 'true';
    const quadras = await quadraService.listar({ somenteAtivas });
    res.json(quadras);
  }),

  criar: asyncHandler(async (req, res) => {
    const quadra = await quadraService.criar(req.body);
    res.status(201).json(quadra);
  }),

  atualizar: asyncHandler(async (req, res) => {
    const quadra = await quadraService.atualizar(req.params.id, req.body);
    res.json(quadra);
  }),
};
