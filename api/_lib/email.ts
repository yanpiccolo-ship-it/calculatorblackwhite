// Unified email sender: Gmail SMTP (free, no domain verification needed)
// falls back to Resend if GMAIL_USER is not configured.

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

// ── Gmail via nodemailer ──────────────────────────────────────────────────
async function sendViaGmail(args: SendEmailArgs): Promise<{ id: string }> {
  const nodemailer = await import('nodemailer');
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not set');

  const transport = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const nm: any[] = (args.attachments ?? []).map((a) => ({
    filename: a.filename,
    content: a.content,
  }));

  const info = await transport.sendMail({
    from: `"Numerology Reading" <${user}>`,
    to: args.to,
    subject: args.subject,
    html: args.html,
    attachments: nm,
  });

  return { id: info.messageId ?? 'gmail-ok' };
}

// ── Resend fallback ───────────────────────────────────────────────────────
async function sendViaResend(args: SendEmailArgs): Promise<{ id: string }> {
  const { Resend } = await import('resend');
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');

  const resend = new Resend(key);
  const from =
    process.env.EMAIL_FROM || 'Numerology Reading <numerology.reading@dresstyle.world>';

  const result = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
    attachments: (args.attachments ?? []).map((a) => ({
      filename: a.filename,
      content: a.content,
    })),
  });

  if ((result as any).error) {
    throw new Error(
      `Resend error: ${(result as any).error.message || JSON.stringify((result as any).error)}`,
    );
  }
  return { id: (result as any).data?.id || 'resend-ok' };
}

// ── Router ────────────────────────────────────────────────────────────────
export async function sendEmail(args: SendEmailArgs): Promise<{ id: string }> {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return sendViaGmail(args);
  }
  return sendViaResend(args);
}
