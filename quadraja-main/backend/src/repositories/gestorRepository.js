import { prisma } from '../utils/prisma.js';

export const gestorRepository = {
  buscarPorEmail(email) {
    return prisma.gestor.findUnique({ where: { email } });
  },
  buscarPorId(id) {
    return prisma.gestor.findUnique({ where: { id } });
  },
};
