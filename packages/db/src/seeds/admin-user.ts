import { eq } from "drizzle-orm";

import { ENV } from "../env";
import { createDb } from "../index";
import { user } from "../schema/auth";

export async function createAdminUser() {
  const db = createDb({ DATABASE_URL: ENV.DATABASE_URL });
  const email = ENV.ADMIN_EMAIL.toLowerCase().trim();

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
    name: ENV.ADMIN_NAME,
    role: "admin",
  });

  console.log(`✅ Admin user created with ID: ${userId}`);
}
