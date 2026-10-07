import { eq } from "drizzle-orm";

import { createDb } from "../index";
import { user } from "../schema/auth";

export interface AdminSeedConfig {
  DATABASE_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_NAME: string;
}

export function createAdminSeed(env: AdminSeedConfig) {
  const db = createDb({ DATABASE_URL: env.DATABASE_URL });
  const email = env.ADMIN_EMAIL.toLowerCase().trim();

  async function createAdminUser(): Promise<void> {
    console.log("🔐 Checking for existing admin user...");

    const [existing] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (existing) {
      if (existing.role === "admin") {
        console.log("ℹ️  Admin user already exists, skipping");

        return;
      }

      await db
        .update(user)
        .set({ role: "admin" })
        .where(eq(user.id, existing.id));

      console.log(`✅ Existing user promoted to admin (ID: ${existing.id})`);

      return;
    }

    console.log("👤 Creating admin user...");

    const userId = crypto.randomUUID();

    await db.insert(user).values({
      email,
      emailVerified: true,
      id: userId,
      name: env.ADMIN_NAME,
      role: "admin",
    });

    console.log(`✅ Admin user created with ID: ${userId}`);
  }

  return { createAdminUser };
}
