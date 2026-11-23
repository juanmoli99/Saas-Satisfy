import { NextRequest, NextResponse } from "next/server";
import { isDemoRequestAllowed } from "@/lib/demo-routing";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isDemoRequestAllowed(pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Ruta no disponible en la demostración" }, { status: 404 });
    }
    return new NextResponse("Página no disponible en la demostración", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
  if (pathname === "/") return NextResponse.redirect(new URL("/demo", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
