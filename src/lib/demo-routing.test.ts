import { describe, expect, it } from "vitest";
import { isDemoRequestAllowed } from "./demo-routing";

describe("perímetro de rutas de la demo", () => {
  it.each(["/", "/demo", "/demo/dashboard", "/demo/clientes", "/api/demo/login", "/api/demo/logout", "/_next/static/app.js"])("permite %s", path => {
    expect(isDemoRequestAllowed(path)).toBe(true);
  });

  it.each(["/dashboard", "/clientes", "/login", "/api/clients", "/api/webhooks/mercadopago", "/api/settings", "/api/v1/service-access"])("bloquea %s", path => {
    expect(isDemoRequestAllowed(path)).toBe(false);
  });
});
