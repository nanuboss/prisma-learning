import { describe, expect, it } from "vitest";

import { getDeviceName } from "../../src/utils/device-info.js";

describe("getDeviceName", () => {
  it("should detect Chrome on Windows", () => {
    expect(
      getDeviceName("Mozilla/5.0 Chrome/120.0.0.0 Windows NT 10.0"),
    ).toBe("Chrome on Windows");
  });

  it("should detect Firefox on Linux", () => {
    expect(
      getDeviceName("Mozilla/5.0 Firefox/120.0 Linux"),
    ).toBe("Firefox on Linux");
  });

  it("should detect Safari on macOS", () => {
    expect(
      getDeviceName("Mozilla/5.0 Mac OS X Safari/605.1.15"),
    ).toBe("Safari on macOS");
  });

  it("should detect Edge on Windows", () => {
    expect(
      getDeviceName("Mozilla/5.0 Chrome/120.0 Edg/120.0 Windows NT 10.0"),
    ).toBe("Edge on Windows");
  });

  it("should detect Opera on Android", () => {
    expect(
      getDeviceName("Mozilla/5.0 Android 13 Chrome/120.0 OPR/90.0"),
    ).toBe("Opera on Android");
  });

  it("should return null for missing user agent", () => {
    expect(getDeviceName()).toBeNull();
  });

  it("should handle unknown user agents", () => {
    expect(getDeviceName("CustomClient/1.0")).toBe(
      "Unknown Browser on Unknown OS",
    );
  });
});