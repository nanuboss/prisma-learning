import { describe, expect, it, vi } from "vitest";
import type { Request, Response } from "express";

import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../../src/controllers/user.controller.js";

import { ApiError } from "../../src/utils/api-error.js";

const prismaMocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
  transaction: vi.fn(),
  update: vi.fn(),
}));

vi.mock("../../src/config/prisma.js", () => ({
  prisma: {
    user: {
      findMany: prismaMocks.findMany,
      count: prismaMocks.count,
      update: prismaMocks.update,
    },
    $transaction: prismaMocks.transaction,
  },
}));

describe("User Controller - Invalid ID Handling", () => {
  it("should throw 400 when getUserById receives a non-string ID", async () => {
    const req = {
      params: {
        id: ["invalid-id"],
      },
    } as unknown as Request;

    const res = {} as Response;

    await expect(getUserById(req, res)).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid user ID",
    });

    await expect(getUserById(req, res)).rejects.toBeInstanceOf(ApiError);
  });

  it("should throw 400 when updateUser receives a non-string ID", async () => {
    const req = {
      params: {
        id: ["invalid-id"],
      },
      body: {},
    } as unknown as Request;

    const res = {} as Response;

    await expect(updateUser(req, res)).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid user ID",
    });
  });

  it("should throw 400 when deleteUser receives a non-string ID", async () => {
    const req = {
      params: {
        id: ["invalid-id"],
      },
    } as unknown as Request;

    const res = {} as Response;

    await expect(deleteUser(req, res)).rejects.toMatchObject({
      statusCode: 400,
      message: "Invalid user ID",
    });
  });

  describe("User Controller - getUsers", () => {
    it("should apply search and email filters", async () => {
      const users = [
        {
          id: "user-1",
          name: "John",
          email: "john@example.com",
        },
      ];

      prismaMocks.findMany.mockReturnValue({});
      prismaMocks.count.mockReturnValue({});

      prismaMocks.transaction.mockResolvedValue([users, 1]);

      const req = {} as Request;

      const res = {
        locals: {
          validatedData: {
            page: 1,
            limit: 10,
            search: "John",
            email: "john@example.com",
          },
        },
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockReturnThis(),
      } as unknown as Response;

      await getUsers(req, res);

      expect(prismaMocks.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                contains: "John",
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: "John",
                mode: "insensitive",
              },
            },
          ],
          email: "john@example.com",
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(prismaMocks.count).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              name: {
                contains: "John",
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: "John",
                mode: "insensitive",
              },
            },
          ],
          email: "john@example.com",
        },
      });

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});

describe("User Controller - updateUser", () => {
  it("should update email when email is provided", async () => {
    const updatedUser = {
      id: "user-1",
      name: "John",
      email: "new@example.com",
    };

    prismaMocks.update.mockResolvedValue(updatedUser);  

    const req = { 
      params: { id: "user-1" },
      body: { email: "new@example.com" },
    } as Request;

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;

    await updateUser(req, res);

    expect(prismaMocks.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: { email: "new@example.com" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    expect(res.status).toHaveBeenCalledWith(200);
  });
});
