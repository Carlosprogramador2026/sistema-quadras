import { disponibilidadeService } from '../services/disponibilidadeService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const disponibilidadeController = {
  listar: asyncHandler(async (req, res) => {
    const { quadraId, data } = req.query;
    const result = await disponibilidadeService.listar({ quadraId, data });
    res.json(result);
  }),
};
