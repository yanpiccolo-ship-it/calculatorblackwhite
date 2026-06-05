import express, { type Request, type Response, type NextFunction } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

import createCheckoutHandler from '../api/create-checkout-session';
import processOrderHandler from '../api/process-order';
import stripeWebhookHandler from '../api/stripe-webhook';
import newsletterHandler from '../api/newsletter-subscribe';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '..', 'dist');

const PORT = Number(process.env.PORT || 5000);

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', true);

// Health check
app.get('/healthz', (_req, res) => res.json({ ok: true }));

// Stripe webhook MUST receive the raw body (signature verification).
app.post(
  '/api/stripe-webhook',
  express.raw({ type: '*/*' }),
  (req: Request, res: Response, next: NextFunction) => {
    // The serverless handler reads the body via req.on('data')/req.on('end').
    // Express has already consumed it into req.body (a Buffer because of express.raw).
    // Replay that buffer through the EventEmitter API the handler expects.
    const buf: Buffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const listeners: Record<string, Array<(...a: any[]) => void>> = {};
    const fakeReq: any = Object.assign(req, {
      on(event: string, cb: (...a: any[]) => void) {
        listeners[event] = listeners[event] || [];
        listeners[event].push(cb);
        // Fire data + end on next tick once both listeners are attached
        if (event === 'end') {
          process.nextTick(() => {
            (listeners.data || []).forEach((d) => d(buf));
            (listeners.end || []).forEach((e) => e());
          });
        }
        return fakeReq;
      },
    });
    Promise.resolve(stripeWebhookHandler(fakeReq, res as any)).catch(next);
  },
);

// JSON-body endpoints
app.use(express.json({ limit: '1mb' }));

app.post('/api/create-checkout-session', (req, res, next) => {
  Promise.resolve(createCheckoutHandler(req as any, res as any)).catch(next);
});

app.post('/api/process-order', (req, res, next) => {
  Promise.resolve(processOrderHandler(req as any, res as any)).catch(next);
});

app.post('/api/newsletter-subscribe', (req, res, next) => {
  Promise.resolve(newsletterHandler(req as any, res as any)).catch(next);
});

// Static SPA assets
if (existsSync(distDir)) {
  app.use(express.static(distDir, { maxAge: '1h', index: false }));

  // SPA fallback (Express v5 uses /*splat instead of *)
  app.get(/.*/, (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get(/.*/, (_req, res) => {
    res
      .status(500)
      .send(
        'Build output not found at dist/. Run "npm run build" before starting the production server.',
      );
  });
}

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('[server error]', err);
  res.status(500).json({ error: err?.message || 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`✓ Numerology server listening on http://0.0.0.0:${PORT}`);
});
