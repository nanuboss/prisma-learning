import { describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { requestLogger } from "../../src/middlewares/request-logger.middleware.js";

describe("Request Logger Middleware", () => {
  it("should call next()", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/v1/users",
    } as Request;

    const res = {
      on: vi.fn(),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;

    requestLogger(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.on).toHaveBeenCalledWith("finish", expect.any(Function));
  });

  it("should log request details when response finishes", () => {
    const req = {
      method: "GET",
      originalUrl: "/api/v1/users",
    } as Request;

    let finishCallback: (() => void) | undefined;

    const res = {
      statusCode: 200,
      on: vi.fn((event: string, callback: () => void) => {
        if (event === "finish") {
          finishCallback = callback;
        }
      }),
    } as unknown as Response;

    const next = vi.fn() as NextFunction;
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    requestLogger(req, res, next);

    expect(finishCallback).toBeDefined();

    finishCallback!();

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^GET \/api\/v1\/users 200 - \d+ms$/),
    );

    consoleSpy.mockRestore();
  });
});
