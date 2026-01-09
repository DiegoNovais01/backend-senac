import request from 'supertest';

/**
 * Helper para fazer requisições GET
 */
export const getRequest = (app, path) => {
  return request(app).get(path);
};

/**
 * Helper para fazer requisições POST
 */
export const postRequest = (app, path, data) => {
  return request(app).post(path).send(data);
};

/**
 * Helper para fazer requisições PUT
 */
export const putRequest = (app, path, data) => {
  return request(app).put(path).send(data);
};

/**
 * Helper para fazer requisições DELETE
 */
export const deleteRequest = (app, path) => {
  return request(app).delete(path);
};

/**
 * Helper para fazer requisição com Authorization header
 */
export const withAuth = (req, token) => {
  return req.set('Authorization', `Bearer ${token}`);
};

/**
 * Validar resposta de sucesso
 */
export const expectSuccessResponse = (response, statusCode = 200) => {
  expect(response.status).toBe(statusCode);
  expect(response.body.status).toBe('success');
  expect(response.body.data).toBeDefined();
};

/**
 * Validar resposta de erro
 */
export const expectErrorResponse = (response, statusCode = 400) => {
  expect(response.status).toBe(statusCode);
  expect(response.body.status).toBe('error');
  expect(response.body.message).toBeDefined();
};

/**
 * Validar resposta paginada
 */
export const expectPaginatedResponse = (response) => {
  expect(response.body.data.data).toBeDefined();
  expect(Array.isArray(response.body.data.data)).toBe(true);
  expect(response.body.data.meta).toBeDefined();
  expect(response.body.data.meta.page).toBeDefined();
  expect(response.body.data.meta.limit).toBeDefined();
  expect(response.body.data.meta.total).toBeDefined();
};
