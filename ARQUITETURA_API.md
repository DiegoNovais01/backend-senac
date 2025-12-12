# 📊 Arquitetura & Fluxos da API SENAC

## 🏗️ ARQUITETURA GERAL

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser/App)                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
         ┌────────▼────────┐
         │  HTTP/JSON API  │
         │   PORT 3000     │
         └────────┬────────┘
                  │
    ┌─────────────┼──────────────┐
    │             │              │
 ┌──▼──┐    ┌──────▼──┐    ┌──────▼──┐
 │ JWT │    │ Prisma  │    │ Bcrypt  │
 │Token│    │  Client │    │ Hashing │
 └──────┘    └──────┬──┘    └─────────┘
             ┌──────▼──────────┐
             │   MySQL 8.0     │
             │   Database      │
             └────────────────┘
```

---

## 🔐 FLUXO DE AUTENTICAÇÃO COMPLETO

```
┌──────────────────────────────────────────────────────────────┐
│              1. REGISTER (Criar conta)                        │
└──────────────────────────────────────────────────────────────┘

POST /auth/register
{
  "nome": "João",
  "email": "joao@senac.com",
  "senha": "senha123"
}
       │
       ▼
  Valida CPF
  (se fornecido)
       │
       ▼
  Hash da senha
  (bcrypt: 10 rounds)
       │
       ▼
  Salva em BD
  usuarios {
    id_usuario: 1,
    email: "joao@senac.com",
    senha: "$2b$10$...(hash)",
    papel: "aluno"
  }
       │
       ▼
  Gera JWT
  (15 minutos)
       │
       ▼
  Gera Refresh Token
  (7 dias)
       │
       ▼
  Salva hash do Refresh
  em refresh_tokens
       │
       ▼
  Retorna ao cliente:
  {
    token: "eyJhbGc...",
    refreshToken: "a1b2c3..."
  }
```

---

```
┌──────────────────────────────────────────────────────────────┐
│              2. LOGIN (Fazer Login)                          │
└──────────────────────────────────────────────────────────────┘

POST /auth/login
{
  "email": "joao@senac.com",
  "senha": "senha123"
}
       │
       ▼
  Busca usuário
  por email
       │
       ├─── NÃO ENCONTRADO?
       │    └──▶ 400 "Usuário não encontrado"
       │
       ▼
  Compara senha
  (bcrypt.compare)
       │
       ├─── INCORRETA?
       │    └──▶ 401 "Senha incorreta"
       │
       ▼
  Gera novo JWT
  (15 minutos)
       │
       ▼
  Gera novo Refresh
  Token (7 dias)
       │
       ▼
  Salva no BD
       │
       ▼
  Retorna:
  {
    token: "eyJhbGc...",
    refreshToken: "a1b2c3..."
  }
```

---

```
┌──────────────────────────────────────────────────────────────┐
│              3. USAR O TOKEN (Requisição Autenticada)        │
└──────────────────────────────────────────────────────────────┘

GET /alunos
Authorization: Bearer eyJhbGc...
       │
       ▼
  Middleware:
  authMiddleware
       │
       ├─── Token não fornecido?
       │    └──▶ 401 "Token não fornecido"
       │
       ├─── Token inválido?
       │    └──▶ 403 "Token inválido"
       │
       ├─── Token expirado?
       │    └──▶ 403 "Token expirado"
       │
       ▼
  Decodifica JWT
  req.user = {
    id: 1,
    papel: "aluno"
  }
       │
       ▼
  Executa Controller
  (listarAlunos)
       │
       ▼
  Retorna dados
```

---

```
┌──────────────────────────────────────────────────────────────┐
│              4. RENOVAR TOKEN (Refresh)                      │
└──────────────────────────────────────────────────────────────┘

POST /auth/refresh
{
  "refreshToken": "a1b2c3..."
}
       │
       ▼
  Busca Refresh Token
  no BD (hash)
       │
       ├─── Revogado?
       │    └──▶ 401 "Token inválido"
       │
       ├─── Expirado?
       │    └──▶ 401 "Token expirado"
       │
       ▼
  Gera novo JWT
  (15 minutos)
       │
       ▼
  Gera novo Refresh
  (7 dias)
       │
       ▼
  Atualiza BD
  (token rotation)
       │
       ▼
  Retorna:
  {
    token: "eyJhbGc...",
    refreshToken: "nova..."
  }
```

---

```
┌──────────────────────────────────────────────────────────────┐
│              5. LOGOUT (Encerrar Sessão)                     │
└──────────────────────────────────────────────────────────────┘

POST /auth/logout
{
  "refreshToken": "a1b2c3..."
}
       │
       ▼
  Busca token
  no BD
       │
       ▼
  Marca como:
  revoked: true
       │
       ▼
  Retorna:
  {
    message: "Logout com sucesso"
  }
       │
       ▼
  JWT no cliente
  continua válido até expirar!
  (após 15 min expira automaticamente)
```

---

## 🔑 RECUPERAÇÃO DE SENHA

```
┌──────────────────────────────────────────────────────────────┐
│         FLUXO DE RECUPERAÇÃO (Sem autenticação)              │
└──────────────────────────────────────────────────────────────┘

1️⃣  POST /auth/recuperar-senha
    { "email": "joao@senac.com" }
         │
         ▼
    Gera token aleatório
    (64 bytes, hex)
    token = "a1b2c3d4..."
         │
         ▼
    Hash do token
    (SHA256)
    hash = "7f8e9d..."
         │
         ▼
    Salva em BD:
    reset_token: "7f8e9d..."
    reset_token_expiry: +1 hora
         │
         ▼
    Retorna (em DEV):
    dev_link: "http://localhost:3000/auth/resetar-senha?token=a1b2c3..."
         │
         ▼
    Em PRODUÇÃO: Envia email


