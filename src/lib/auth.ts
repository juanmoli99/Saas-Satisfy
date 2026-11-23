import { cookies, headers } from "next/headers";
import type { NextRequest } from "next/server";
import { db } from "./db";
import { hmac, randomToken, safeEqual } from "./crypto";
import { HttpError } from "./http";

export const SESSION_COOKIE = "gestion_session";
export const CSRF_COOKIE = "gestion_csrf";
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

export async function createSession(userId: string, userAgent?: string, ipAddress?: string) {
  const token = randomToken();
  const csrf = randomToken(24);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + IDLE_TIMEOUT_MS);
  await db.$transaction(async tx => {
    await tx.session.deleteMany({ where: { userId } });
    await tx.session.create({ data: {
      userId, tokenHash: hmac(token), csrfTokenHash: hmac(csrf), userAgent, ipAddress, expiresAt
    }});
  });
  return { token, csrf, expiresAt };
}

export async function revokeSession(token?: string) {
  if (!token) return;
  await db.session.updateMany({ where: { tokenHash: hmac(token), revokedAt: null }, data: { revokedAt: new Date() } });
}

async function resolveSession(token?: string) {
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hmac(token) },
    include: { user: { include: { permissions: { include: { permission: true } } } } }
  });
  const now = new Date();
  if (!session || session.revokedAt || session.expiresAt <= now || session.user.status !== "ACTIVE") return null;
  if (now.getTime() - session.lastActivityAt.getTime() > IDLE_TIMEOUT_MS) {
    await db.session.update({ where: { id: session.id }, data: { revokedAt: now } });
    return null;
  }
  return session;
}

export async function currentUser() {
  const jar = await cookies();
  return (await resolveSession(jar.get(SESSION_COOKIE)?.value))?.user ?? null;
}

export async function requirePageUser() {
  const user = await currentUser();
  if (!user) return null;
  return user;
}

export async function requireApiUser(req: NextRequest, permission?: string) {
  const session = await resolveSession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) throw new HttpError(401, "Sesión inválida o vencida", "unauthorized");
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    const supplied = req.headers.get("x-csrf-token") ?? "";
    if (!safeEqual(hmac(supplied), session.csrfTokenHash)) throw new HttpError(403, "Token CSRF inválido", "csrf");
  }
  if (permission && session.user.role !== "OWNER") {
    const granted = session.user.permissions.some(p => p.permission.code === permission);
    if (!granted) throw new HttpError(403, "No tenés permiso para esta operación", "forbidden");
  }
  const now = new Date();
  if (now.getTime() - session.lastActivityAt.getTime() > 60_000) {
    await db.session.update({ where: { id: session.id }, data: { lastActivityAt: now, expiresAt: new Date(now.getTime() + IDLE_TIMEOUT_MS) } });
  }
  return session.user;
}

export async function requestMetadata() {
  const h = await headers();
  return { userAgent: h.get("user-agent") ?? undefined, ip: h.get("x-forwarded-for")?.split(",")[0] ?? undefined };
}
