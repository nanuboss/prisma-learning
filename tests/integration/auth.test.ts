import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";

const testEmail = `auth-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

let accessToken: string;
let refreshToken1: string;
let refreshToken2: string;
let userId: string;

describe("Auth API - Logout All Devices", () => {
  beforeAll(async () => {
    const registerResponse = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Auth Integration User",
        email: testEmail,
        password: testPassword,
      });

    expect(registerResponse.status).toBe(201);

    const login1 = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(login1.status).toBe(200);

    accessToken = login1.body.data.accessToken;
    refreshToken1 = login1.body.data.refreshToken;

    const login2 = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(login2.status).toBe(200);

    refreshToken2 = login2.body.data.refreshToken;

    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (!user) {
      throw new Error("Test user not found");
    }

    userId = user.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  it("should reject logout-all without authentication", async () => {
    const response = await request(app).post("/api/v1/auth/logout-all");

    expect(response.status).toBe(401);
  });

  it("should revoke all active refresh tokens", async () => {
    const response = await request(app)
      .post("/api/v1/auth/logout-all")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const tokens = await prisma.refreshToken.findMany({
      where: { userId },
    });

    expect(tokens).toHaveLength(2);
    expect(tokens.every((token) => token.revokedAt !== null)).toBe(true);
  });

  it("should reject refresh using a token revoked by logout-all", async () => {
    const response = await request(app).post("/api/v1/auth/refresh").send({
      refreshToken: refreshToken1,
    });

    expect(response.status).toBe(401);
  });
});
