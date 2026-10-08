import { log } from "evlog";

import { magicLinkEmail } from "../emails/magic-link";
import type { EmailConfig } from "../lib/email";
import { createEmailTransporter } from "../lib/email";

export interface SendMagicLinkOptions {
  email: string;
  url: string;
  expiresIn?: string;
}

export function createEmailService(env: EmailConfig) {
  const transporter = createEmailTransporter(env);

  async function sendMagicLink(options: SendMagicLinkOptions): Promise<void> {
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
        acceptedCount: info.accepted?.length ?? 0,
        action: "magic-link",
        message: "Magic link email accepted by SMTP transport",
        messageId: info.messageId,
        rejectedCount: info.rejected?.length ?? 0,
        response: info.response,
      });
    } catch (error) {
      log.error({
        action: "magic-link",
        error: error instanceof Error ? error : String(error),
        message: "Failed to send magic link email",
      });
      throw error;
    }
  }

  return { sendMagicLink };
}
