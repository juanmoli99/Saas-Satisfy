"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [challenge, setChallenge] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(form: FormData) {
    setLoading(true); setError("");
    const url = challenge ? "/api/auth/totp" : "/api/auth/login";
    const body = challenge ? { challenge, code: form.get("code") } : { email: form.get("email"), password: form.get("password") };
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "No se pudo iniciar sesión");
      if (data.challenge) setChallenge(data.challenge); else { router.push("/dashboard"); router.refresh(); }
    } catch (e) { setError(e instanceof Error ? e.message : "Error inesperado"); }
    finally { setLoading(false); }
  }
  return <form action={submit}>
    {error && <div className="alert" role="alert">{error}</div>}
    {!challenge ? <>
      <div className="field"><label htmlFor="email">Correo electrónico</label><input id="email" name="email" type="email" autoComplete="username" required /></div>
      <div className="field"><label htmlFor="password">Contraseña</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
    </> : <div className="field"><label htmlFor="code">Código de 6 dígitos</label><input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} autoFocus required /></div>}
    <button className="button" disabled={loading}>{loading ? "Verificando…" : challenge ? "Confirmar acceso" : "Continuar"}</button>
  </form>;
}
