import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { apiError, assertSameOrigin } from "@/lib/http";
import { audit } from "@/lib/audit";

const schema = z.object({
  businessName: z.string().trim().min(2).max(160), legalName: z.string().trim().max(160).optional().nullable(),
  taxId: z.string().trim().max(20).optional().nullable(), email: z.email().optional().or(z.literal("")).nullable(),
  phone: z.string().trim().max(40).optional().nullable(), whatsapp: z.string().trim().max(30).optional().nullable(),
  whatsappConsent: z.boolean().optional().default(false), notes: z.string().max(4000).optional().nullable(), sellerId: z.string().optional().nullable()
});

export async function GET(req: NextRequest) {
  try {
    const user = await requireApiUser(req, "clients.view");
    const rows = await db.client.findMany({ where: user.role === "SELLER" ? {sellerId:user.id} : {}, orderBy:{businessName:"asc"}, include:{_count:{select:{services:true}}} });
    return NextResponse.json(rows.map(c => user.role === "SELLER" ? {id:c.id,businessName:c.businessName,status:c.status,services:c._count.services} : c));
  } catch(e) { return apiError(e); }
}

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req); const user = await requireApiUser(req, "clients.create"); const data = schema.parse(await req.json());
    const client = await db.$transaction(async tx => {
      const { whatsappConsent, ...clientData } = data;
      const created = await tx.client.create({data:{...clientData,email:data.email||null,whatsappOptInAt:whatsappConsent?new Date():null}});
      if (data.sellerId) await tx.clientSellerHistory.create({data:{clientId:created.id,sellerId:data.sellerId}});
      return created;
    });
    await audit({actorId:user.id,action:"create",module:"clients",recordType:"Client",recordId:client.id,after:client});
    return NextResponse.json(client,{status:201});
  } catch(e) { return apiError(e); }
}
