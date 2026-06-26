// Utilitarios compartilhados pelos testes de integracao.
// Usamos o app Express real (createApp) + Prisma apontando para um SQLite
// de teste (definido em DATABASE_URL no script "test" do package.json).
import request from 'supertest';
import bcrypt from 'bcryptjs';
import { createApp } from '../src/app.js';
import { prisma } from '../src/utils/prisma.js';

export const app = createApp();
export { prisma, request };

// Data sempre no futuro: evita que os slots sejam marcados como "passado".
export const DATA_FUTURA = '2099-12-31';

// Monta o header de autenticacao Bearer.
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

// Apaga todos os dados respeitando a ordem das chaves estrangeiras.
export async function resetarBanco() {
  await prisma.reserva.deleteMany();
  await prisma.listaEspera.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.quadra.deleteMany();
  await prisma.gestor.deleteMany();
}

// Cria um gestor (senha "admin123") e uma quadra ativa para os testes.
export async function semearBase() {
  const gestor = await prisma.gestor.create({
    data: {
      nome: 'Gestor Teste',
      email: 'gestor@teste.com',
      senha: await bcrypt.hash('admin123', 10),
      whatsapp: '5511999990000',
    },
  });
  const quadra = await prisma.quadra.create({ data: { nome: 'Quadra Teste', ativa: true } });
  return { gestor, quadra };
}

// Cadastra um cliente via API e devolve { token, usuario }.
export async function cadastrarCliente(over = {}) {
  const body = {
    nome: 'Fulano',
    telefone: '5511988887777',
    email: `cli_${Math.random().toString(36).slice(2)}@teste.com`,
    senha: 'senha123',
    ...over,
  };
  const res = await request(app).post('/api/clientes').send(body);
  return res.body; // { token, usuario }
}

// Faz login do gestor semeado e devolve o token.
export async function loginGestor() {
  const res = await request(app)
    .post('/api/gestores/login')
    .send({ email: 'gestor@teste.com', senha: 'admin123' });
  return res.body.token;
}

// Reserva (PENDENTE) de um cliente num slot. Devolve a resposta da API.
export function criarReserva(token, { quadraId, data = DATA_FUTURA, horaInicio = '08:00', horaFim = '09:00' }) {
  return request(app)
    .post('/api/reservas')
    .set(auth(token))
    .send({ quadraId, data, horaInicio, horaFim });
}
