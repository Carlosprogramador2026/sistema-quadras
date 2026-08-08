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

describe('Participantes, rateio e sorteio', () => {
  let quadra;

  beforeEach(async () => {
    await resetarBanco();
    ({ quadra } = await semearBase());
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('dono da reserva adiciona um participante (201)', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id, ...SLOT });

    const res = await request(app)
      .post('/api/participantes')
      .set(auth(token))
      .send({ reservaId: criada.body.reserva.id, nome: 'Amigo 1' });

    assert.equal(res.status, 201);
    assert.equal(res.body.nome, 'Amigo 1');
    assert.equal(res.body.confirmado, false);
    assert.equal(res.body.pago, false);
  });

  test('outro cliente nao pode adicionar participante numa reserva que nao e sua (403)', async () => {
    const dono = await cadastrarCliente();
    const intruso = await cadastrarCliente();
    const criada = await criarReserva(dono.token, { quadraId: quadra.id, ...SLOT });

    const res = await request(app)
      .post('/api/participantes')
      .set(auth(intruso.token))
      .send({ reservaId: criada.body.reserva.id, nome: 'Intruso' });

    assert.equal(res.status, 403);
  });

  test('cliente dono e gestor podem marcar um participante como pago', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id, ...SLOT });
    const add = await request(app)
      .post('/api/participantes')
      .set(auth(token))
      .send({ reservaId: criada.body.reserva.id, nome: 'Amigo 1' });

    const peloDono = await request(app)
      .patch(`/api/participantes/${add.body.id}`)
      .set(auth(token))
      .send({ pago: true });
    assert.equal(peloDono.status, 200);
    assert.equal(peloDono.body.pago, true);

    const gestor = await loginGestor();
    const peloGestor = await request(app)
      .patch(`/api/participantes/${add.body.id}`)
      .set(auth(gestor))
      .send({ confirmado: true });
    assert.equal(peloGestor.status, 200);
    assert.equal(peloGestor.body.confirmado, true);
  });

  test('GET /reservas/:id calcula o rateio pelos confirmados', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id, ...SLOT });
    const reservaId = criada.body.reserva.id;

    const semConfirmados = await request(app).get(`/api/reservas/${reservaId}`).set(auth(token));
    assert.equal(semConfirmados.body.rateio.confirmados, 0);
    assert.equal(semConfirmados.body.rateio.valorPorPessoa, 100); // quadra semeada com valorHora=100

    const p1 = await request(app)
      .post('/api/participantes')
      .set(auth(token))
      .send({ reservaId, nome: 'Amigo 1' });
    const p2 = await request(app)
      .post('/api/participantes')
      .set(auth(token))
      .send({ reservaId, nome: 'Amigo 2' });
    await request(app).patch(`/api/participantes/${p1.body.id}`).set(auth(token)).send({ confirmado: true });
    await request(app).patch(`/api/participantes/${p2.body.id}`).set(auth(token)).send({ confirmado: true });

    const comConfirmados = await request(app).get(`/api/reservas/${reservaId}`).set(auth(token));
    assert.equal(comConfirmados.body.rateio.confirmados, 2);
    assert.equal(comConfirmados.body.rateio.valorPorPessoa, 50);
  });

  test('sorteio exige ao menos 2 confirmados (409)', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id, ...SLOT });

    const res = await request(app).post(`/api/reservas/${criada.body.reserva.id}/sorteio`).set(auth(token));
    assert.equal(res.status, 409);
  });

  test('sorteio divide os confirmados em 2 times e persiste apos reload', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id, ...SLOT });
    const reservaId = criada.body.reserva.id;

    const nomes = ['Ana', 'Bia', 'Caio', 'Duda', 'Eva'];
    for (const nome of nomes) {
      const p = await request(app).post('/api/participantes').set(auth(token)).send({ reservaId, nome });
      await request(app).patch(`/api/participantes/${p.body.id}`).set(auth(token)).send({ confirmado: true });
    }

    const sorteio = await request(app).post(`/api/reservas/${reservaId}/sorteio`).set(auth(token));
    assert.equal(sorteio.status, 200);
    const time1 = sorteio.body.filter((p) => p.time === 1).length;
    const time2 = sorteio.body.filter((p) => p.time === 2).length;
    assert.equal(time1 + time2, 5);
    assert.ok(Math.abs(time1 - time2) <= 1);

    // persistencia: um novo GET mostra os mesmos times.
    const detalhe = await request(app).get(`/api/reservas/${reservaId}`).set(auth(token));
    const time1Depois = detalhe.body.participantes.filter((p) => p.time === 1).length;
    assert.equal(time1Depois, time1);
  });

  test('remove um participante', async () => {
    const { token } = await cadastrarCliente();
    const criada = await criarReserva(token, { quadraId: quadra.id, ...SLOT });
    const p = await request(app)
      .post('/api/participantes')
      .set(auth(token))
      .send({ reservaId: criada.body.reserva.id, nome: 'Amigo 1' });

    const res = await request(app).delete(`/api/participantes/${p.body.id}`).set(auth(token));
    assert.equal(res.status, 204);

    const detalhe = await request(app).get(`/api/reservas/${criada.body.reserva.id}`).set(auth(token));
    assert.equal(detalhe.body.participantes.length, 0);
  });
});
