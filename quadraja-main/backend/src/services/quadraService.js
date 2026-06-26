import { quadraRepository } from '../repositories/quadraRepository.js';
import { AppError } from '../utils/AppError.js';

export const quadraService = {
  listar({ somenteAtivas = false } = {}) {
    return quadraRepository.listar({ somenteAtivas });
  },

  async buscarOuFalhar(id) {
    const quadra = await quadraRepository.buscarPorId(id);
    if (!quadra) throw new AppError('Quadra nao encontrada.', 404);
    return quadra;
  },

  criar({ nome, ativa = true }) {
    return quadraRepository.criar({ nome, ativa });
  },

  async atualizar(id, dados) {
    await quadraService.buscarOuFalhar(id);
    return quadraRepository.atualizar(id, dados);
  },
};
