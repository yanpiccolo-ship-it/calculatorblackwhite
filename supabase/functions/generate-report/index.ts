import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ARCHETYPES: Record<number, string> = {
  1: 'El Pionero', 2: 'El Mediador', 3: 'El Creador', 4: 'El Constructor',
  5: 'El Explorador', 6: 'El Cuidador', 7: 'El Sabio', 8: 'El Líder', 9: 'El Humanitario',
  11: 'El Visionario', 22: 'El Arquitecto del Mundo', 33: 'El Maestro del Amor',
  44: 'El Maestro Planificador — Constructor Universal',
};

const TAROT_MARSEILLE: Record<number, { card: string; jungArchetype: string; shadow: string; light: string }> = {
  1:  { card: 'I · Le Bateleur (El Mago)',                  jungArchetype: 'El Héroe / El Yo consciente',              shadow: 'Manipulación, arrogancia, uso del poder sin ética',                                  light: 'Manifestación creativa, voluntad alineada, maestría de los propios recursos' },
  2:  { card: 'II · La Papesse (La Papisa)',                 jungArchetype: 'El Ánima / La Sabia Interior',             shadow: 'Secretismo, pasividad excesiva, bloqueo de la intuición',                            light: 'Sabiduría intuitiva, conexión con el inconsciente, receptividad sagrada' },
  3:  { card: "III · L'Impératrice (La Emperatriz)",         jungArchetype: 'La Gran Madre / Ánima fértil',             shadow: 'Dependencia afectiva, sobreprotección, caos creativo',                               light: 'Creatividad desbordante, amor incondicional, abundancia y expresión del alma' },
  4:  { card: "IIII · L'Empereur (El Emperador)",            jungArchetype: 'El Padre / El Rey Interior',               shadow: 'Rigidez, control, autoritarismo, miedo al cambio',                                   light: 'Estructura sagrada, liderazgo con integridad, dominio de la realidad material' },
  5:  { card: 'V · Le Pape (El Papa / Hierofante)',          jungArchetype: 'El Sabio / El Guía Espiritual',            shadow: 'Dogmatismo, conformismo, dependencia de la aprobación externa',                       light: 'Transmisión de conocimiento sagrado, puente entre lo humano y lo divino' },
  6:  { card: "VI · L'Amoureux (El Enamorado)",              jungArchetype: 'El Ánima y el Ánimus en integración',      shadow: 'Indecisión crónica, dependencia emocional, conflicto de valores',                     light: 'Elección consciente, integración de polaridades, amor como elección del alma' },
  7:  { card: 'VII · Le Chariot (El Carro)',                 jungArchetype: 'El Guerrero / La Voluntad triunfante',     shadow: 'Control rígido, victoria vacía, falta de integración emocional',                      light: 'Dominio de fuerzas internas opuestas, avance con propósito, conquista del destino' },
  8:  { card: 'VIII · La Justice (La Justicia)',             jungArchetype: 'El Árbitro / La Conciencia Moral',         shadow: 'Juicio implacable, frialdad, inflexibilidad moral',                                   light: 'Equilibrio kármico, discernimiento elevado, integridad en todas las decisiones' },
  9:  { card: "VIIII · L'Ermite (El Ermitaño)",              jungArchetype: 'El Viejo Sabio / El Sí-mismo profundo',    shadow: 'Aislamiento patológico, soledad como huida, perfeccionismo estéril',                   light: 'Búsqueda interior luminosa, guía espiritual auténtica, sabiduría ganada en silencio' },
  11: { card: 'XI · La Force (La Fuerza)',                   jungArchetype: 'El Domador / La Energía Integrada',        shadow: 'Represión de la sombra, lucha constante con los instintos',                          light: 'Integración del instinto y el espíritu, fuerza desde la compasión, coraje del alma' },
  22: { card: 'Le Mat (El Loco) — sin número',               jungArchetype: 'El Trickster / El Espíritu Libre',         shadow: 'Irresponsabilidad, huida de la realidad, caos sin propósito',                         light: 'Libertad absoluta, confianza en el universo, potencial ilimitado del Arquitecto del Mundo' },
  33: { card: "VI★ · L'Amoureux — Vibración Superior",       jungArchetype: 'El Maestro del Amor / La Integración Total', shadow: 'Sacrificio excesivo, martirio emocional, amor desde la herida',                  light: 'Amor incondicional como misión de vida, sanación colectiva a través de la presencia' },
  44: { card: "IIII★ · L'Empereur — Vibración del Maestro Planificador", jungArchetype: 'El Maestro Planificador / Constructor Universal', shadow: 'Carga abrumadora de responsabilidad, desequilibrio entre ambición material y ética espiritual, perfeccionismo que paraliza la acción y aísla emocionalmente', light: 'Creación de estructuras duraderas que benefician a muchos, manifestación a escala global con sabiduría, dominio de la eficiencia como acto sagrado y construcción de legados que trascienden generaciones' },
};

