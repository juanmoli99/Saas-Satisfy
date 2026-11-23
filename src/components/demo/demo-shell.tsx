"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Boxes, CreditCard, FileText, LayoutDashboard, LogOut, Moon, Receipt, Settings, ShieldCheck, Sun, UserRoundCheck, Users, WalletCards } from "lucide-react";
import { useEffect, useState } from "react";
import { useDemo } from "./demo-context";

const links = [
  ["/demo/dashboard", "Dashboard", LayoutDashboard], ["/demo/clientes", "Clientes", Users], ["/demo/servicios", "Servicios", Boxes],
  ["/demo/pagos", "Pagos", CreditCard], ["/demo/vendedores", "Vendedores", UserRoundCheck], ["/demo/liquidaciones", "Liquidaciones", WalletCards],
  ["/demo/gastos", "Gastos", Receipt], ["/demo/documentos", "Documentos", FileText], ["/demo/auditoria", "Auditoría", ShieldCheck], ["/demo/configuracion", "Configuración", Settings],
] as const;

export function DemoShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); const router = useRouter(); const { toast } = useDemo();
  const [dark, setDark] = useState(false);
  useEffect(() => { document.documentElement.dataset.theme = dark ? "dark" : "light"; return () => { delete document.documentElement.dataset.theme; }; }, [dark]);
  async function logout() { await fetch("/api/demo/logout", { method: "POST" }); router.replace("/demo/ingresar"); router.refresh(); }
  return <div className="app-shell">
    <aside className="sidebar">
      <Link className="brand" href="/demo/dashboard"><span className="brand-mark">GS</span><span>Gestión SaaS</span></Link>
      <nav className="nav" aria-label="Navegación principal">{links.map(([href, label, Icon]) => <Link className={pathname === href ? "active" : ""} href={href} key={href}><Icon size={19}/><span>{label}</span></Link>)}</nav>
      <div className="sidebar-footer"><div style={{display:"flex",gap:10,alignItems:"center"}}><Bell size={18}/><div className="user-meta"><div style={{fontSize:13,fontWeight:700}}>Administrador Demo</div><div style={{fontSize:11,color:"#9fb4c4"}}>DEMO · ADMIN</div></div></div><button className="demo-logout" onClick={logout}><LogOut size={17}/> Salir</button></div>
    </aside>
    <main className="main">
      <div className="demo-banner"><strong>DEMO</strong><span>Datos ficticios · operaciones simuladas · sin conexión a producción</span></div>
      <header className="topbar"><span style={{color:"var(--muted)",fontSize:13}}>Panel administrativo</span><button className="button secondary" onClick={() => setDark(value => !value)} aria-label={dark ? "Usar modo claro" : "Usar modo oscuro"}>{dark ? <Sun size={17}/> : <Moon size={17}/>}</button></header>
      {children}
      {toast && <div className="demo-toast" role="status">{toast}</div>}
    </main>
  </div>;
}
