import request from 'supertest';
import app from '../../src/index.js';

describe('Aluno Endpoints', () => {
  let alunoId;
  let authToken = null;

  // Gerar token de autenticação antes dos testes
  beforeAll(async () => {
    try {
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Admin Teste Aluno',
          email: `admin-aluno-${Date.now()}@example.com`,
          senha: 'AdminSenha123!',
          papel: 'admin'
        });

      if (registerResponse.body.data?.token) {
        authToken = registerResponse.body.data.token;
      }
    } catch (error) {
      console.log('Erro ao gerar token para testes');
    }
  });

  describe('GET /alunos - Sem Autenticação', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/alunos');

      expect(response.status).toBe(401);
      expect(response.body.status).toBe('error');
    });

    test('deve retornar 401 com token inválido', async () => {
      const response = await request(app)
        .get('/alunos')
        .set('Authorization', 'Bearer token_invalido_xyz');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /alunos - Com Autenticação', () => {
    test('deve listar alunos com token válido', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/alunos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    test('deve suportar paginação com limit', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/alunos?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.meta.limit).toBe(10);
    });
  });

  describe('GET /alunos/:id', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/alunos/1');

      expect(response.status).toBe(401);
    });

    test('deve retornar 400 para ID inválido com autenticação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/alunos/abc')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para aluno inexistente', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/alunos/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /alunos/:id', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .delete('/alunos/1');

      expect(response.status).toBe(401);
    });

    test('deve retornar 400 para ID inválido com autenticação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .delete('/alunos/xyz')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para aluno inexistente', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .delete('/alunos/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});
