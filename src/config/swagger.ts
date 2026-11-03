import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Prisma Learning API",
      version: "1.0.0",
      description: "REST API documentation for Prisma Learning Project",
    },

    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
  },

  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);