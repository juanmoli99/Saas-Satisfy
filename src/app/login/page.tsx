import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";

export const dynamic = "force-dynamic";
export default async function LoginPage() {
  if (await currentUser()) redirect("/dashboard");
  return <main className="login-shell">
    <section className="login-panel"><div className="login-card">
      <div className="brand"><span className="brand-mark">GS</span><span style={{color:"var(--text)"}}>Gestión SaaS</span></div>
      <h1>Bienvenido de nuevo</h1><p className="page-subtitle">Ingresá con tu correo, contraseña y código de autenticación.</p>
      <LoginForm />
    </div></section>
    <aside className="login-art"><blockquote>Tu operación comercial, financiera y técnica en un solo lugar seguro.</blockquote></aside>
  </main>;
}
