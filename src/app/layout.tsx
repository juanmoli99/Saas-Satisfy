import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Gestión SaaS · Demo", description: "Demostración aislada de la plataforma de gestión SaaS" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es-AR" suppressHydrationWarning><body>{children}</body></html>;
}
