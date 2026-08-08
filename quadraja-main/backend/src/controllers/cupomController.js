import { cupomService } from '../services/cupomService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const cupomController = {
  listar: asyncHandler(async (_req, res) => {
    const cupons = await cupomService.listar();
    res.json(cupons);
  }),

  criar: asyncHandler(async (req, res) => {
    const cupom = await cupomService.criar(req.body);
    res.status(201).json(cupom);
  }),

  atualizar: asyncHandler(async (req, res) => {
    const cupom = await cupomService.atualizar(req.params.id, req.body);
    res.json(cupom);
  }),

  validar: asyncHandler(async (req, res) => {
    const resultado = await cupomService.validarParaQuadra(req.body);
    res.json(resultado);
  }),
};
