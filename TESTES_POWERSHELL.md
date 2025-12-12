# 🧪 TESTES PRONTOS PARA COPIAR E COLAR

## ⚠️ ANTES DE COMEÇAR

1. Certifique-se que o servidor está rodando:
```bash
npm run dev
```

2. Todos os comandos abaixo usam `http://localhost:3000`

3. Quando ver `SEU_TOKEN_AQUI`, substitua pelo token real que recebeu do login

4. Você pode copiar cada bloco todo e colar no PowerShell

---

## 📝 TESTE 1: Registrar um Novo Usuário

```powershell
$body = @{
    nome = "João Silva"
    email = "joao@senac.com"
    senha = "senha123"
    papel = "aluno"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/register" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**O que fazer com a resposta:**
- Salve o `token` (é o JWT)
- Salve o `refreshToken` (é para renovar)
- Use para os próximos testes

---

## 📝 TESTE 2: Ver Todos os Usuários Cadastrados

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/auth/usuarios-debug" | ConvertTo-Json
```

**Mostra:**
- ID, Nome, Email, Papel, Data de Cadastro
- Todos os usuários que se registraram
- Sem necessidade de autenticação

---

## 📝 TESTE 3: Fazer Login

```powershell
$body = @{
    email = "joao@senac.com"
    senha = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**O que fazer:**
- Salve o `token` desta resposta
- Use para todos os testes que precisam de autenticação

---

## 📝 TESTE 4: Ver Seu Perfil (Com Autenticação)

```powershell
# ⚠️ Substitua SEU_TOKEN_AQUI pelo token que você recebeu
$token = "SEU_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/auth/meu-perfil" `
  -Headers $headers | ConvertTo-Json
```

**Mostra:**
- ID, Nome, Email, Papel, CPF
- Os dados do usuário logado

---

## 📝 TESTE 5: Ver Suas Sessões Ativas

```powershell
$token = "SEU_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/auth/minhas-sessoes" `
  -Headers $headers | ConvertTo-Json
```

**Mostra:**
- Quantas abas/dispositivos você tá logado
- Quando cada sessão foi criada
- Quanto tempo falta para expirar

---

## 📝 TESTE 6: Ver Todos os Usuários Logados (Admin View)

```powershell
$token = "SEU_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/auth/usuarios-logados" `
  -Headers $headers | ConvertTo-Json
```

**Mostra:**
- Total de usuários registrados
- Quantos têm sessão ativa
- Última sessão de cada um
- Tokens e quando expiram

---

## 📝 TESTE 7: Mudar Sua Senha (Usuário Logado)

```powershell
$token = "SEU_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    senha_atual = "senha123"
    nova_senha = "novaSenha456"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/mudar-senha" `
  -Method Post `
  -Headers $headers `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**Resultado:**
- Se correto: "Senha alterada com sucesso!"
- Se senha atual estiver errada: "Senha atual incorreta"
- Se nova senha igual a antiga: "Não pode ser igual à atual"

---

## 📝 TESTE 8: Recuperar Senha (Usuário Esqueceu)

```powershell
$body = @{
    email = "joao@senac.com"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/recuperar-senha" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**Em desenvolvimento:**
- Retorna um `dev_link` que você pode usar

**Em produção:**
- Envia um email (precisa configurar SendGrid/Gmail)

---

## 📝 TESTE 9: Resetar Senha (Com o Link de Recuperação)

```powershell
# 🔑 Copie o "dev_link" da resposta anterior
# Exemplo: http://localhost:3000/auth/resetar-senha?token=a1b2c3...&email=joao@senac.com

# Extrai o token do link acima
$token = "COLE_O_TOKEN_DO_LINK_AQUI"
$email = "joao@senac.com"

