
import { describe, expect, it } from "vitest";

import {
  paginationQuerySchema,
  uuidSchema,
} from "../../src/validations/common.validation.js";

describe("uuidSchema", () => {
  it("should accept a valid UUID", () => {
    const result = uuidSchema.safeParse({
      id: "550e8400-e29b-41d4-a716-446655440000",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid UUID", () => {
    const result = uuidSchema.safeParse({
      id: "invalid-id",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing ID", () => {
    const result = uuidSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});

describe("paginationQuerySchema", () => {
  it("should apply default page and limit values", () => {
    const result = paginationQuerySchema.safeParse({});

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("should convert page and limit strings into numbers", () => {
    const result = paginationQuerySchema.safeParse({
      page: "2",
      limit: "20",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it("should reject page less than 1", () => {
    const result = paginationQuerySchema.safeParse({
      page: "0",
    });

    expect(result.success).toBe(false);
  });

  it("should reject limit greater than 100", () => {
    const result = paginationQuerySchema.safeParse({
      limit: "101",
    });

    expect(result.success).toBe(false);
  });

  it("should reject non-integer page values", () => {
    const result = paginationQuerySchema.safeParse({
      page: "1.5",
    });

    expect(result.success).toBe(false);
  });

  it("should accept valid search and email filters", () => {
    const result = paginationQuerySchema.safeParse({
      search: "  Dinesh  ",
      email: "  dinesh@example.com  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.search).toBe("Dinesh");
      expect(result.data.email).toBe("dinesh@example.com");
    }
  });

  it("should reject an invalid email filter", () => {
    const result = paginationQuerySchema.safeParse({
      email: "invalid-email",
    });

    expect(result.success).toBe(false);
  });
});
