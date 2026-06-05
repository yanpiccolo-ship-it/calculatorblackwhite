import type { Plugin } from 'vite';
import { createCheckoutSession, type CheckoutSessionRequest } from '../api/_lib/stripe';
import { processOrder } from '../api/_lib/orders';

function readJson<T = any>(req: any): Promise<T> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    req.on('end', () => {
      if (!data) return resolve({} as T);
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({} as T);
      }
    });
    req.on('error', () => resolve({} as T));
  });
}

function readRaw(req: any): Promise<Buffer> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)),
    );
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', () => resolve(Buffer.alloc(0)));
  });
}

function getOrigin(req: any): string {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
  return `${proto}://${host}`;
}

function setCors(res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS',
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, x-admin-token, stripe-signature',
  );
}

function sendJson(res: any, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export function stripeApiPlugin(): Plugin {
  return {
    name: 'stripe-api-dev',
    configureServer(server) {
      // 1) Create Stripe Checkout session
      server.middlewares.use('/api/create-checkout-session', async (req, res) => {
        setCors(res);
        if (req.method === 'OPTIONS') return void (res.statusCode = 204) || res.end();
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
        try {
          const body = await readJson<CheckoutSessionRequest>(req);
          const origin = getOrigin(req);
          const session = await createCheckoutSession(body, origin);
          sendJson(res, 200, session);
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to create checkout session';
          console.error('[stripe-api-dev]', message);
          sendJson(res, 500, { error: message });
        }
      });

      // 2) Stripe webhook (dev: no signature check unless STRIPE_WEBHOOK_SECRET is set)
      server.middlewares.use('/api/stripe-webhook', async (req, res) => {
        setCors(res);
        if (req.method === 'OPTIONS') return void (res.statusCode = 204) || res.end();
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
        try {
          // Lazy-import so we don't hard-fail in dev when Supabase env is missing
          const handler = (await import('../api/stripe-webhook')).default;
          // Reconstruct req body for the handler that reads raw stream
          const raw = await readRaw(req);
          const fakeReq: any = Object.assign(req, {
            on: (event: string, cb: any) => {
              if (event === 'data') cb(raw);
              if (event === 'end') cb();
              return fakeReq;
            },
          });
          const fakeRes: any = Object.assign(res, {
            status: (code: number) => {
              res.statusCode = code;
              return fakeRes;
            },
            json: (data: any) => sendJson(res, res.statusCode || 200, data),
          });
          await handler(fakeReq, fakeRes);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error('[stripe-webhook-dev]', message);
          sendJson(res, 500, { error: message });
        }
      });

      // 3) Newsletter subscription
      server.middlewares.use('/api/newsletter-subscribe', async (req, res) => {
        setCors(res);
        if (req.method === 'OPTIONS') return void (res.statusCode = 204) || res.end();
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
        try {
          const body = await readJson<{ email?: string }>(req);
          const email = body.email?.trim().toLowerCase();
          if (!email || !email.includes('@')) return sendJson(res, 400, { error: 'Invalid email' });
          // Best-effort Supabase upsert — silently skips if table doesn't exist
          try {
            const { createClient } = await import('@supabase/supabase-js');
            const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
            const key = process.env.SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
            if (url && key) {
              const sb = createClient(url, key);
              await sb.from('newsletter_subscribers').upsert({ email, subscribed_at: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true });
            }
          } catch { /* table may not exist yet */ }
          sendJson(res, 200, { ok: true });
        } catch (err) {
          sendJson(res, 500, { error: (err as Error).message });
        }
      });

      // 4) Manual order re-processing (admin "Generate" / "Resend" buttons)
      server.middlewares.use('/api/process-order', async (req, res) => {
        setCors(res);
        if (req.method === 'OPTIONS') return void (res.statusCode = 204) || res.end();
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
        try {
          const { assertAdminFromRequest } = await import('../api/_lib/adminAuth');
          await assertAdminFromRequest(req as any);
        } catch (err) {
          return sendJson(res, 401, {
            error: err instanceof Error ? err.message : 'Unauthorized',
          });
        }
        try {
          const body = await readJson<{ orderId?: string }>(req);
          if (!body.orderId) return sendJson(res, 400, { error: 'orderId required' });
          const result = await processOrder(body.orderId);
          sendJson(res, 200, result);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error('[process-order-dev]', message);
          sendJson(res, 500, { error: message });
        }
      });
    },
  };
}
