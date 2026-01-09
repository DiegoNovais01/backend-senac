import request from 'supertest';
import app from '../../src/index.js';

describe('Health Check', () => {
  test('GET / deve retornar status success', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBeDefined();
    expect(response.body.endpoints).toBeDefined();
  });

  test('GET /health deve retornar status healthy', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.status).toBe('healthy');
    expect(response.body.timestamp).toBeDefined();
  });

  test('GET /api/docs deve servir Swagger UI', async () => {
    const response = await request(app)
      .get('/api/docs/')
      .expect(200);

    expect(response.type).toContain('text/html');
  });

  test('deve rejeitar requisições para rotas inexistentes', async () => {
    const response = await request(app)
      .get('/rota-inexistente')
      .expect(404);

    expect(response.body.status).toBe('error');
  });

  test('deve rejeitar POST sem Content-Type application/json', async () => {
    const response = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'text/plain')
      .send('{"email":"test@test.com"}');

    expect([400, 415]).toContain(response.status);
  });
});
