import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { apiError, assertSameOrigin, HttpError } from "@/lib/http";
import { audit } from "@/lib/audit";

const patchSchema = z.object({businessName:z.string().min(2).max(160).optional(),notes:z.string().max(4000).nullable().optional(),status:z.enum(["ACTIVE","INACTIVE"]).optional(),sellerId:z.string().nullable().optional()});
export async function PATCH(req:NextRequest,{params}:{params:Promise<{id:string}>}) {
  try { assertSameOrigin(req); const user=await requireApiUser(req,"clients.update"); const {id}=await params; const input=patchSchema.parse(await req.json()); const before=await db.client.findUnique({where:{id}}); if(!before) throw new HttpError(404,"Cliente inexistente");
    const after=await db.$transaction(async tx=>{ if(input.sellerId!==undefined&&input.sellerId!==before.sellerId){ await tx.clientSellerHistory.updateMany({where:{clientId:id,unassignedAt:null},data:{unassignedAt:new Date()}}); if(input.sellerId) await tx.clientSellerHistory.create({data:{clientId:id,sellerId:input.sellerId}}); } return tx.client.update({where:{id},data:{...input,disabledAt:input.status==="INACTIVE"?new Date():input.status==="ACTIVE"?null:undefined}}); });
    await audit({actorId:user.id,action:"update",module:"clients",recordType:"Client",recordId:id,before,after}); return NextResponse.json(after);
  } catch(e){return apiError(e)}
}
