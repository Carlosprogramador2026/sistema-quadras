import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import {
  app,
  request,
  prisma,
  auth,
  DATA_FUTURA,
  resetarBanco,
  semearBase,
  cadastrarCliente,
  loginGestor,
  criarReserva,
} from './helpers.js';

describe('Reservas e disponibilidade', () => {
  let quadra;

  beforeEach(async () => {
    await resetarBanco();
    ({ quadra } = await semearBase());
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('disponibilidade: dia livre traz 15 slots, todos LIVRE', async () => {
    const res = await request(app).get('/api/disponibilidade').query({ quadraId: quadra.id, data: DATA_FUTURA });

    assert.equal(res.status, 200);
    assert.equal(res.body.slots.length, 15); // 08:00 -> 23:00, de hora em hora
    assert.ok(res.body.slots.every((s) => s.status === 'LIVRE' && s.disponivel));
  });

  test('cliente cria reserva PENDENTE e recebe link do WhatsApp', async () => {
    const { token } = await cadastrarCliente();
    const res = await criarReserva(token, { quadraId: quadra.id });

    assert.equal(res.status, 201);
    assert.equal(res.body.reserva.status, 'PENDENTE');
    assert.match(res.body.whatsappUrl, /wa\.me/);
  });

  test('horario ocupado nao pode ser reservado de novo (409)', async () => {
    const a = await cadastrarCliente();
    const b = await cadastrarCliente();
    await criarReserva(a.token, { quadraId: quadra.id });

    const res = await criarReserva(b.token, { quadraId: quadra.id });
    assert.equal(res.status, 409);
    assert.equal(res.body.details?.ocupado, true);
  });

  test('disponibilidade reflete o slot ocupado apos a reserva', async () => {
    const { token } = await cadastrarCliente();
    await criarReserva(token, { quadraId: quadra.id, horaInicio: '08:00', horaFim: '09:00' });

    const res = await request(app).get('/api/disponibilidade').query({ quadraId: quadra.id, data: DATA_FUTURA });
    const slot = res.body.slots.find((s) => s.horaInicio === '08:00');
    assert.equal(slot.status, 'PENDENTE');
    assert.equal(slot.disponivel, false);
  });

  test('gestor confirma a reserva (PENDENTE -> CONFIRMADA)', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id });
    const gestor = await loginGestor();

    const res = await request(app).patch(`/api/reservas/${criada.body.reserva.id}/confirmar`).set(auth(gestor));
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'CONFIRMADA');
  });

  test('gestor recusa a reserva (PENDENTE -> CANCELADA)', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id });
    const gestor = await loginGestor();

    const res = await request(app).patch(`/api/reservas/${criada.body.reserva.id}/recusar`).set(auth(gestor));
    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'CANCELADA');
  });

  test('gestor cancela a reserva (sem fila, esperaNotificada = null)', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id });
    const gestor = await loginGestor();

    const res = await request(app).delete(`/api/reservas/${criada.body.reserva.id}`).set(auth(gestor));
    assert.equal(res.status, 200);
    assert.equal(res.body.reserva.status, 'CANCELADA');
    assert.equal(res.body.esperaNotificada, null);
  });

  test('cliente so enxerga as proprias reservas', async () => {
    const a = await cadastrarCliente();
    const b = await cadastrarCliente();
    await criarReserva(a.token, { quadraId: quadra.id, horaInicio: '08:00', horaFim: '09:00' });
    await criarReserva(b.token, { quadraId: quadra.id, horaInicio: '09:00', horaFim: '10:00' });

    const res = await request(app).get('/api/reservas').set(auth(a.token));
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].horaInicio, '08:00');
  });
});
