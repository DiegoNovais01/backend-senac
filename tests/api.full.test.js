import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../src/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "senha_token";

// helper pra gerar tokens fake
const gerarToken = (role = "admin") => {
  return jwt.sign(
    { id: 1, nome: "Teste", role },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
};

describe("🚀 TESTES COMPLETOS - API SENAC", () => {

  // ============================
  // ROTAS GERAIS
  // ============================
  test("health check", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  });

  test("rota inexistente retorna 404", async () => {
    const res = await request(app).get("/rota-que-nao-existe");
    expect(res.statusCode).toBe(404);
  });

  // ============================
  // AUTH MIDDLEWARE
  // ============================
  test("GET /alunos sem token → 401", async () => {
    const res = await request(app).get("/alunos");
    expect(res.statusCode).toBe(401);
  });

  test("GET /alunos token inválido → 403", async () => {
    const res = await request(app)
      .get("/alunos")
      .set("Authorization", "Bearer token_fake");
    expect(res.statusCode).toBe(403);
  });

  // ============================
  // ROLE MIDDLEWARE
  // ============================
  test("GET /alunos role inválida → 403", async () => {
    const token = gerarToken("aluno"); // role errada

    const res = await request(app)
      .get("/alunos")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

  // ============================
  // ROTAS PROTEGIDAS FUNCIONANDO
  // ============================
  test("GET /alunos com admin → permitido", async () => {
    const token = gerarToken("admin");

    const res = await request(app)
      .get("/alunos")
      .set("Authorization", `Bearer ${token}`);

    expect([200, 404]).toContain(res.statusCode);
  });

  // ============================
  // DELETE SOMENTE ADMIN
  // ============================
  test("DELETE /alunos/:id com secretaria → bloqueado", async () => {
    const token = gerarToken("secretaria");

    const res = await request(app)
      .delete("/alunos/1")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
  });

});
