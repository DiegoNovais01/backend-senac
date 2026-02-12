import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API SENAC',
      version: '1.0.0',
      description: 'Documentação da API SENAC - Gerenciamento de Cursos, Alunos, Instrutores e Matrículas',
      contact: {
        name: 'SENAC - Suporte Técnico',
        email: 'suporte@senac.com'
      }
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor de Desenvolvimento' },
      { url: 'https://api.senac.com', description: 'Servidor de Produção' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através de login. Formato: Authorization: Bearer <token>'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            details: { type: 'object' }
          }
        },
        Usuario: {
          type: 'object',
          properties: {
            id_usuario: { type: 'integer' },
            nome: { type: 'string' },
            email: { type: 'string', format: 'email' },
            senha: { type: 'string', description: 'Hash da senha' },
            papel: { type: 'string', enum: ['admin', 'professor', 'aluno', 'secretaria'] },
            criado_em: { type: 'string', format: 'date-time' }
          },
          required: ['nome', 'email', 'papel']
        },
        Aluno: {
          type: 'object',
          properties: {
            id_aluno: { type: 'integer' },
            nome: { type: 'string', description: 'Nome completo do aluno' },
            cpf: { type: 'string', description: 'CPF com 11 dígitos (validado automaticamente)' },
            email: { type: 'string', format: 'email' },
            telefone: { type: 'string' },
            endereco: { type: 'string' },
            data_nascimento: { type: 'string', format: 'date' },
            senha: { type: 'string', description: 'Opcional - define senha para o aluno' }
          },
          required: ['nome', 'cpf', 'email']
        },
        Instrutor: {
          type: 'object',
          properties: {
            id_instrutor: { type: 'integer' },
            nome: { type: 'string' },
            cpf: { type: 'string', description: 'CPF com 11 dígitos (validado)' },
            email: { type: 'string', format: 'email' },
            especialidade: { type: 'string' },
            telefone: { type: 'string' }
          },
          required: ['nome', 'cpf', 'email']
        },
        Curso: {
          type: 'object',
          properties: {
            id_curso: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' },
            data_inicio: { type: 'string', format: 'date' },
            carga_horaria: { type: 'integer', minimum: 1 },
            preco: { type: 'number', minimum: 0 },
            nivel: { type: 'string', enum: ['basico', 'intermediario', 'avancado'] },
            modalidade: { type: 'string', enum: ['presencial', 'online', 'hibrido'] },
            id_categoria: { type: 'integer' }
          },
          required: ['nome', 'carga_horaria']
        },
        Categoria: {
          type: 'object',
          properties: {
            id_categoria: { type: 'integer' },
            nome: { type: 'string' },
            descricao: { type: 'string' }
          },
          required: ['nome']
        },
        Matricula: {
          type: 'object',
          properties: {
            id_matricula: { type: 'integer' },
            id_aluno: { type: 'integer' },
            id_curso: { type: 'integer' },
            data_matricula: { type: 'string', format: 'date' },
            status: { type: 'string', enum: ['ativa', 'concluida', 'cancelada'] },
            nota_final: { type: 'number', minimum: 0, maximum: 10 }
          },
          required: ['id_aluno', 'id_curso']
        },
        Avaliacao: {
          type: 'object',
          properties: {
            id_avaliacao: { type: 'integer' },
            id_aluno: { type: 'integer' },
            id_curso: { type: 'integer' },
            nota: { type: 'integer', minimum: 0, maximum: 10 },
            comentario: { type: 'string' },
            data_avaliacao: { type: 'string', format: 'date-time' }
          },
          required: ['id_aluno', 'id_curso', 'nota']
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

swaggerSpec.paths = {
  '/auth/register': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Registrar novo usuário',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Usuario'
            }
          }
        }
      },
      responses: {
        '201': { description: 'Usuário criado com sucesso' },
        '400': { description: 'Erro de validação' }
      }
    }
  },
  '/auth/login': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Login - Obter tokens JWT',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { email: { type: 'string', format: 'email' }, senha: { type: 'string' } },
              required: ['email', 'senha']
            }
          }
        }
      },
      responses: { '200': { description: 'Login realizado com sucesso' }, '401': { description: 'Credenciais inválidas' } }
    }
  },
  '/auth/refresh': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Renovar token JWT',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } }
      },
      responses: { '200': { description: 'Novo token gerado' }, '401': { description: 'Token inválido/expirado' } }
    }
  },
  '/auth/logout': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Logout - Revoga tokens',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } }, required: ['refreshToken'] } } }
      },
      responses: { '200': { description: 'Logout realizado com sucesso' } }
    }
  },
  '/auth/recuperar-senha': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Solicitar recuperação de senha',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } }, required: ['email'] } } }
      },
      responses: { '200': { description: 'Email enviado' }, '400': { description: 'Email não fornecido' } }
    }
  },
  '/auth/resetar-senha': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Resetar senha com token',
      security: [],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', format: 'email' }, token: { type: 'string' }, nova_senha: { type: 'string', minLength: 6 } }, required: ['email', 'token', 'nova_senha'] } } }
      },
      responses: { '200': { description: 'Senha atualizada' }, '400': { description: 'Dados inválidos' } }
    }
  },
  '/auth/mudar-senha': {
    post: {
      tags: ['🔐 Autenticação'],
      summary: 'Alterar senha (usuário logado)',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { senha_atual: { type: 'string' }, nova_senha: { type: 'string', minLength: 6 } }, required: ['senha_atual', 'nova_senha'] } } }
      },
      responses: { '200': { description: 'Senha alterada' }, '401': { description: 'Senha incorreta' } }
    }
  },
  '/auth/meu-perfil': {
    get: {
      tags: ['👤 Usuários'],
      summary: 'Visualizar perfil do usuário logado',
      responses: { '200': { description: 'Dados do usuário' }, '404': { description: 'Não encontrado' } }
    }
  },
  '/auth/minhas-sessoes': {
    get: {
      tags: ['👤 Usuários'],
      summary: 'Listar sessões ativas do usuário',
      responses: { '200': { description: 'Lista de sessões' } }
    }
  },
  '/auth/logout-sessao': {
    post: {
      tags: ['👤 Usuários'],
      summary: 'Logout de uma sessão específica',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { type: 'object', properties: { sessao_id: { type: 'integer' } }, required: ['sessao_id'] } } }
      },
      responses: { '200': { description: 'Sessão encerrada' }, '403': { description: 'Acesso negado' } }
    }
  },
  '/auth/logout-global': {
    post: {
      tags: ['👤 Usuários'],
      summary: 'Logout de TODAS as sessões',
      responses: { '200': { description: 'Todas as sessões encerradas' } }
    }
  },
  '/auth/usuarios-logados': {
    get: {
      tags: ['👤 Usuários'],
      summary: 'Listar usuários com sessões ativas (ADMIN)',
      responses: { '200': { description: 'Lista de usuários' }, '403': { description: 'Acesso negado' } }
    }
  },
  '/alunos': {
    get: {
      tags: ['🎓 Alunos'],
      summary: 'Listar alunos com paginação',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: { '200': { description: 'Lista de alunos' } }
    },
    post: {
      tags: ['🎓 Alunos'],
      summary: 'Criar novo aluno',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Aluno' } } }
      },
      responses: { '201': { description: 'Aluno criado' }, '400': { description: 'CPF inválido/duplicado' } }
    }
  },
  '/alunos/{id}': {
    get: {
      tags: ['🎓 Alunos'],
      summary: 'Obter aluno por ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Dados do aluno' }, '400': { description: 'ID inválido' }, '404': { description: 'Não encontrado' } }
    },
    put: {
      tags: ['🎓 Alunos'],
      summary: 'Atualizar aluno',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Aluno' } } }
      },
      responses: { '200': { description: 'Aluno atualizado' } }
    },
    delete: {
      tags: ['🎓 Alunos'],
      summary: 'Deletar aluno',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Aluno deletado' }, '400': { description: 'ID inválido' }, '404': { description: 'Não encontrado' } }
    }
  },
  '/instrutores': {
    get: {
      tags: ['👨‍🏫 Instrutores'],
      summary: 'Listar instrutores',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: { '200': { description: 'Lista de instrutores' } }
    },
    post: {
      tags: ['👨‍🏫 Instrutores'],
      summary: 'Criar instrutor (ADMIN)',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Instrutor' } } }
      },
      responses: { '201': { description: 'Instrutor criado' }, '400': { description: 'CPF inválido/duplicado' } }
    }
  },
  '/instrutores/{id}': {
    get: {
      tags: ['👨‍🏫 Instrutores'],
      summary: 'Obter instrutor por ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Dados do instrutor' }, '400': { description: 'ID inválido' }, '404': { description: 'Não encontrado' } }
    },
    put: {
      tags: ['👨‍🏫 Instrutores'],
      summary: 'Atualizar instrutor (ADMIN)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Instrutor' } } }
      },
      responses: { '200': { description: 'Instrutor atualizado' } }
    },
    delete: {
      tags: ['👨‍🏫 Instrutores'],
      summary: 'Deletar instrutor (ADMIN)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Instrutor deletado' }, '404': { description: 'Não encontrado' } }
    }
  },
  '/cursos': {
    get: {
      tags: ['📚 Cursos'],
      summary: 'Listar cursos',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: { '200': { description: 'Lista de cursos' } }
    },
    post: {
      tags: ['📚 Cursos'],
      summary: 'Criar curso',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Curso' } } }
      },
      responses: { '201': { description: 'Curso criado' }, '400': { description: 'Erro de validação' } }
    }
  },
  '/cursos/{id}': {
    get: {
      tags: ['📚 Cursos'],
      summary: 'Obter curso por ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Dados do curso' }, '400': { description: 'ID inválido' }, '404': { description: 'Não encontrado' } }
    },
    put: {
      tags: ['📚 Cursos'],
      summary: 'Atualizar curso',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Curso' } } }
      },
      responses: { '200': { description: 'Curso atualizado' } }
    },
    delete: {
      tags: ['📚 Cursos'],
      summary: 'Deletar curso',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Curso deletado' }, '404': { description: 'Não encontrado' } }
    }
  },
  '/categorias': {
    get: {
      tags: ['🏷️ Categorias'],
      summary: 'Listar categorias',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: { '200': { description: 'Lista de categorias' } }
    },
    post: {
      tags: ['🏷️ Categorias'],
      summary: 'Criar categoria (ADMIN)',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } }
      },
      responses: { '201': { description: 'Categoria criada' } }
    }
  },
  '/categorias/{id}': {
    get: {
      tags: ['🏷️ Categorias'],
      summary: 'Obter categoria por ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Dados da categoria' }, '404': { description: 'Não encontrada' } }
    },
    put: {
      tags: ['🏷️ Categorias'],
      summary: 'Atualizar categoria (ADMIN)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } }
      },
      responses: { '200': { description: 'Categoria atualizada' } }
    },
    delete: {
      tags: ['🏷️ Categorias'],
      summary: 'Deletar categoria (ADMIN)',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Categoria deletada' }, '400': { description: 'Categoria com cursos' } }
    }
  },
  '/matriculas': {
    get: {
      tags: ['📋 Matrículas'],
      summary: 'Listar matrículas',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } }
      ],
      responses: { '200': { description: 'Lista de matrículas' } }
    },
    post: {
      tags: ['📋 Matrículas'],
      summary: 'Criar matrícula',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Matricula' } } }
      },
      responses: { '201': { description: 'Matrícula criada' }, '400': { description: 'Dados inválidos' } }
    }
  },
  '/matriculas/{id}': {
    get: {
      tags: ['📋 Matrículas'],
      summary: 'Obter matrícula por ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Dados da matrícula' }, '404': { description: 'Não encontrada' } }
    },
    put: {
      tags: ['📋 Matrículas'],
      summary: 'Atualizar matrícula',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Matricula' } } }
      },
      responses: { '200': { description: 'Matrícula atualizada' } }
    },
    delete: {
      tags: ['📋 Matrículas'],
      summary: 'Deletar matrícula',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Matrícula deletada' }, '404': { description: 'Não encontrada' } }
    }
  },
  '/avaliacoes': {
    get: {
      tags: ['⭐ Avaliações'],
      summary: 'Listar avaliações',
      parameters: [
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
        { name: 'id_curso', in: 'query', schema: { type: 'integer' } },
        { name: 'id_aluno', in: 'query', schema: { type: 'integer' } }
      ],
      responses: { '200': { description: 'Lista de avaliações' } }
    },
    post: {
      tags: ['⭐ Avaliações'],
      summary: 'Criar avaliação',
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Avaliacao' } } }
      },
      responses: { '201': { description: 'Avaliação criada' }, '400': { description: 'Aluno não matriculado' } }
    }
  },
  '/avaliacoes/{id}': {
    get: {
      tags: ['⭐ Avaliações'],
      summary: 'Obter avaliação por ID',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Dados da avaliação' }, '404': { description: 'Não encontrada' } }
    },
    put: {
      tags: ['⭐ Avaliações'],
      summary: 'Atualizar avaliação',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: '#/components/schemas/Avaliacao' } } }
      },
      responses: { '200': { description: 'Avaliação atualizada' } }
    },
    delete: {
      tags: ['⭐ Avaliações'],
      summary: 'Deletar avaliação',
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Avaliação deletada' }, '404': { description: 'Não encontrada' } }
    }
  }
};

export default swaggerSpec;
