const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildResetEmail({ resetUrl }) {
  const subject = "Guibbo — Restablecer contraseña";

  const safeUrl = escapeHtml(resetUrl);

  const text = `Recibimos una solicitud para restablecer tu contraseña en Guibbo.

Cambia tu contraseña aquí:
${resetUrl}

Este enlace expira en 20 minutos. Si no solicitaste este cambio, ignora este correo.`;

  const logoUrl = process.env.BRAND_LOGO_URL || "";
  const appUrl = process.env.BRAND_APP_URL || process.env.FRONTEND_URL || "";

  // ✅ Email HTML “bulletproof” (tablas + inline)
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark light" />
    <meta name="supported-color-schemes" content="dark light" />
    <title>${subject}</title>
  </head>

  <body style="margin:0; padding:0; background-color:#020617;">
    <!-- Preheader (oculto) -->
    <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">
      Restablece tu contraseña de Guibbo. Este enlace expira en 20 minutos.
    </div>

    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"
      style="background-color:#020617; padding:32px 12px; font-family:Arial, Helvetica, sans-serif;">
      <tr>
        <td align="center">
          <!-- Container -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"
            style="width:600px; max-width:600px;">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:8px 0 18px 0;">
                ${
                  logoUrl
                    ? `<a href="${escapeHtml(appUrl)}" style="text-decoration:none;">
                         <img src="${escapeHtml(logoUrl)}" width="44" height="44" alt="Guibbo"
                           style="display:block; border:0; outline:none; text-decoration:none; border-radius:12px;" />
                       </a>`
                    : `<div style="font-size:18px; font-weight:700; color:#EAF2FA;">Guibbo</div>`
                }
              </td>
            </tr>

            <!-- Card -->
            <tr>
              <td style="
                background-color:#0B1220;
                border:1px solid rgba(255,255,255,0.10);
                border-radius:20px;
                padding:26px 24px;
                box-shadow:0 24px 60px rgba(0,0,0,0.55);
              ">
                <div style="font-size:20px; font-weight:700; color:#EAF2FA; margin:0 0 8px 0;">
                  Restablecer contraseña
                </div>

                <div style="font-size:14px; line-height:1.55; color:#9FB2C8; margin:0 0 18px 0;">
                  Recibimos una solicitud para restablecer tu contraseña en Guibbo.
                </div>

                <!-- Button -->
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;">
                  <tr>
                    <td bgcolor="#00B8DB" style="border-radius:999px;">
                      <a href="${safeUrl}"
                        style="
                          display:inline-block;
                          padding:12px 18px;
                          color:#ffffff;
                          text-decoration:none;
                          font-size:14px;
                          font-weight:700;
                          border-radius:999px;
                        ">
                        Cambiar contraseña
                      </a>
                    </td>
                  </tr>
                </table>

                <div style="font-size:13px; line-height:1.55; color:#9FB2C8; margin:0 0 12px 0;">
                  Este enlace expira en <b style="color:#EAF2FA;">20 minutos</b>.
                  Si no solicitaste este cambio, ignora este correo.
                </div>

                <div style="font-size:12px; line-height:1.55; color:#9FB2C8; margin:0;">
                  Si el botón no funciona, copia y pega este enlace:
                  <br />
                  <span style="word-break:break-all; color:#7DD3FC;">${safeUrl}</span>
                </div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:14px 8px 0 8px;">
                <div style="font-size:11px; line-height:1.6; color:#64748B;">
                  © ${new Date().getFullYear()} Guibbo. Todos los derechos reservados.
                </div>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, text, html };
}

async function sendResetPasswordEmail({ to, resetUrl }) {
  const from = process.env.SENDGRID_FROM;

  if (!process.env.SENDGRID_API_KEY) throw new Error("Falta SENDGRID_API_KEY");
  if (!from) throw new Error("Falta SENDGRID_FROM en .env");
  if (!resetUrl) throw new Error("Falta resetUrl");

  const msg = buildResetEmail({ resetUrl });

  await sgMail.send({
    to,
    from,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,

    // ✅ evita reescritura sendgrid.net (Safari / local)
    tracking_settings: {
      click_tracking: { enable: false, enable_text: false },
    },
  });
}

module.exports = { sendResetPasswordEmail };