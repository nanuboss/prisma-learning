import rateLimit from "express-rate-limit";
import { env } from "../config/env.js";

export const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  limit: env.nodeEnv === "test" ? 100 : 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});