import { describe, expect, it } from "vitest";

import {
  hashPassword,
  comparePassword,
} from "../../src/utils/password.js";

describe("Password Utility", () => {
  it("should hash a password", async () => {
    const password = "Test@12345";

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$/);
  });

  it("should return true for a matching password", async () => {
    const password = "Test@12345";

    const hash = await hashPassword(password);

    const result = await comparePassword(password, hash);

    expect(result).toBe(true);
  });

  it("should return false for an incorrect password", async () => {
    const hash = await hashPassword("Test@12345");

    const result = await comparePassword("WrongPassword", hash);

    expect(result).toBe(false);
  });
});
