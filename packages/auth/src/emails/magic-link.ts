interface MagicLinkEmailOptions {
  url: string;
  expiresIn?: string;
}

export interface MagicLinkEmailResult {
  html: string;
  text: string;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function magicLinkEmail({
  url,
  expiresIn = "15 minutos",
}: MagicLinkEmailOptions) {
  const safeUrl = escapeHtml(url);
  const safeExpiresIn = escapeHtml(expiresIn);

  const html = `<!DOCTYPE html>
<html lang="es">
  <body style="margin:0;padding:40px 0;background:#F3F4F6;font-family:-apple-system,'Segoe UI',sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#FFFFFF;border-radius:16px;padding:40px 32px;">
      <h1 style="margin:0 0 16px;font-size:18px;color:#1F2937;">¡Hola!</h1>
      <p style="font-size:15px;line-height:24px;color:#6B7280;">
        Solicitaste acceder a tu cuenta en Suni. Este enlace expira en <strong>${safeExpiresIn}</strong>.
      </p>
      <a href="${safeUrl}" style="display:block;margin:32px 0;padding:14px 32px;background:#2563EB;color:#FFFFFF;text-align:center;text-decoration:none;font-weight:600;border-radius:8px;">
        Acceder
      </a>
      <p style="font-size:13px;line-height:20px;color:#6B7280;">
        ¿El botón no funciona? Copia este enlace en tu navegador:<br />
        <a href="${safeUrl}" style="color:#2563EB;word-break:break-all;">${safeUrl}</a>
      </p>
      <p style="font-size:12px;color:#9CA3AF;">
        Si no lo solicitaste, ignora este correo. — Grupo Secovam
      </p>
    </div>
  </body>
</html>`;

  const text = `¡Hola!

Solicitaste acceder a tu cuenta en Suni. Este enlace expira en ${expiresIn}:

${url}

Si no lo solicitaste, ignora este correo.
Grupo Secovam`;

  return { html, text } satisfies MagicLinkEmailResult;
}
