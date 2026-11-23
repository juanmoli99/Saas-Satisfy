import { createHmac, timingSafeEqual } from "node:crypto";

export const DEMO_COOKIE = "saas_demo_session";
export const DEMO_SESSION_SECONDS = 60 * 60 * 12;

function requiredEnv(name: "DEMO_ACCESS_CODE" | "DEMO_SESSION_SECRET") {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} no está configurada`);
  if (name === "DEMO_SESSION_SECRET" && value.length < 32) throw new Error("DEMO_SESSION_SECRET debe tener al menos 32 caracteres");
  if (name === "DEMO_ACCESS_CODE" && value.length < 10) throw new Error("DEMO_ACCESS_CODE debe tener al menos 10 caracteres");
  return value;
}

function signature(payload: string, secret = requiredEnv("DEMO_SESSION_SECRET")) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyDemoAccessCode(value: unknown) {
  if (typeof value !== "string") return false;
  return safeEqual(value, requiredEnv("DEMO_ACCESS_CODE"));
}

export function createDemoSession(now = Date.now()) {
  const expiresAt = Math.floor(now / 1000) + DEMO_SESSION_SECONDS;
  const payload = `demo.${expiresAt}`;
  return `${payload}.${signature(payload)}`;
}

export function verifyDemoSession(token: string | undefined, now = Date.now()) {
  if (!token) return false;
  const [scope, expires, providedSignature, extra] = token.split(".");
  if (scope !== "demo" || !expires || !providedSignature || extra) return false;
  const expiresAt = Number(expires);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1000)) return false;
  return safeEqual(providedSignature, signature(`${scope}.${expires}`));
}
