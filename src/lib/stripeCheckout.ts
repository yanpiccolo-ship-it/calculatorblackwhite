export type CreateCheckoutPayload = {
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

export type CreateCheckoutResponse = {
  id: string;
  url: string;
};

export async function createCheckoutSession(
  payload: CreateCheckoutPayload,
): Promise<CreateCheckoutResponse> {
  const response = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // ignore parse errors, will throw below
  }

  if (!response.ok || !data?.url) {
    const message =
      data?.error || `Checkout request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data as CreateCheckoutResponse;
}
