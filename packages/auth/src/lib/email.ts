import type { Transporter } from "nodemailer";
import { createTransport } from "nodemailer";

export interface EmailConfig {
  NODE_ENV: "development" | "production" | "test";
  SMTP_FROM: string;
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_SECURE: boolean;
  SMTP_USER?: string;
  SMTP_PASS?: string;
  LOGO_URL?: string;
}

export function createEmailTransporter(env: EmailConfig): Transporter {
  return createTransport({
    auth:
      env.SMTP_USER && env.SMTP_PASS
        ? { pass: env.SMTP_PASS, user: env.SMTP_USER }
        : undefined,
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    requireTLS: env.NODE_ENV === "production" && !env.SMTP_SECURE,
    secure: env.SMTP_SECURE,
  });
}
