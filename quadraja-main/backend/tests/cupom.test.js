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
} from './helpers.js';

const DATA_PASSADA = '2020-01-01';
const SLOT = { data: DATA_FUTURA, horaInicio: '08:00', horaFim: '09:00' };

function criarCupom(token, over = {}) {
  return request(app)
    .post('/api/cupons')
    .set(auth(token))
    .send({ codigo: 'PROMO10', tipo: 'PERCENTUAL', valor: 10, ...over });
}

describe('Cupons de desconto', () => {
  let quadra;

  beforeEach(async () => {
    await resetarBanco();
    ({ quadra } = await semearBase()); // valorHora = 100
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('gestor cria um cupom (201)', async () => {
    const gestor = await loginGestor();
    const res = await criarCupom(gestor);
    assert.equal(res.status, 201);
    assert.equal(res.body.codigo, 'PROMO10');
    assert.equal(res.body.ativo, true);
  });

  test('nao deixa criar cupom com codigo duplicado (409)', async () => {
    const gestor = await loginGestor();
    await criarCupom(gestor);
    const res = await criarCupom(gestor);
    assert.equal(res.status, 409);
  });

  test('cliente nao pode criar cupom (403)', async () => {
    const { token } = await cadastrarCliente();
    const res = await criarCupom(token);
    assert.equal(res.status, 403);
  });

  test('validar cupom PERCENTUAL calcula o desconto sobre o valor da quadra', async () => {
    const gestor = await loginGestor();
    await criarCupom(gestor, { codigo: 'DEZ', tipo: 'PERCENTUAL', valor: 10 });
    const { token } = await cadastrarCliente();

    const res = await request(app)
      .post('/api/cupons/validar')
      .set(auth(token))
      .send({ codigo: 'dez', quadraId: quadra.id }); // minusculo: normalizacao

    assert.equal(res.status, 200);
    assert.equal(res.body.desconto, 10);
    assert.equal(res.body.valorFinal, 90);
  });

  test('validar cupom FIXO nao deixa o valor final ficar negativo', async () => {
    const gestor = await loginGestor();
    await criarCupom(gestor, { codigo: 'FIXO200', tipo: 'FIXO', valor: 200 });
    const { token } = await cadastrarCliente();

    const res = await request(app)
      .post('/api/cupons/validar')
      .set(auth(token))
      .send({ codigo: 'FIXO200', quadraId: quadra.id });

    assert.equal(res.status, 200);
    assert.equal(res.body.desconto, 100); // limitado ao valor base
    assert.equal(res.body.valorFinal, 0);
  });

  test('cupom inexistente retorna 404', async () => {
    const { token } = await cadastrarCliente();
    const res = await request(app)
      .post('/api/cupons/validar')
      .set(auth(token))
      .send({ codigo: 'NAOEXISTE', quadraId: quadra.id });
    assert.equal(res.status, 404);
  });

  test('cupom inativo retorna 409', async () => {
    const gestor = await loginGestor();
    const criado = await criarCupom(gestor, { ativo: false });
    const { token } = await cadastrarCliente();

    const res = await request(app)
      .post('/api/cupons/validar')
      .set(auth(token))
      .send({ codigo: criado.body.codigo, quadraId: quadra.id });
    assert.equal(res.status, 409);
  });

  test('cupom expirado retorna 409', async () => {
    const gestor = await loginGestor();
    await criarCupom(gestor, { codigo: 'VENCIDO', validoAte: DATA_PASSADA });
    const { token } = await cadastrarCliente();

    const res = await request(app)
      .post('/api/cupons/validar')
      .set(auth(token))
      .send({ codigo: 'VENCIDO', quadraId: quadra.id });
    assert.equal(res.status, 409);
  });

  test('cupom no limite de usos retorna 409', async () => {
    const gestor = await loginGestor();
    await criarCupom(gestor, { codigo: 'LIMITADO', usosMaximos: 1 });
    const cliente1 = await cadastrarCliente();
    const cliente2 = await cadastrarCliente();

    const primeira = await request(app)
      .post('/api/reservas')
      .set(auth(cliente1.token))
      .send({ quadraId: quadra.id, ...SLOT, cupomCodigo: 'LIMITADO' });
    assert.equal(primeira.status, 201);
    assert.equal(primeira.body.reserva.valor, 90);

    const segunda = await request(app)
      .post('/api/reservas')
      .set(auth(cliente2.token))
      .send({ quadraId: quadra.id, data: DATA_FUTURA, horaInicio: '09:00', horaFim: '10:00', cupomCodigo: 'LIMITADO' });
    assert.equal(segunda.status, 409);
  });

  test('reserva com cupom valido aplica o desconto e incrementa o uso', async () => {
    const gestor = await loginGestor();
    const criado = await criarCupom(gestor, { codigo: 'ABC10', tipo: 'PERCENTUAL', valor: 10 });
    const { token } = await cadastrarCliente();

    const res = await request(app)
      .post('/api/reservas')
      .set(auth(token))
      .send({ quadraId: quadra.id, ...SLOT, cupomCodigo: 'ABC10' });

    assert.equal(res.status, 201);
    assert.equal(res.body.reserva.valor, 90);
    assert.equal(res.body.reserva.cupomId, criado.body.id);

    const cupomAtualizado = await prisma.cupom.findUnique({ where: { id: criado.body.id } });
    assert.equal(cupomAtualizado.usosCount, 1);
  });

  test('reserva com cupom invalido nao e criada com valor cheio (404, nao 201)', async () => {
    const { token } = await cadastrarCliente();
    const res = await request(app)
      .post('/api/reservas')
      .set(auth(token))
      .send({ quadraId: quadra.id, ...SLOT, cupomCodigo: 'NAOEXISTE' });

    assert.equal(res.status, 404);

    const reservas = await prisma.reserva.findMany();
    assert.equal(reservas.length, 0);
  });
});
