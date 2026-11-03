import { getSystemErrorMessage } from "node:util";

export class ApiError extends Error {
  statusCode: number;
  errors: unknown;

  constructor(statusCode: number, message: string, errors: unknown = null) {
    super(message);

    this.statusCode = statusCode;
    this.errors = errors;
    this.name = "ApiError";

    Error.captureStackTrace(this, this.constructor);
  }
}
