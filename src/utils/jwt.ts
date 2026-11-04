import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface AccessTokenPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign(
    { userId } satisfies AccessTokenPayload,
    env.jwtSecret,
    { expiresIn: "15m" },
  );
};

export const verifyAccessToken = (
  token: string,
): AccessTokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (
    typeof decoded === "string" ||
    typeof decoded.userId !== "string"
  ) {
    throw new Error("Invalid access token payload");
  }

  return { userId: decoded.userId };
};
