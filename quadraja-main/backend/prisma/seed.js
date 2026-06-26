import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const senhaGestor = await bcrypt.hash('admin123', 10);

  const gestor = await prisma.gestor.upsert({
    where: { email: 'gestor@quadra.com' },
    update: {},
    create: {
      nome: 'Gestor da Quadra',
      email: 'gestor@quadra.com',
      senha: senhaGestor,
      whatsapp: process.env.GESTOR_WHATSAPP || '5511999998888',
    },
  });

  const quadras = ['Quadra Society 1', 'Quadra Society 2', 'Quadra Coberta'];
  for (const nome of quadras) {
    const existente = await prisma.quadra.findFirst({ where: { nome } });
    if (!existente) {
      await prisma.quadra.create({ data: { nome, ativa: true } });
    }
  }

  // Cliente de demonstracao
  const senhaCliente = await bcrypt.hash('cliente123', 10);
  await prisma.cliente.upsert({
    where: { email: 'cliente@teste.com' },
    update: {},
    create: {
      nome: 'Cliente Teste',
      telefone: '5511988887777',
      email: 'cliente@teste.com',
      senha: senhaCliente,
    },
  });

  console.log('Seed concluido.');
  console.log(`  Gestor:  gestor@quadra.com / admin123 (id ${gestor.id})`);
  console.log('  Cliente: cliente@teste.com / cliente123');
  console.log(`  Quadras: ${quadras.length} cadastradas`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
