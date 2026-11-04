import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

import { validate } from "../../src/middlewares/validate.middleware.js";

describe("Validate Middleware", () => {
  it("should return 400 when validation fails", () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const req = {
      body: {
        email: "invalid-email",
      },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    const middleware = validate(schema);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Validation failed",
      errors: {
        details: [
          {
            field: "email",
            message: expect.any(String),
          },
        ],
      },
    });

    expect(next).not.toHaveBeenCalled();
  });

  it("should call next when validation succeeds", () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const req = {
      body: {
        email: "test@example.com",
      },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    const middleware = validate(schema);

    middleware(req, res, next);

    expect(res.locals.validatedData).toEqual({
      email: "test@example.com",
    });

    expect(req.body).toEqual({
      email: "test@example.com",
    });

    expect(next).toHaveBeenCalledOnce();
  });

  it("should validate request params when source is params", () => {
    const schema = z.object({
      id: z.string().uuid(),
    });

    const req = {
      params: {
        id: "550e8400-e29b-41d4-a716-446655440000",
      },
      body: {},
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    const middleware = validate(schema, "params");

    middleware(req, res, next);

    expect(res.locals.validatedData).toEqual({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(req.body).toEqual({});

    expect(next).toHaveBeenCalledOnce();
  });

  it("should validate request query when source is query", () => {
    const schema = z.object({
      page: z.coerce.number().int().positive(),
    });

    const req = {
      query: {
        page: "2",
      },
      body: {},
    } as unknown as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    const middleware = validate(schema, "query");

    middleware(req, res, next);

    expect(res.locals.validatedData).toEqual({
      page: 2,
    });

    expect(req.body).toEqual({});

    expect(next).toHaveBeenCalledOnce();
  });
});
