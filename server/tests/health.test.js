const { test, expect } = require("@jest/globals");
const supertest = require("supertest");
const app = require("../app");

test("Server health check", async () => {
  const response = await supertest(app).get("/");
  expect(response.status).toBe(200);
  expect(response.text).toBe("WarTek API Running 🚀");
});
