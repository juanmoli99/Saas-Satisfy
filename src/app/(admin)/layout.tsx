import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Users, Boxes, CreditCard, UserRoundCheck, Receipt, WalletCards, FileText, ShieldCheck, Settings, Bell } from "lucide-react";
import { requirePageUser } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

const adminLinks = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/clientes", "Clientes", Users], ["/servicios", "Servicios", Boxes],
  ["/pagos", "Pagos", CreditCard], ["/vendedores", "Vendedores", UserRoundCheck], ["/liquidaciones", "Liquidaciones", WalletCards],
  ["/gastos", "Gastos", Receipt], ["/documentos", "Documentos", FileText], ["/auditoria", "Auditoría", ShieldCheck], ["/configuracion", "Configuración", Settings]
] as const;
const sellerLinks = [["/dashboard", "Dashboard", LayoutDashboard], ["/clientes", "Mis clientes", Users], ["/liquidaciones", "Mis liquidaciones", WalletCards]] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  if (!user) redirect("/login");
  const links = user.role === "SELLER" ? sellerLinks : adminLinks;
  return <div className="app-shell" data-theme={user.theme === "dark" ? "dark" : undefined}>
    <aside className="sidebar">
      <Link className="brand" href="/dashboard"><span className="brand-mark">GS</span><span>Gestión SaaS</span></Link>
      <nav className="nav" aria-label="Navegación principal">{links.map(([href, label, Icon]) => <Link href={href} key={href}><Icon size={19} /><span>{label}</span></Link>)}</nav>
      <div className="sidebar-footer"><div style={{display:"flex", gap:10, alignItems:"center"}}><Bell size={18}/><div className="user-meta"><div style={{fontSize:13,fontWeight:700}}>{user.displayName}</div><div style={{fontSize:11,color:"#9fb4c4"}}>{user.role}</div></div></div><LogoutButton /></div>
    </aside>
    <main className="main"><header className="topbar"><div><span style={{color:"var(--muted)",fontSize:13}}>Panel administrativo</span></div><ThemeToggle initialTheme={user.theme} /></header>{children}</main>
  </div>;
}
