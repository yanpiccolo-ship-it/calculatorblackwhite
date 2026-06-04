// Unified email sender
// Priority: Resend (primary) → Gmail SMTP (free fallback, no domain verification needed)
// Resend is the default when RESEND_API_KEY is set.
// Gmail kicks in automatically if Resend is unavailable or throws.

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: Buffer }>;
}

// ── Resend ────────────────────────────────────────────────────────────────
async function sendViaResend(args: SendEmailArgs): Promise<{ id: string }> {
  const { Resend } = await import('resend');
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY not set');

  const from = process.env.EMAIL_FROM || 'Numerology Reading <numerology.reading@dresstyle.world>';
  const resend = new Resend(key);

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

// ── Gmail SMTP via nodemailer (free, no domain verification) ──────────────
async function sendViaGmail(args: SendEmailArgs): Promise<{ id: string }> {
  const nodemailer = await import('nodemailer');
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) throw new Error('GMAIL_USER or GMAIL_APP_PASSWORD not set');

  const transport = nodemailer.default.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  const attachments = (args.attachments ?? []).map((a) => ({
    filename: a.filename,
    content: a.content,
  }));

  const info = await transport.sendMail({
    from: `"Numerology Reading" <${user}>`,
    to: args.to,
    subject: args.subject,
    html: args.html,
    attachments,
  });

  return { id: info.messageId ?? 'gmail-ok' };
}

// ── Router — Resend first, Gmail fallback ─────────────────────────────────
export async function sendEmail(args: SendEmailArgs): Promise<{ id: string }> {
  // Try Resend if API key is configured
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend(args);
    } catch (resendErr) {
      const msg = resendErr instanceof Error ? resendErr.message : String(resendErr);
      console.warn(`[email] Resend failed (${msg}), trying Gmail fallback…`);
    }
  }

  // Fall back to Gmail SMTP
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return sendViaGmail(args);
  }

  throw new Error(
    'No email transport configured. Set RESEND_API_KEY (primary) or GMAIL_USER + GMAIL_APP_PASSWORD (fallback).',
  );
}
