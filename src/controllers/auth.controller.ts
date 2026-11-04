import type { Request, Response } from "express";

import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";
import { hashPassword,comparePassword } from "../utils/password.js";
import { generateAccessToken } from "../utils/jwt.js";

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

  const { passwordHash: _passwordHash, ...safeUser } = user;

  return sendSuccess(res, 200, {
    message: "Login successful",
    data: {
      user: safeUser,
      accessToken,
    },
  });
};