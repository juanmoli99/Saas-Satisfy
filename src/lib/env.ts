import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.url().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32),
  INTEGRATION_KEY_PEPPER: z.string().min(32),
  MERCADOPAGO_ACCESS_TOKEN: z.string().optional(),
  MERCADOPAGO_WEBHOOK_SECRET: z.string().optional(),
  MERCADOPAGO_BACK_URL: z.url().optional(),
  MERCADOPAGO_MODE: z.enum(["sandbox", "production"]).default("sandbox"),
  WHATSAPP_ACCESS_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
  WHATSAPP_VERIFY_TOKEN: z.string().optional(),
  WHATSAPP_APP_SECRET: z.string().optional(),
  WHATSAPP_GRAPH_VERSION: z.string().default("v27.0")
});

export type AppEnv = z.infer<typeof schema>;
let cached: AppEnv | undefined;

export function env(): AppEnv {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Configuración inválida: ${result.error.issues.map(i => `${i.path.join(".")}: ${i.message}`).join(", ")}`);
  }
  cached = result.data;
  return cached;
}

export function integrationConfigured(name: "mercadopago" | "whatsapp") {
  const e = env();
  return name === "mercadopago"
    ? Boolean(e.MERCADOPAGO_ACCESS_TOKEN && e.MERCADOPAGO_WEBHOOK_SECRET)
    : Boolean(e.WHATSAPP_ACCESS_TOKEN && e.WHATSAPP_PHONE_NUMBER_ID && e.WHATSAPP_VERIFY_TOKEN);
}