function getTarotForNumber(n: number): { card: string; jungArchetype: string; shadow: string; light: string } {
  if (TAROT_MARSEILLE[n]) return TAROT_MARSEILLE[n];
  const reduced = n % 9 || 9;
  return TAROT_MARSEILLE[reduced] || TAROT_MARSEILLE[1];
}

const MASTER_NUMBERS = [11, 22, 33, 44];

function buildCompleteReportPrompt(data: Record<string, unknown>): string {
  const { userName, birthDate, destinyNumber, soulNumber, personalityNumber, expressionNumber, personalYearNumber, karmicNumbers } = data;
  const archetype = ARCHETYPES[destinyNumber as number] || ARCHETYPES[(destinyNumber as number) % 9 || 9];
  const isMaster = MASTER_NUMBERS.includes(destinyNumber as number);
  const tarot = getTarotForNumber(destinyNumber as number);

  return `Actúa como numerólogo experto en arquetipos, psicología junguiana, Tarot de Marsella y evolución del alma.

Genera un informe profundo de numerología, arquetipos y tarot en español basado en los siguientes datos:

Nombre completo: ${userName}
Fecha de nacimiento: ${birthDate}
Número de Vida (Destino): ${destinyNumber}${isMaster ? ' (NÚMERO MAESTRO)' : ''}
Número del Alma: ${soulNumber}
Número de Personalidad: ${personalityNumber}
Número de Expresión: ${expressionNumber || destinyNumber}
Números kármicos: ${karmicNumbers || 'Ninguno identificado'}
Número personal del año: ${personalYearNumber}
Arquetipo Numerológico: ${archetype}

CARTA DEL TAROT DE MARSELLA ASOCIADA:
Carta: ${tarot.card}
Arquetipo Junguiano: ${tarot.jungArchetype}
Sombra: ${tarot.shadow}
Luz: ${tarot.light}

El informe debe incluir TODAS estas secciones con profundidad:

1. INTRODUCCIÓN
Explicación breve de numerología evolutiva, arquetipos y cómo influyen los números en la vida. Abre el informe como guía de autoconocimiento.

2. NÚMERO DE VIDA — ${destinyNumber}${isMaster ? ' (NÚMERO MAESTRO)' : ''}
Explicación completa: propósito de vida, talentos principales, desafíos evolutivos, lecciones del alma.
${isMaster ? `Como número maestro ${destinyNumber}, explica su significado espiritual, potencial extraordinario y responsabilidad energética.` : ''}

3. ARQUETIPO NUMEROLÓGICO — ${archetype}
Interpretación completa del arquetipo asociado al número de vida. Cómo se manifiesta en la personalidad y el propósito.

4. TAROT DE MARSELLA — LECTURA JUNGUIANA
Analiza en profundidad la carta del Tarot de Marsella: ${tarot.card}
Explica su iconografía en el Tarot de Marsella (colores, símbolos, personajes).
Conecta la carta con la psicología analítica de Carl Jung: el arquetipo que representa (${tarot.jungArchetype}), cómo aparece en la vida de ${userName}.
Describe la SOMBRA junguiana de esta carta: ${tarot.shadow}
Describe la LUZ y el potencial de integración: ${tarot.light}
Explica cómo el trabajo consciente con esta carta y su sombra puede transformar la vida de esta persona.

5. NÚMERO DEL ALMA — ${soulNumber}
Motivación profunda, deseos del corazón, emociones dominantes. Relación con el amor y conexión espiritual.

6. NÚMERO DE PERSONALIDAD — ${personalityNumber}
Cómo la persona es percibida. Energía social, primera impresión, modo de relacionarse.

7. TALENTOS Y EXPRESIÓN
Basado en el número de expresión ${expressionNumber || destinyNumber}. Creatividad, habilidades naturales, potencial profesional.

8. NÚMEROS KÁRMICOS
${karmicNumbers ? `Interpretación de los números kármicos: ${karmicNumbers}. Explica lecciones pendientes, patrones repetitivos y oportunidades de evolución.` : 'Si no hay números kármicos identificados, explica brevemente qué significan y que este perfil no los presenta.'}

9. ÁREAS DE VIDA
- Trabajo y vocación: tipo de trabajo alineado al número
- Relaciones: estilo afectivo
- Crecimiento personal: cómo evoluciona el alma
- Trabajo colectivo: rol dentro de grupos

10. AÑO PERSONAL — ${personalYearNumber}
Explicación del ciclo actual. Energía dominante, oportunidades, decisiones importantes.

11. EJERCICIO DE INTEGRACIÓN
Ejercicio de reflexión: journaling con preguntas de autoconocimiento específicas para este perfil numerológico y la carta del tarot.

12. MEDITACIÓN NUMEROLÓGICA
Meditación guiada corta (5 minutos) basada en el número de vida ${destinyNumber} y la energía de ${tarot.card}.

13. MENSAJE FINAL
Mensaje inspirador que sintetice el informe y motive al lector.

ESTILO: profundo, sabio, claro, inspirador. Integra la visión junguiana de manera natural, no académica.
EXTENSIÓN: 2500 a 3500 palabras.
FORMATO: Usa los títulos de sección indicados, párrafos bien desarrollados. No uses listas excesivas, prioriza prosa profunda y evocadora.`;
}

