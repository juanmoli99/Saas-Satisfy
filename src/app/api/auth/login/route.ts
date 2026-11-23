import { NextRequest, NextResponse } from "next/server";
import argon2 from "argon2";
import { SignJWT } from "jose";
import { z } from "zod";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { hmac } from "@/lib/crypto";
import { apiError, clientIp, HttpError } from "@/lib/http";

const inputSchema = z.object({ email: z.email().transform(v => v.toLowerCase().trim()), password: z.string().min(1).max(256) });

export async function POST(req: NextRequest) {
  try {
    const input = inputSchema.parse(await req.json());
    const ip = clientIp(req);
    const since = new Date(Date.now() - 15 * 60_000);
    const [emailFailures, ipFailures] = await Promise.all([
      db.loginAttempt.count({ where: { emailHash: hmac(input.email), success: false, createdAt: { gte: since } } }),
      db.loginAttempt.count({ where: { ipHash: hmac(ip), success: false, createdAt: { gte: since } } })
    ]);
    if (emailFailures >= 8 || ipFailures >= 30) throw new HttpError(429, "Demasiados intentos. Esperá 15 minutos.", "rate_limited");
    const user = await db.user.findUnique({ where: { email: input.email } });
    const ok = user && user.status === "ACTIVE" && await argon2.verify(user.passwordHash, input.password);
    await db.loginAttempt.create({ data: { emailHash: hmac(input.email), ipHash: hmac(ip), success: Boolean(ok) } });
    if (!ok || !user?.totpSecretEncrypted) throw new HttpError(401, "Correo o contraseña incorrectos", "invalid_credentials");
    const token = await new SignJWT({ sub: user.id, purpose: "totp" })
      .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("5m")
      .sign(new TextEncoder().encode(env().SESSION_SECRET));
    return NextResponse.json({ requiresTotp: true, challenge: token });
  } catch (error) { return apiError(error); }
}
