import { prisma } from '../utils/prisma.js';

export const quadraRepository = {
  listar({ somenteAtivas = false } = {}) {
    return prisma.quadra.findMany({
      where: somenteAtivas ? { ativa: true } : undefined,
      orderBy: { nome: 'asc' },
    });
  },
  buscarPorId(id) {
    return prisma.quadra.findUnique({ where: { id } });
  },
  criar(data) {
    return prisma.quadra.create({ data });
  },
  atualizar(id, data) {
    return prisma.quadra.update({ where: { id }, data });
  },
};
