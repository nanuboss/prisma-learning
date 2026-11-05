import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";
import { prisma } from "../../src/config/prisma.js";
import { hashRefreshToken } from "../../src/utils/refresh-token.js";

const testEmail = `sessions-${Date.now()}@example.com`;
const otherEmail = `other-${Date.now()}@example.com`;
const testPassword = "TestPassword123!";

let accessToken: string;
let otherAccessToken: string;
let userId: string;
let otherUserId: string;
let sessionId: string;
let otherSessionId: string;

describe("Auth API - Session Management", () => {
  beforeAll(async () => {
    const register1 = await request(app).post("/api/v1/auth/register").send({
      name: "Session Test User",
      email: testEmail,
      password: testPassword,
    });

    expect(register1.status).toBe(201);

    const register2 = await request(app).post("/api/v1/auth/register").send({
      name: "Other Session User",
      email: otherEmail,
      password: testPassword,
    });

    expect(register2.status).toBe(201);

    const login1 = await request(app)
      .post("/api/v1/auth/login")
      .set("User-Agent", "Mozilla/5.0 Chrome/120.0.0.0 Windows NT 10.0")
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(login1.status).toBe(200);
    accessToken = login1.body.data.accessToken;

    const login2 = await request(app).post("/api/v1/auth/login").send({
      email: testEmail,
      password: testPassword,
    });

    expect(login2.status).toBe(200);

    const otherLogin = await request(app).post("/api/v1/auth/login").send({
      email: otherEmail,
      password: testPassword,
    });

    expect(otherLogin.status).toBe(200);
    otherAccessToken = otherLogin.body.data.accessToken;

    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    const otherUser = await prisma.user.findUnique({
      where: { email: otherEmail },
    });

    if (!user || !otherUser) {
      throw new Error("Test users not found");
    }

    userId = user.id;
    otherUserId = otherUser.id;

    const firstSession = await prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashRefreshToken(login1.body.data.refreshToken),
      },
    });

    const secondSession = await prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashRefreshToken(login2.body.data.refreshToken),
      },
    });

    const otherSession = await prisma.refreshToken.findUnique({
      where: {
        tokenHash: hashRefreshToken(otherLogin.body.data.refreshToken),
      },
    });

    if (!firstSession || !secondSession || !otherSession) {
      throw new Error("Test sessions not found");
    }

    sessionId = firstSession.familyId;
    otherSessionId = otherSession.familyId;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        id: { in: [userId, otherUserId].filter(Boolean) },
      },
    });
  });

  it("should reject session listing without authentication", async () => {
    const response = await request(app).get("/api/v1/auth/sessions");

    expect(response.status).toBe(401);
  });

  it("should list active sessions for the authenticated user", async () => {
    const response = await request(app)
      .get("/api/v1/auth/sessions")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);

    expect(
      response.body.data.every(
        (session: { familyId: string }) => typeof session.familyId === "string",
      ),
    ).toBe(true);

    const session = response.body.data.find(
      (item: { familyId: string }) => item.familyId === sessionId,
    );

    expect(session).toMatchObject({
      userAgent: "Mozilla/5.0 Chrome/120.0.0.0 Windows NT 10.0",
      deviceName: "Chrome on Windows",
    });

    expect(typeof session.ipAddress).toBe("string");
    expect(typeof session.lastUsedAt).toBe("string");
  });

  it("should revoke a specific active session", async () => {
    const response = await request(app)
      .delete(`/api/v1/auth/sessions/${sessionId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const tokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        familyId: sessionId,
      },
    });

    expect(tokens.length).toBeGreaterThan(0);
    expect(tokens.every((token) => token.revokedAt !== null)).toBe(true);
  });

  it("should not revoke another user's session", async () => {
    const response = await request(app)
      .delete(`/api/v1/auth/sessions/${otherSessionId}`)
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(404);

    const otherTokens = await prisma.refreshToken.findMany({
      where: {
        userId: otherUserId,
        familyId: otherSessionId,
      },
    });

    expect(otherTokens.every((token) => token.revokedAt === null)).toBe(true);
  });

  it("should reject an invalid session ID", async () => {
    const response = await request(app)
      .delete("/api/v1/auth/sessions/invalid-id")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.status).toBe(400);
  });

  it("should reject revoking a session without authentication", async () => {
    const response = await request(app).delete(
      `/api/v1/auth/sessions/${otherSessionId}`,
    );

    expect(response.status).toBe(401);
  });
});
