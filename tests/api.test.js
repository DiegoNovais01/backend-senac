import request from "supertest";
import app from "../src/index.js";

describe("Api Senac", () => {
  
  test("health check", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
  })
  
  test("rota inexistente retorna 404", async () => {
    const res = await request(app).get("/naoexiste");
    expect(res.statusCode).toBe(404)
  })

})