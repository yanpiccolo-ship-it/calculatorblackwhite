import Stripe from 'stripe';

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient;
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set');
  }
  cachedClient = new Stripe(secret, { apiVersion: '2024-06-20' });
  return cachedClient;
}

export type CheckoutSessionRequest = {
  productKey?: string;
  productName?: string;
  description?: string;
  amount?: number;
  currency?: string;
  quantity?: number;
  customerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
};

const PRODUCT_CATALOG: Record<
  string,
  { name: string; description: string; amount: number; currency: string }
> = {
  premium_pdf: {
    name: 'Premium Numerology PDF Report',
    description:
      'Personalized numerology report with destiny, soul, personality and personal-year analysis.',
    amount: 999,
    currency: 'usd',
  },
  complete_report: {
    name: 'Complete Numerology Report',
    description:
      'Full numerology reading including Tarot de Marseille and Jungian archetypes.',
    amount: 2999,
    currency: 'eur',
  },
  master_premium: {
    name: 'Master Premium Numerology Report',
    description:
      'Master-level reading with deep Tarot de Marseille and Jungian archetype interpretation.',
    amount: 5999,
    currency: 'eur',
  },
};

function sanitizeRedirect(rawUrl: string | undefined, origin: string, fallbackPath: string) {
  if (!rawUrl) return `${origin}${fallbackPath}`;
  try {
    const u = new URL(rawUrl, origin);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return `${origin}${fallbackPath}`;
    }
    return u.toString();
  } catch {
    return `${origin}${fallbackPath}`;
  }
}

export async function createCheckoutSession(
  body: CheckoutSessionRequest,
  origin: string,
) {
  const stripe = getStripeClient();

  const preset = body.productKey ? PRODUCT_CATALOG[body.productKey] : undefined;

  const name = body.productName ?? preset?.name ?? 'Numerology Report';
  const description = body.description ?? preset?.description;
  const amount = Math.round(body.amount ?? preset?.amount ?? 999);
  const currency = (body.currency ?? preset?.currency ?? 'usd').toLowerCase();
  const quantity = Math.max(1, Math.floor(body.quantity ?? 1));

  if (amount < 50) {
    throw new Error('Amount must be at least 50 (smallest currency unit)');
  }

  const successUrl = sanitizeRedirect(
    body.successUrl,
    origin,
    '/checkout/success?session_id={CHECKOUT_SESSION_ID}',
  );
  const cancelUrl = sanitizeRedirect(body.cancelUrl, origin, '/checkout/cancel');

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [
      {
        quantity,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: {
            name,
            ...(description ? { description } : {}),
          },
        },
      },
    ],
    customer_email: body.customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...(body.productKey ? { productKey: body.productKey } : {}),
      ...(body.metadata ?? {}),
    },
  });

  return { id: session.id, url: session.url };
}
