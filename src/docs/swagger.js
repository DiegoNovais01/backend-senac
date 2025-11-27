import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API SENAC',
      version: '1.0.0',
      description: 'Documentação da API SENAC - rotas, modelos e exemplos',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Dev server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Usuario: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            senha: { type: 'string' },
            papel: { type: 'string', enum: ['admin', 'professor', 'aluno', 'secretaria'] }
          }
        },
        Aluno: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
            cpf: { type: 'string' },
            email: { type: 'string', format: 'email' },
            telefone: { type: 'string' },
            endereco: { type: 'string' },
            data_nascimento: { type: 'string', format: 'date' },
            senha: { type: 'string' }
          }
        },
        Curso: {
          type: 'object',
          properties: {
            nome: { type: 'string' },
            descricao: { type: 'string' },
            data_inicio: { type: 'string', format: 'date' },
            carga_horaria: { type: 'integer' },
            preco: { type: 'number' },
            nivel: { type: 'string', enum: ['basico', 'intermediario', 'avancado'] },
            modalidade: { type: 'string', enum: ['presencial', 'online', 'hibrido'] }
          }
        },
        Matricula: {
          type: 'object',
          properties: {
            id_aluno: { type: 'integer' },
            id_curso: { type: 'integer' },
            data_matricula: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['ativa', 'concluida', 'cancelada'] }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [] // we are defining docs here, not via JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

// Manually add paths to the spec (for clarity and to avoid adding doc comments all over)
swaggerSpec.paths = {
  '/auth/register': {
    post: {
      tags: ['Auth'],
      summary: 'Registrar usuário',
      requestBody: {
        required: true,
        content: {
          'application/json': { schema: { $ref: '#/components/schemas/Usuario' } }
        }
      },
      responses: { '201': { description: 'Usuário criado' }, '400': { description: 'Erro de validação' } }
    }
  },
  '/auth/login': {
    post: {
      tags: ['Auth'],
      summary: 'Fazer login',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, senha: { type: 'string' } }, required: ['email', 'senha'] } } } },
      responses: { '200': { description: 'Retorna token e refreshToken' }, '401': { description: 'Credenciais inválidas' } }
    }
  },
  '/auth/refresh': {
    post: {
      tags: ['Auth'],
      summary: 'Renovar token',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } } },
      responses: { '200': { description: 'Novo token' }, '401': { description: 'Refresh inválido/expirado' } }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['Auth'],
      summary: 'Fazer logout (revoga refresh token)',
      requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } } },
      responses: { '200': { description: 'Logout realizado' } }
    }
  },
  '/alunos': {
    get: {
      tags: ['Alunos'],
      summary: 'Listar alunos (admin/secretaria)',
      security: [{ bearerAuth: ['admin', 'secretaria'] }],
      responses: { '200': { description: 'Lista de alunos' } }
    },
    post: {
      tags: ['Alunos'],
      summary: 'Criar aluno (admin/secretaria)',
      security: [{ bearerAuth: [] }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Aluno' } } } },
      responses: { '201': { description: 'Aluno criado' }, '400': { description: 'Erro de validação' } }
    }
  },
  '/alunos/{id}': {
    get: { tags: ['Alunos'], summary: 'Buscar aluno por id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Aluno' }, '404': { description: 'Não encontrado' } } },
    put: { tags: ['Alunos'], summary: 'Atualizar aluno', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Aluno' } } } }, responses: { '200': { description: 'Atualizado' } } },
    delete: { tags: ['Alunos'], summary: 'Deletar aluno', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Removido' } } }
  },
  '/cursos': {
    get: { tags: ['Cursos'], summary: 'Listar cursos', responses: { '200': { description: 'Lista de cursos' } } },
    post: { tags: ['Cursos'], summary: 'Criar curso', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Curso' } } } }, responses: { '201': { description: 'Criado' } } }
  },
  '/cursos/{id}': {
    get: { tags: ['Cursos'], summary: 'Buscar curso por id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Curso' } } },
    put: { tags: ['Cursos'], summary: 'Atualizar curso', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Curso' } } } }, responses: { '200': { description: 'Atualizado' } } },
    delete: { tags: ['Cursos'], summary: 'Deletar curso', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }], responses: { '200': { description: 'Removido' } } }
  },
  '/matriculas': {
    get: { tags: ['Matriculas'], summary: 'Listar matriculas', responses: { '200': { description: 'Lista' } } },
    post: { tags: ['Matriculas'], summary: 'Criar matricula', requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Matricula' } } } }, responses: { '201': { description: 'Criada' } } }
  }
};

export default swaggerSpec;
