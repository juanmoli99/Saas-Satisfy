import { Prisma } from "@prisma/client";
import { HttpError } from "@/lib/http";
import { calculateCommission, isFullMonthlyPayment, servicePeriodForPayment } from "./rules";

type Tx = Prisma.TransactionClient;
export async function recordApprovedPayment(tx:Tx,input:{
  clientId:string;serviceId:string;subscriptionId?:string;provider:"MERCADO_PAGO"|"EXTERNAL"|"SIMULATION";
  providerPaymentId?:string;idempotencyKey:string;method:"MERCADO_PAGO"|"BANK_TRANSFER"|"CASH"|"OTHER";
  grossAmount:number;feesAmount?:number|null;taxesAmount?:number|null;withholdingAmount?:number|null;netAmount?:number|null;
  effectiveAt:Date;externalReference?:string;notes?:string;confirmedById?:string;providerPayload?:Prisma.InputJsonValue;
}){
  const service=await tx.service.findUnique({where:{id:input.serviceId},include:{client:{select:{sellerId:true}},periods:{orderBy:{endsAt:"desc"},take:1}}});
  if(!service||service.clientId!==input.clientId)throw new HttpError(409,"El servicio no pertenece al cliente");
  if(!isFullMonthlyPayment(Number(service.monthlyPrice),input.grossAmount))throw new HttpError(409,"El pago debe cubrir la mensualidad completa","partial_payment_forbidden");
  const suspended=["SUSPENDED","CANCELED","INCIDENT"].includes(service.status);
  const lastEnd=service.periods[0]?.endsAt;
  const {startsAt:periodStart,endsAt:periodEnd}=servicePeriodForPayment(input.effectiveAt,lastEnd,suspended);
  const payment=await tx.payment.create({data:{...input,status:"APPROVED",periodStart,periodEnd}});
  await tx.servicePeriod.create({data:{serviceId:service.id,paymentId:payment.id,startsAt:periodStart,endsAt:periodEnd,price:service.monthlyPrice}});
  await tx.service.update({where:{id:service.id},data:{status:"ACTIVE",graceEndsAt:null,suspendAt:null,accessRevision:{increment:1}}});
  if(service.client.sellerId){
    const seller=await tx.user.findUnique({where:{id:service.client.sellerId},select:{commissionRate:true}});
    if(seller?.commissionRate){const net=input.netAmount??null;const amount=calculateCommission(net,Number(seller.commissionRate));await tx.commission.create({data:{paymentId:payment.id,sellerId:service.client.sellerId,percentage:seller.commissionRate,baseNetAmount:net,status:net==null?"PENDING_CALCULATION":"GENERATED",amount,accreditedAt:input.effectiveAt}})}
  }
  return payment;
}
