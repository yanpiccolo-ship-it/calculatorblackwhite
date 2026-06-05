import Stripe from 'stripe';

let cachedClient: Stripe | null = null;

// Pick the first env value that looks like a Stripe API key (sk_live_ / sk_test_ / rk_).
// Avoids the common mistake of pasting a webhook signing secret (whsec_…)
// into STRIPE_SECRET_KEY.
function pickStripeApiKey(): string {
  const candidates = [
    process.env.STRIPE_SECRET_KEY,
    process.env.STRIPE_API_KEY,
    process.env.STRIPE_KEY,
  ].filter((v): v is string => Boolean(v && v.length > 0));

  // Prefer full secret keys (sk_) over restricted keys (rk_) — restricted
  // keys often lack the permissions needed to create checkout sessions.
  const sk = candidates.find((v) => /^sk_(live|test)_/.test(v));
  if (sk) return sk;
  const rk = candidates.find((v) => /^rk_(live|test)_/.test(v));
  if (rk) return rk;

  // No properly-prefixed key was found — surface the clearest possible error.
  const present = candidates
    .map((v) => `${v.slice(0, 8)}…`)
    .join(', ');
  throw new Error(
    `No valid Stripe API key found (need a value starting with sk_live_, sk_test_ or rk_). ` +
      `Got: [${present || 'no env vars set'}]. ` +
      `If you accidentally put the webhook signing secret (whsec_…) in STRIPE_SECRET_KEY, ` +
      `move it to STRIPE_WEBHOOK_SECRET and put the sk_live_/sk_test_ key in STRIPE_SECRET_KEY (or STRIPE_API_KEY).`,
  );
}

export function getStripeClient(): Stripe {
  if (cachedClient) return cachedClient;
  cachedClient = new Stripe(pickStripeApiKey(), { apiVersion: '2024-06-20' });
  return cachedClient;
}

// Pick the webhook signing secret from any env value that starts with whsec_.
// Lets us tolerate users putting it in the wrong slot.
export function pickStripeWebhookSecret(): string | undefined {
  const candidates = [
    process.env.STRIPE_WEBHOOK_SECRET,
    process.env.STRIPE_SECRET_KEY,
    process.env.STRIPE_API_KEY,
  ].filter((v): v is string => Boolean(v && v.length > 0));
  return candidates.find((v) => v.startsWith('whsec_'));
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
  { name: string; description: string; amount: number; currency: string; recurring?: boolean }
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
  brand_report: {
    name: 'Brand Numerology Report',
    description:
      'Complete numerological analysis of your brand or company: archetype, positioning, visual identity, brand voice, growth cycles and 12-month action plan.',
    amount: 3999,
    currency: 'eur',
  },
  luna: {
    name: 'Luna — Monthly Plan',
    description: '1 personal numerology report/month, daily universal number, unlimited compatibility calculator.',
    amount: 999,
    currency: 'eur',
    recurring: true,
  },
  estrella: {
    name: 'Estrella — Monthly Plan',
    description: '2 full reports/month, PDF downloads, yearly forecast, past reports archive.',
    amount: 1999,
    currency: 'eur',
    recurring: true,
  },
  maestra: {
    name: 'Maestra — Monthly Plan',
    description: 'Unlimited personal reports + 1 Brand Report/month, Master Premium always included.',
    amount: 3999,
    currency: 'eur',
    recurring: true,
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

  const isSubscription = preset?.recurring === true;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = isSubscription
    ? {
        quantity: 1,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: { name, ...(description ? { description } : {}) },
          recurring: { interval: 'month' },
        },
      }
    : {
        quantity,
        price_data: {
          currency,
          unit_amount: amount,
          product_data: { name, ...(description ? { description } : {}) },
        },
      };

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: isSubscription ? 'subscription' : 'payment',
    line_items: [lineItem],
    customer_email: body.customerEmail,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      ...(body.productKey ? { productKey: body.productKey } : {}),
      ...(body.metadata ?? {}),
    },
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return { id: session.id, url: session.url };
}
