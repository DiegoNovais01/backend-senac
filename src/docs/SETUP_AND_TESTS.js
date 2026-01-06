/**
 * INSTRUÇÕES DE SETUP E TESTES
 * 
 * Guia passo a passo para configurar o backend SENAC com todas as melhorias
 */

// ═════════════════════════════════════════════════════════════════════════════
// 1. INSTALAÇÃO E CONFIGURAÇÃO
// ═════════════════════════════════════════════════════════════════════════════

/*
PASSO 1: Clonar o repositório
  git clone <url-do-repositorio>
  cd backend-senac

PASSO 2: Instalar dependências
  npm install
  
PASSO 3: Configurar variáveis de ambiente
  - Copiar .env.example para .env
  - cp .env.example .env
  
PASSO 4: Editar .env com suas configurações
  - Alterar DATABASE_URL com suas credenciais MySQL
  - Gerar JWT_SECRET seguro:
    node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  - Colar o resultado em JWT_SECRET no .env

PASSO 5: Configurar banco de dados
  - npm run prisma:setup
  - npm run prisma:seed (opcional - popular com dados de teste)

PASSO 6: Iniciar o servidor
  npm run dev
  
RESULTADO:
  🚀 Servidor rodando na porta 3000
  📄 Documentação: http://localhost:3000/api/docs
  ❤️  Health check: http://localhost:3000/health
*/

// ═════════════════════════════════════════════════════════════════════════════
// 2. SCRIPTS NPM DISPONÍVEIS
// ═════════════════════════════════════════════════════════════════════════════

export const NPM_SCRIPTS = {
  'dev': 'Inicia servidor em modo desenvolvimento com nodemon',
  'start': 'Inicia servidor em produção',
  'test': 'Executa testes (se configurados)',
  'prisma:setup': 'Cria o banco de dados e executa migrations',
  'prisma:reset': 'Reseta o banco de dados (CUIDADO!)',
  'prisma:generate': 'Regenera Prisma Client',
  'prisma:seed': 'Popula banco com dados de teste',
  'prisma:studio': 'Abre Prisma Studio para visualizar dados',
  'lint': 'Executa linter de código',
  'lint:fix': 'Corrige erros de linting automaticamente'
};

// ═════════════════════════════════════════════════════════════════════════════
// 3. TESTES MANUAIS - ENDPOINTS PRINCIPAIS
// ═════════════════════════════════════════════════════════════════════════════

