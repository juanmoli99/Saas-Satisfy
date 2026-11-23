import{Prisma}from"@prisma/client";
import{addMonths}from"date-fns";
export function isFullMonthlyPayment(expected:number,received:number){return Math.abs(expected-received)<0.009}
export function calculateCommission(net:number|null,percentage:number){return net==null?null:Number(new Prisma.Decimal(net).mul(percentage).div(100).toDecimalPlaces(2))}
export function servicePeriodForPayment(effectiveAt:Date,lastPeriodEnd:Date|undefined,suspended:boolean){const startsAt=!suspended&&lastPeriodEnd&&lastPeriodEnd>effectiveAt?lastPeriodEnd:effectiveAt;return{startsAt,endsAt:addMonths(startsAt,1)}}
export function serviceAccessAllowed(status:string,periods:{startsAt:Date;endsAt:Date}[],now=new Date()){return status==="ACTIVE"&&periods.some(p=>p.startsAt<=now&&p.endsAt>now)}
export function shouldSuspendAfterGrace(graceEndsAt:Date,hasCurrentPeriod:boolean,now=new Date()){return graceEndsAt<=now&&!hasCurrentPeriod}
