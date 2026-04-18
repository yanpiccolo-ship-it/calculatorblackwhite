import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const REPORT_PRODUCTS = {
  complete: {
    name: 'Complete Report — Fundamental Guidance',
    description: 'Informe Numerológico Completo con arquetipos, números maestros, meditación y ejercicios prácticos (2500-3500 palabras)',
    price: 2999,
    currency: 'eur',
  },
  master_premium: {
    name: 'Master Premium Report — Absolute Revelation',
    description: 'Informe Premium de Numerología y Arquetipos con análisis profundo, ciclos de vida, rituales y meditación profunda (4500-6500 palabras)',
    price: 5999,
    currency: 'eur',
  },
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { reportType, userEmail, userName, birthDate, destinyNumber, soulNumber, personalityNumber, personalYearNumber, expressionNumber, karmicNumbers, successUrl, cancelUrl } = body;

    if (!reportType || !userEmail || !userName || !birthDate) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const product = REPORT_PRODUCTS[reportType as keyof typeof REPORT_PRODUCTS];
    if (!product) {
      return new Response(JSON.stringify({ error: 'Invalid report type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-06-20' });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_email: userEmail,
        user_name: userName,
        birth_date: birthDate,
        report_type: reportType,
        status: 'pending',
        destiny_number: destinyNumber || null,
        soul_number: soulNumber || null,
        personality_number: personalityNumber || null,
        personal_year_number: personalYearNumber || null,
        expression_number: expressionNumber || null,
        karmic_numbers: karmicNumbers ? JSON.stringify(karmicNumbers) : null,
        amount_paid: product.price / 100,
        currency: 'EUR',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return new Response(JSON.stringify({ error: 'Could not create order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency,
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail,
      metadata: {
        orderId: order.id,
        reportType,
        userName,
      },
      success_url: successUrl || `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/success?order=${order.id}`,
      cancel_url: cancelUrl || `${Deno.env.get('SUPABASE_URL')?.replace('.supabase.co', '')}/pricing`,
    });

    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id);

    return new Response(JSON.stringify({ url: session.url, orderId: order.id, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
