import type { Plugin } from 'vite';
import { createCheckoutSession, type CheckoutSessionRequest } from '../api/_lib/stripe';

function readBody(req: any): Promise<CheckoutSessionRequest> {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function getOrigin(req: any): string {
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:5000';
  return `${proto}://${host}`;
}

export function stripeApiPlugin(): Plugin {
  return {
    name: 'stripe-api-dev',
    configureServer(server) {
      server.middlewares.use('/api/create-checkout-session', async (req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.end();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        try {
          const body = await readBody(req);
          const origin = getOrigin(req);
          const session = await createCheckoutSession(body, origin);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(session));
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to create checkout session';
          // eslint-disable-next-line no-console
          console.error('[stripe-api-dev]', message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: message }));
        }
      });
    },
  };
}