2️⃣  POST /auth/resetar-senha
    {
      "email": "joao@senac.com",
      "token": "a1b2c3d4...",
      "nova_senha": "nova_123"
    }
         │
         ▼
    Valida token
    (ainda válido?)
         │
         ▼
    Hash nova senha
    (bcrypt)
         │
         ▼
    Atualiza BD
    senha: "$2b$10$..."
         │
         ▼
    Limpa reset_token
         │
         ▼
    Retorna:
    {
      "message": "Senha atualizada"
    }
```

---

## 📋 LISTAR USUÁRIOS LOGADOS

```
┌──────────────────────────────────────────────────────────────┐
│  GET /auth/usuarios-logados (requer autenticação)            │
└──────────────────────────────────────────────────────────────┘

Autenticado?
    │
    ├─ NÃO → 401 Unauthorized
    │
    ▼
Busca TODOS os usuários
com refresh_tokens ATIVOS
(revoked: false)
    │
    ▼
Para cada usuário:
  ├─ id_usuario
  ├─ nome
  ├─ email
  ├─ papel
  ├─ sessoes_ativas: count(refresh_tokens)
  ├─ ultima_sessao: max(created_at)
  └─ tokens: [{
       criado_em,
       expira_em,
       dias_restantes
     }]
    │
    ▼
Retorna:
{
  "total_usuarios": 5,
  "usuarios_com_sessao": 2,
  "usuarios": [...]
}
```

---

## 🧹 LIMPEZA AUTOMÁTICA

```
Token JWT expira após 15 minutos
    │
    └─────────────────────────┐
                              │
    Refresh Token expira      │
    após 7 dias               │
                              │
                              ▼
                   Cliente precisa fazer
                   POST /auth/refresh
                              │
                              ├─ Token OK?
                              │  └─ Gera novo JWT
                              │
                              ├─ Token expirado?
                              │  └─ 401 "Refaça login"
                              │
                              └─ Token revogado?
                                 └─ 401 "Faça logout primeiro"
```

---

## 📊 DIAGRAMA DE ESTADO DO TOKEN

```
                    ┌──────────────┐
                    │ ANTES DO      │
                    │ LOGIN         │
                    └──────┬───────┘
                           │
          ┌────────────────▼────────────────┐
          │    POST /auth/login             │
          │    ou /auth/register            │
          └────────────────┬────────────────┘
                           │
                ┌──────────▼──────────┐
                │                     │
          ┌─────▼──────┐        ┌────▼──────┐
          │ JWT Token  │        │ Refresh   │
          │ (15 min)   │        │ (7 dias)  │
          └─────┬──────┘        └────┬──────┘
                │                    │
                │                    │
         ┌──────▼──────────────┐     │
         │ Token VÁLIDO        │     │
         │ Cliente pode usar   │     │
         └────────┬────────────┘     │
                  │                  │
         ┌────────▼──────────────┐   │
         │ 15 minutos passados?  │   │
         └────────┬────────────┬─┘   │
                  │ SIM        │ NÃO │
          ┌───────▼────┐       │     │
          │ EXPIRADO   │       │     │
          │ (precisa   │◄──────┘     │
          │  refresh)  │             │
          └───────┬────┘             │
                  │                  │
         ┌────────▼──────────────┐   │
         │POST /auth/refresh     │   │
         │ (usa refresh token)   │   │
         └────────┬────────────┬─┘   │
                  │ OK         │ ERRO│
          ┌───────▼────┐  ┌────▼───┐│
          │ Novo JWT   │  │ 401    ││
          │ (15 min)   │  │Refaça  ││
          │ Volta aqui ├──┤login   ││
          └────────────┘  │        ││
                          │    ┌───▼─┐
                          │    │     │
                          │    ▼
                          │  POST /auth/logout
                          │  (marca revoked: true)
                          │    │
                          │    ▼
                          │  REVOGADO
                          │
                          └─ NÃO PODE USAR MAIS
```

---

## 🔐 TABELAS DO BANCO

### `usuarios`
```
id_usuario (PK)
nome
email (UNIQUE)
senha (HASH)
papel (admin | professor | aluno | secretaria)
cpf (UNIQUE)
data_cadastro
```

### `refresh_tokens`
```
id (PK)
token (HASH do refresh token)
id_usuario (FK → usuarios)
revoked (true | false)
created_at
expires_at
```

### `alunos` (Duplicação atual - deveria referenciar usuarios)
```
id_aluno
nome
email
senha
cpf
telefone
endereco
data_nascimento
data_cadastro
```

---

## ⚡ RESUMO RÁPIDO

| Operação | Endpoint | Auth | Retorna |
|---|---|---|---|
| Registrar | POST /auth/register | ❌ | token + refreshToken |
| Login | POST /auth/login | ❌ | token + refreshToken |
| Renovar | POST /auth/refresh | ❌ | token + refreshToken |
| Logout | POST /auth/logout | ❌ | ok |
| Recuperar | POST /auth/recuperar-senha | ❌ | ok |
| Resetar | POST /auth/resetar-senha | ❌ | ok |
| Mudar | POST /auth/mudar-senha | ✅ | ok |
| Perfil | GET /auth/meu-perfil | ✅ | userData |
| Sessões | GET /auth/minhas-sessoes | ✅ | sessionList |
| Logoff Sessão | POST /auth/logout-sessao | ✅ | ok |
| Logoff Global | POST /auth/logout-global | ✅ | ok |
| Usuários Logados | GET /auth/usuarios-logados | ✅ | userList |
| Debug: Todos | GET /auth/usuarios-debug | ❌ | userList |
