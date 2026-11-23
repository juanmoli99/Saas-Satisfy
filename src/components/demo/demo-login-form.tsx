"use client";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function DemoLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setError("");
    const code = new FormData(event.currentTarget).get("code");
    try {
      const response = await fetch("/api/demo/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "No se pudo ingresar");
      router.replace("/demo/dashboard"); router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Error inesperado"); }
    finally { setLoading(false); }
  }
  return <form onSubmit={submit}>
    {error && <div className="alert" role="alert">{error}</div>}
    <div className="field"><label htmlFor="demo-code">Código de acceso DEMO</label><input id="demo-code" name="code" type="password" autoComplete="current-password" minLength={10} required autoFocus /></div>
    <button className="button" disabled={loading}>{loading ? "Validando…" : "Ingresar a la demostración"}</button>
  </form>;
}