function buildMasterPremiumPrompt(data: Record<string, unknown>): string {
  const { userName, birthDate, destinyNumber, soulNumber, personalityNumber, expressionNumber, personalYearNumber, karmicNumbers } = data;
  const archetype = ARCHETYPES[destinyNumber as number] || ARCHETYPES[(destinyNumber as number) % 9 || 9];
  const isMaster = MASTER_NUMBERS.includes(destinyNumber as number);
  const tarot = getTarotForNumber(destinyNumber as number);
  const tarotSoul = getTarotForNumber(soulNumber as number);

  return `Actúa como numerólogo experto, analista de arquetipos junguianos, maestro del Tarot de Marsella y guía de evolución espiritual.

Genera un informe premium extremadamente profundo en español basado en:

Nombre completo: ${userName}
Fecha de nacimiento: ${birthDate}
Número de Vida: ${destinyNumber}${isMaster ? ' (NÚMERO MAESTRO — significado espiritual excepcional)' : ''}
Número del Alma: ${soulNumber}
Número de Personalidad: ${personalityNumber}
Número de Expresión: ${expressionNumber || destinyNumber}
Números kármicos: ${karmicNumbers || 'Ninguno identificado'}
Ciclos de vida: calcúlalos a partir de la fecha de nacimiento
Número personal del año: ${personalYearNumber}
Arquetipo central: ${archetype}

CARTA TAROT DE MARSELLA DEL NÚMERO DE VIDA:
Carta: ${tarot.card} | Arquetipo: ${tarot.jungArchetype} | Sombra: ${tarot.shadow} | Luz: ${tarot.light}

CARTA TAROT DE MARSELLA DEL NÚMERO DEL ALMA:
Carta: ${tarotSoul.card} | Arquetipo: ${tarotSoul.jungArchetype}

El informe debe incluir TODAS estas secciones con máxima profundidad:

1. INTRODUCCIÓN AL VIAJE DEL ALMA
2. PROPÓSITO DEL ALMA — Número ${destinyNumber}${isMaster ? ` (NÚMERO MAESTRO — ${archetype})` : ''}
3. ARQUETIPO MAESTRO — ${archetype}
4. TAROT DE MARSELLA — CARTA DE VIDA: ${tarot.card} (iconografía, lectura junguiana, sombra, proceso de individuación, ejercicio práctico)
5. TAROT DEL ALMA — CARTA ${soulNumber}: ${tarotSoul.card} (deseo del alma, diálogo entre ambas cartas)
6. TALENTOS Y POTENCIAL
7. DESAFÍOS KÁRMICOS${karmicNumbers ? ` — Números: ${karmicNumbers}` : ''}
8. CICLOS DE VIDA (tres grandes ciclos calculados)
9. RELACIONES Y VÍNCULOS
10. VOCACIÓN Y CAMINO PROFESIONAL
11. AÑO PERSONAL PROFUNDO — ${personalYearNumber}
12. PLAN DE EVOLUCIÓN PERSONAL (plan de 90 días)
13. MEDITACIÓN PROFUNDA (10 minutos, imaginación activa junguiana)
14. RITUAL NUMEROLÓGICO CON TAROT
15. MENSAJE DEL ALMA

ESTILO: sabio, espiritual, profundo, transformador. Jung integrado de forma natural, no académica.
EXTENSIÓN: 4500 a 6500 palabras.
FORMATO: títulos de sección claros, prosa rica y evocadora.`;
}

