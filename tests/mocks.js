/**
 * Mock do Prisma para testes
 */
export const createMockPrisma = () => {
  return {
    usuarios: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    alunos: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    cursos: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    categorias: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    matriculas: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
    avaliacoes: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    refresh_tokens: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      delete: jest.fn(),
    },
  };
};

/**
 * Mock do Response do Express
 */
export const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    statusCode: 200,
    locals: {},
  };
  return res;
};

/**
 * Mock do Request do Express
 */
export const createMockRequest = (overrides = {}) => {
  const req = {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    path: '/',
    user: null,
    ...overrides,
  };
  return req;
};

/**
 * Dados de teste - Usuário
 */
export const mockUsuario = {
  id_usuario: 1,
  nome: 'Usuário Teste',
  email: 'teste@example.com',
  papel: 'aluno',
  data_cadastro: new Date(),
};

/**
 * Dados de teste - Aluno
 */
export const mockAluno = {
  id_aluno: 1,
  nome: 'João Silva',
  cpf: '12345678900',
  email: 'joao@example.com',
  data_nascimento: new Date('2000-01-01'),
};

/**
 * Dados de teste - Curso
 */
export const mockCurso = {
  id_curso: 1,
  nome: 'Curso de JavaScript',
  descricao: 'Aprenda JavaScript do zero',
  carga_horaria: 40,
  nivel: 'basico',
  modalidade: 'online',
  preco: 99.90,
  data_inicio: new Date(),
};

/**
 * Dados de teste - Categoria
 */
export const mockCategoria = {
  id_categoria: 1,
  nome: 'Programação',
  descricao: 'Cursos de programação',
};

/**
 * Dados de teste - Matrícula
 */
export const mockMatricula = {
  id_matricula: 1,
  id_aluno: 1,
  id_curso: 1,
  status: 'ativa',
  data_matricula: new Date(),
  nota_final: null,
};
