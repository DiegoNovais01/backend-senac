process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://root:password@localhost:3306/senac_test';
process.env.JWT_SECRET = 'test_secret_key_for_jest_123456789';

afterEach(() => {
  jest.clearAllMocks();
});
