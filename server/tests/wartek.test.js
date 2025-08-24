const { test, expect, describe } = require("@jest/globals");
const supertest = require("supertest");
const app = require("../app");

// Basic health check test
test("GET / should return API running message", async () => {
  const response = await supertest(app).get("/");

  expect(response.status).toBe(200);
  expect(response.text).toBe("WarTek API Running 🚀");
});
