import { logger } from '../../src/utils/logger.js';

describe('Logger Utils', () => {
  let consoleSpy;

  beforeEach(() => {
    // Capturar console.log
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'error').mockImplementation(() => { });
    jest.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    console.error.mockRestore();
    console.warn.mockRestore();
  });

  describe('info', () => {
    test('deve registrar mensagem INFO', () => {
      logger.info('Mensagem de teste');
      expect(consoleSpy).toHaveBeenCalled();
    });

    test('deve incluir contexto adicional', () => {
      logger.info('Ação realizada', { userId: 123, action: 'login' });
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    test('deve registrar mensagem ERROR', () => {
      const errorSpy = jest.spyOn(console, 'error');
      logger.error('Erro encontrado', { code: 'ERR_001' });
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    test('deve registrar mensagem WARN', () => {
      const warnSpy = jest.spyOn(console, 'warn');
      logger.warn('Aviso importante', { status: 'warning' });
      expect(warnSpy).toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    test('deve registrar mensagem DEBUG', () => {
      process.env.DEBUG = 'true';
      logger.debug('Informação de debug');
      expect(consoleSpy).toHaveBeenCalled();
      delete process.env.DEBUG;
    });
  });
});
