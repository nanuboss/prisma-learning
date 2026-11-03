import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import userRoutes from "./routes/user.routes.js";
import { requestLogger } from "./middlewares/request-logger.middleware.js";
import { env } from "./config/env.js";
import { apiLimiter } from "./middlewares/rate-limit.middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();
app.use(helmet());

if (env.nodeEnv !== "production") {
  app.use((_req, res, next) => {
    res.removeHeader("Strict-Transport-Security");
    next();
  });
}
// Global middlewares
const allowedOrigins = [env.clientUrl];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
if (env.nodeEnv === "development") {
  app.use(requestLogger);
}
app.use(express.json({
  limit: "10kb",
}));

app.use("/api/v1", apiLimiter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/v1/health", healthRoutes);
app.use("/api/v1/users", userRoutes);

// 404 handler
app.use(notFound);

// Error handler (always last)
app.use(errorHandler);

export default app;
