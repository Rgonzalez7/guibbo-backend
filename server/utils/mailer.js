const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

function buildResetEmail({ resetUrl }) {
  const subject = "Guibbo — Restablecer contraseña";

  const text =
`Recibimos una solicitud para restablecer tu contraseña en Guibbo.

Cambia tu contraseña aquí:
${resetUrl}

Este enlace expira en 20 minutos. Si no solicitaste este cambio, ignora este correo.`;

  const html = `
  <div style="font-family: Arial, sans-serif; background:#0b1220; padding:30px;">
    <div style="max-width:560px; margin:0 auto; background:#111c2e; border-radius:16px; padding:24px; color:#eaf2fa;">
      <h2 style="margin:0 0 10px 0;">Restablecer contraseña</h2>
      <p style="margin:0 0 18px 0; color:#9fb2c8;">
        Recibimos una solicitud para restablecer tu contraseña en Guibbo.
      </p>

      <a href="${resetUrl}"
         style="display:inline-block; background:#00b8db; color:white; text-decoration:none;
                padding:12px 18px; border-radius:12px; font-weight:700;">
        Cambiar contraseña
      </a>

      <p style="margin:18px 0 0 0; color:#9fb2c8; font-size:13px;">
        Este enlace expira en 20 minutos. Si no solicitaste este cambio, ignora este correo.
      </p>

      <p style="margin:16px 0 0 0; color:#9fb2c8; font-size:12px;">
        Si el botón no funciona, copia y pega este enlace:
        <br/>
        <span style="word-break:break-all; color:#a7e2e6;">${resetUrl}</span>
      </p>
    </div>
  </div>
  `;

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

    // ✅ CLAVE para local + Safari: evita reescritura sendgrid.net
    tracking_settings: {
      click_tracking: { enable: false, enable_text: false },
    },
  });
}

module.exports = { sendResetPasswordEmail };