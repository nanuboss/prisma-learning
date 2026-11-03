/**
 * @swagger
 * tags:
 *   name: Health
 *   description: API health monitoring
 */

/**
 * @swagger
 * /api/v1/health/live:
 *   get:
 *     summary: Check application liveness
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */

/**
 * @swagger
 * /api/v1/health/ready:
 *   get:
 *     summary: Check application and database readiness
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application and database are ready
 *       500:
 *         description: Database connection failed
 */
import { Router } from "express";
import { liveCheck,
  readyCheck, } from "../controllers/health.controller.js";

const router = Router();

router.get("/live", liveCheck);
router.get("/ready", readyCheck);

export default router;
