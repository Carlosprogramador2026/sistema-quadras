import { prisma } from '../utils/prisma.js';

const incluirRelacoes = {
  cliente: { select: { id: true, nome: true, telefone: true, email: true } },
  quadra: { select: { id: true, nome: true } },
};

export const reservaRepository = {
  criar(data) {
    return prisma.reserva.create({ data, include: incluirRelacoes });
  },

  buscarPorId(id) {
    return prisma.reserva.findUnique({ where: { id }, include: incluirRelacoes });
  },

  atualizarStatus(id, status) {
    return prisma.reserva.update({
      where: { id },
      data: { status },
      include: incluirRelacoes,
    });
  },

  // Reservas que ocupam um slot (filtra por status fornecidos).
  buscarPorSlot({ quadraId, data, horaInicio, statusIn }) {
    return prisma.reserva.findFirst({
      where: { quadraId, data, horaInicio, status: { in: statusIn } },
      include: incluirRelacoes,
    });
  },

  // Reservas que ocupam algum slot do dia (para montar a disponibilidade).
  listarOcupadasDoDia({ quadraId, data, statusIn }) {
    return prisma.reserva.findMany({
      where: { quadraId, data, status: { in: statusIn } },
    });
  },

  listar({ status, data, quadraId, clienteId } = {}) {
    return prisma.reserva.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(data ? { data } : {}),
        ...(quadraId ? { quadraId } : {}),
        ...(clienteId ? { clienteId } : {}),
      },
      include: incluirRelacoes,
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }],
    });
  },

  contarPorStatus() {
    return prisma.reserva.groupBy({ by: ['status'], _count: { _all: true } });
  },
};
