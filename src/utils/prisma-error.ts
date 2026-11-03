import { Prisma } from "../generated/prisma/client.js";

export const handlePrismaError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002":
        return {
          statusCode: 409,
          message: "A record with this value already exists",
        };

      case "P2025":
        return {
          statusCode: 404,
          message: "Record not found",
        };

      case "P2003":
        return {
          statusCode: 400,
          message: "Related record constraint failed",
        };
    }
  }

  return {
    statusCode: 500,
    message: "Internal Server Error",
  };
};
