import { ApiResponse } from '../../src/utils/apiResponse.js';

describe('ApiResponse Utils', () => {
  let res;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('success', () => {
    test('deve retornar resposta com status 200', () => {
      ApiResponse.success(res, { id: 1 }, 200, 'Sucesso');

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalled();
      const call = res.json.mock.calls[0][0];
      expect(call.success).toBe(true);
      expect(call.data).toEqual({ id: 1 });
    });
  });

  describe('created', () => {
    test('deve retornar resposta com status 201', () => {
      ApiResponse.created(res, { id: 1 }, 'Criado');

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalled();
      const call = res.json.mock.calls[0][0];
      expect(call.success).toBe(true);
    });
  });

  describe('badRequest', () => {
    test('deve retornar resposta com status 400', () => {
      ApiResponse.badRequest(res, 'Campo obrigatório');

      expect(res.status).toHaveBeenCalledWith(400);
      const call = res.json.mock.calls[0][0];
      expect(call.success).toBe(false);
      expect(call.error).toBe('Campo obrigatório');
    });
  });

  describe('unauthorized', () => {
    test('deve retornar resposta com status 401', () => {
      ApiResponse.unauthorized(res, 'Não autenticado');

      expect(res.status).toHaveBeenCalledWith(401);
      const call = res.json.mock.calls[0][0];
      expect(call.success).toBe(false);
      expect(call.error).toBe('Não autenticado');
    });
  });

  describe('notFound', () => {
    test('deve retornar resposta com status 404', () => {
      ApiResponse.notFound(res, 'Recurso não encontrado');

      expect(res.status).toHaveBeenCalledWith(404);
      const call = res.json.mock.calls[0][0];
      expect(call.success).toBe(false);
      expect(call.error).toBe('Recurso não encontrado');
    });
  });

  describe('serverError', () => {
    test('deve retornar resposta com status 500', () => {
      ApiResponse.serverError(res, 'Erro interno');

      expect(res.status).toHaveBeenCalledWith(500);
      const call = res.json.mock.calls[0][0];
      expect(call.success).toBe(false);
      expect(call.error).toBe('Erro interno');
    });
  });
});