// ─── AI Generation ────────────────────────────────────────────────────────────

async function generateWithGemini(prompt: string, isPremium: boolean): Promise<string> {
  const geminiKey = Deno.env.get('GEMINI_API_KEY');
  if (!geminiKey) throw new Error('GEMINI_API_KEY not configured');

  // Use Gemini 1.5 Flash (free tier) for standard, Pro for premium
  const model = isPremium ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: isPremium ? 8192 : 4096,
        topP: 0.95,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Gemini returned empty response');
  return text;
}

async function generateWithOpenAI(prompt: string, isPremium: boolean): Promise<string> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: isPremium ? 8000 : 5000,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${errText}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned empty response');
  return text;
}

async function generateReport(prompt: string, isPremium: boolean): Promise<{ text: string; engine: string }> {
  // Try Gemini first (free tier)
  try {
    const text = await generateWithGemini(prompt, isPremium);
    return { text, engine: 'gemini' };
  } catch (geminiErr) {
    console.warn('Gemini failed, falling back to OpenAI:', geminiErr);
  }

  // Fallback to OpenAI
  try {
    const text = await generateWithOpenAI(prompt, isPremium);
    return { text, engine: 'openai' };
  } catch (openaiErr) {
    throw new Error(`Both AI engines failed. Gemini: check GEMINI_API_KEY. OpenAI: ${openaiErr}`);
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

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

    await supabase.from('orders').update({ status: 'processing' }).eq('id', orderId);

    const isPremium = order.report_type === 'master_premium';

    const promptData = {
      userName: order.user_name,
      birthDate: order.birth_date,
      destinyNumber: order.destiny_number,
      soulNumber: order.soul_number,
      personalityNumber: order.personality_number,
      expressionNumber: order.expression_number,
      personalYearNumber: order.personal_year_number,
      karmicNumbers: order.karmic_numbers,
    };

    const prompt = isPremium
      ? buildMasterPremiumPrompt(promptData)
      : buildCompleteReportPrompt(promptData);

    const { text: reportText, engine } = await generateReport(prompt, isPremium);

    console.log(`Report generated via ${engine} for order ${orderId} (${reportText.length} chars)`);

    await supabase
      .from('orders')
      .update({ status: 'completed', generated_report: reportText })
      .eq('id', orderId);

    // Auto-send email (non-blocking)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    fetch(`${supabaseUrl}/functions/v1/send-report-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ orderId }),
    }).then(res => console.log(`Auto-email triggered: ${res.status}`))
      .catch(err => console.warn('Auto-email non-critical error:', err));

    return new Response(JSON.stringify({ success: true, engine, reportLength: reportText.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Generate report error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
