import "varlock/auto-load";
import type { AdminSeedConfig } from "./admin-user";
import { createAdminSeed } from "./admin-user";

const databaseUrl = process.env.DATABASE_URL;

const adminEmail = process.env.ADMIN_EMAIL;

const adminName = process.env.ADMIN_NAME;

if (!databaseUrl || !adminEmail || !adminName) {
  throw new Error(
    "❌ Faltan variables de entorno requeridas (DATABASE_URL, ADMIN_EMAIL, ADMIN_NAME)."
  );
}

export async function runSeed(env: AdminSeedConfig): Promise<void> {
  try {
    console.log(`🌱 Iniciando seed para: ${env.ADMIN_EMAIL}`);
    await createAdminSeed(env).createAdminUser();
    console.log("✅ Seed completado exitosamente.");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

void runSeed({
  DATABASE_URL: databaseUrl,
  ADMIN_EMAIL: adminEmail,
  ADMIN_NAME: adminName,
});
