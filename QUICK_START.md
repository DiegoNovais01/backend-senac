# 🚀 Quick Start - Teste Sua API em 5 Minutos

## 1️⃣ Inicie o servidor

```bash
cd "c:\Users\Aluno 19\Desktop\Site Senac\backend-senac"
npm run dev
```

Você deve ver:
```
🚀 Servidor rodando na porta 3000
🔗 http://localhost:3000
📄 http://localhost:3000/api/docs
```

---

## 2️⃣ Abra uma aba do navegador

Acesse: http://localhost:3000/api/docs

(Swagger UI com todos seus endpoints documentados)

---

## 3️⃣ Teste os endpoints (Copie e cola em curl/Postman)

### A. Registre um usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@senac.com",
    "senha": "senha123",
    "papel": "aluno"
  }'
```

**Salva a resposta do `token` e `refreshToken`**

---

### B. Veja todos os usuários cadastrados

```bash
curl http://localhost:3000/auth/usuarios-debug
```

Você verá todos os usuários com email, nome, etc.

---

### C. Faça login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@senac.com",
    "senha": "senha123"
  }'
```

**Salva o `token` desta resposta**

---

### D. Veja seus dados pessoais

Substitua `SEU_TOKEN` pelo token que você copiou acima:

```bash
curl -X GET http://localhost:3000/auth/meu-perfil \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### E. Veja suas sessões ativas

```bash
curl -X GET http://localhost:3000/auth/minhas-sessoes \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### F. Veja todos os usuários LOGADOS

```bash
curl -X GET http://localhost:3000/auth/usuarios-logados \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### G. Mude sua senha

```bash
curl -X POST http://localhost:3000/auth/mudar-senha \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senha_atual": "senha123",
    "nova_senha": "novaSenha456"
  }'
```

---

### H. Faça logout

```bash
curl -X POST http://localhost:3000/auth/logout-global \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

## 🎯 TESTAR NO POSTMAN (Mais fácil)

### 1. Baixe Postman
https://www.postman.com/downloads/

### 2. Crie uma nova requisição POST
**URL:** `http://localhost:3000/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (raw):**
```json
{
  "email": "joao@senac.com",
  "senha": "senha123"
}
```

### 3. Clique Send
Você verá o token na resposta.

### 4. Crie nova requisição GET
**URL:** `http://localhost:3000/auth/meu-perfil`

**Headers:**
```
Authorization: Bearer COLE_O_TOKEN_AQUI
Content-Type: application/json
```

### 5. Clique Send
Você verá seus dados!

---

## 🐛 TROUBLESHOOTING

### Erro: "Cannot find module '@prisma/client'"
```bash
npm install
```

### Erro: "Port 3000 already in use"
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process -Force
```

### Erro: "JWT_SECRET not defined"
Crie um arquivo `.env`:
```
DATABASE_URL="mysql://user:password@localhost:3306/senac"
JWT_SECRET="sua_chave_secreta_bem_longa_aqui"
PORT=3000
NODE_ENV=development
```

### Erro: "Database connection failed"
Verifique se MySQL está rodando:
```bash
# Windows - Abra Services (services.msc) e procure por MySQL
# Ou na linha de comando:
mysql -u root -p
```

---

## 📱 RESPOSTAS ESPERADAS

### Login Bem-Sucedido
```json
{
  "message": "Login realizado com sucesso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."
}
```

### Usuários Cadastrados
```json
{
  "aviso": "Este endpoint retorna dados sensíveis. Não usar em produção!",
  "total": 2,
  "usuarios": [
    {
      "id_usuario": 1,
      "nome": "João Silva",
      "email": "joao@senac.com",
      "papel": "aluno",
      "data_cadastro": "2025-12-12T10:30:00.000Z"
    }
  ]
}
```

### Usuários Logados
```json
{
  "total_usuarios": 2,
  "usuarios_com_sessao": 1,
  "usuarios": [
    {
      "id_usuario": 1,
      "nome": "João Silva",
      "email": "joao@senac.com",
      "papel": "aluno",
      "sessoes_ativas": 1,
      "ultima_sessao": "2025-12-12T10:30:00.000Z",
      "tokens": [
        {
          "criado_em": "2025-12-12T10:30:00.000Z",
          "expira_em": "2025-12-19T10:30:00.000Z",
          "dias_restantes": 7
        }
      ]
    }
  ]
}
```

---

## 🔄 FLUXO PRÁTICO COMPLETO

1. **npm run dev** → Servidor rodando
2. **Register** → Cria novo usuário
3. **Login** → Obtem token
4. **usuarios-debug** → Vê todos
5. **meu-perfil** → Vê seus dados
6. **minhas-sessoes** → Vê quantas abas abertas
7. **mudar-senha** → Muda senha
8. **Login novamente** → Com nova senha
9. **logout-global** → Faz logout

---

## ✨ AGORA VOCÊ TEM:

✅ 10 novos endpoints para gerenciar usuários
✅ Recuperação de senha
✅ Gerenciamento de sessões
✅ Visualização de usuários logados
✅ Mudança de senha
✅ Logout seletivo

**Continue desenvolvendo! 🚀**
