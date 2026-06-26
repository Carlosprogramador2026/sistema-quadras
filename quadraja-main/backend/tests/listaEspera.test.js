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

const SLOT = { data: DATA_FUTURA, horaInicio: '08:00', horaFim: '09:00' };

describe('Lista de espera', () => {
  let quadra;

  beforeEach(async () => {
    await resetarBanco();
    ({ quadra } = await semearBase());
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('nao deixa entrar na fila de um horario LIVRE (409)', async () => {
    const { token } = await cadastrarCliente();
    const res = await request(app)
      .post('/api/lista-espera')
      .set(auth(token))
      .send({ quadraId: quadra.id, ...SLOT });

    assert.equal(res.status, 409);
  });

  test('cliente entra na fila de um horario ocupado (posicao 1)', async () => {
    const dono = await cadastrarCliente();
    const interessado = await cadastrarCliente();
    await criarReserva(dono.token, { quadraId: quadra.id, ...SLOT });

    const res = await request(app)
      .post('/api/lista-espera')
      .set(auth(interessado.token))
      .send({ quadraId: quadra.id, ...SLOT });

    assert.equal(res.status, 201);
    assert.equal(res.body.posicao, 1);
    assert.equal(res.body.notificado, false);
  });

  test('nao permite entrar duas vezes na mesma fila (409)', async () => {
    const dono = await cadastrarCliente();
    const interessado = await cadastrarCliente();
    await criarReserva(dono.token, { quadraId: quadra.id, ...SLOT });

    await request(app).post('/api/lista-espera').set(auth(interessado.token)).send({ quadraId: quadra.id, ...SLOT });
    const res = await request(app)
      .post('/api/lista-espera')
      .set(auth(interessado.token))
      .send({ quadraId: quadra.id, ...SLOT });

    assert.equal(res.status, 409);
  });

  test('ao cancelar a reserva, o 1o da fila e notificado', async () => {
    const dono = await cadastrarCliente();
    const interessado = await cadastrarCliente({ email: 'fila@teste.com' });
    const criada = await criarReserva(dono.token, { quadraId: quadra.id, ...SLOT });

    // interessado entra na fila
    await request(app).post('/api/lista-espera').set(auth(interessado.token)).send({ quadraId: quadra.id, ...SLOT });

    const gestor = await loginGestor();
    await request(app).patch(`/api/reservas/${criada.body.reserva.id}/confirmar`).set(auth(gestor));

    // gestor cancela -> deve notificar o 1o da fila
    const res = await request(app).delete(`/api/reservas/${criada.body.reserva.id}`).set(auth(gestor));

    assert.equal(res.status, 200);
    assert.ok(res.body.esperaNotificada, 'esperava notificar alguem da fila');
    assert.equal(res.body.esperaNotificada.listaEspera.cliente.email, 'fila@teste.com');
    assert.match(res.body.esperaNotificada.whatsappUrl, /wa\.me/);

    // a marca "notificado" foi persistida
    const fila = await prisma.listaEspera.findFirst({ where: { quadraId: quadra.id, horaInicio: '08:00' } });
    assert.equal(fila.notificado, true);
  });
});
