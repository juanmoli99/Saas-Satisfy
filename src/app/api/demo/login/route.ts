import { NextRequest, NextResponse } from "next/server";
import { createDemoSession, DEMO_COOKIE, DEMO_SESSION_SECONDS, verifyDemoAccessCode } from "@/lib/demo-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!verifyDemoAccessCode(body?.code)) {
      return NextResponse.json({ error: "Código de demostración incorrecto" }, { status: 401 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(DEMO_COOKIE, createDemoSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/demo",
      maxAge: DEMO_SESSION_SECONDS,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "No se pudo validar el acceso" }, { status: 400 });
  }
}
