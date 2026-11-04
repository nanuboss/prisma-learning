import { describe, expect, it } from "vitest";
import { Prisma } from "../../src/generated/prisma/client.js";

import { handlePrismaError } from "../../src/utils/prisma-error.js";

describe("Prisma Error Handler", () => {
  it("should handle duplicate record error (P2002)", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Unique constraint failed",
      {
        code: "P2002",
        clientVersion: "7.0.0",
      },
    );

    const result = handlePrismaError(error);

    expect(result.statusCode).toBe(409);
    expect(result.message).toBe("A record with this value already exists");
  });

  it("should handle record not found error (P2025)", () => {
    const error = new Prisma.PrismaClientKnownRequestError("Record not found", {
      code: "P2025",
      clientVersion: "7.0.0",
    });

    const result = handlePrismaError(error);

    expect(result.statusCode).toBe(404);
    expect(result.message).toBe("Record not found");
  });

  it("should handle foreign key constraint error (P2003)", () => {
    const error = new Prisma.PrismaClientKnownRequestError(
      "Foreign key constraint failed",
      {
        code: "P2003",
        clientVersion: "7.0.0",
      },
    );

    const result = handlePrismaError(error);

    expect(result.statusCode).toBe(400);
    expect(result.message).toBe("Related record constraint failed");
  });

  it("should return 500 for an unknown error", () => {
    const error = new Error("Something unexpected happened");

    const result = handlePrismaError(error);

    expect(result.statusCode).toBe(500);
    expect(result.message).toBe("Internal Server Error");
  });
});
