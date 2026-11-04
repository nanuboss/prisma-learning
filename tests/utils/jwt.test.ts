import { describe, expect, it } from "vitest";

import {
  generateAccessToken,
  verifyAccessToken,
} from "../../src/utils/jwt.js";

describe("JWT Utility", () => {
  it("should generate an access token", () => {
    const token = generateAccessToken("user-123");

    expect(token).toEqual(expect.any(String));
    expect(token.split(".")).toHaveLength(3);
  });

  it("should verify a valid access token", () => {
    const token = generateAccessToken("user-123");

    const payload = verifyAccessToken(token);

    expect(payload).toEqual({ userId: "user-123" });
  });

  it("should reject an invalid token", () => {
    expect(() => verifyAccessToken("invalid.token.value")).toThrow();
  });
});
