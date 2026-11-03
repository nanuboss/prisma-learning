import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { sendSuccess } from "../utils/api-response.js";

// Liveness Check
export const liveCheck = (
  _req: Request,
  res: Response
) => {
  return sendSuccess(res, 200, {
    message: "Application is alive",
    data: {
      status: "ALIVE",
      timestamp: new Date().toISOString(),
    },
  });
};

// Readiness Check
export const readyCheck = async (
  _req: Request,
  res: Response
) => {
  await prisma.$queryRaw`SELECT 1`;

  return sendSuccess(res, 200, {
    message: "Application is ready",
    data: {
      status: "READY",
      database: "CONNECTED",
      timestamp: new Date().toISOString(),
    },
  });
};
