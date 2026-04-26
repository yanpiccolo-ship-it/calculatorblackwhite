import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processOrder } from './_lib/orders';
import { assertAdminFromRequest } from './_lib/adminAuth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return void res.status(204).end();
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    await assertAdminFromRequest(req as any);
  } catch (err) {
    res.status(401).json({ error: err instanceof Error ? err.message : 'Unauthorized' });
    return;
  }

  const orderId = (req.body && (req.body as any).orderId) as string | undefined;
  if (!orderId) {
    res.status(400).json({ error: 'orderId required' });
    return;
  }

  try {
    const result = await processOrder(orderId);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: message });
  }
}
