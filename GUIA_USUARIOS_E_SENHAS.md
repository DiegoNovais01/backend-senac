# 🔐 Guia Prático: Ver Usuários Logados & Recuperação de Senha

## 🚀 PROBLEMA RESOLVIDO

Você agora tem **3 formas de ver os usuários**:

### 1️⃣ **Ver TODOS os usuários (com email/senha)**
```
GET http://localhost:3000/auth/usuarios-debug
```
**Retorna:**
```json
{
  "aviso": "Este endpoint retorna dados sensíveis. Não usar em produção!",
  "total": 5,
  "usuarios": [
    {
      "id_usuario": 1,
      "nome": "João Silva",
      "email": "joao@senac.com",
      "papel": "aluno",
      "data_cadastro": "2025-12-10T10:30:00Z"
    },
    {
      "id_usuario": 2,
      "nome": "Maria Santos",
      "email": "maria@senac.com",
      "papel": "professor",
      "data_cadastro": "2025-12-10T11:20:00Z"
    }
  ]
}
```

**✅ Use isto para:**
- Lembrar qual email usou para registrar
- Saber qual é o papel do usuário
- Encontrar usuários cadastrados

---

### 2️⃣ **Ver usuários com sessões ATIVAS** (requer autenticação)
```
GET http://localhost:3000/auth/usuarios-logados
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

**Retorna:**
```json
{
  "total_usuarios": 5,
  "usuarios_com_sessao": 2,
  "usuarios": [
    {
      "id_usuario": 1,
      "nome": "João Silva",
      "email": "joao@senac.com",
      "papel": "aluno",
      "data_cadastro": "2025-12-10T10:30:00Z",
      "sessoes_ativas": 3,
      "ultima_sessao": "2025-12-12T15:45:00Z",
      "tokens": [
        {
          "criado_em": "2025-12-12T15:45:00Z",
          "expira_em": "2025-12-19T15:45:00Z",
          "dias_restantes": 7
        },
        {
          "criado_em": "2025-12-12T14:20:00Z",
          "expira_em": "2025-12-19T14:20:00Z",
          "dias_restantes": 7
        }
      ]
    }
  ]
}
```

**✅ Use isto para:**
- Ver quantas abas/dispositivos estão conectados
- Saber quando foi o último acesso
- Ver quando os tokens expiram

---

### 3️⃣ **Ver MINHAS SESSÕES** (requer autenticação)
```
GET http://localhost:3000/auth/minhas-sessoes
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

**Retorna:**
```json
{
  "total_sessoes": 3,
  "sessoes": [
    {
      "id": 15,
      "criada_em": "2025-12-12T15:45:00Z",
      "expira_em": "2025-12-19T15:45:00Z",
      "dias_restantes": 7,
      "ativa": true
    }
  ]
}
```

---

## 🔑 RECUPERAÇÃO DE SENHA

### Passo 1: Usuário esqueceu a senha
```bash
POST http://localhost:3000/auth/recuperar-senha
Content-Type: application/json

{
  "email": "joao@senac.com"
}
```

**Retorna:**
```json
{
  "message": "Email de recuperação enviado (em produção)",
  "dev_link": "http://localhost:3000/auth/resetar-senha?token=a1b2c3d4e5f6...&email=joao@senac.com",
  "status": "enviado"
}
```

**ℹ️ Em produção:** Seria enviado email com o link
**ℹ️ Em desenvolvimento:** O link aparece no console

---

### Passo 2: Resetar com o token
```bash
POST http://localhost:3000/auth/resetar-senha
Content-Type: application/json

{
  "email": "joao@senac.com",
  "token": "a1b2c3d4e5f6...",
  "nova_senha": "nova_senha_123"
}
```

**Retorna:**
```json
{
  "message": "Senha atualizada com sucesso!",
  "status": "sucesso"
}
```

---

## 🔄 MUDAR SENHA (Usuário Logado)

Se o usuário **sabe a senha atual** e quer mudar:

