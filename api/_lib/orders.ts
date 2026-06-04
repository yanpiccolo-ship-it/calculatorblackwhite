import { getSupabaseAdmin } from './supabaseAdmin';
import { buildProfile, buildBrandProfile, type NumerologyProfile } from './numerologyServer';
import { generateReport } from './openai';
import { buildReportPdf } from './pdf';
import { sendEmail } from './email';
import { getProductTitle, type ProductKey } from './prompts';

export interface OrderRow {
  id: string;
  stripe_session_id: string;
  product_key: ProductKey;
  amount_cents: number;
  currency: string;
  customer_email: string;
  customer_name: string | null;
  birth_date: string | null;
  language: string | null;
  numerology_data: any;
  status: string;
  report_text: string | null;
  report_pdf_url: string | null;
  email_message_id: string | null;
  error_message: string | null;
  metadata: any;
  created_at: string;
  completed_at: string | null;
  sent_at: string | null;
}

export async function createOrderFromStripeSession(input: {
  sessionId: string;
  paymentIntentId?: string | null;
  productKey: ProductKey;
  amountCents: number;
  currency: string;
  customerEmail: string;
  customerName?: string | null;
  birthDate?: string | null;
  language?: string | null;
  metadata?: Record<string, any>;
}): Promise<OrderRow> {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from('orders')
    .select('*')
    .eq('stripe_session_id', input.sessionId)
    .maybeSingle();

  if (existing) return existing as OrderRow;

  const { data, error } = await supabase
    .from('orders')
    .insert({
      stripe_session_id: input.sessionId,
      stripe_payment_intent: input.paymentIntentId ?? null,
      product_key: input.productKey,
      amount_cents: input.amountCents,
      currency: input.currency,
      customer_email: input.customerEmail,
      customer_name: input.customerName ?? null,
      birth_date: input.birthDate ?? null,
      language: input.language ?? 'en',
      status: 'pending',
      metadata: input.metadata ?? {},
    })
    .select('*')
    .single();

  if (error) throw new Error(`Failed to insert order: ${error.message}`);
  return data as OrderRow;
}

export async function updateOrder(
  id: string,
  patch: Partial<OrderRow>,
): Promise<OrderRow> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .update(patch as any)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw new Error(`Failed to update order ${id}: ${error.message}`);
  return data as OrderRow;
}

export async function getOrderById(id: string): Promise<OrderRow | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return (data as OrderRow) ?? null;
}

export async function uploadPdfToStorage(
  orderId: string,
  pdf: Buffer,
): Promise<string> {
  const supabase = getSupabaseAdmin();
  const path = `${orderId}.pdf`;
  const { error } = await supabase.storage
    .from('reports')
    .upload(path, pdf, {
      contentType: 'application/pdf',
      upsert: true,
    });
  if (error) throw new Error(`Storage upload failed: ${error.message}`);
  const { data } = supabase.storage.from('reports').getPublicUrl(path);
  return data.publicUrl;
}

export interface ProcessResult {
  ok: boolean;
  orderId: string;
  status: string;
  emailMessageId?: string;
  pdfUrl?: string;
  error?: string;
}

// Full pipeline: numerology → AI text → PDF → upload → email → mark sent
export async function processOrder(orderId: string): Promise<ProcessResult> {
  const supabase = getSupabaseAdmin();

  // 1. Load + lock as processing
  const order = await getOrderById(orderId);
  if (!order) throw new Error(`Order ${orderId} not found`);
  if (!order.customer_email) throw new Error(`Order ${orderId} has no email`);

  await updateOrder(orderId, { status: 'processing', error_message: null });

  try {
    // 2. Profile (use stored data if available, otherwise compute from name+dob)
    let profile: NumerologyProfile;
    if (order.numerology_data && order.numerology_data.lifePath) {
      profile = order.numerology_data as NumerologyProfile;
    } else if (order.product_key === 'brand_report' && order.customer_name) {
      // Brand reports use the brand name only — no birth date required
      profile = buildBrandProfile(order.customer_name);
      await updateOrder(orderId, { numerology_data: profile as any });
    } else if (order.customer_name && order.birth_date) {
      profile = buildProfile(order.customer_name, order.birth_date);
      await updateOrder(orderId, { numerology_data: profile as any });
    } else {
      throw new Error(
        'Cannot generate report: missing customer_name or birth_date. ' +
          'Open the order in the admin panel and add the data, then retry.',
      );
    }

    // 3. AI text
    const ai = await generateReport(
      order.product_key as ProductKey,
      profile,
      order.language || 'en',
    );

    // 4. PDF
    const pdf = await buildReportPdf({
      title: ai.title,
      reportText: ai.text,
      profile,
      language: order.language || 'en',
    });

    // 5. Storage
    const pdfUrl = await uploadPdfToStorage(orderId, pdf);

    await updateOrder(orderId, {
      status: 'completed',
      report_text: ai.text,
      report_pdf_url: pdfUrl,
      completed_at: new Date().toISOString() as any,
    });

    // 6. Email
    const greeting = order.customer_name ? `Hi ${order.customer_name},` : 'Hello,';
    const emailHtml = `<!doctype html>
<html><body style="font-family: -apple-system, Segoe UI, Helvetica, Arial, sans-serif; color: #222; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h2 style="font-family: Georgia, serif; color: #111; margin-top: 0;">${ai.title}</h2>
  <p>${greeting}</p>
  <p>Thank you for your purchase. Your personalized numerology report is attached as a PDF.</p>
  <p>Take a quiet moment to read it — these insights are most powerful when you give them space to land.</p>
  <p style="margin-top: 28px; color: #777; font-size: 13px;">With light,<br/>The Numerology Reading team</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 28px 0;"/>
  <p style="color: #999; font-size: 12px;">If you have any questions, just reply to this email.</p>
</body></html>`;
    const sent = await sendEmail({
      to: order.customer_email,
      subject: `${ai.title} — your personalized report`,
      html: emailHtml,
      attachments: [{ filename: `${ai.title.replace(/[^a-z0-9]+/gi, '_')}.pdf`, content: pdf }],
    });

    await updateOrder(orderId, {
      status: 'sent',
      email_message_id: sent.id,
      sent_at: new Date().toISOString() as any,
    });

    return {
      ok: true,
      orderId,
      status: 'sent',
      emailMessageId: sent.id,
      pdfUrl,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error(`[processOrder ${orderId}] ${message}`);
    await updateOrder(orderId, {
      status: 'error',
      error_message: message,
    });
    return { ok: false, orderId, status: 'error', error: message };
  }
}
