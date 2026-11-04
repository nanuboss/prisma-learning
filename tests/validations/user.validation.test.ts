
import { describe, expect, it } from "vitest";

import {
  createUserSchema,
  updateUserSchema,
} from "../../src/validations/user.validation.js";

describe("createUserSchema", () => {
  it("should accept valid user data", () => {
    const result = createUserSchema.safeParse({
      name: "Dinesh Saini",
      email: "dinesh@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid email", () => {
    const result = createUserSchema.safeParse({
      name: "Dinesh Saini",
      email: "invalid-email",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a name shorter than 2 characters", () => {
    const result = createUserSchema.safeParse({
      name: "A",
      email: "dinesh@example.com",
    });

    expect(result.success).toBe(false);
  });

  it("should trim whitespace from name and email", () => {
    const result = createUserSchema.safeParse({
      name: "  Dinesh Saini  ",
      email: "  dinesh@example.com  ",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Dinesh Saini");
      expect(result.data.email).toBe("dinesh@example.com");
    }
  });
});

describe("updateUserSchema", () => {
  it("should accept a valid name-only update", () => {
    const result = updateUserSchema.safeParse({
      name: "Updated Name",
    });

    expect(result.success).toBe(true);
  });

  it("should accept a valid email-only update", () => {
    const result = updateUserSchema.safeParse({
      email: "updated@example.com",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an empty update object", () => {
    const result = updateUserSchema.safeParse({});

    expect(result.success).toBe(false);
  });

  it("should reject invalid email in an update", () => {
    const result = updateUserSchema.safeParse({
      email: "invalid-email",
    });

    expect(result.success).toBe(false);
  });
});
