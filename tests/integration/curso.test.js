import request from 'supertest';
import app from '../../src/index.js';

describe('Curso Endpoints', () => {
  describe('GET /cursos', () => {
    test('deve listar cursos com sucesso', async () => {
      const response = await request(app)
        .get('/cursos')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.meta).toBeDefined();
    });

    test('deve respeitar parâmetros de paginação', async () => {
      const response = await request(app)
        .get('/cursos?page=1&limit=5')
        .expect(200);

      expect(response.body.data.meta.page).toBe(1);
      expect(response.body.data.meta.limit).toBe(5);
    });
  });

  describe('GET /cursos/:id', () => {
    test('deve retornar 404 para curso inexistente', async () => {
      const response = await request(app)
        .get('/cursos/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    test('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/cursos/notanumber')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /cursos', () => {
    test('deve rejeitar campos obrigatórios ausentes', async () => {
      const response = await request(app)
        .post('/cursos')
        .send({
          nome: 'Curso Teste'
        });

      expect([400, 500]).toContain(response.status);
    });
  });

  describe('DELETE /cursos/:id', () => {
    test('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .delete('/cursos/invalid')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para curso inexistente', async () => {
      const response = await request(app)
        .delete('/cursos/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});
