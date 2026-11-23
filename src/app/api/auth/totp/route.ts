import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { TOTP } from "otpauth";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { decryptSecret } from "@/lib/crypto";
import { createSession, CSRF_COOKIE, SESSION_COOKIE } from "@/lib/auth";
import { apiError, clientIp, HttpError } from "@/lib/http";
import { audit } from "@/lib/audit";

const schema = z.object({ challenge: z.string().min(20), code: z.string().regex(/^\d{6}$/) });

export async function POST(req: NextRequest) {
  try {
    const input = schema.parse(await req.json());
    const { payload } = await jwtVerify(input.challenge, new TextEncoder().encode(env().SESSION_SECRET), { algorithms: ["HS256"] });
    if (payload.purpose !== "totp" || !payload.sub) throw new HttpError(401, "Desafío inválido", "invalid_challenge");
    const user = await db.user.findUnique({ where: { id: payload.sub } });
    if (!user || user.status !== "ACTIVE" || !user.totpSecretEncrypted) throw new HttpError(401, "Cuenta no disponible", "invalid_account");
    const totp = new TOTP({ issuer: "Gestión SaaS", label: user.email, algorithm: "SHA1", digits: 6, period: 30, secret: decryptSecret(user.totpSecretEncrypted) });
    if (totp.validate({ token: input.code, window: 1 }) === null) throw new HttpError(401, "Código de autenticación inválido", "invalid_totp");
    const session = await createSession(user.id, req.headers.get("user-agent") ?? undefined, clientIp(req));
    await audit({ actorId: user.id, action: "login", module: "auth", recordType: "Session", result: "success", ipAddress: clientIp(req) });
    const response = NextResponse.json({ ok: true });
    const cookieOptions = { httpOnly: true, secure: env().NODE_ENV === "production", sameSite: "strict" as const, path: "/", expires: session.expiresAt };
    response.cookies.set(SESSION_COOKIE, session.token, cookieOptions);
    response.cookies.set(CSRF_COOKIE, session.csrf, { ...cookieOptions, httpOnly: false });
    return response;
  } catch (error) { return apiError(error); }
}