```bash
POST http://localhost:3000/auth/mudar-senha
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
Content-Type: application/json

{
  "senha_atual": "senha_antiga_123",
  "nova_senha": "senha_nova_456"
}
```

**Retorna:**
```json
{
  "message": "Senha alterada com sucesso!",
  "status": "sucesso"
}
```

---

## 🔓 LOGOUT

### Logout de UMA SESSÃO específica
```bash
POST http://localhost:3000/auth/logout-sessao
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
Content-Type: application/json

{
  "sessao_id": 15
}
```

---

### Logout GLOBAL (todas as sessões)
```bash
POST http://localhost:3000/auth/logout-global
Authorization: Bearer SEU_ACCESS_TOKEN_AQUI
```

**Retorna:**
```json
{
  "message": "Logout de todas as sessões realizado com sucesso",
  "sessoes_encerradas": 3,
  "status": "sucesso"
}
```

---

## 📋 FLUXO COMPLETO DE TESTE

### 1. Register
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste User",
    "email": "teste@senac.com",
    "senha": "senha123",
    "papel": "aluno"
  }'
```

**Guarda:** `token` e `refreshToken`

---

### 2. Login (se já registrou)
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@senac.com",
    "senha": "senha123"
  }'
```

---

### 3. Ver usuários cadastrados
```bash
curl http://localhost:3000/auth/usuarios-debug
```

---

### 4. Ver seus dados
```bash
curl -X GET http://localhost:3000/auth/meu-perfil \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 5. Ver suas sessões
```bash
curl -X GET http://localhost:3000/auth/minhas-sessoes \
  -H "Authorization: Bearer SEU_TOKEN"
```

---

### 6. Mudar senha
```bash
curl -X POST http://localhost:3000/auth/mudar-senha \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "senha_atual": "senha123",
    "nova_senha": "nova_senha_456"
  }'
```

---

### 7. Login com nova senha
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@senac.com",
    "senha": "nova_senha_456"
  }'
```

---

## 🔥 DICAS IMPORTANTES

### ⚠️ Para Ver o Token
1. Faz login
2. Copia o `token` da resposta
3. Cola em qualquer requisição que precisa autenticação

### 💡 Token JWT já vem decodificado
Se precisar ver o que tem dentro do token, use um site como:
```
https://jwt.io
```

Cole seu token lá e vê:
- `id` (ID do usuário)
- `papel` (admin/professor/aluno/secretaria)
- `exp` (quando expira)

### 🧪 Testando no Postman/Insomnia

1. **Criar nova requisição POST**
2. **URL:** `http://localhost:3000/auth/login`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
```json
{
  "email": "teste@senac.com",
  "senha": "senha123"
}
```
5. **Enviar**
6. **Copiar o `token` da resposta**
7. **Ir pra próxima requisição**
8. **Headers → Authorization**
9. **Tipo: Bearer Token**
10. **Cole o token**

---

## 🎯 RESUMO

| O que precisa | Como acessar |
|---|---|
| Ver emails/senhas de quem registrou | `GET /auth/usuarios-debug` |
| Ver quem tá logado agora | `GET /auth/usuarios-logados` (com token) |
| Ver minhas sessões | `GET /auth/minhas-sessoes` (com token) |
| Esqueci a senha | `POST /auth/recuperar-senha` |
| Mudar minha senha | `POST /auth/mudar-senha` (com token) |
| Fazer logout | `POST /auth/logout-global` (com token) |

---

## ✅ PRÓXIMAS MELHORIAS (Opcional)

Seus novos endpoints já têm:
- ✅ Listagem de usuários
- ✅ Recuperação de senha
- ✅ Gerenciamento de sessões
- ✅ Logout seletivo

Ainda falta:
- ⏳ Envio real de email (usar SendGrid, Gmail API)
- ⏳ Validação de entrada com Zod
- ⏳ Autenticação por dois fatores (2FA)
- ⏳ Proteção de rotas por papel (admin, professor)
