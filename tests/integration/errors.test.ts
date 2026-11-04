import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";

describe("Error Middleware", () => {
  it("should return 400 for invalid JSON", async () => {
    const response = await request(app)
      .post("/api/v1/users")
      .set("Content-Type", "application/json")
      .send('{"name": "Test User", "email":');

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid JSON in request body");
    expect(response.body.errors).toBeNull();
  });

  it("should return 413 when request body is too large", async () => {
    const largePayload = {
      name: "A".repeat(15 * 1024),
      email: "large@example.com",
    };

    const response = await request(app)
      .post("/api/v1/users")
      .send(largePayload);

    expect(response.status).toBe(413);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Request body is too large");
    expect(response.body.errors).toBeNull();
  });

  it("should return 404 when user is not found", async () => {
    const response = await request(app).get(
      "/api/v1/users/00000000-0000-4000-8000-000000000000",
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("User not found");
    expect(response.body.errors).toBeNull();
  });

  it("should return 404 for an unknown route", async () => {
    const response = await request(app).get("/api/v1/unknown-route");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Route not found: /api/v1/unknown-route",
    );
  });
});