$body = @{
    email = $email
    token = $token
    nova_senha = "senhaNovaReal123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/resetar-senha" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**Resultado:**
- Se sucesso: "Senha atualizada com sucesso!"
- Pode fazer login com a nova senha

---

## 📝 TESTE 10: Login com Nova Senha

```powershell
$body = @{
    email = "joao@senac.com"
    senha = "senhaNovaReal123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**Deve funcionar!**
- Recebe novo token
- Pode usar normalmente

---

## 📝 TESTE 11: Renovar Token (Refresh)

```powershell
# Você já tem um refreshToken do register/login anterior
$refreshToken = "SEU_REFRESH_TOKEN_AQUI"

$body = @{
    refreshToken = $refreshToken
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/refresh" `
  -Method Post `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**Resultado:**
- Novo JWT válido por 15 minutos
- Novo refresh token válido por 7 dias

---

## 📝 TESTE 12: Logout de Uma Sessão Específica

Primeiro, pegue o ID da sessão:

```powershell
# Ver suas sessões
$token = "SEU_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/auth/minhas-sessoes" `
  -Headers $headers | ConvertTo-Json
```

Depois, faça logout de uma específica:

```powershell
$token = "SEU_TOKEN_AQUI"
$sessao_id = 15  # Copie do resultado anterior

$headers = @{
    "Authorization" = "Bearer $token"
}

$body = @{
    sessao_id = $sessao_id
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/auth/logout-sessao" `
  -Method Post `
  -Headers $headers `
  -Body $body `
  -ContentType "application/json" | ConvertTo-Json
```

**Resultado:**
- Essa sessão é revogada
- As outras continuam ativas

---

## 📝 TESTE 13: Logout Global (Todas as Sessões)

```powershell
$token = "SEU_TOKEN_AQUI"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/auth/logout-global" `
  -Method Post `
  -Headers $headers | ConvertTo-Json
```

**Resultado:**
- Todas as suas sessões são encerradas
- Precisa fazer login de novo

---

## 🔄 TESTE COMPLETO (Sequência de 1 a 13)

```powershell
# 1. Registrar
Write-Host "1️⃣ Registrando novo usuário..."
$register = Invoke-RestMethod -Uri "http://localhost:3000/auth/register" `
  -Method Post `
  -Body (@{nome="Teste";email="teste@senac.com";senha="teste123"} | ConvertTo-Json) `
  -ContentType "application/json"
$token = $register.token
Write-Host "✅ Registrado! Token: $($token.Substring(0, 20))..."
Write-Host ""

# 2. Ver usuários
Write-Host "2️⃣ Vendo todos os usuários..."
$users = Invoke-RestMethod -Uri "http://localhost:3000/auth/usuarios-debug"
Write-Host "✅ Total: $($users.total) usuários"
Write-Host ""

# 3. Login
Write-Host "3️⃣ Fazendo login..."
$login = Invoke-RestMethod -Uri "http://localhost:3000/auth/login" `
  -Method Post `
  -Body (@{email="teste@senac.com";senha="teste123"} | ConvertTo-Json) `
  -ContentType "application/json"
$token = $login.token
Write-Host "✅ Login realizado!"
Write-Host ""

# 4. Ver perfil
Write-Host "4️⃣ Vendo perfil..."
$headers = @{"Authorization" = "Bearer $token"}
$perfil = Invoke-RestMethod -Uri "http://localhost:3000/auth/meu-perfil" -Headers $headers
Write-Host "✅ Nome: $($perfil.perfil.nome)"
Write-Host ""

# 5. Ver sessões
Write-Host "5️⃣ Vendo sessões..."
$sessoes = Invoke-RestMethod -Uri "http://localhost:3000/auth/minhas-sessoes" -Headers $headers
Write-Host "✅ Sessões ativas: $($sessoes.total_sessoes)"
Write-Host ""

# 6. Ver usuários logados
Write-Host "6️⃣ Vendo usuários logados..."
$logados = Invoke-RestMethod -Uri "http://localhost:3000/auth/usuarios-logados" -Headers $headers
Write-Host "✅ Usuários com sessão: $($logados.usuarios_com_sessao)"
Write-Host ""

# 7. Mudar senha
Write-Host "7️⃣ Mudando senha..."
$mudar = Invoke-RestMethod -Uri "http://localhost:3000/auth/mudar-senha" `
  -Method Post `
  -Headers $headers `
  -Body (@{senha_atual="teste123";nova_senha="teste456"} | ConvertTo-Json) `
  -ContentType "application/json"
Write-Host "✅ Senha mudada!"
Write-Host ""

# 8. Recuperar senha
Write-Host "8️⃣ Solicitando recuperação..."
$recuperar = Invoke-RestMethod -Uri "http://localhost:3000/auth/recuperar-senha" `
  -Method Post `
  -Body (@{email="teste@senac.com"} | ConvertTo-Json) `
  -ContentType "application/json"
Write-Host "✅ Email enviado (em desenvolvimento, veja o link abaixo)"
if ($recuperar.dev_link) {
    Write-Host "🔗 Link: $($recuperar.dev_link.Substring(0, 80))..."
}
Write-Host ""

# 9. Logout
Write-Host "9️⃣ Fazendo logout..."
$logout = Invoke-RestMethod -Uri "http://localhost:3000/auth/logout-global" `
  -Method Post `
  -Headers $headers
Write-Host "✅ Logout realizado!"
Write-Host ""

Write-Host "🎉 TESTE COMPLETO FINALIZADO!"
```

**Execute tudo de uma vez:**
Copie todo o bloco acima e cole no PowerShell!

---

## 🛠️ CONVERTENDO PARA CURL (Linux/Mac)

Se você estiver em Linux/Mac, converta assim:

```bash
# PowerShell:
Invoke-RestMethod -Uri "URL" -Headers $headers -Body $body -Method Post

# Vira Curl:
curl -X POST "URL" \
  -H "Authorization: Bearer $token" \
  -H "Content-Type: application/json" \
  -d '{"campo": "valor"}'
```

**Exemplo prático:**

```bash
# PowerShell
$body = @{email="joao@senac.com";senha="123"} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/auth/login" -Method Post -Body $body -ContentType "application/json"

# Vira
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@senac.com","senha":"123"}'
```

---

## ✅ ESPERADO FUNCIONAR

Se todos os testes passarem:

```
✅ Registrar novo usuário
✅ Ver todos os usuários
✅ Fazer login
✅ Ver seu perfil
✅ Ver suas sessões
✅ Ver usuários logados
✅ Mudar senha
✅ Recuperar senha
✅ Renovar token
✅ Logout seletivo
✅ Logout global
```

---

## 🐛 Se não funcionar:

1. **Erro: "Cannot reach localhost:3000"**
   - Certifique-se que rodou `npm run dev`
   - Verifique se porta 3000 está livre

2. **Erro: "JWT_SECRET not defined"**
   - Crie um `.env` com:
   ```
   JWT_SECRET="sua_chave_secreta"
   ```

3. **Erro: "Database connection failed"**
   - Verifique se MySQL está rodando
   - Verifique `.env` com DATABASE_URL correto

4. **Erro no token**
   - Certifique-se que copiou todo o token (não cortou)
   - Token JWT tem 3 partes separadas por pontos

---

**Bom teste! 🚀**
