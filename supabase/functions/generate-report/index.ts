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

const MASTER_NUMBERS = [11, 22, 33, 44];

function buildCompleteReportPrompt(data: Record<string, unknown>): string {
  const { userName, birthDate, destinyNumber, soulNumber, personalityNumber, expressionNumber, personalYearNumber, karmicNumbers } = data;
  const archetype = ARCHETYPES[destinyNumber as number] || ARCHETYPES[(destinyNumber as number) % 9 || 9];
  const isMaster = MASTER_NUMBERS.includes(destinyNumber as number);

  return `Actúa como numerólogo experto en arquetipos, evolución del alma y crecimiento personal.

Genera un informe profundo de numerología y arquetipos en español basado en los siguientes datos:

Nombre completo: ${userName}
Fecha de nacimiento: ${birthDate}
Número de Vida (Destino): ${destinyNumber}${isMaster ? ' (NÚMERO MAESTRO)' : ''}
Número del Alma: ${soulNumber}
Número de Personalidad: ${personalityNumber}
Número de Expresión: ${expressionNumber || destinyNumber}
Números kármicos: ${karmicNumbers || 'Ninguno identificado'}
Número personal del año: ${personalYearNumber}
Arquetipo: ${archetype}

El informe debe incluir TODAS estas secciones con profundidad:

1. INTRODUCCIÓN
Explicación breve de numerología evolutiva, arquetipos y cómo influyen los números en la vida. Abre el informe como guía de autoconocimiento.

2. NÚMERO DE VIDA — ${destinyNumber}${isMaster ? ' (NÚMERO MAESTRO)' : ''}
Explicación completa: propósito de vida, talentos principales, desafíos evolutivos, lecciones del alma.
${isMaster ? `Como número maestro ${destinyNumber}, explica su significado espiritual, potencial extraordinario y responsabilidad energética.` : ''}

3. ARQUETIPO NUMEROLÓGICO — ${archetype}
Interpretación completa del arquetipo asociado al número de vida. Cómo se manifiesta en la personalidad y el propósito.

4. NÚMERO DEL ALMA — ${soulNumber}
Motivación profunda, deseos del corazón, emociones dominantes. Relación con el amor y conexión espiritual.

5. NÚMERO DE PERSONALIDAD — ${personalityNumber}
Cómo la persona es percibida. Energía social, primera impresión, modo de relacionarse.

6. TALENTOS Y EXPRESIÓN
Basado en el número de expresión ${expressionNumber || destinyNumber}. Creatividad, habilidades naturales, potencial profesional.

7. NÚMEROS KÁRMICOS
${karmicNumbers ? `Interpretación de los números kármicos: ${karmicNumbers}. Explica lecciones pendientes, patrones repetitivos y oportunidades de evolución.` : 'Si no hay números kármicos identificados, explica brevemente qué significan y que este perfil no los presenta.'}

8. ÁREAS DE VIDA
- Trabajo y vocación: tipo de trabajo alineado al número
- Relaciones: estilo afectivo
- Crecimiento personal: cómo evoluciona el alma
- Trabajo colectivo: rol dentro de grupos

9. AÑO PERSONAL — ${personalYearNumber}
Explicación del ciclo actual. Energía dominante, oportunidades, decisiones importantes.

10. EJERCICIO DE INTEGRACIÓN
Ejercicio de reflexión: journaling con preguntas de autoconocimiento específicas para este perfil numerológico.

11. MEDITACIÓN NUMEROLÓGICA
Meditación guiada corta (5 minutos) basada en el número de vida ${destinyNumber}.

12. MENSAJE FINAL
Mensaje inspirador que sintetice el informe y motive al lector.

ESTILO: profundo, sabio, claro, inspirador.
EXTENSIÓN: 2500 a 3500 palabras.
FORMATO: Usa los títulos de sección indicados, párrafos bien desarrollados. No uses listas excesivas, prioriza prosa profunda y evocadora.`;
}

function buildMasterPremiumPrompt(data: Record<string, unknown>): string {
  const { userName, birthDate, destinyNumber, soulNumber, personalityNumber, expressionNumber, personalYearNumber, karmicNumbers } = data;
  const archetype = ARCHETYPES[destinyNumber as number] || ARCHETYPES[(destinyNumber as number) % 9 || 9];
  const isMaster = MASTER_NUMBERS.includes(destinyNumber as number);

  return `Actúa como numerólogo experto, analista de arquetipos y guía de evolución espiritual.

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

El informe debe incluir TODAS estas secciones con máxima profundidad:

1. INTRODUCCIÓN AL VIAJE DEL ALMA
Cómo la numerología revela propósito, evolución y destino. Apertura transformadora.

2. PROPÓSITO DEL ALMA
Interpretación profunda del número de vida ${destinyNumber}. Misión espiritual, impacto en el mundo, evolución del alma.
${isMaster ? `Como número maestro ${destinyNumber} — ${archetype} — explica su rol espiritual extraordinario en la humanidad y el potencial transformador que conlleva.` : ''}

3. ARQUETIPO MAESTRO — ${archetype}
Explicación profunda del arquetipo central. Sus sombras, su luz, su misión.

4. TALENTOS Y POTENCIAL
Interpretación avanzada del número de expresión ${expressionNumber || destinyNumber}. Dones únicos y cómo manifestarlos.

5. DESAFÍOS KÁRMICOS
Interpretación profunda de los patrones repetitivos, lecciones del alma y contratos kármicos. ${karmicNumbers ? `Números: ${karmicNumbers}` : 'Análisis de la ausencia de deuda kármica y su significado.'}

6. CICLOS DE VIDA
Explicación de los tres grandes ciclos: primer ciclo (formación), segundo ciclo (productividad), tercer ciclo (realización). Qué le corresponde vivir a ${userName} en cada uno.

7. RELACIONES Y VÍNCULOS
Análisis numerológico de amor, familia y asociaciones. Patrones relacionales, compatibilidades y el propósito de los vínculos en su vida.

8. VOCACIÓN Y CAMINO PROFESIONAL
Vocación natural, estilo de liderazgo, misión laboral. Cómo alinear el trabajo con el propósito del alma.

9. AÑO PERSONAL PROFUNDO — ${personalYearNumber}
Análisis estratégico del ciclo actual. Decisiones clave, oportunidades, energías a trabajar y cómo navegar este año con consciencia.

10. PLAN DE EVOLUCIÓN PERSONAL
Acciones concretas: hábitos específicos, decisiones estratégicas, enfoque espiritual. Plan de 90 días de transformación.

11. MEDITACIÓN PROFUNDA
Meditación guiada de 10 minutos para conectar con la esencia del número ${destinyNumber}. Detallada, evocadora, transformadora.

12. RITUAL NUMEROLÓGICO
Ejercicio energético específico para activar y potenciar el número de vida ${destinyNumber}. Paso a paso.

13. MENSAJE DEL ALMA
Cierre poderoso, transformador, como si el alma misma hablara a través de las palabras.

ESTILO: sabio, espiritual, profundo, transformador. Como una lectura que cambia la vida.
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
