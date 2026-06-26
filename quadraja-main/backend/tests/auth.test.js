import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { app, request, prisma, resetarBanco, semearBase, cadastrarCliente } from './helpers.js';

describe('Autenticacao', () => {
  // Banco zerado e semeado antes de cada teste (isolamento).
  beforeEach(async () => {
    await resetarBanco();
    await semearBase();
  });
  after(async () => {
    await prisma.$disconnect();
  });

  test('cadastra cliente e retorna token (201), sem vazar a senha', async () => {
    const res = await request(app).post('/api/clientes').send({
      nome: 'Maria',
      telefone: '5511999998888',
      email: 'maria@teste.com',
      senha: 'senha123',
    });

    assert.equal(res.status, 201);
    assert.ok(res.body.token, 'deveria retornar um token');
    assert.equal(res.body.usuario.email, 'maria@teste.com');
    assert.equal(res.body.usuario.senha, undefined, 'a senha nao pode voltar na resposta');
  });

  test('nao cadastra com e-mail duplicado (409)', async () => {
    const dados = { nome: 'Ana', telefone: '5511999990000', email: 'dup@teste.com', senha: 'senha123' };
    await request(app).post('/api/clientes').send(dados);
    const res = await request(app).post('/api/clientes').send(dados);
    assert.equal(res.status, 409);
  });

  test('login do cliente com senha correta (200)', async () => {
    await cadastrarCliente({ email: 'joao@teste.com', senha: 'certa123' });
    const res = await request(app)
      .post('/api/clientes/login')
      .send({ email: 'joao@teste.com', senha: 'certa123' });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
  });

  test('login com senha errada falha (401)', async () => {
    await cadastrarCliente({ email: 'joao2@teste.com', senha: 'certa123' });
    const res = await request(app)
      .post('/api/clientes/login')
      .send({ email: 'joao2@teste.com', senha: 'errada' });

    assert.equal(res.status, 401);
  });

  test('login do gestor semeado funciona (200)', async () => {
    const res = await request(app)
      .post('/api/gestores/login')
      .send({ email: 'gestor@teste.com', senha: 'admin123' });

    assert.equal(res.status, 200);
    assert.equal(res.body.usuario.email, 'gestor@teste.com');
    assert.equal(res.body.role, undefined); // role vem do token, nao do corpo
  });
});
