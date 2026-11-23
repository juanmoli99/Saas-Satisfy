import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Gestión SaaS", description: "Administración privada de clientes y servicios" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR" suppressHydrationWarning><body>{children}</body></html>;
}
