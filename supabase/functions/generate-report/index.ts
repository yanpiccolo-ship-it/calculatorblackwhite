import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ARCHETYPES: Record<number, string> = {
  1: 'El Pionero', 2: 'El Mediador', 3: 'El Creador', 4: 'El Constructor',
  5: 'El Explorador', 6: 'El Cuidador', 7: 'El Sabio', 8: 'El Líder', 9: 'El Humanitario',
  11: 'El Visionario', 22: 'El Arquitecto del Mundo', 33: 'El Maestro del Amor', 44: 'El Maestro Constructor del Destino',
};

// Tarot de Marsella — Arcanos Mayores asociados a cada número de vida
// Según correspondencia tradicional y lectura junguiana
const TAROT_MARSEILLE: Record<number, { card: string; jungArchetype: string; shadow: string; light: string }> = {
  1:  { card: 'El Bagatto (El Mago) — Arcano I',      jungArchetype: 'El Héroe / El Yo consciente',       shadow: 'Manipulación, arrogancia, uso del poder sin ética',       light: 'Manifestación creativa, voluntad alineada, maestría de los propios recursos' },
  2:  { card: 'La Papesse (La Sacerdotisa) — Arcano II', jungArchetype: 'El Ánima / La Sabia Interior',   shadow: 'Secretismo, pasividad excesiva, bloqueo de la intuición',   light: 'Sabiduría intuitiva, conexión con el inconsciente, receptividad sagrada' },
  3:  { card: "L'Impératrice (La Emperatriz) — Arcano III", jungArchetype: 'La Gran Madre / Ánima fértil', shadow: 'Dependencia afectiva, sobreprotección, caos creativo',        light: 'Creatividad desbordante, amor incondicional, abundancia y expresión del alma' },
  4:  { card: "L'Empereur (El Emperador) — Arcano IV",  jungArchetype: 'El Padre / El Rey Interior',      shadow: 'Rigidez, control, autoritarismo, miedo al cambio',           light: 'Estructura sagrada, liderazgo con integridad, dominio de la realidad material' },
  5:  { card: 'Le Pape (El Hierofante) — Arcano V',    jungArchetype: 'El Sabio / El Guía espiritual',   shadow: 'Dogmatismo, conformismo, dependencia de la aprobación externa', light: 'Transmisión de conocimiento sagrado, puente entre lo humano y lo divino' },
  6:  { card: "L'Amoureux (El Enamorado) — Arcano VI", jungArchetype: 'El Ánima y el Ánimus en integración', shadow: 'Indecisión crónica, dependencia emocional, conflicto de valores', light: 'Elección consciente, integración de polaridades, amor como elección del alma' },
  7:  { card: 'Le Chariot (El Carro) — Arcano VII',    jungArchetype: 'El Guerrero / La Voluntad triunfante', shadow: 'Control rígido, victoria vacía, falta de integración emocional', light: 'Dominio de fuerzas internas opuestas, avance con propósito, conquista del destino' },
  8:  { card: 'La Justice (La Justicia) — Arcano VIII', jungArchetype: 'El Árbitro / La Conciencia Moral', shadow: 'Juicio implacable, frialdad, inflexibilidad moral',            light: 'Equilibrio kármico, discernimiento elevado, integridad en todas las decisiones' },
  9:  { card: "L'Hermite (El Ermitaño) — Arcano IX",   jungArchetype: 'El Viejo Sabio / El Sí-mismo profundo', shadow: 'Aislamiento patológico, soledad como huida, perfeccionismo estéril', light: 'Búsqueda interior luminosa, guía espiritual auténtica, sabiduría ganada en silencio' },
  11: { card: 'La Force (La Fuerza) — Arcano XI',      jungArchetype: 'El Domador / La Energía Integrada', shadow: 'Represión de la sombra, lucha constante con los instintos',   light: 'Integración del instinto y el espíritu, fuerza desde la compasión, coraje del alma' },
  22: { card: 'Le Mat (El Loco) — Arcano 0/XXII',      jungArchetype: 'El Trickster / El Espíritu Libre', shadow: 'Irresponsabilidad, huida de la realidad, caos sin propósito',  light: 'Libertad absoluta, confianza en el universo, potencial ilimitado del Arquitecto del Mundo' },
  33: { card: 'Les Amoureux — Arcano VI (vibración superior)', jungArchetype: 'El Maestro del Amor / La Integración Total', shadow: 'Sacrificio excesivo, martirio emocional, amor desde la herida', light: 'Amor incondicional como misión de vida, sanación colectiva a través de la presencia' },
  44: { card: 'L\'Empereur — Arcano IV (vibración superior)', jungArchetype: 'El Gran Constructor / El Hacedor de Realidades', shadow: 'Perfeccionismo paralizante, acumulación de poder, inflexibilidad extrema', light: 'Construcción de legados que trascienden lo personal, arquitectura del mundo desde la sabiduría' },
};

