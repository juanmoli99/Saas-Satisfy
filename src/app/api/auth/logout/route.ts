import { NextRequest, NextResponse } from "next/server";
import { CSRF_COOKIE, revokeSession, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await revokeSession(req.cookies.get(SESSION_COOKIE)?.value);
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  response.cookies.delete(CSRF_COOKIE);
  return response;
}
