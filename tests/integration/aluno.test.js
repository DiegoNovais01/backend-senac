import request from 'supertest';
import app from '../../src/index.js';

describe('Aluno Endpoints', () => {
  let alunoId;

  describe('GET /alunos', () => {
    test('deve listar alunos com sucesso', async () => {
      const response = await request(app)
        .get('/alunos')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
    });

    test('deve suportar paginação com limit', async () => {
      const response = await request(app)
        .get('/alunos?page=1&limit=10')
        .expect(200);

      expect(response.body.data.meta.limit).toBe(10);
    });
  });

  describe('GET /alunos/:id', () => {
    test('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/alunos/abc')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para aluno inexistente', async () => {
      const response = await request(app)
        .get('/alunos/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /alunos/:id', () => {
    test('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .delete('/alunos/xyz')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para aluno inexistente', async () => {
      const response = await request(app)
        .delete('/alunos/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});
