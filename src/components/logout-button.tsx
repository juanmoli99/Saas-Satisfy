"use client";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

export function LogoutButton() {
  const router = useRouter();
  return <button className="button secondary" style={{width:"100%"}} onClick={async()=>{ await apiFetch("/api/auth/logout", {method:"POST"}); router.push("/login"); router.refresh(); }}><LogOut size={15} style={{display:"inline",marginRight:7}}/>Salir</button>;
}
