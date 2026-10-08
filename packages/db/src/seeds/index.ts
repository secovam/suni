import "varlock/auto-load";
import { ENV } from "../env";
import { createAdminUser } from "./admin-user";

export async function runSeed() {
  try {
    console.log("🌱 Iniciando seeds de base de datos...");
    console.log(`👤 Procesando usuario administrador: ${ENV.ADMIN_EMAIL}`);

    await createAdminUser();

    console.log("✅ Seeds de base de datos completados exitosamente.");
  } catch (error) {
    console.error(
      "❌ Falló la ejecución de los seeds de base de datos:",
      error
    );

    process.exit(1);
  }
}

runSeed();
