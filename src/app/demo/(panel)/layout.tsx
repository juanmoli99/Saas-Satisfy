import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DemoProvider } from "@/components/demo/demo-context";
import { DemoShell } from "@/components/demo/demo-shell";
import { DEMO_COOKIE, verifyDemoSession } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";
export default async function DemoPanelLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(DEMO_COOKIE)?.value;
  if (!verifyDemoSession(token)) redirect("/demo/ingresar");
  return <DemoProvider><DemoShell>{children}</DemoShell></DemoProvider>;
}
