import { Router } from "express";

import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getSessions,
  revokeSession,
} from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  sessionParamsSchema,
} from "../validations/auth.validation.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", validate(refreshTokenSchema), refresh);

router.post("/logout", validate(refreshTokenSchema), logout);
router.post("/logout-all", authenticate, logoutAll);

router.get("/sessions", authenticate, getSessions);

router.delete(
  "/sessions/:id",
  authenticate,
  validate(sessionParamsSchema, "params"),
  revokeSession,
);

export default router;
