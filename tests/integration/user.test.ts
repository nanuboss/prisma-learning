import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";

const testEmail = `integration-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";
let createdUserId: string;
let accessToken: string;
const createdUserEmail = `create-${Date.now()}@example.com`;

describe("User API", () => {
  beforeAll(async () => {
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Integration Test User",
        email: testEmail,
        password: testPassword,
      });

    const loginResponse = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    accessToken = loginResponse.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  it("POST /api/v1/users should create a new user", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Integration Test User",
        email: createdUserEmail,
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User created successfully");
    expect(response.body.data.name).toBe("Integration Test User");
    expect(response.body.data.email).toBe(createdUserEmail);
    expect(response.body.data.id).toBeDefined();
    createdUserId = response.body.data.id;
  });

  it("GET /api/v1/users/:id should return a user by ID", async () => {
    const response = await request(app)
      .get(`/api/v1/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(createdUserId);
    expect(response.body.data.email).toBe(createdUserEmail);
  });

  it("GET /api/v1/users should return a paginated list of users", async () => {
    const response = await request(app)
      .get("/api/v1/users")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({ page: 1, limit: 10 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Users fetched successfully");
    expect(response.body.data).toBeInstanceOf(Array);
    expect(response.body.meta.page).toBe(1);
    expect(response.body.meta.limit).toBe(10);
    expect(response.body.meta.total).toBeGreaterThanOrEqual(1);
  });

  it("PATCH /api/v1/users/:id should update a user", async () => {
    const response = await request(app)
      .patch(`/api/v1/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated Integration User",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User updated successfully");
    expect(response.body.data.id).toBe(createdUserId);
    expect(response.body.data.name).toBe("Updated Integration User");
  });

  it("DELETE /api/v1/users/:id should delete a user", async () => {
    const response = await request(app)
      .delete(`/api/v1/users/${createdUserId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("User deleted successfully");
  });
});
