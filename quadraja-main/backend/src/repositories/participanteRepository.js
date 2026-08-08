import { prisma } from '../utils/prisma.js';

const incluirReserva = {
  reserva: { select: { id: true, clienteId: true, status: true } },
};

export const participanteRepository = {
  criar(data) {
    return prisma.participante.create({ data });
  },

  listarPorReserva(reservaId) {
    return prisma.participante.findMany({
      where: { reservaId },
      orderBy: { createdAt: 'asc' },
    });
  },

  buscarPorId(id) {
    return prisma.participante.findUnique({ where: { id }, include: incluirReserva });
  },

  atualizar(id, data) {
    return prisma.participante.update({ where: { id }, data });
  },

  remover(id) {
    return prisma.participante.delete({ where: { id } });
  },
};
