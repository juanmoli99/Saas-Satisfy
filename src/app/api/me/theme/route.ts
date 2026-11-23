import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { apiError, assertSameOrigin } from "@/lib/http";

export async function PATCH(req: NextRequest) {
  try { assertSameOrigin(req); const user = await requireApiUser(req); const { theme } = z.object({theme:z.enum(["light","dark","system"])}).parse(await req.json()); await db.user.update({where:{id:user.id},data:{theme}}); return NextResponse.json({ok:true}); }
  catch (e) { return apiError(e); }
}
