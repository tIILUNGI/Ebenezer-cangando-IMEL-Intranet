import nodemailer from 'nodemailer';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, name, role } = JSON.parse(event.body || '{}');

  // Simulado: se não houver SMTP configurado, retorna sucesso para não bloquear o fluxo.
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM;

  const messageBody = `Bem-vindo ao Intra IMEL, ${name}. A sua conta (${role}) foi ativada com sucesso.`;

  if (!smtpHost || !smtpUser || !smtpPass || !smtpFrom) {
    return { statusCode: 200, body: JSON.stringify({ ok: true, channel: 'simulado' }) };
  }

  if (!email) {
    return { statusCode: 400, body: JSON.stringify({ message: 'E-mail é obrigatório.' }) };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort || 587),
      secure: Number(smtpPort) === 465,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: smtpFrom,
      to: email,
      subject: 'Bem-vindo ao Intra IMEL',
      text: messageBody,
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true, channel: 'smtp' }) };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Falha ao enviar mensagem.', details: String(error) }),
    };
  }
};
