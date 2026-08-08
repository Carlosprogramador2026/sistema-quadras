import { quadraService } from '../services/quadraService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Role } from '../utils/constants.js';

export const quadraController = {
  listar: asyncHandler(async (req, res) => {
    // Por padrao a listagem publica traz so quadras ativas. Ver inativas
    // (?todas=true) e um recurso de gestao, entao exige estar logado como gestor.
    const podeVerTodas = req.query.todas === 'true' && req.user?.role === Role.GESTOR;
    const quadras = await quadraService.listar({ somenteAtivas: !podeVerTodas });
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
