import { z } from "zod";

export const uuidSchema = z.object({
  id: z.string().uuid("Invalid user ID format"),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().optional(),

  email: z.string().trim().email("Invalid email address").optional(),
});
