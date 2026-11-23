import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, verifyDemoSession } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";
export default async function DemoIndex() {
  const token = (await cookies()).get(DEMO_COOKIE)?.value;
  redirect(verifyDemoSession(token) ? "/demo/dashboard" : "/demo/ingresar");
}
