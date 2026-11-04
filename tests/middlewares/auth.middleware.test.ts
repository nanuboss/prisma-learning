import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Request, Response, NextFunction } from "express";

import { authenticate } from "../../src/middlewares/auth.middleware.js";
import { verifyAccessToken } from "../../src/utils/jwt.js";
import { ApiError } from "../../src/utils/api-error.js";

vi.mock("../../src/utils/jwt.js", () => ({
  verifyAccessToken: vi.fn(),
}));

describe("Auth Middleware", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      headers: {},
    } as Request;

    res = {
      locals: {},
    } as Response;

    next = vi.fn() as unknown as NextFunction;
  });

  it("should reject requests without an authorization header", () => {
    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("should reject requests without a Bearer token", () => {
    req.headers.authorization = "Basic some-token";

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect(verifyAccessToken).not.toHaveBeenCalled();
  });

  it("should authenticate a valid token", () => {
    req.headers.authorization = "Bearer valid-token";

    vi.mocked(verifyAccessToken).mockReturnValue({
      userId: "user-123",
    } as ReturnType<typeof verifyAccessToken>);

    authenticate(req, res, next);

    expect(verifyAccessToken).toHaveBeenCalledWith("valid-token");
    expect(res.locals.userId).toBe("user-123");
    expect(next).toHaveBeenCalledWith();
  });

  it("should reject an invalid or expired token", () => {
    req.headers.authorization = "Bearer invalid-token";

    vi.mocked(verifyAccessToken).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    authenticate(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
  });
});
