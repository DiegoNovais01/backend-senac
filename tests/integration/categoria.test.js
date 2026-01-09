import request from 'supertest';
import app from '../../src/index.js';

describe('Categoria Endpoints', () => {
  let categoriaId;

  describe('GET /categorias', () => {
    test('deve listar categorias com sucesso', async () => {
      const response = await request(app)
        .get('/categorias')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.meta).toBeDefined();
    });

    test('deve suportar paginação', async () => {
      const response = await request(app)
        .get('/categorias?page=1&limit=5')
        .expect(200);

      expect(response.body.data.meta.page).toBe(1);
      expect(response.body.data.meta.limit).toBe(5);
    });
  });

  describe('POST /categorias', () => {
    test('deve criar categoria com sucesso', async () => {
      const response = await request(app)
        .post('/categorias')
        .send({
          nome: `Categoria Teste ${Date.now()}`,
          descricao: 'Descrição de teste'
        })
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.data.id_categoria).toBeDefined();
      categoriaId = response.body.data.id_categoria;
    });

    test('deve rejeitar nome muito curto', async () => {
      const response = await request(app)
        .post('/categorias')
        .send({
          nome: 'AB',
          descricao: 'Descrição'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('deve rejeitar nome vazio', async () => {
      const response = await request(app)
        .post('/categorias')
        .send({
          nome: '',
          descricao: 'Descrição'
        })
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /categorias/:id', () => {
    test('deve retornar 404 para categoria inexistente', async () => {
      const response = await request(app)
        .get('/categorias/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });

    test('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .get('/categorias/abc')
        .expect(400);

      expect(response.body.status).toBe('error');
    });
  });

  describe('DELETE /categorias/:id', () => {
    test('deve retornar 400 para ID inválido', async () => {
      const response = await request(app)
        .delete('/categorias/xyz')
        .expect(400);

      expect(response.body.status).toBe('error');
    });

    test('deve retornar 404 para categoria inexistente', async () => {
      const response = await request(app)
        .delete('/categorias/999999')
        .expect(404);

      expect(response.body.status).toBe('error');
    });
  });
});
