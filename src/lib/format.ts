export const ars = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });
export const number = new Intl.NumberFormat("es-AR");
export const date = new Intl.DateTimeFormat("es-AR", { timeZone: "America/Argentina/Buenos_Aires", day: "2-digit", month: "short", year: "numeric" });
export function statusClass(status: string) { return /ACTIVE|APPROVED|PAID|DELIVERED|GENERATED/.test(status) ? "ok" : /PENDING|GRACE|OPEN|SCHEDULED/.test(status) ? "warn" : /REJECTED|SUSPENDED|CANCELED|OVERDUE|INCIDENT|FAILED/.test(status) ? "bad" : ""; }
