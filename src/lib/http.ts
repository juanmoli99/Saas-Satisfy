import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string, public code = "request_error") { super(message); }
}

export function apiError(error: unknown) {
  if (error instanceof HttpError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
  if (error instanceof ZodError) return NextResponse.json({ error: "Datos inválidos", details: error.issues }, { status: 422 });
  console.error("Unhandled API error", error);
  return NextResponse.json({ error: "Error interno" }, { status: 500 });
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? "unknown";
}

export function assertSameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) throw new HttpError(403, "Origen inválido", "csrf_origin");
}
