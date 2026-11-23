const PUBLIC_DEMO_PATHS = new Set(["/demo/ingresar", "/api/demo/login"]);

export function isDemoRequestAllowed(pathname: string) {
  if (pathname === "/" || pathname === "/favicon.ico" || pathname.startsWith("/_next/")) return true;
  return pathname === "/demo" || pathname.startsWith("/demo/") || pathname.startsWith("/api/demo/");
}

export function isPublicDemoPath(pathname: string) {
  return PUBLIC_DEMO_PATHS.has(pathname);
}
