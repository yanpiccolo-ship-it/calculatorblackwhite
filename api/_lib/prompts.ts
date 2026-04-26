// Master prompts for AI report generation, derived from the
// "NumerologyCalculatorBW_MasterPrompt_Informes" PDF.

import type { NumerologyProfile } from './numerologyServer';

export type ProductKey = 'premium_pdf' | 'complete_report' | 'master_premium';

const LANG_NAME: Record<string, string> = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  it: 'Italian',
  de: 'German',
  pt: 'Portuguese',
  ru: 'Russian',
};

interface BuildArgs {
  product: ProductKey;
  profile: NumerologyProfile;
  language?: string;
}

interface BuiltPrompt {
  system: string;
  user: string;
  model: string;
  temperature: number;
  maxTokens: number;
  wordRange: [number, number];
  title: string;
}

const COMMON_STYLE = `Estilo: profundo, sabio, claro, inspirador, espiritual.
Estructura el texto en secciones bien diferenciadas con encabezados Markdown (##).
Reconoce siempre los números maestros (11, 22, 33, 44) y profundiza en su responsabilidad espiritual cuando aparezcan.
Integra interpretación arquetípica para cada número (ej: 1 — El Pionero, 22 — El Arquitecto del Mundo, 44 — El Maestro Constructor del Destino).
Incluye SIEMPRE: meditación guiada, ejercicio práctico de integración y mensaje final inspirador.`;

const PRODUCT_TITLES: Record<ProductKey, string> = {
  premium_pdf: 'Initial Insight Report',
  complete_report: 'Complete Report — Fundamental Guidance',
  master_premium: 'Master Premium Report — Absolute Revelation',
};

const PRODUCT_WORD_RANGES: Record<ProductKey, [number, number]> = {
  premium_pdf: [1200, 1800],
  complete_report: [2500, 3500],
  master_premium: [4500, 6500],
};

function profileBlock(p: NumerologyProfile): string {
  return `Nombre completo: ${p.fullName}
Fecha de nacimiento: ${p.birthDate}
Número de vida (Life Path): ${p.lifePath}${p.isMaster ? ' ★ MAESTRO' : ''}
Número del alma: ${p.soul}
Número de personalidad: ${p.personality}
Número de expresión / destino: ${p.expression}
Año personal actual: ${p.personalYear}
Números kármicos detectados: ${p.karmic.length ? p.karmic.join(', ') : 'ninguno'}`;
}

