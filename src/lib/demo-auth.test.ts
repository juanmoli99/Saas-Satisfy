import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createDemoSession, verifyDemoAccessCode, verifyDemoSession } from "./demo-auth";

describe("autenticación aislada de demo", () => {
  beforeEach(() => {
    process.env.DEMO_ACCESS_CODE = "codigo-demo-seguro";
    process.env.DEMO_SESSION_SECRET = "secreto-demo-con-mas-de-treinta-y-dos-caracteres";
  });
  afterEach(() => {
    delete process.env.DEMO_ACCESS_CODE;
    delete process.env.DEMO_SESSION_SECRET;
  });

  it("acepta únicamente el código configurado", () => {
    expect(verifyDemoAccessCode("codigo-demo-seguro")).toBe(true);
    expect(verifyDemoAccessCode("otro-codigo")).toBe(false);
  });

  it("firma, valida y vence una sesión", () => {
    const now = Date.UTC(2026, 10, 23);
    const token = createDemoSession(now);
    expect(verifyDemoSession(token, now + 1000)).toBe(true);
    expect(verifyDemoSession(`${token}alterado`, now + 1000)).toBe(false);
    expect(verifyDemoSession(token, now + 13 * 60 * 60 * 1000)).toBe(false);
  });
});
