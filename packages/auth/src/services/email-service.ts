import env from "@suni/env/auth";
import { log } from "evlog";

import { magicLinkEmail } from "../emails/magic-link";
import { getEmailTransporter } from "../lib/email";

export interface SendMagicLinkOptions {
  email: string;
  url: string;
  expiresIn?: string;
}

async function sendMagicLink(options: SendMagicLinkOptions): Promise<void> {
  const transporter = getEmailTransporter();

  const { html, text } = await magicLinkEmail({
    expiresIn: options.expiresIn,
    logoUrl: env.LOGO_URL,
    url: options.url,
  });

  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      html,
      subject: "Enlace de acceso - Suni",
      text,
      to: options.email,
    });

    log.info({
      accepted: info.accepted,
      action: "magic-link",
      message: "Magic link email accepted by SMTP transport",
      messageId: info.messageId,
      rejected: info.rejected,
      response: info.response,
    });
  } catch (error) {
    log.error({
      action: "magic-link",
      error: error instanceof Error ? error : String(error),
      message: "Failed to send magic link email",
      to: options.email,
    });
    throw error;
  }
}

export const emailService = { sendMagicLink };
