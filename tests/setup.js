process.env.NODE_ENV = 'test';
// Carrega .env.test se existir, caso contrário usa padrões
require('dotenv').config({ path: '.env.test' });

// Garante que tem DATABASE_URL e JWT_SECRET
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'mysql://root:root@localhost:3306/senac_cursos';
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'github_actions_test_secret_key_minimo_32_caracteres_12345';
}

afterEach(() => {
  jest.clearAllMocks();
});
