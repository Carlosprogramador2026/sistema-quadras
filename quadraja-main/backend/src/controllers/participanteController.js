import { participanteService } from '../services/participanteService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const participanteController = {
  criar: asyncHandler(async (req, res) => {
    const participante = await participanteService.adicionar({
      ...req.body,
      ator: { id: req.user.id, role: req.user.role },
    });
    res.status(201).json(participante);
  }),

  atualizar: asyncHandler(async (req, res) => {
    const participante = await participanteService.atualizar({
      id: req.params.id,
      dados: req.body,
      ator: { id: req.user.id, role: req.user.role },
    });
    res.json(participante);
  }),

  remover: asyncHandler(async (req, res) => {
    await participanteService.remover({
      id: req.params.id,
      ator: { id: req.user.id, role: req.user.role },
    });
    res.status(204).end();
  }),
};
