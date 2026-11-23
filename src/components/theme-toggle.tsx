"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export function ThemeToggle({ initialTheme }: { initialTheme: string }) {
  const [dark, setDark] = useState(initialTheme === "dark");
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; }, [dark]);
  async function toggle() {
    const next = !dark; setDark(next);
    try { await apiFetch("/api/me/theme", { method: "PATCH", body: JSON.stringify({ theme: next ? "dark" : "light" }) }); } catch { setDark(!next); }
  }
  return <button className="button secondary" onClick={toggle} aria-label={dark ? "Usar modo claro" : "Usar modo oscuro"}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button>;
}
