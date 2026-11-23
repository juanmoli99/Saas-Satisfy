import { after, NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getAuthorizedPayment, getPayment, getPreapproval, verifyMercadoPagoSignature } from "@/lib/mercadopago";
import { recordApprovedPayment } from "@/domain/payments";
import { audit } from "@/lib/audit";

type MPWebhook={id?:string|number;type?:string;action?:string;data?:{id?:string|number};live_mode?:boolean};
function mapStatus(status:string){return status==="approved"?"APPROVED":status==="rejected"?"REJECTED":status==="refunded"?"REFUNDED":status==="charged_back"?"CHARGED_BACK":status==="cancelled"?"CANCELED":"PENDING" as const}

async function processEvent(eventId:string) {
  const event=await db.webhookEvent.findUnique({where:{id:eventId}});if(!event||event.status==="processed")return;
  const payload=event.payload as MPWebhook;
  try{
    if((payload.type==="payment"||payload.action?.startsWith("payment."))&&event.resourceId){
      const mp=await getPayment(event.resourceId);const existing=await db.payment.findUnique({where:{providerPaymentId:String(mp.id)}});
      if(existing){await db.payment.update({where:{id:existing.id},data:{status:mapStatus(mp.status),providerPayload:mp as unknown as Prisma.InputJsonValue,updatedAt:new Date()}})}
      else if(mp.status==="approved"){
        const sub=await db.subscription.findFirst({where:{OR:[{externalReference:mp.external_reference??"__none__"},{providerId:mp.point_of_interaction?.transaction_data?.subscription_id??"__none__"}]},include:{service:true}});
        if(!sub)throw new Error("No se encontró la suscripción local del pago");
        const fees=(mp.fee_details??[]).reduce((n,f)=>n+Number(f.amount),0);const net=mp.transaction_details?.net_received_amount??null;
        await db.$transaction(tx=>recordApprovedPayment(tx,{clientId:sub.service.clientId,serviceId:sub.serviceId,subscriptionId:sub.id,provider:"MERCADO_PAGO",providerPaymentId:String(mp.id),idempotencyKey:`mp:${mp.id}`,method:"MERCADO_PAGO",grossAmount:Number(mp.transaction_amount),feesAmount:fees,taxesAmount:null,withholdingAmount:null,netAmount:net,effectiveAt:new Date(mp.date_approved??Date.now()),externalReference:mp.external_reference,providerPayload:mp as unknown as Prisma.InputJsonValue}));
      }
    }else if((payload.type==="subscription_preapproval"||payload.action?.includes("preapproval"))&&event.resourceId){
      const mp=await getPreapproval(event.resourceId);const mapped=mp.status==="authorized"?"AUTHORIZED":mp.status==="paused"?"PAUSED":mp.status==="cancelled"?"CANCELED":"PENDING";await db.subscription.updateMany({where:{providerId:mp.id},data:{status:mapped,providerAmount:mp.auto_recurring?.transaction_amount,nextBillingAt:mp.auto_recurring?.next_payment_date?new Date(mp.auto_recurring.next_payment_date):null,providerPayload:mp as unknown as Prisma.InputJsonValue}});
    }else if(payload.type==="subscription_authorized_payment"&&event.resourceId){await getAuthorizedPayment(event.resourceId)}
    await db.webhookEvent.update({where:{id:eventId},data:{status:"processed",processedAt:new Date()}});await audit({origin:"WEBHOOK",action:"process",module:"mercadopago",recordType:"WebhookEvent",recordId:eventId,result:"success"});
  }catch(error){const message=error instanceof Error?error.message:"Error desconocido";await db.webhookEvent.update({where:{id:eventId},data:{status:"failed",error:message}});await db.incident.create({data:{code:"MP_WEBHOOK_PROCESSING_FAILED",severity:"CRITICAL",title:"Falló la conciliación de Mercado Pago",detail:message,metadata:{eventId}}});}
}

export async function POST(req:NextRequest){
  const payload=await req.json() as MPWebhook;const dataId=String(req.nextUrl.searchParams.get("data.id")??payload.data?.id??"");const requestId=req.headers.get("x-request-id");const valid=verifyMercadoPagoSignature({signature:req.headers.get("x-signature"),requestId,dataId});
  if(!valid)return NextResponse.json({error:"Firma inválida"},{status:401});
  const providerEventId=`${requestId}:${payload.action??payload.type}:${dataId}`;
  const event=await db.webhookEvent.upsert({where:{provider_providerEventId:{provider:"mercadopago",providerEventId}},update:{},create:{provider:"mercadopago",providerEventId,eventType:payload.action??payload.type??"unknown",resourceId:dataId||null,signatureValid:true,payload:payload as Prisma.InputJsonValue}});
  after(()=>processEvent(event.id));return NextResponse.json({received:true});
}
