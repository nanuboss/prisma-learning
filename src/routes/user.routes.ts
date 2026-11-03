import { Router } from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";

import { validate } from "../middlewares/validate.middleware.js";

import {
  createUserSchema,
  updateUserSchema,
} from "../validations/user.validation.js";

import {
  uuidSchema,
  paginationQuerySchema,
} from "../validations/common.validation.js";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     CreateUser:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Dinesh Saini
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 100
 *           example: dinesh@example.com
 *       example:
 *         name: Dinesh Saini
 *         email: dinesh@example.com
 *
 *     UpdateUser:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           example: Dinesh Saini Updated
 *         email:
 *           type: string
 *           format: email
 *           maxLength: 100
 *           example: dinesh.updated@example.com
 *       example:
 *         name: Dinesh Saini Updated
 *         email: dinesh.updated@example.com
 *
 *     SuccessResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation successful
 *
 *     ErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - errors
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: Validation failed
 *         errors:
 *           oneOf:
 *             - type: object
 *               additionalProperties: true
 *             - type: array
 *               items:
 *                 type: object
 *                 additionalProperties: true
 *             - type: string
 *             - type: "null"
 *           description: Error details
 *           example: null
 *
 *
 */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User created successfully
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation failed
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email already exists
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         description: Number of users per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *           example: 10
 *       - in: query
 *         name: search
 *         description: Search users by name or email
 *         schema:
 *           type: string
 *           example: Dinesh
 *       - in: query
 *         name: email
 *         description: Filter users by exact email address
 *         schema:
 *           type: string
 *           format: email
 *           example: dinesh@example.com
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Users fetched successfully
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     meta:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 25
 *                         totalPages:
 *                           type: integer
 *                           example: 3
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation failed
 *                     errors:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: array
 *                           items:
 *                             type: object
 *               example:
 *                 success: false
 *                 message: Validation failed
 *                 errors:
 *                   details: []
 *
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User fetched successfully
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     errors:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: array
 *                           items:
 *                             type: object
 *               example:
 *                 success: false
 *                 message: Validation failed
 *                 errors:
 *                   details: []
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User not found
 *               example:
 *                 success: false
 *                 message: User not found
 *                 errors: null
 * 
 *   patch:
 *     summary: Update user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User updated successfully
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid user ID or validation failed
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation failed
 *                     errors:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: array
 *                           items:
 *                             type: object
 *               example:
 *                 success: false
 *                 message: Validation failed
 *                 errors:
 *                   details: []
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User not found
 *               example:
 *                 success: false
 *                 message: User not found
 *                 errors: null
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Email already exists
 *               example:
 *                 success: false
 *                 message: Email already exists
 *                 errors: null
 *
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User deleted successfully
 *       400:
 *         description: Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: Validation failed
 *                     errors:
 *                       type: object
 *                       properties:
 *                         details:
 *                           type: array
 *                           items:
 *                             type: object
 *               example:
 *                 success: false
 *                 message: Validation failed
 *                 errors:
 *                   details: []
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ErrorResponse'
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: User not found
 *               example:
 *                 success: false
 *                 message: User not found
 *                 errors: null
 */

const router = Router();

router.post("/", validate(createUserSchema), createUser);

router.get("/", validate(paginationQuerySchema, "query"), getUsers);

router.get("/:id", validate(uuidSchema, "params"), getUserById);

router.patch(
  "/:id",
  validate(uuidSchema, "params"),
  validate(updateUserSchema),
  updateUser,
);

router.delete("/:id", validate(uuidSchema, "params"), deleteUser);

export default router;
