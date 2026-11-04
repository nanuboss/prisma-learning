import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import {
  register,
  login,
  refresh,
  logout,
} from "../../src/controllers/auth.controller.js";

import { ApiError } from "../../src/utils/api-error.js";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generateAccessToken: vi.fn(),
  refreshTokenFindUnique: vi.fn(),
  refreshTokenCreate: vi.fn(),
  refreshTokenUpdateMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("../../src/config/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
    refreshToken: {
      findUnique: mocks.refreshTokenFindUnique,
      create: mocks.refreshTokenCreate,
      updateMany: mocks.refreshTokenUpdateMany,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock("../../src/utils/password.js", () => ({
  hashPassword: mocks.hashPassword,
  comparePassword: mocks.comparePassword,
}));

vi.mock("../../src/utils/jwt.js", () => ({
  generateAccessToken: mocks.generateAccessToken,
}));

vi.mock("../../src/utils/refresh-token.js", () => ({
  generateRefreshToken: vi.fn().mockReturnValue("mock-new-refresh-token"),
  hashRefreshToken: vi.fn((token: string) => `hashed-${token}`),
  REFRESH_TOKEN_EXPIRY_DAYS: 7,
}));

const createResponse = () => {
  return {
    locals: {},
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
};

describe("Auth Controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user successfully", async () => {
      const req = {
        body: {},
      } as Request;

      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          name: "John Doe",
          email: "john@example.com",
          password: "Password@123",
        },
      });

      mocks.findUnique.mockResolvedValue(null);
      mocks.hashPassword.mockResolvedValue("hashed-password");

      mocks.create.mockResolvedValue({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await register(req, res);

      expect(mocks.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });

      expect(mocks.hashPassword).toHaveBeenCalledWith("Password@123");

      expect(mocks.create).toHaveBeenCalledWith({
        data: {
          name: "John Doe",
          email: "john@example.com",
          passwordHash: "hashed-password",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "User registered successfully",
        }),
      );
    });

    it("should throw 409 when email is already registered", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          name: "John Doe",
          email: "john@example.com",
          password: "Password@123",
        },
      });

      mocks.findUnique.mockResolvedValue({
        id: "existing-user",
      });

      await expect(register(req, res)).rejects.toBeInstanceOf(ApiError);

      await expect(register(req, res)).rejects.toMatchObject({
        statusCode: 409,
        message: "Email is already registered",
      });

      expect(mocks.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          email: "john@example.com",
          password: "Password@123",
        },
      });

      mocks.findUnique.mockResolvedValue({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mocks.comparePassword.mockResolvedValue(true);
      mocks.generateAccessToken.mockReturnValue("mock-access-token");

      await login(req, res);

      expect(mocks.comparePassword).toHaveBeenCalledWith(
        "Password@123",
        "hashed-password",
      );

      expect(mocks.generateAccessToken).toHaveBeenCalledWith("user-123");
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Login successful",
          data: expect.objectContaining({
            accessToken: "mock-access-token",
          }),
        }),
      );
    });

    it("should reject login when user does not exist", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          email: "unknown@example.com",
          password: "Password@123",
        },
      });

      mocks.findUnique.mockResolvedValue(null);

      await expect(login(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });
    });

    it("should reject login when password is incorrect", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          email: "john@example.com",
          password: "WrongPassword",
        },
      });

      mocks.findUnique.mockResolvedValue({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        passwordHash: "hashed-password",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mocks.comparePassword.mockResolvedValue(false);

      await expect(login(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid email or password",
      });

      expect(mocks.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("refresh", () => {
    it("should refresh tokens successfully", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          refreshToken: "old-refresh-token",
        },
      });

      mocks.refreshTokenFindUnique.mockResolvedValue({
        id: "token-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
      });

      mocks.refreshTokenUpdateMany.mockResolvedValue({
        count: 1,
      });

      mocks.refreshTokenCreate.mockResolvedValue({});
      mocks.generateAccessToken.mockReturnValue("new-access-token");

      mocks.transaction.mockImplementation(async (callback) => {
        return callback({
          refreshToken: {
            updateMany: mocks.refreshTokenUpdateMany,
            create: mocks.refreshTokenCreate,
          },
        });
      });

      await refresh(req, res);

      expect(mocks.refreshTokenFindUnique).toHaveBeenCalledWith({
        where: {
          tokenHash: "hashed-old-refresh-token",
        },
      });

      expect(mocks.refreshTokenUpdateMany).toHaveBeenCalled();
      expect(mocks.refreshTokenCreate).toHaveBeenCalled();

      expect(mocks.generateAccessToken).toHaveBeenCalledWith("user-123");

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Token refreshed successfully",
          data: expect.objectContaining({
            accessToken: "new-access-token",
            refreshToken: "mock-new-refresh-token",
          }),
        }),
      );
    });

    it("should reject an invalid refresh token", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          refreshToken: "invalid-refresh-token",
        },
      });

      mocks.refreshTokenFindUnique.mockResolvedValue(null);

      await expect(refresh(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid or expired refresh token",
      });

      expect(mocks.transaction).not.toHaveBeenCalled();
    });

    it("should reject an expired refresh token", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          refreshToken: "expired-refresh-token",
        },
      });

      mocks.refreshTokenFindUnique.mockResolvedValue({
        id: "token-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() - 60_000),
        revokedAt: null,
      });

      await expect(refresh(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid or expired refresh token",
      });

      expect(mocks.transaction).not.toHaveBeenCalled();
    });

    it("should reject a revoked refresh token", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          refreshToken: "revoked-refresh-token",
        },
      });

      mocks.refreshTokenFindUnique.mockResolvedValue({
        id: "token-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: new Date(),
      });

      await expect(refresh(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid or expired refresh token",
      });

      expect(mocks.transaction).not.toHaveBeenCalled();
    });

    it("should reject refresh when token was already revoked", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          refreshToken: "old-refresh-token",
        },
      });

      mocks.refreshTokenFindUnique.mockResolvedValue({
        id: "token-123",
        userId: "user-123",
        expiresAt: new Date(Date.now() + 60_000),
        revokedAt: null,
      });

      mocks.refreshTokenUpdateMany.mockResolvedValue({
        count: 0,
      });

      mocks.transaction.mockImplementation(async (callback) => {
        return callback({
          refreshToken: {
            updateMany: mocks.refreshTokenUpdateMany,
            create: mocks.refreshTokenCreate,
          },
        });
      });

      await expect(refresh(req, res)).rejects.toMatchObject({
        statusCode: 401,
        message: "Invalid or expired refresh token",
      });

      expect(mocks.refreshTokenCreate).not.toHaveBeenCalled();
    });
  });

  describe("logout", () => {
    it("should logout successfully", async () => {
      const req = {} as Request;
      const res = createResponse();

      Object.assign(res.locals, {
        validatedData: {
          refreshToken: "valid-refresh-token",
        },
      });

      mocks.refreshTokenUpdateMany.mockResolvedValue({
        count: 1,
      });

      await logout(req, res);

      expect(mocks.refreshTokenUpdateMany).toHaveBeenCalledWith({
        where: {
          tokenHash: "hashed-valid-refresh-token",
          revokedAt: null,
        },
        data: {
          revokedAt: expect.any(Date),
        },
      });

      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Logout successful",
        }),
      );
    });

    it("should reject logout with invalid or revoked token", async () => {
  const req = {} as Request;
  const res = createResponse();

  Object.assign(res.locals, {
    validatedData: {
      refreshToken: "invalid-refresh-token",
    },
  });

  mocks.refreshTokenUpdateMany.mockResolvedValue({
    count: 0,
  });

  await expect(logout(req, res)).rejects.toMatchObject({
    statusCode: 401,
    message: "Invalid or already revoked refresh token",
  });
});
  });
});
