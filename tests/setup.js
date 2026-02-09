process.env.NODE_ENV = 'test';
require('dotenv').config({ path: '.env.test' });

// Não sobrescrever DATABASE_URL após carregamento de .env.test
// Isso garante que testes usem senac_test

afterEach(() => {
  jest.clearAllMocks();
});

// Desconectar Prisma após testes para evitar handles abertos
afterAll(async () => {
  const { default: prisma } = await import('../src/db.js');
  await prisma.$disconnect();
});
