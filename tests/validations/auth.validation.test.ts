import { describe, expect, it } from "vitest";

import {
  registerSchema,
  loginSchema,
  refreshTokenSchema
} from "../../src/validations/auth.validation.js";

describe("registerSchema", () => {
  it("should accept valid registration data", () => {
    const result = registerSchema.safeParse({
      name: "Dinesh Saini",
      email: "dinesh@example.com",
      password: "Password@123",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid email", () => {
    const result = registerSchema.safeParse({
      name: "Dinesh Saini",
      email: "invalid-email",
      password: "Password@123",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      name: "Dinesh Saini",
      email: "dinesh@example.com",
      password: "short",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "dinesh@example.com",
      password: "Password@123",
    });

    expect(result.success).toBe(false);
  });

  it("should trim whitespace from name and email", () => {
    const result = registerSchema.safeParse({
      name: "  Dinesh Saini  ",
      email: "  dinesh@example.com  ",
      password: "Password@123",
    });

    expect(result.success).toBe(true);

    if (result.success) {
      expect(result.data.name).toBe("Dinesh Saini");
      expect(result.data.email).toBe("dinesh@example.com");
    }
  });
});

describe("loginSchema", () => {
  it("should accept valid login data", () => {
    const result = loginSchema.safeParse({
      email: "dinesh@example.com",
      password: "Password@123",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "Password@123",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an empty password", () => {
    const result = loginSchema.safeParse({
      email: "dinesh@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });


});

describe("refreshTokenSchema", () => {
  it("should accept a valid refresh token", () => {
    const result = refreshTokenSchema.safeParse({
      refreshToken: "valid-refresh-token",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an empty refresh token", () => {
    const result = refreshTokenSchema.safeParse({
      refreshToken: "",
    });

    expect(result.success).toBe(false);
  });

  it("should reject a missing refresh token", () => {
    const result = refreshTokenSchema.safeParse({});

    expect(result.success).toBe(false);
  });
});