import type { ErrorRequestHandler } from "express";

import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";
import { handlePrismaError } from "../utils/prisma-error.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (env.nodeEnv !== "production") {
  console.error(err);
}

  // Request body too large
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.too.large"
  ) {
    res.status(413).json({
      success: false,
      message: "Request body is too large",
      errors: null,
    });
    return;
  }

  // Invalid JSON
  if (
    typeof err === "object" &&
    err !== null &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid JSON in request body",
      errors: null,
    });
    return;
  }

  // Custom API errors
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  // Prisma errors
  const prismaError = handlePrismaError(err);

  if (prismaError.statusCode === 500) {
    res.status(500).json({
      success: false,
      message:
        env.nodeEnv === "production"
          ? "Something went wrong"
          : prismaError.message,
      errors: null,
    });
    return;
  }

  res.status(prismaError.statusCode).json({
    success: false,
    message: prismaError.message,
    errors: null,
  });
};
