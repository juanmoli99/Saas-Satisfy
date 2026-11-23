import { randomBytes } from "node:crypto";

for (const name of ["SESSION_SECRET", "ENCRYPTION_KEY", "INTEGRATION_KEY_PEPPER", "CRON_SECRET", "WHATSAPP_VERIFY_TOKEN"]) {
  console.log(`${name}=${randomBytes(32).toString("base64")}`);
}
