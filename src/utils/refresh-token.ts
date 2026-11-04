import { randomBytes, createHash } from "node:crypto";

export const generateRefreshToken = (): string => {
  return randomBytes(64).toString("hex");
};

export const hashRefreshToken = (token: string): string => {
  return createHash("sha256").update(token).digest("hex");
};

export const REFRESH_TOKEN_EXPIRY_DAYS = 7;