export function buildPrompt({ product, profile, language = 'en' }: BuildArgs): BuiltPrompt {
  const langName = LANG_NAME[language] ?? 'English';
  const [minW, maxW] = PRODUCT_WORD_RANGES[product];
  const data = profileBlock(profile);

  if (product === 'premium_pdf') {
    return {
      title: PRODUCT_TITLES[product],
      model: 'gpt-4o',
      temperature: 0.85,
      maxTokens: 3500,
      wordRange: [minW, maxW],
      system: `Eres un numerólogo experto en arquetipos, evolución del alma y crecimiento personal.
Generas el "Initial Insight Report" — el primer informe de pago, puente entre el lead magnet gratuito y los informes superiores.
Debe sentirse como una primera revelación útil y aplicable.
${COMMON_STYLE}
IMPORTANTE: escribe TODO el informe en ${langName}.`,
      user: `Genera el Initial Insight Report con base en estos datos:

${data}

Estructura obligatoria:
1. Saludo personalizado y propósito del informe.
2. Tu Número de Vida: arquetipo central, propósito y don principal.
3. Tu Número del Alma: motivación profunda y deseos del corazón.
4. Tu Número de Personalidad: cómo te perciben los demás.
5. Tu Año Personal (${profile.personalYear}): energía dominante y oportunidades del ciclo actual.
6. Aplicación práctica: 3 acciones concretas para esta semana.
7. Meditación corta (5 minutos) basada en tu número de vida.
8. Mensaje final inspirador.

Extensión: ${minW}–${maxW} palabras. Tono cercano, claro y directo.`,
    };
  }

  if (product === 'complete_report') {
    return {
      title: PRODUCT_TITLES[product],
      model: 'gpt-4o',
      temperature: 0.85,
      maxTokens: 6000,
      wordRange: [minW, maxW],
      system: `Eres un numerólogo experto en arquetipos, evolución del alma y crecimiento personal.
Generas el "Complete Report — Fundamental Guidance".
${COMMON_STYLE}
IMPORTANTE: escribe TODO el informe en ${langName}.`,
      user: `Genera un informe profundo de numerología y arquetipos basado en:

${data}

Estructura obligatoria (12 secciones):
1. Introducción a la numerología evolutiva y los arquetipos.
2. Número de Vida: propósito de vida, talentos principales, desafíos evolutivos, lecciones del alma. Si es maestro (11/22/33/44) explica significado, potencial espiritual y responsabilidad energética.
3. Arquetipo Numerológico (1—El Pionero, 2—El Mediador, 3—El Creador, 4—El Constructor, 5—El Explorador, 6—El Cuidador, 7—El Sabio, 8—El Líder, 9—El Humanitario, 11—El Visionario, 22—El Arquitecto del Mundo, 33—El Maestro del Amor, 44—El Maestro Constructor del Destino).
4. Número del Alma: motivación profunda, deseos del corazón, conexión espiritual y relación con el amor.
5. Número de Personalidad: energía social, primera impresión, modo de relacionarse.
6. Talentos y Expresión: creatividad, habilidades naturales, potencial profesional.
7. Números Kármicos (13, 14, 16, 19): si aplican, explica lecciones pendientes y oportunidades.
8. Áreas de Vida: trabajo y vocación, relaciones, crecimiento personal, trabajo colectivo.
9. Año Personal (${profile.personalYear}): energía dominante, oportunidades, decisiones importantes.
10. Ejercicio de integración (journaling con preguntas de autoconocimiento).
11. Meditación numerológica guiada de 5 minutos basada en el número de vida.
12. Mensaje final inspirador.

Extensión: ${minW}–${maxW} palabras.`,
    };
  }

  // master_premium
  return {
    title: PRODUCT_TITLES[product],
    model: 'gpt-4o',
    temperature: 0.9,
    maxTokens: 9000,
    wordRange: [minW, maxW],
    system: `Eres un numerólogo experto, analista de arquetipos y guía de evolución espiritual.
Generas el "Master Premium Report — Absolute Revelation": una lectura transformadora del alma.
${COMMON_STYLE}
IMPORTANTE: escribe TODO el informe en ${langName}.`,
    user: `Genera un informe premium extremadamente profundo basado en:

${data}

Estructura obligatoria (13 secciones):
1. Introducción al viaje del alma: cómo la numerología revela propósito, evolución y destino.
2. Propósito del Alma — interpretación profunda del número de vida: misión espiritual, impacto en el mundo, evolución del alma. Si es maestro, explica rol espiritual en la humanidad.
3. Arquetipo Maestro central — interpretación arquetípica completa.
4. Talentos y Potencial — interpretación avanzada del número de expresión.
5. Desafíos Kármicos — patrones repetitivos y lecciones del alma (incluye los kármicos detectados: ${profile.karmic.join(', ') || 'analizar también ausencia de kármicos'}).
6. Ciclos de Vida — primer ciclo (formación), segundo ciclo (productividad), tercer ciclo (sabiduría), explicando cada uno con su número regente.
7. Relaciones y Vínculos — análisis numerológico del amor, familia y asociaciones.
8. Vocación y Camino Profesional — vocación natural, estilo de liderazgo, misión laboral.
9. Año Personal Profundo (${profile.personalYear}) — análisis estratégico, decisiones clave, oportunidades.
10. Plan de Evolución Personal — hábitos, decisiones, enfoque espiritual con acciones concretas.
11. Meditación profunda guiada de 10 minutos.
12. Ritual numerológico para activar el número de vida.
13. Mensaje del alma — cierre poderoso.

Extensión: ${minW}–${maxW} palabras. Estilo: sabio, espiritual, profundo, transformador.`,
  };
}

export function getProductTitle(product: ProductKey): string {
  return PRODUCT_TITLES[product];
}
