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
  apis: [], // estamos definindo a documentação aqui, não via comentários JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

// Adicionamos manualmente os caminhos (paths) à especificação por clareza, evitando ter comentários JSDoc espalhados
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
  '/auth/recuperar-senha': {
    post: {
      tags: ['Recuperação de Senha'],
      summary: 'Solicitar recuperação de senha',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { email: { type: 'string', format: 'email' } },
              required: ['email']
            }
          }
        }
      },
      responses: {
        '200': { description: 'Email de recuperação enviado (ou em dev, retorna dev_link)' },
        '400': { description: 'Email não fornecido' }
      }
    }
  },
  '/auth/resetar-senha': {
    post: {
      tags: ['Recuperação de Senha'],
      summary: 'Resetar senha com token',
      security: [],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                token: { type: 'string' },
                nova_senha: { type: 'string', minLength: 6 }
              },
              required: ['email', 'token', 'nova_senha']
            }
          }
        }
      },
      responses: {
        '200': { description: 'Senha atualizada com sucesso' },
        '400': { description: 'Campos obrigatórios ou senha muito curta' }
      }
    }
  },
  '/auth/mudar-senha': {
    post: {
      tags: ['Recuperação de Senha'],
      summary: 'Mudar senha (usuário logado)',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                senha_atual: { type: 'string' },
                nova_senha: { type: 'string', minLength: 6 }
              },
              required: ['senha_atual', 'nova_senha']
            }
          }
        }
      },
      responses: {
        '200': { description: 'Senha alterada com sucesso' },
        '401': { description: 'Senha atual incorreta' }
      }
    }
  },
  '/auth/usuarios-debug': {
    get: {
      tags: ['Gerenciamento de Usuários'],
      summary: 'Listar todos os usuários (DEBUG)',
      security: [],
      responses: {
        '200': { description: 'Lista de usuários com email, nome, papel' }
      }
    }
  },
  '/auth/usuarios-logados': {
    get: {
      tags: ['Gerenciamento de Usuários'],
      summary: 'Listar usuários com sessões ativas',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Usuários com sessões ativas e informações de tokens' },
        '401': { description: 'Token não fornecido' }
      }
    }
  },
  '/auth/meu-perfil': {
    get: {
      tags: ['Gerenciamento de Usuários'],
      summary: 'Visualizar perfil do usuário logado',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Dados do usuário logado' },
        '404': { description: 'Usuário não encontrado' }
      }
    }
  },
  '/auth/minhas-sessoes': {
    get: {
      tags: ['Gerenciamento de Usuários'],
      summary: 'Listar todas as minhas sessões ativas',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Lista de sessões com data de criação, expiração e dias restantes' }
      }
    }
  },
  '/auth/logout-sessao': {
    post: {
      tags: ['Logout Avançado'],
      summary: 'Fazer logout de UMA sessão específica',
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { sessao_id: { type: 'integer' } },
              required: ['sessao_id']
            }
          }
        }
      },
      responses: {
        '200': { description: 'Sessão encerrada com sucesso' },
        '403': { description: 'Acesso negado' }
      }
    }
  },
  '/auth/logout-global': {
    post: {
      tags: ['Logout Avançado'],
      summary: 'Fazer logout de TODAS as sessões',
      security: [{ bearerAuth: [] }],
      responses: {
        '200': { description: 'Todas as sessões foram encerradas' }
      }
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
    get: { tags: ['Matriculas'], summary: 'Listar matriculas', security: [{ bearerAuth: [] }], responses: { '200': { description: 'Lista' } } },
    post: { tags: ['Matriculas'], summary: 'Criar matricula', security: [{ bearerAuth: [] }], requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Matricula' } } } }, responses: { '201': { description: 'Criada' } } }
  }
  ,
  '/matriculas/{id}': {
    get: {
      tags: ['Matriculas'],
      summary: 'Buscar matrícula por id',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Matrícula' }, '404': { description: 'Não encontrada' } }
    },
    put: {
      tags: ['Matriculas'],
      summary: 'Atualizar matrícula',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Matricula' } } } },
      responses: { '200': { description: 'Atualizado' } }
    },
    delete: {
      tags: ['Matriculas'],
      summary: 'Excluir matrícula',
      security: [{ bearerAuth: [] }],
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Removido' } }
    }
  }
};

export default swaggerSpec;
