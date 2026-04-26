import { Resend } from 'resend';

let cached: Resend | null = null;

function getClient(): Resend {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  cached = new Resend(key);
  return cached;
}

const DEFAULT_FROM =
  process.env.EMAIL_FROM ||
  'Numerology Reading <numerology.reading@dresstyle.world>';

export interface SendReportEmailArgs {
  to: string;
  subject: string;
  reportTitle: string;
  customerName?: string;
  pdfBuffer: Buffer;
  pdfFilename: string;
  intro?: string;
}

export async function sendReportEmail(
  args: SendReportEmailArgs,
): Promise<{ id: string }> {
  const resend = getClient();
  const greeting = args.customerName ? `Hi ${args.customerName},` : 'Hello,';
  const intro =
    args.intro ||
    'Thank you for your purchase. Your personalized numerology report is attached as a PDF.';

  const html = `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2 style="font-family: Georgia, serif; color: #111; margin-top: 0;">${args.reportTitle}</h2>
  <p>${greeting}</p>
  <p>${intro}</p>
  <p>Take a quiet moment to read it — these insights are most powerful when you give them space to land.</p>
  <p style="margin-top: 28px; color: #777; font-size: 13px;">With light,<br/>The Numerology Reading team</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;"/>
  <p style="color: #999; font-size: 12px;">If you have any questions, just reply to this email.</p>
</body></html>`;

  const result = await resend.emails.send({
    from: DEFAULT_FROM,
    to: args.to,
    subject: args.subject,
    html,
    attachments: [
      {
        filename: args.pdfFilename,
        content: args.pdfBuffer,
      },
    ],
  });

  if ((result as any).error) {
    throw new Error(
      `Resend error: ${(result as any).error.message || JSON.stringify((result as any).error)}`,
    );
  }
  const id = (result as any).data?.id || (result as any).id || 'unknown';
  return { id };
}

export async function sendSubscriptionWelcomeEmail(
  to: string,
  tierName: string,
  customerName?: string,
): Promise<{ id: string }> {
  const resend = getClient();
  const greeting = customerName ? `Hi ${customerName},` : 'Hello,';
  const html = `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2 style="font-family: Georgia, serif; color: #111;">Welcome to ${tierName}</h2>
  <p>${greeting}</p>
  <p>Your subscription is active. You now have full access to your tier's benefits.</p>
  <p style="margin-top: 28px; color: #777; font-size: 13px;">With light,<br/>The Numerology Reading team</p>
</body></html>`;

  const result = await resend.emails.send({
    from: DEFAULT_FROM,
    to,
    subject: `Welcome — ${tierName} is active`,
    html,
  });
  if ((result as any).error) {
    throw new Error(`Resend error: ${(result as any).error.message}`);
  }
  return { id: (result as any).data?.id || 'unknown' };
}
