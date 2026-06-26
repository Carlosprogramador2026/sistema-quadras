import { prisma } from '../utils/prisma.js';

export const clienteRepository = {
  criar(data) {
    return prisma.cliente.create({ data });
  },
  buscarPorEmail(email) {
    return prisma.cliente.findUnique({ where: { email } });
  },
  buscarPorId(id) {
    return prisma.cliente.findUnique({ where: { id } });
  },
};
