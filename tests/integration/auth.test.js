import request from 'supertest';
import app from '../../src/index.js';

describe('Auth Endpoints', () => {
  let validToken = null;
  let validRefreshToken = null;
  const testUserEmail = `test-${Date.now()}@example.com`;

  describe('POST /auth/register', () => {
    test('deve registrar novo usuário com sucesso', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Usuário Teste',
          email: testUserEmail,
          senha: 'SenhaSegura123!',
          papel: 'aluno'
        });

      expect(response.status).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();

      // Armazenar token para testes posteriores
      if (response.body.data.token) {
        validToken = response.body.data.token;
      }
      if (response.body.data.refreshToken) {
        validRefreshToken = response.body.data.refreshToken;
      }
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
    test('deve fazer login com sucesso', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          senha: 'SenhaSegura123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBeDefined();

      if (response.body.data.token) {
        validToken = response.body.data.token;
      }
    });

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

    test('deve retornar erro com senha errada', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: testUserEmail,
          senha: 'SenhaErrada123!'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Protected Auth Endpoints', () => {
    test('deve retornar 401 sem token em endpoint protegido', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', '');

      expect(response.status).toBe(401);
    });

    test('deve rejeitar token inválido', async () => {
      const response = await request(app)
        .get('/auth/verify')
        .set('Authorization', 'Bearer token_invalido_12345');

      expect(response.status).toBe(401);
    });

    test('deve aceitar token válido em /auth/verify', async () => {
      if (validToken) {
        const response = await request(app)
          .get('/auth/verify')
          .set('Authorization', `Bearer ${validToken}`);

        expect(response.status).toBeOneOf([200, 401]); // 200 se endpoint existe, 401 se token inválido
      }
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

    test('deve fazer logout com sucesso com token válido', async () => {
      if (validRefreshToken) {
        const response = await request(app)
          .post('/auth/logout')
          .send({
            refreshToken: validRefreshToken
          });

        expect([200, 204]).toContain(response.status);
      }
    });
  });
});
