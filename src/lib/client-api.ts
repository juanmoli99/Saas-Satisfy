function csrfToken() {
  return document.cookie.split("; ").find(v => v.startsWith("gestion_csrf="))?.split("=")[1] ?? "";
}
export async function apiFetch(url: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (init.method && !["GET", "HEAD"].includes(init.method.toUpperCase())) headers.set("x-csrf-token", decodeURIComponent(csrfToken()));
  const response = await fetch(url, { ...init, headers });
  if (!response.ok) { const data = await response.json().catch(()=>({})); throw new Error(data.error ?? "Error en la operación"); }
  return response;
}
