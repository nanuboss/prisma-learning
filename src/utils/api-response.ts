import type { Response } from "express";

interface ApiResponseOptions<T> {
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendSuccess = <T>(
  res: Response,
  statusCode: number,
  options: ApiResponseOptions<T>
) => {
  return res.status(statusCode).json({
    success: true,
    message: options.message,
    ...(options.data !== undefined && {
      data: options.data,
    }),
    ...(options.meta !== undefined && {
      meta: options.meta,
    }),
  });
};
