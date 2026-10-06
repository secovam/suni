import env from "@suni/env/auth";
import type { Transporter, TransportOptions } from "nodemailer";
import { createTransport } from "nodemailer";

let transporter: Transporter | null = null;

export function getEmailTransporter(): Transporter {
  if (transporter) {
    return transporter;
  }

  const transportOptions: TransportOptions & {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: { user: string; pass: string };
  } = {
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
  };

  if (env.SMTP_USER && env.SMTP_PASS) {
    transportOptions.auth = {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    };
  }

  transporter = createTransport(transportOptions);

  return transporter;
}
