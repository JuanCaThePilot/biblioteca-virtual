const nodemailer = require('nodemailer');

function getTransportConfig() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT) return null;

  const config = {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true'
  };

  if (process.env.SMTP_USER || process.env.SMTP_PASS) {
    config.auth = {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    };
  }

  return config;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildPasswordResetEmail({ name, resetUrl, expiresMinutes }) {
  const safeName = name || 'usuario';
  const htmlName = escapeHtml(safeName);
  const htmlResetUrl = escapeHtml(resetUrl);
  const subject = 'Restablece tu contraseña de BibliotecaTech';
  const text = [
    `Hola ${safeName},`,
    '',
    'Recibimos una solicitud para restablecer la contraseña de tu cuenta en BibliotecaTech.',
    `Abre este enlace para crear una nueva contraseña. El enlace vence en ${expiresMinutes} minutos:`,
    resetUrl,
    '',
    'Si no solicitaste este cambio, puedes ignorar este mensaje.'
  ].join('\n');

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;background:#05070d;padding:32px;color:#f7f8ff">
      <div style="max-width:560px;margin:0 auto;background:#111827;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:28px">
        <h1 style="margin:0 0 12px;font-size:24px">Restablece tu contraseña</h1>
        <p style="color:#cbd5e1;line-height:1.6">Hola ${htmlName}, recibimos una solicitud para restablecer la contraseña de tu cuenta en BibliotecaTech.</p>
        <p style="color:#cbd5e1;line-height:1.6">Este enlace vence en <strong>${expiresMinutes} minutos</strong> y solo puede usarse una vez.</p>
        <p style="margin:28px 0">
          <a href="${htmlResetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c5cff,#00d1ff);color:white;text-decoration:none;border-radius:999px;padding:14px 22px;font-weight:700">Crear nueva contraseña</a>
        </p>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6">Si el botón no funciona, copia este enlace en tu navegador:<br>${htmlResetUrl}</p>
        <p style="color:#94a3b8;font-size:13px;line-height:1.6">Si no solicitaste este cambio, ignora este mensaje.</p>
      </div>
    </div>
  `;

  return { subject, text, html };
}

async function sendPasswordResetEmail({ to, name, resetUrl, expiresMinutes }) {
  const message = buildPasswordResetEmail({ name, resetUrl, expiresMinutes });
  const transportConfig = getTransportConfig();

  if (!transportConfig) {
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[password-reset] SMTP no configurado. Enlace de desarrollo para ${to}: ${resetUrl}`);
      return { delivered: false, mode: 'development-log' };
    }

    throw new Error('SMTP no está configurado para enviar correos de recuperación.');
  }

  const transporter = nodemailer.createTransport(transportConfig);
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'BibliotecaTech <no-reply@bibliotecatech.local>',
    to,
    subject: message.subject,
    text: message.text,
    html: message.html
  });

  return { delivered: true, mode: 'smtp' };
}

module.exports = { buildPasswordResetEmail, sendPasswordResetEmail };
