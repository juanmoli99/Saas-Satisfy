import type { Prisma, AuditOrigin } from "@prisma/client";
import { db } from "./db";

const SECRET_KEYS = /password|secret|token|credential|authorization/i;
function redact(value: unknown): Prisma.InputJsonValue | undefined {
  if (value == null) return undefined;
  if (Array.isArray(value)) return value.map(redact).filter(v => v !== undefined) as Prisma.InputJsonArray;
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, SECRET_KEYS.test(k) ? "[REDACTADO]" : redact(v)])) as Prisma.InputJsonObject;
  }
  return value as Prisma.InputJsonValue;
}

export async function audit(input: {
  actorId?: string; origin?: AuditOrigin; action: string; module: string; recordType: string;
  recordId?: string; before?: unknown; after?: unknown; result?: string; ipAddress?: string;
}) {
  await db.auditLog.create({ data: {
    actorId: input.actorId, origin: input.origin ?? "USER", action: input.action, module: input.module,
    recordType: input.recordType, recordId: input.recordId, before: redact(input.before), after: redact(input.after),
    result: input.result ?? "success", ipAddress: input.ipAddress
  }});
}
