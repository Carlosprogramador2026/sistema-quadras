import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { app, request, prisma, auth, resetarBanco, semearBase, cadastrarCliente } from './helpers.js';

describe('Validacao e tratamento de erros', () => {
  beforeEach(async () => {
    await resetarBanco();
    await semearBase();
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('dados invalidos no login retornam 422 com detalhes do Zod', async () => {
    const res = await request(app).post('/api/clientes/login').send({ email: 'naoEhEmail', senha: '' });

    assert.equal(res.status, 422);
    assert.equal(res.body.error, 'Dados invalidos.');
    assert.ok(Array.isArray(res.body.details) && res.body.details.length > 0);
  });

  test('JSON malformado retorna 400 (e nao 500)', async () => {
    const res = await request(app)
      .post('/api/clientes/login')
      .set('Content-Type', 'application/json')
      .send('{"email": ');

    assert.equal(res.status, 400);
  });

  test('payload acima do limite retorna 413 (e nao 500)', async () => {
    const res = await request(app)
      .post('/api/clientes/login')
      .send({ email: 'x'.repeat(20000), senha: 'a' });

    assert.equal(res.status, 413);
  });

  test('rota protegida sem token retorna 401', async () => {
    const res = await request(app).get('/api/reservas');
    assert.equal(res.status, 401);
  });

  test('cliente nao acessa acao de gestor retorna 403', async () => {
    const { token } = await cadastrarCliente();
    const res = await request(app).patch('/api/reservas/999/confirmar').set(auth(token));
    assert.equal(res.status, 403);
  });

  test('rota inexistente retorna 404', async () => {
    const res = await request(app).get('/api/nao-existe');
    assert.equal(res.status, 404);
  });
});
