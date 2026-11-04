import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { ApiError } from "../utils/api-error.js";

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Authentication required"));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);

    res.locals.userId = payload.userId;
    return next();
  } catch {
    return next(new ApiError(401, "Invalid or expired access token"));
  }
}