// Para números que no están en la tabla, calculamos el Arcano por reducción
function getTarotForNumber(n: number): { card: string; jungArchetype: string; shadow: string; light: string } {
  if (TAROT_MARSEILLE[n]) return TAROT_MARSEILLE[n];
  // Reducir a 1-9
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
Carta: ${tarot.card}
Arquetipo Junguiano: ${tarot.jungArchetype}
Sombra: ${tarot.shadow}
Luz: ${tarot.light}

CARTA TAROT DE MARSELLA DEL NÚMERO DEL ALMA:
Carta: ${tarotSoul.card}
Arquetipo: ${tarotSoul.jungArchetype}

El informe debe incluir TODAS estas secciones con máxima profundidad:

1. INTRODUCCIÓN AL VIAJE DEL ALMA
Cómo la numerología y el Tarot de Marsella revelan propósito, evolución y destino desde la psicología junguiana. Apertura transformadora.

2. PROPÓSITO DEL ALMA
Interpretación profunda del número de vida ${destinyNumber}. Misión espiritual, impacto en el mundo, evolución del alma.
${isMaster ? `Como número maestro ${destinyNumber} — ${archetype} — explica su rol espiritual extraordinario en la humanidad y el potencial transformador que conlleva.` : ''}

3. ARQUETIPO MAESTRO — ${archetype}
Explicación profunda del arquetipo central. Sus sombras, su luz, su misión. Cómo este arquetipo opera en la psique de ${userName}.

4. TAROT DE MARSELLA — CARTA DE VIDA: ${tarot.card}
Análisis completo e iconográfico de esta carta en el Tarot de Marsella tradicional (colores, símbolos, postura, elementos).
Lectura junguiana profunda: cómo esta carta encarna el arquetipo de ${tarot.jungArchetype} en la vida de ${userName}.
LA SOMBRA JUNGUIANA: análisis detallado de ${tarot.shadow} — cómo se manifiesta en patrones inconscientes, relaciones y decisiones.
EL PROCESO DE INDIVIDUACIÓN: cómo integrar la sombra para llegar a la luz de ${tarot.light}.
Ejercicio práctico de trabajo con esta carta (contemplación activa, técnica junguiana).

5. TAROT DEL ALMA — CARTA DEL NÚMERO ${soulNumber}: ${tarotSoul.card}
Lectura del deseo más profundo del alma a través de esta carta. Cómo se complementa con la carta de vida.
El diálogo entre ${tarot.card} y ${tarotSoul.card}: tensión creativa y potencial de integración.

6. TALENTOS Y POTENCIAL
Interpretación avanzada del número de expresión ${expressionNumber || destinyNumber}. Dones únicos y cómo manifestarlos.

7. DESAFÍOS KÁRMICOS
Interpretación profunda de los patrones repetitivos, lecciones del alma y contratos kármicos. ${karmicNumbers ? `Números: ${karmicNumbers}` : 'Análisis de la ausencia de deuda kármica y su significado.'}

8. CICLOS DE VIDA
Explicación de los tres grandes ciclos: primer ciclo (formación), segundo ciclo (productividad), tercer ciclo (realización). Qué le corresponde vivir a ${userName} en cada uno.

9. RELACIONES Y VÍNCULOS
Análisis numerológico de amor, familia y asociaciones. Patrones relacionales, compatibilidades y el propósito de los vínculos en su vida. Cómo la energía de ${tarot.card} influye en su modo de relacionarse.

10. VOCACIÓN Y CAMINO PROFESIONAL
Vocación natural, estilo de liderazgo, misión laboral. Cómo alinear el trabajo con el propósito del alma y el arquetipo de ${archetype}.

11. AÑO PERSONAL PROFUNDO — ${personalYearNumber}
Análisis estratégico del ciclo actual. Decisiones clave, oportunidades, energías a trabajar y cómo navegar este año con consciencia.

12. PLAN DE EVOLUCIÓN PERSONAL
Acciones concretas: hábitos específicos, decisiones estratégicas, enfoque espiritual. Plan de 90 días de transformación integrando numerología y Tarot de Marsella.

13. MEDITACIÓN PROFUNDA
Meditación guiada de 10 minutos para conectar con la esencia del número ${destinyNumber} y la imagen de ${tarot.card}. Detallada, evocadora, transformadora. Usa la técnica de imaginación activa de Jung.

14. RITUAL NUMEROLÓGICO CON TAROT
Ritual energético específico combinando el número de vida ${destinyNumber} con la energía de ${tarot.card}. Paso a paso. Cómo usar la carta del Tarot de Marsella como espejo del alma.

15. MENSAJE DEL ALMA
Cierre poderoso, transformador, como si el alma misma hablara a través de las palabras y la sabiduría de ${tarot.card}.

ESTILO: sabio, espiritual, profundo, transformador. Integra la perspectiva junguiana de manera natural y accesible, no académica ni fría.
EXTENSIÓN: 4500 a 6500 palabras.
FORMATO: Usa los títulos de sección indicados. Prosa rica, evocadora, poética en los momentos adecuados. Párrafos bien desarrollados.`;
}

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

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your secrets.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    const prompt = order.report_type === 'master_premium'
      ? buildMasterPremiumPrompt(promptData)
      : buildCompleteReportPrompt(promptData);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: order.report_type === 'master_premium' ? 8000 : 5000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      await supabase.from('orders').update({ status: 'pending' }).eq('id', orderId);
      return new Response(JSON.stringify({ error: 'AI generation failed', detail: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await response.json();
    const reportText = aiData.choices?.[0]?.message?.content || '';

    await supabase
      .from('orders')
      .update({ status: 'completed', generated_report: reportText })
      .eq('id', orderId);

    // Try to send email automatically (non-blocking — won't fail the whole request)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
      await fetch(`${supabaseUrl}/functions/v1/send-report-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ orderId }),
      });
    } catch (emailErr) {
      console.warn('Auto-email send failed (non-critical):', emailErr);
    }

    return new Response(JSON.stringify({ success: true, reportLength: reportText.length }), {
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