export const MANUAL_TESTS = {
  
  // 1️⃣ Health Check
  health_check: {
    method: 'GET',
    url: 'http://localhost:3000/health',
    description: 'Verifica se o servidor está funcionando',
    expectedStatus: 200,
    expectedResponse: {
      success: true,
      status: 'healthy'
    }
  },
  
  // 2️⃣ Criar Aluno (Validação)
  criar_aluno_valido: {
    method: 'POST',
    url: 'http://localhost:3000/alunos',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    body: {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '123.456.789-00'
    },
    description: 'Criar aluno com CPF válido',
    expectedStatus: 201
  },
  
  criar_aluno_cpf_invalido: {
    method: 'POST',
    url: 'http://localhost:3000/alunos',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    body: {
      nome: 'João Silva',
      email: 'joao@example.com',
      cpf: '111.111.111-11' // Inválido
    },
    description: 'Criar aluno com CPF inválido - deve retornar 400',
    expectedStatus: 400,
    expectedError: 'CPF inválido'
  },
  
  criar_aluno_cpf_duplicado: {
    method: 'POST',
    url: 'http://localhost:3000/alunos',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    body: {
      nome: 'Maria Silva',
      email: 'maria@example.com',
      cpf: '123.456.789-00' // CPF duplicado
    },
    description: 'Criar aluno com CPF duplicado - deve retornar 409',
    expectedStatus: 409,
    expectedError: 'CPF já existe'
  },
  
  // 3️⃣ Validação de ID
  deletar_aluno_id_invalido: {
    method: 'DELETE',
    url: 'http://localhost:3000/alunos/abc', // ID inválido
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    description: 'Deletar com ID inválido - deve retornar 400',
    expectedStatus: 400,
    expectedError: 'ID inválido'
  },
  
  deletar_aluno_nao_existe: {
    method: 'DELETE',
    url: 'http://localhost:3000/alunos/99999',
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    description: 'Deletar aluno inexistente - deve retornar 404',
    expectedStatus: 404,
    expectedError: 'não encontrado'
  },
  
  // 4️⃣ Rate Limiting
  rate_limit_test: {
    method: 'GET',
    url: 'http://localhost:3000/alunos',
    description: 'Fazer 301+ requisições rapidamente - deve retornar 429 após o limite',
    expectedStatus: 429,
    expectedError: 'Muitas requisições'
  },
  
  // 5️⃣ Security Headers
  check_security_headers: {
    method: 'GET',
    url: 'http://localhost:3000/health',
    description: 'Verificar headers de segurança',
    expectedHeaders: {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'X-Request-ID': 'deve estar presente'
    }
  },
  
  // 6️⃣ Content-Type Enforcement
  content_type_json_required: {
    method: 'POST',
    url: 'http://localhost:3000/alunos',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded', // Errado
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    body: 'nome=João&email=joao@example.com',
    description: 'POST sem Content-Type application/json - deve retornar 415',
    expectedStatus: 415,
    expectedError: 'Content-Type deve ser application/json'
  },
  
  // 7️⃣ Paginação
  listar_com_paginacao: {
    method: 'GET',
    url: 'http://localhost:3000/alunos?page=1&limit=10',
    headers: {
      'Authorization': 'Bearer SEU_TOKEN_JWT'
    },
    description: 'Listar alunos com paginação',
    expectedStatus: 200,
    expectedFields: ['data', 'meta', 'meta.page', 'meta.limit', 'meta.total']
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 4. TESTES COM CURL
// ═════════════════════════════════════════════════════════════════════════════

export const CURL_EXAMPLES = `
# 1. Health Check
curl http://localhost:3000/health

# 2. Listar Alunos
curl -H "Authorization: Bearer SEU_TOKEN" http://localhost:3000/alunos

# 3. Criar Aluno
curl -X POST http://localhost:3000/alunos \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -d '{
    "nome": "João Silva",
    "email": "joao@example.com",
    "cpf": "123.456.789-00"
  }'

# 4. Testar Rate Limiting (fazer 301 requisições)
for i in {1..301}; do
  curl http://localhost:3000/health
done

# 5. Verificar Headers de Segurança
curl -I http://localhost:3000/health

# 6. Testar Content-Type
curl -X POST http://localhost:3000/alunos \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -H "Authorization: Bearer SEU_TOKEN" \\
  -d "nome=João"
`;

// ═════════════════════════════════════════════════════════════════════════════
// 5. TESTES AUTOMATIZADOS (Exemplo com Jest)
// ═════════════════════════════════════════════════════════════════════════════

export const JEST_TEST_EXAMPLE = `
// tests/aluno.test.js
import request from 'supertest';
import app from '../src/index.js';

describe('Aluno API - Validação', () => {
  
  describe('POST /alunos', () => {
    
    test('Deve criar aluno com CPF válido', async () => {
      const res = await request(app)
        .post('/alunos')
        .set('Authorization', 'Bearer TOKEN')
        .send({
          nome: 'João Silva',
          email: 'joao@example.com',
          cpf: '123.456.789-00'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBeDefined();
    });
    
    test('Deve retornar 400 com CPF inválido', async () => {
      const res = await request(app)
        .post('/alunos')
        .set('Authorization', 'Bearer TOKEN')
        .send({
          nome: 'João Silva',
          email: 'joao@example.com',
          cpf: '111.111.111-11'
        });
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('CPF');
    });
    
    test('Deve retornar 409 com CPF duplicado', async () => {
      // Primeiro cria um aluno
      await request(app)
        .post('/alunos')
        .set('Authorization', 'Bearer TOKEN')
        .send({
          nome: 'João Silva',
          email: 'joao@example.com',
          cpf: '123.456.789-00'
        });
      
      // Tenta criar outro com mesmo CPF
      const res = await request(app)
        .post('/alunos')
        .set('Authorization', 'Bearer TOKEN')
        .send({
          nome: 'Outro Nome',
          email: 'outro@example.com',
          cpf: '123.456.789-00'
        });
      
      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('já existe');
    });
  });
  
  describe('DELETE /alunos/:id', () => {
    
    test('Deve retornar 400 com ID inválido', async () => {
      const res = await request(app)
        .delete('/alunos/abc')
        .set('Authorization', 'Bearer TOKEN');
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
    
    test('Deve retornar 404 se aluno não existe', async () => {
      const res = await request(app)
        .delete('/alunos/99999')
        .set('Authorization', 'Bearer TOKEN');
      
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });
  
  describe('Security Headers', () => {
    
    test('Deve conter headers de segurança', async () => {
      const res = await request(app).get('/health');
      
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-xss-protection']).toBe('1; mode=block');
      expect(res.headers['x-request-id']).toBeDefined();
    });
  });
});
`;

// ═════════════════════════════════════════════════════════════════════════════
// 6. TROUBLESHOOTING
// ═════════════════════════════════════════════════════════════════════════════

export const TROUBLESHOOTING = {
  
  'Erro: Cannot find module': {
    causa: 'Dependências não instaladas',
    solucao: 'npm install'
  },
  
  'Erro: DATABASE_URL not set': {
    causa: '.env não configurado',
    solucao: 'Copiar .env.example para .env e preencher valores'
  },
  
  'Erro: EADDRINUSE: address already in use :::3000': {
    causa: 'Porta 3000 já em uso',
    solucao: 'matar processo ou mudar PORT no .env'
  },
  
  'Erro: connect ECONNREFUSED': {
    causa: 'Banco de dados não conectado',
    solucao: 'Verificar DATABASE_URL e se MySQL está rodando'
  },
  
  'Erro: Rate limit retorna 429 muito rápido': {
    causa: 'Rate limit muito restritivo',
    solucao: 'Aumentar max em .env (RATE_LIMIT_*_MAX)'
  },
  
  'Log não aparecendo': {
    causa: 'LOG_LEVEL configurado para nível mais alto',
    solucao: 'Mudar LOG_LEVEL no .env para INFO ou DEBUG'
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// 7. CHECKLIST DE VALIDAÇÃO
// ═════════════════════════════════════════════════════════════════════════════

export const VALIDATION_CHECKLIST = \`
✅ SETUP INICIAL
  [ ] npm install rodou sem erros
  [ ] .env.example copiado para .env
  [ ] JWT_SECRET gerado e configurado
  [ ] DATABASE_URL configurado corretamente
  [ ] npm run prisma:setup rodou sem erros

✅ SERVIDOR
  [ ] npm run dev inicia sem erros
  [ ] http://localhost:3000/health retorna 200
  [ ] Swagger acessível em http://localhost:3000/api/docs

✅ VALIDAÇÃO
  [ ] CPF com 11 dígitos válido é aceito
  [ ] CPF com dígitos inválidos é rejeitado
  [ ] CPF duplicado retorna 409
  [ ] ID não-numérico retorna 400
  [ ] Email inválido é rejeitado

✅ SEGURANÇA
  [ ] Headers de segurança presentes
  [ ] Rate limit funciona (429 após limite)
  [ ] Content-Type application/json é obrigatório
  [ ] Tokens são validados

✅ LOGGING
  [ ] Operações são logadas
  [ ] Erros são logados com detalhes
  [ ] Logs não contêm dados sensíveis
  [ ] Request ID está em cada requisição

✅ RESPOSTAS
  [ ] Campo 'success' sempre presente
  [ ] Formato de resposta consistente
  [ ] Mensagens de erro são amigáveis
  [ ] Detalhes técnicos omitidos em produção
\`;
`;

// ═════════════════════════════════════════════════════════════════════════════
// 8. PRÓXIMOS PASSOS
// ═════════════════════════════════════════════════════════════════════════════

export const NEXT_STEPS = `
1. TESTES AUTOMATIZADOS
   [ ] Setup Jest
   [ ] Escrever testes unitários para validators
   [ ] Escrever testes de integração para controllers
   [ ] Setup CI/CD (GitHub Actions)

2. INTEGRAÇÃO EM TODOS OS CONTROLLERS
   [ ] Atualizar alunoController
   [ ] Atualizar instrutorController
   [ ] Atualizar cursoController
   [ ] Atualizar categoriaController
   [ ] Atualizar avaliacaoController
   [ ] Atualizar matriculaController

3. LOGGING CENTRALIZADO
   [ ] Setup ELK Stack ou CloudWatch
   [ ] Configurar índices de logs
   [ ] Criar dashboards de monitoramento

4. VERSIONAMENTO DE API
   [ ] Versionar endpoints (/v1/alunos)
   [ ] Documentar breaking changes

5. DEPLOY EM PRODUÇÃO
   [ ] Setup environment variables em produção
   [ ] Gerar JWT_SECRET seguro
   [ ] Configurar HTTPS
   [ ] Setup backup de banco de dados
`;
