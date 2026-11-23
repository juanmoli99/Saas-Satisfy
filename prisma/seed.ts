import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { Secret, TOTP } from "otpauth";
import QRCode from "qrcode";
import { createCipheriv, createHash, randomBytes } from "node:crypto";

const db = new PrismaClient();
const permissionCodes = [
  "clients.view", "clients.create", "clients.update", "services.view", "services.create", "services.update",
  "services.suspend", "payments.view", "payments.external.confirm", "subscriptions.manage", "sellers.manage",
  "commissions.manage", "settlements.manage", "expenses.manage", "documents.manage", "users.manage",
  "audit.view", "settings.manage", "integrations.manage", "backups.manage"
];

function encrypt(value: string, source: string) {
  const decoded = Buffer.from(source, "base64");
  const key = decoded.length === 32 ? decoded : createHash("sha256").update(source).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const data = Buffer.concat([cipher.update(value), cipher.final()]);
  return `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${data.toString("base64url")}`;
}

async function main() {
  for (const code of permissionCodes) await db.permission.upsert({ where: { code }, update: {}, create: { code, description: code } });
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const encryptionKey = process.env.ENCRYPTION_KEY;
  if (!email || !password || !encryptionKey) throw new Error("Definí BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD y ENCRYPTION_KEY");
  const existingOwner = await db.user.findFirst({ where: { role: "OWNER" } });
  if (existingOwner) { console.log(`La cuenta principal ya existe: ${existingOwner.email}`); return; }
  const secret = new Secret({ size: 20 });
  const totp = new TOTP({ issuer: "Gestión SaaS", label: email, secret, algorithm: "SHA1", digits: 6, period: 30 });
  await db.user.create({ data: {
    email, displayName: "Administrador principal", role: "OWNER", status: "ACTIVE",
    passwordHash: await argon2.hash(password, { type: argon2.argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 }),
    totpSecretEncrypted: encrypt(secret.base32, encryptionKey), totpEnabledAt: new Date()
  }});
  console.log("\nCuenta principal creada. Escaneá este QR ahora; el secreto no podrá recuperarse desde la aplicación:\n");
  console.log(await QRCode.toString(totp.toString(), { type: "terminal", small: true }));
  console.log(`URI de emergencia (guardala fuera del servidor): ${totp.toString()}\n`);
}

main().finally(() => db.$disconnect());
