import type { VercelRequest, VercelResponse } from '@vercel/node';
import type Stripe from 'stripe';
import { getStripeClient, pickStripeWebhookSecret } from './_lib/stripe';
import { getSupabaseAdmin } from './_lib/supabaseAdmin';
import { createOrderFromStripeSession, processOrder } from './_lib/orders';
import { sendSubscriptionWelcomeEmail } from './_lib/resend';
import type { ProductKey } from './_lib/prompts';

// Vercel: raw body required for Stripe signature verification
export const config = {
  api: { bodyParser: false },
};

async function readRaw(req: VercelRequest): Promise<Buffer> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const TIER_NAMES: Record<string, string> = {
  solo_aura: 'Solo Aura',
  binary_essence: 'Binary Essence',
  ai_sales_master: 'AI Sales Master',
  monolith_empire: 'Monolith Empire',
};

async function recordEvent(event: Stripe.Event, status: string, error?: string) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from('stripe_webhook_events').upsert(
      {
        id: event.id,
        type: event.type,
        payload: event as any,
        status,
        error: error ?? null,
        processed_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
  } catch {
    /* swallow audit errors */
  }
}

async function alreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('stripe_webhook_events')
      .select('id, status')
      .eq('id', eventId)
      .maybeSingle();
    return Boolean(data && data.status === 'processed');
  } catch {
    return false;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = pickStripeWebhookSecret();

  let event: Stripe.Event;
  try {
    const rawBody = await readRaw(req);
    const stripe = getStripeClient();
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      // Allow unsigned events ONLY when secret is not configured (dev/local).
      // eslint-disable-next-line no-console
      console.warn('[stripe-webhook] STRIPE_WEBHOOK_SECRET not set — skipping signature check (dev mode)');
      event = JSON.parse(rawBody.toString()) as Stripe.Event;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid payload';
    // eslint-disable-next-line no-console
    console.error('[stripe-webhook] verification failed:', message);
    res.status(400).json({ error: `Webhook Error: ${message}` });
    return;
  }

  if (await alreadyProcessed(event.id)) {
    res.status(200).json({ received: true, duplicate: true });
    return;
  }
  await recordEvent(event, 'received');

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const productKey = (session.metadata?.productKey || 'premium_pdf') as ProductKey;

        if (session.mode === 'payment') {
          const order = await createOrderFromStripeSession({
            sessionId: session.id,
            paymentIntentId:
              typeof session.payment_intent === 'string'
                ? session.payment_intent
                : null,
            productKey,
            amountCents: session.amount_total ?? 0,
            currency: session.currency ?? 'eur',
            customerEmail:
              session.customer_details?.email ||
              session.customer_email ||
              '',
            customerName: session.customer_details?.name ?? null,
            birthDate: session.metadata?.birthDate ?? null,
            language: session.metadata?.language ?? 'en',
            metadata: session.metadata ?? {},
          });

          if (order.customer_email) {
            // Fire and forget — webhook must respond fast
            processOrder(order.id).catch((e) => {
              // eslint-disable-next-line no-console
              console.error('[processOrder background]', e);
            });
          }
        } else if (session.mode === 'subscription') {
          // Subscription handled in customer.subscription.created
          // but we also send a welcome email here.
          const tierId = session.metadata?.tierId || 'unknown';
          const tierName = TIER_NAMES[tierId] || tierId;
          const email =
            session.customer_details?.email || session.customer_email || '';
          if (email) {
            sendSubscriptionWelcomeEmail(
              email,
              tierName,
              session.customer_details?.name ?? undefined,
            ).catch((e) => console.error('[welcome email]', e));
          }
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const supabase = getSupabaseAdmin();
        const tierId = (sub.metadata?.tierId as string) || 'unknown';
        const customer = sub.customer as string;

        const stripe = getStripeClient();
        const customerRecord = (await stripe.customers.retrieve(customer)) as Stripe.Customer;

        await supabase.from('subscriptions').upsert(
          {
            stripe_subscription_id: sub.id,
            stripe_customer_id: customer,
            customer_email: customerRecord.email ?? '',
            customer_name: customerRecord.name ?? null,
            tier_id: tierId,
            status: sub.status,
            current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            cancel_at_period_end: sub.cancel_at_period_end,
            metadata: sub.metadata ?? {},
          },
          { onConflict: 'stripe_subscription_id' },
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const supabase = getSupabaseAdmin();
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id);
        break;
      }

      default:
        // ignore other event types
        break;
    }

    await recordEvent(event, 'processed');
    res.status(200).json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error(`[stripe-webhook] processing ${event.type}: ${message}`);
    await recordEvent(event, 'error', message);
    res.status(500).json({ error: message });
  }
}
