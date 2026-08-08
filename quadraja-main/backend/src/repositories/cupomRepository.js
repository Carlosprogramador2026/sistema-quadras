import { prisma } from '../utils/prisma.js';

export const cupomRepository = {
  criar(data) {
    return prisma.cupom.create({ data });
  },

  listar() {
    return prisma.cupom.findMany({ orderBy: { createdAt: 'desc' } });
  },

  buscarPorId(id) {
    return prisma.cupom.findUnique({ where: { id } });
  },

  buscarPorCodigo(codigo) {
    return prisma.cupom.findUnique({ where: { codigo } });
  },

  atualizar(id, data) {
    return prisma.cupom.update({ where: { id }, data });
  },

  incrementarUso(id) {
    return prisma.cupom.update({ where: { id }, data: { usosCount: { increment: 1 } } });
  },
};
