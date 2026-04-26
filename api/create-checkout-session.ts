import type { IncomingMessage, ServerResponse } from 'http';
import { createCheckoutSession, type CheckoutSessionRequest } from './_lib/stripe.js';

type AnyReq = IncomingMessage & {
  body?: unknown;
  method?: string;
  headers: Record<string, string | string[] | undefined>;
};

type AnyRes = ServerResponse & {
  status?: (code: number) => AnyRes;
  json?: (data: unknown) => void;
};

function sendJson(res: AnyRes, statusCode: number, payload: unknown) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    res.status(statusCode).json(payload);
    return;
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: AnyReq): Promise<CheckoutSessionRequest> {
  if (req.body && typeof req.body === 'object') {
    return req.body as CheckoutSessionRequest;
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return await new Promise<CheckoutSessionRequest>((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
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

function getOrigin(req: AnyReq): string {
  const proto =
    (Array.isArray(req.headers['x-forwarded-proto'])
      ? req.headers['x-forwarded-proto'][0]
      : req.headers['x-forwarded-proto']) || 'https';
  const host =
    (Array.isArray(req.headers['x-forwarded-host'])
      ? req.headers['x-forwarded-host'][0]
      : req.headers['x-forwarded-host']) ||
    (Array.isArray(req.headers.host) ? req.headers.host[0] : req.headers.host) ||
    'localhost:5000';
  return `${proto}://${host}`;
}

export default async function handler(req: AnyReq, res: AnyRes) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const origin = getOrigin(req);
    const session = await createCheckoutSession(body, origin);
    sendJson(res, 200, session);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to create checkout session';
    // eslint-disable-next-line no-console
    console.error('[create-checkout-session]', message);
    sendJson(res, 500, { error: message });
  }
}
