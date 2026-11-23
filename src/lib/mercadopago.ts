import { createHmac } from "node:crypto";
import { env, integrationConfigured } from "./env";
import { HttpError } from "./http";
import { safeEqual } from "./crypto";

const API = "https://api.mercadopago.com";
async function request<T>(path:string, init:RequestInit={}) {
  if(!integrationConfigured("mercadopago")) throw new HttpError(503,"Mercado Pago no está configurado","integration_not_configured");
  const response=await fetch(`${API}${path}`,{...init,headers:{Authorization:`Bearer ${env().MERCADOPAGO_ACCESS_TOKEN}`,"Content-Type":"application/json",...init.headers},cache:"no-store"});
  const body=await response.json().catch(()=>null); if(!response.ok) throw new HttpError(502,`Mercado Pago rechazó la operación (${response.status})`,"provider_error"); return body as T;
}

export type MPPreapproval={id:string;status:string;init_point?:string;external_reference?:string;auto_recurring?:{transaction_amount:number;currency_id:string;next_payment_date?:string};payer_email?:string};
export type MPPayment={id:number;status:string;external_reference?:string;date_approved?:string;transaction_amount:number;currency_id:string;description?:string;metadata?:Record<string,unknown>;transaction_details?:{net_received_amount?:number};fee_details?:{amount:number;type:string}[];charges_details?:{amounts?:{original?:number;refunded?:number};type?:string}[];point_of_interaction?:{transaction_data?:{subscription_id?:string}}};

export function createPreapproval(input:{reason:string;externalReference:string;payerEmail:string;amount:number}) {
  return request<MPPreapproval>("/preapproval",{method:"POST",headers:{"X-Idempotency-Key":input.externalReference},body:JSON.stringify({reason:input.reason,external_reference:input.externalReference,payer_email:input.payerEmail,auto_recurring:{frequency:1,frequency_type:"months",transaction_amount:input.amount,currency_id:"ARS",start_date:new Date().toISOString()},back_url:env().MERCADOPAGO_BACK_URL,status:"pending"})});
}
export function getPreapproval(id:string){return request<MPPreapproval>(`/preapproval/${encodeURIComponent(id)}`)}
export function updatePreapproval(id:string,data:Record<string,unknown>){return request<MPPreapproval>(`/preapproval/${encodeURIComponent(id)}`,{method:"PUT",body:JSON.stringify(data)})}
export function getPayment(id:string){return request<MPPayment>(`/v1/payments/${encodeURIComponent(id)}`)}
export function getAuthorizedPayment(id:string){return request<Record<string,unknown>>(`/authorized_payments/${encodeURIComponent(id)}`)}
export function searchAuthorizedPayments(preapprovalId:string){return request<{results:Array<{id:number;payment?:{id:number};status?:string}>}>(`/authorized_payments/search?preapproval_id=${encodeURIComponent(preapprovalId)}`)}

export function verifyMercadoPagoSignature(input:{signature:string|null;requestId:string|null;dataId:string|null}){
  const secret=env().MERCADOPAGO_WEBHOOK_SECRET;if(!secret||!input.signature||!input.requestId||!input.dataId)return false;
  const parts=Object.fromEntries(input.signature.split(",").map(p=>p.trim().split("="))); const ts=parts.ts,v1=parts.v1;if(!ts||!v1)return false;
  const manifest=`id:${input.dataId.toLowerCase()};request-id:${input.requestId};ts:${ts};`;
  return safeEqual(createHmac("sha256",secret).update(manifest).digest("hex"),v1);
}
