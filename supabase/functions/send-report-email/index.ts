import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Missing orderId' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!order.generated_report) {
      return new Response(JSON.stringify({ error: 'Report not generated yet' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendKey = Deno.env.get('RESEND_API_KEY');

    if (!resendKey) {
      console.warn('RESEND_API_KEY not configured — skipping email send');
      return new Response(JSON.stringify({
        success: false,
        reason: 'RESEND_API_KEY not configured. Add it to your Supabase edge function secrets.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const isPremium = order.report_type === 'master_premium';
    const reportTypeName = isPremium
      ? 'Master Premium Report — Absolute Revelation'
      : 'Complete Report — Fundamental Guidance';

    const reportHtml = formatReportAsHtml(order);

    const emailPayload = {
      from: 'Numerología Dresstyle <numerology.reading@dresstyle.world>',
      to: [order.user_email],
      subject: `Tu Informe Numerológico — ${reportTypeName}`,
      html: reportHtml,
    };

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!resendResponse.ok) {
      const errText = await resendResponse.text();
      console.error('Resend error:', errText);

      return new Response(JSON.stringify({
        success: false,
        reason: 'Email send failed via Resend',
        detail: errText,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailResult = await resendResponse.json();
    console.log('Email sent via Resend:', emailResult.id);

    await supabase.from('orders').update({ status: 'sent' }).eq('id', orderId);

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Send email error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function formatReportAsHtml(order: Record<string, unknown>): string {
  const isPremium = order.report_type === 'master_premium';
  const accentColor = isPremium ? '#D4AF37' : '#111111';
  const reportText = (order.generated_report as string) || '';

  const htmlBody = reportText
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '<br/>';
      if (/^\d+\.\s+[A-ZÁÉÍÓÚÑÜ]/.test(trimmed) || /^[A-ZÁÉÍÓÚÑÜ\s\-—]{10,}$/.test(trimmed)) {
        return `<h2 style="color:${accentColor};font-family:Georgia,serif;font-size:18px;margin:28px 0 10px;border-bottom:1px solid #eee;padding-bottom:6px;">${trimmed}</h2>`;
      }
      return `<p style="color:#333;font-family:Georgia,serif;font-size:15px;line-height:1.8;margin:0 0 12px;">${trimmed}</p>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9f9f7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f7;padding:40px 20px;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);max-width:640px;">

        <tr><td style="background:${isPremium ? 'linear-gradient(135deg,#1a1a1a,#2d2d2d)' : '#111111'};padding:48px 48px 36px;text-align:center;">
          <p style="color:${accentColor};font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">
            ${isPremium ? 'Master Premium Report · Absolute Revelation' : 'Complete Report · Fundamental Guidance'}
          </p>
          <h1 style="color:#ffffff;font-family:Georgia,serif;font-size:32px;font-weight:300;margin:0 0 16px;line-height:1.3;">
            Informe Numerológico<br/>de ${order.user_name}
          </h1>
          <p style="color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;font-size:13px;margin:0;">
            Fecha de nacimiento: ${order.birth_date} &nbsp;·&nbsp; Número de Vida: ${order.destiny_number}
          </p>
        </td></tr>

        <tr><td style="background:${accentColor};padding:20px 48px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="color:${isPremium ? '#111' : '#fff'};font-family:Arial,sans-serif;font-size:12px;">
                <strong>${order.destiny_number}</strong><br/><span style="opacity:0.7;font-size:10px;">Destino</span>
              </td>
              <td align="center" style="color:${isPremium ? '#111' : '#fff'};font-family:Arial,sans-serif;font-size:12px;">
                <strong>${order.soul_number}</strong><br/><span style="opacity:0.7;font-size:10px;">Alma</span>
              </td>
              <td align="center" style="color:${isPremium ? '#111' : '#fff'};font-family:Arial,sans-serif;font-size:12px;">
                <strong>${order.personality_number}</strong><br/><span style="opacity:0.7;font-size:10px;">Personalidad</span>
              </td>
              <td align="center" style="color:${isPremium ? '#111' : '#fff'};font-family:Arial,sans-serif;font-size:12px;">
                <strong>${order.personal_year_number}</strong><br/><span style="opacity:0.7;font-size:10px;">Año Personal</span>
              </td>
            </tr>
          </table>
        </td></tr>

        <tr><td style="padding:48px;">
          ${htmlBody}
        </td></tr>

        <tr><td style="background:#f5f5f3;padding:32px 48px;text-align:center;border-top:1px solid #eee;">
          <p style="color:#999;font-family:Arial,sans-serif;font-size:11px;margin:0 0 6px;">
            Este informe ha sido generado personalmente para ${order.user_name}.
          </p>
          <p style="color:#ccc;font-family:Arial,sans-serif;font-size:10px;margin:0;">
            Dresstyle · Numerología & Arquetipos · numerology.reading@dresstyle.world
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
