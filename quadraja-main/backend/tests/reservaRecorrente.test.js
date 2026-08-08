import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import dayjs from 'dayjs';
import { app, request, prisma, auth, resetarBanco, semearBase, cadastrarCliente, criarReserva } from './helpers.js';
import { proximasDatasDoDiaSemana } from '../src/utils/dates.js';
import { OCORRENCIAS_RECORRENCIA, StatusReserva } from '../src/utils/constants.js';

const HORA = { horaInicio: '08:00', horaFim: '09:00' };

describe('Reserva recorrente (mensalista)', () => {
  let quadra;
  let diaSemana;
  let datas;

  beforeEach(async () => {
    await resetarBanco();
    ({ quadra } = await semearBase());
    // Sempre um dia da semana diferente de hoje, pra 1a ocorrencia nunca cair
    // no passado (a hora atual poderia ja ter passado se caisse em hoje).
    diaSemana = (dayjs().day() + 1) % 7;
    datas = proximasDatasDoDiaSemana(diaSemana, OCORRENCIAS_RECORRENCIA);
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('materializa OCORRENCIAS_RECORRENCIA reservas', async () => {
    const { token } = await cadastrarCliente();
    const res = await request(app)
      .post('/api/reservas-recorrentes')
      .set(auth(token))
      .send({ quadraId: quadra.id, diaSemana, ...HORA });

    assert.equal(res.status, 201);
    assert.equal(res.body.criadas.length, OCORRENCIAS_RECORRENCIA);
    assert.equal(res.body.puladas.length, 0);
    assert.equal(res.body.recorrente.ativo, true);
    assert.match(res.body.whatsappUrl, /wa\.me/);
  });

  test('data ja ocupada cai em puladas, sem abortar as demais (201)', async () => {
    const outro = await cadastrarCliente();
    await criarReserva(outro.token, { quadraId: quadra.id, data: datas[0], ...HORA });

    const { token } = await cadastrarCliente();
    const res = await request(app)
      .post('/api/reservas-recorrentes')
      .set(auth(token))
      .send({ quadraId: quadra.id, diaSemana, ...HORA });

    assert.equal(res.status, 201);
    assert.equal(res.body.criadas.length, OCORRENCIAS_RECORRENCIA - 1);
    assert.equal(res.body.puladas.length, 1);
    assert.equal(res.body.puladas[0].data, datas[0]);
  });

  test('cancelar so afeta reservas futuras; passadas ficam intocadas', async () => {
    const { token, usuario } = await cadastrarCliente();
    const criada = await request(app)
      .post('/api/reservas-recorrentes')
      .set(auth(token))
      .send({ quadraId: quadra.id, diaSemana, ...HORA });
    const recorrenteId = criada.body.recorrente.id;

    // Semeia uma reserva PASSADA vinculada a recorrencia direto no banco
    // (a API nao deixa criar reserva no passado pelo endpoint normal).
    const passada = await prisma.reserva.create({
      data: {
        clienteId: usuario.id,
        quadraId: quadra.id,
        data: '2020-01-01',
        horaInicio: '08:00',
        horaFim: '09:00',
        status: StatusReserva.CONFIRMADA,
        valor: quadra.valorHora,
        reservaRecorrenteId: recorrenteId,
      },
    });

    const res = await request(app).delete(`/api/reservas-recorrentes/${recorrenteId}`).set(auth(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.canceladas, OCORRENCIAS_RECORRENCIA);
    assert.equal(res.body.recorrente.ativo, false);

    const passadaDepois = await prisma.reserva.findUnique({ where: { id: passada.id } });
    assert.equal(passadaDepois.status, 'CONFIRMADA');

    const recorrenteDepois = await prisma.reservaRecorrente.findUnique({ where: { id: recorrenteId } });
    assert.equal(recorrenteDepois.ativo, false);
  });

  test('nao deixa cancelar a mesma recorrencia duas vezes (409)', async () => {
    const { token } = await cadastrarCliente();
    const criada = await request(app)
      .post('/api/reservas-recorrentes')
      .set(auth(token))
      .send({ quadraId: quadra.id, diaSemana, ...HORA });

    await request(app).delete(`/api/reservas-recorrentes/${criada.body.recorrente.id}`).set(auth(token));
    const res = await request(app)
      .delete(`/api/reservas-recorrentes/${criada.body.recorrente.id}`)
      .set(auth(token));
    assert.equal(res.status, 409);
  });
});
