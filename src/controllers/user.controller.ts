import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { ApiError } from "../utils/api-error.js";
import { sendSuccess } from "../utils/api-response.js";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const createUser = async (req: Request, res: Response) => {
  const { name, email } = req.body as {
    name: string;
    email: string;
  };

  const user = await prisma.user.create({
    data: {
      name,
      email,
    },
    select: publicUserSelect,
  });

  return sendSuccess(res, 201, {
    message: "User created successfully",
    data: user,
  });
};

export const getUsers = async (req: Request, res: Response) => {
  const { page, limit, search, email } = res.locals.validatedData as {
    page: number;
    limit: number;
    search?: string;
    email?: string;
  };

  const where = {
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(email && { email }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: publicUserSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return sendSuccess(res, 200, {
    message: "Users fetched successfully",
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

export const getUserById = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (typeof userId !== "string") {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return sendSuccess(res, 200, {
    message: "User fetched successfully",
    data: user,
  });
};

export const updateUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (typeof userId !== "string") {
    throw new ApiError(400, "Invalid user ID");
  }

  const { name, email } = req.body as {
    name?: string;
    email?: string;
  };

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
    },
    select: publicUserSelect,
  });

  return sendSuccess(res, 200, {
    message: "User updated successfully",
    data: updatedUser,
  });
};

export const deleteUser = async (req: Request, res: Response) => {
  const userId = req.params.id;

  if (typeof userId !== "string") {
    throw new ApiError(400, "Invalid user ID");
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return sendSuccess(res, 200, {
    message: "User deleted successfully",
  });
};