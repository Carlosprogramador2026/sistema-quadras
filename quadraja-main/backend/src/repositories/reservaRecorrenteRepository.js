import { prisma } from '../utils/prisma.js';

const incluirRelacoes = {
  quadra: { select: { id: true, nome: true } },
};

export const reservaRecorrenteRepository = {
  criar(data) {
    return prisma.reservaRecorrente.create({ data, include: incluirRelacoes });
  },

  buscarPorId(id) {
    return prisma.reservaRecorrente.findUnique({ where: { id }, include: incluirRelacoes });
  },

  listarDoCliente(clienteId) {
    return prisma.reservaRecorrente.findMany({
      where: { clienteId },
      include: incluirRelacoes,
      orderBy: { createdAt: 'desc' },
    });
  },

  atualizarAtivo(id, ativo) {
    return prisma.reservaRecorrente.update({ where: { id }, data: { ativo }, include: incluirRelacoes });
  },
};
