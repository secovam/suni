import path from "node:path";

import { config } from "dotenv";
import { z } from "zod";

config({ path: path.resolve(import.meta.dirname, "../../../.env") });

const schema = z.object({
  SMTP_FROM: z.string().min(1),
  SMTP_HOST: z.string().min(1),
  SMTP_PASS: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .enum(["true", "false"])
    .default("false")
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  LOGO_URL: z.url().optional(),
});

const env = schema.parse(process.env);

export default env;
