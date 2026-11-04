import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";
import { hashPassword,comparePassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/jwt.js";
import {
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from "../utils/refresh-token.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = res.locals.validatedData as {
    name: string;
    email: string;
    password: string;
  };

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
    },
    select: publicUserSelect,
  });

  return sendSuccess(res, 201, {
    message: "User registered successfully",
    data: user,
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = res.locals.validatedData as {
    email: string;
    password: string;
  };

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...publicUserSelect,
      passwordHash: true,
    },
  });

  if (!user || !user.passwordHash) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.passwordHash,
  );

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user.id);

  const refreshToken = generateRefreshToken();

const expiresAt = new Date(
  Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
);

await prisma.refreshToken.create({
  data: {
    tokenHash: hashRefreshToken(refreshToken),
    userId: user.id,
    expiresAt,
  },
});

  const { passwordHash: _passwordHash, ...safeUser } = user;

  return sendSuccess(res, 200, {
    message: "Login successful",
    data: {
      user: safeUser,
      accessToken,
      refreshToken,
    },
  });
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = res.locals.validatedData as {
    refreshToken: string;
  };

  const tokenHash = hashRefreshToken(refreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { tokenHash },
  });

  if (
    !storedToken ||
    storedToken.revokedAt ||
    storedToken.expiresAt <= new Date()
  ) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const newRefreshToken = generateRefreshToken();

  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
  );

  await prisma.$transaction(async (tx) => {
    const revoked = await tx.refreshToken.updateMany({
      where: {
        id: storedToken.id,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    if (revoked.count !== 1) {
      throw new ApiError(401, "Invalid or expired refresh token");
    }

    await tx.refreshToken.create({
      data: {
        tokenHash: hashRefreshToken(newRefreshToken),
        userId: storedToken.userId,
        expiresAt,
      },
    });
  });

  const accessToken = generateAccessToken(storedToken.userId);

  return sendSuccess(res, 200, {
    message: "Token refreshed successfully",
    data: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = res.locals.validatedData as {
    refreshToken: string;
  };

  const tokenHash = hashRefreshToken(refreshToken);

  const result = await prisma.refreshToken.updateMany({
    where: {
      tokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  if (result.count !== 1) {
    throw new ApiError(401, "Invalid or already revoked refresh token");
  }

  return sendSuccess(res, 200, {
    message: "Logout successful",
  });
};
