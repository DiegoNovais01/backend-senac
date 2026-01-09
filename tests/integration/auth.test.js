import request from 'supertest';
import app from '../../src/index.js';

describe('Auth Endpoints', () => {
  describe('POST /auth/register', () => {
    test('deve registrar novo usuário com sucesso', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: `test-${Date.now()}@example.com`,
          senha: 'SenhaSegura123!',
          papel: 'aluno'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });

    test('deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: 'emailinvalido',
          senha: 'SenhaSegura123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    test('deve rejeitar email vazio', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: '',
          senha: 'SenhaSegura123!'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    test('deve rejeitar senha muito curta', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: `test-${Date.now()}@example.com`,
          senha: 'curta'
        });

      expect(response.status).toBe(400);
    });

    test('deve rejeitar nome muito curto', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Jo',
          email: `test-${Date.now()}@example.com`,
          senha: 'SenhaSegura123!'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    test('deve retornar erro com email não registrado', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'naoexiste@example.com',
          senha: 'QualquerSenha123'
        });

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    test('deve rejeitar email inválido', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'emailinvalido',
          senha: 'SenhaSegura123!'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/logout', () => {
    test('deve retornar erro sem refresh token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});
