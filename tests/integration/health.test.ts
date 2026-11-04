
import { describe, expect, it } from "vitest";
import request from "supertest";

import app from "../../src/app.js";

describe("Health API", () => {
  it("GET /api/v1/health/live should return 200", async () => {
    const response = await request(app)
      .get("/api/v1/health/live");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application is alive");
    expect(response.body.data.status).toBe("ALIVE");
    expect(response.body.data.timestamp).toBeDefined();
  });
    it("GET /api/v1/health/ready should return 200 when database is connected", async () => {
    const response = await request(app).get("/api/v1/health/ready");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Application is ready");
    expect(response.body.data.status).toBe("READY");
    expect(response.body.data.database).toBe("CONNECTED");
    expect(response.body.data.timestamp).toBeDefined();
  });
});
