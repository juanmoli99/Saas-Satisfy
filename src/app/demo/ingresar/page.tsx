import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DemoLoginForm } from "@/components/demo/demo-login-form";
import { DEMO_COOKIE, verifyDemoSession } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";

export default async function DemoLoginPage() {
  const token = (await cookies()).get(DEMO_COOKIE)?.value;
  if (verifyDemoSession(token)) redirect("/demo/dashboard");
  return <main className="login-shell">
    <section className="login-panel"><div className="login-card">
      <div className="brand"><span className="brand-mark">GS</span><span style={{color:"var(--text)"}}>Gestión SaaS</span></div>
      <span className="demo-pill">DEMOSTRACIÓN AISLADA</span>
      <h1>Recorré el sistema</h1>
      <p className="page-subtitle">Acceso exclusivo a datos ficticios. No utiliza la autenticación ni los servicios de producción.</p>
      <DemoLoginForm />
    </div></section>
    <aside className="login-art"><blockquote>La interfaz completa, con operaciones seguras y simuladas.</blockquote></aside>
  </main>;
}
