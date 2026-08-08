import dayjs from 'dayjs';
import { cupomRepository } from '../repositories/cupomRepository.js';
import { quadraService } from './quadraService.js';
import { AppError } from '../utils/AppError.js';
import { TipoCupom } from '../utils/constants.js';

export const cupomService = {
  listar() {
    return cupomRepository.listar();
  },

  async buscarOuFalhar(id) {
    const cupom = await cupomRepository.buscarPorId(id);
    if (!cupom) throw new AppError('Cupom nao encontrado.', 404);
    return cupom;
  },

  async criar({ codigo, tipo, valor, ativo, validoAte, usosMaximos }) {
    const codigoNormalizado = codigo.toUpperCase();
    const existente = await cupomRepository.buscarPorCodigo(codigoNormalizado);
    if (existente) {
      throw new AppError('Ja existe um cupom com este codigo.', 409);
    }
    return cupomRepository.criar({
      codigo: codigoNormalizado,
      tipo,
      valor,
      ativo: ativo ?? true,
      validoAte: validoAte ?? null,
      usosMaximos: usosMaximos ?? null,
    });
  },

  async atualizar(id, dados) {
    await cupomService.buscarOuFalhar(id);
    const patch = { ...dados };
    if (patch.codigo) {
      patch.codigo = patch.codigo.toUpperCase();
      const existente = await cupomRepository.buscarPorCodigo(patch.codigo);
      if (existente && existente.id !== id) {
        throw new AppError('Ja existe um cupom com este codigo.', 409);
      }
    }
    return cupomRepository.atualizar(id, patch);
  },

  // Nucleo reutilizavel: valida um codigo contra um valor base e calcula o desconto.
  async validar({ codigo, valorBase }) {
    const cupom = await cupomRepository.buscarPorCodigo(codigo.toUpperCase());
    if (!cupom) throw new AppError('Cupom nao encontrado.', 404);
    if (!cupom.ativo) throw new AppError('Este cupom nao esta mais ativo.', 409);
    if (cupom.validoAte && dayjs(cupom.validoAte).isBefore(dayjs(), 'day')) {
      throw new AppError('Este cupom expirou.', 409);
    }
    if (cupom.usosMaximos != null && cupom.usosCount >= cupom.usosMaximos) {
      throw new AppError('Este cupom atingiu o limite de usos.', 409);
    }

    const desconto =
      cupom.tipo === TipoCupom.PERCENTUAL ? valorBase * (cupom.valor / 100) : Math.min(cupom.valor, valorBase);
    const valorFinal = Math.max(0, valorBase - desconto);

    return { cupom, desconto, valorFinal };
  },

  async validarParaQuadra({ codigo, quadraId }) {
    const quadra = await quadraService.buscarOuFalhar(quadraId);
    return cupomService.validar({ codigo, valorBase: quadra.valorHora });
  },

  incrementarUso(id) {
    return cupomRepository.incrementarUso(id);
  },
};
