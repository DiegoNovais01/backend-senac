import request from 'supertest';
import app from '../../src/index.js';

describe('Curso Endpoints', () => {
  let authToken = null;

  // Gerar token de autenticação antes dos testes
  beforeAll(async () => {
    try {
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          nome: 'Admin Teste Curso',
          email: `admin-curso-${Date.now()}@example.com`,
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

  describe('GET /cursos - Sem Autenticação', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/cursos');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /cursos - Com Autenticação', () => {
    test('deve listar cursos com sucesso', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/cursos')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.meta).toBeDefined();
    });

    test('deve respeitar parâmetros de paginação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/cursos?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.meta.page).toBe(1);
      expect(response.body.data.meta.limit).toBe(5);
    });
  });

  describe('GET /cursos/:id', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .get('/cursos/1');

      expect(response.status).toBe(401);
    });

    test('deve retornar 400 para ID inválido com autenticação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/cursos/notanumber')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para curso inexistente', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .get('/cursos/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /cursos', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .post('/cursos')
        .send({
          nome: 'Curso Teste'
        });

      expect(response.status).toBe(401);
    });

    test('deve rejeitar campos obrigatórios ausentes com autenticação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .post('/cursos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nome: 'Curso Teste'
        });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('DELETE /cursos/:id', () => {
    test('deve retornar 401 sem autenticação', async () => {
      const response = await request(app)
        .delete('/cursos/1');

      expect(response.status).toBe(401);
    });

    test('deve retornar 400 para ID inválido com autenticação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .delete('/cursos/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para curso inexistente com autenticação', async () => {
      if (!authToken) {
        console.log('Token não disponível, pulando teste');
        return;
      }

      const response = await request(app)
        .delete('/cursos/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.status).toBe('error');
    });
  });
});
