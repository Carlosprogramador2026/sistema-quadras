import { prisma } from '../utils/prisma.js';

const incluirRelacoes = {
  cliente: { select: { id: true, nome: true, telefone: true, email: true } },
  quadra: { select: { id: true, nome: true } },
};

export const listaEsperaRepository = {
  criar(data) {
    return prisma.listaEspera.create({ data, include: incluirRelacoes });
  },

  // Proxima posicao na fila de um slot especifico.
  contarNoSlot({ quadraId, data, horaInicio }) {
    return prisma.listaEspera.count({ where: { quadraId, data, horaInicio } });
  },

  jaInscrito({ clienteId, quadraId, data, horaInicio }) {
    return prisma.listaEspera.findFirst({
      where: { clienteId, quadraId, data, horaInicio },
    });
  },

  // Primeiro da fila de um slot (menor posicao).
  primeiroDaFila({ quadraId, data, horaInicio }) {
    return prisma.listaEspera.findFirst({
      where: { quadraId, data, horaInicio },
      orderBy: { posicao: 'asc' },
      include: incluirRelacoes,
    });
  },

  remover(id) {
    return prisma.listaEspera.delete({ where: { id } });
  },

  marcarNotificado(id) {
    return prisma.listaEspera.update({ where: { id }, data: { notificado: true } });
  },

  listar({ quadraId, data } = {}) {
    return prisma.listaEspera.findMany({
      where: {
        ...(quadraId ? { quadraId } : {}),
        ...(data ? { data } : {}),
      },
      include: incluirRelacoes,
      orderBy: [{ data: 'asc' }, { horaInicio: 'asc' }, { posicao: 'asc' }],
    });
  },
};
