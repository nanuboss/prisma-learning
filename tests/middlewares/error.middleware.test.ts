import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { errorHandler } from "../../src/middlewares/error.middleware.js";
import { ApiError } from "../../src/utils/api-error.js";
import { Prisma } from "../../src/generated/prisma/client.js";
import { env } from "../../src/config/env.js";

describe("Error Middleware", () => {
  it("should handle custom ApiError", () => {
    const err = new ApiError(422, "Validation failed", [
      { field: "email", message: "Invalid email" },
    ]);

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: [{ field: "email", message: "Invalid email" }],
    });
  });

  it("should handle Prisma duplicate error (P2002)", () => {
    const err = {
      code: "P2002",
      message: "Unique constraint failed",
      clientVersion: "7.0.0",
    };

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
  });

  it("should handle actual Prisma P2002 error", () => {
    const err = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.0.0",
      },
    );

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("should handle actual Prisma P2025 error", () => {
    const err = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "7.0.0",
    });

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("should handle actual Prisma P2003 error", () => {
    const err = new Prisma.PrismaClientKnownRequestError(
      "Foreign key constraint failed",
      {
        code: "P2003",
        clientVersion: "7.0.0",
      },
    );

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("should handle unknown errors with 500 status", () => {
    const err = new Error("Something unexpected happened");

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Internal Server Error",
      errors: null,
    });
  });

  it("should log errors in development mode", () => {
    const originalNodeEnv = env.nodeEnv;

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    env.nodeEnv = "development";

    const err = new Error("Development test error");

    const req = {} as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    errorHandler(err, req, res, next);

    expect(consoleSpy).toHaveBeenCalledWith(err);

    env.nodeEnv = originalNodeEnv;
    consoleSpy.mockRestore();
  });
});
