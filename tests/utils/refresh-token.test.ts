import { describe, expect, it } from "vitest";

import {
  generateRefreshToken,
  hashRefreshToken,
  REFRESH_TOKEN_EXPIRY_DAYS,
} from "../../src/utils/refresh-token.js";

describe("Refresh Token Utils", () => {
  it("should generate a secure random refresh token", () => {
    const token = generateRefreshToken();

    expect(token).toHaveLength(128);
    expect(token).toMatch(/^[a-f0-9]+$/);
  });

  it("should generate unique tokens", () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();

    expect(token1).not.toBe(token2);
  });

  it("should hash the same token consistently", () => {
    const token = generateRefreshToken();

    expect(hashRefreshToken(token)).toBe(hashRefreshToken(token));
  });

  it("should generate different hashes for different tokens", () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();

    expect(hashRefreshToken(token1)).not.toBe(hashRefreshToken(token2));
  });

  it("should set refresh token expiry to 7 days", () => {
    expect(REFRESH_TOKEN_EXPIRY_DAYS).toBe(7);
  });
});
