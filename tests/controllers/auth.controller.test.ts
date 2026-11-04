import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import {
  register,
  login,
} from "../../src/controllers/auth.controller.js";

import { ApiError } from "../../src/utils/api-error.js";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  create: vi.fn(),
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
  generateAccessToken: vi.fn(),
}));

vi.mock("../../src/config/prisma.js", () => ({
  prisma: {
    user: {
      findUnique: mocks.findUnique,
      create: mocks.create,
    },
  },
}));

vi.mock("../../src/utils/password.js", () => ({
  hashPassword: mocks.hashPassword,
  comparePassword: mocks.comparePassword,
}));

vi.mock("../../src/utils/jwt.js", () => ({
  generateAccessToken: mocks.generateAccessToken,
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
});
