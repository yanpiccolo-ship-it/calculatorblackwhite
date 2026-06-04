// Master prompts — Numerología Evolutiva con Arquetipos de Jung
// Enhanced: adds Vocación, Pareja/Relaciones, Aprendizajes, Propósito, Ciclos

import type { NumerologyProfile } from './numerologyServer';

export type ProductKey = 'premium_pdf' | 'complete_report' | 'master_premium' | 'brand_report';

const LANG_NAME: Record<string, string> = {
  en: 'English', es: 'Spanish', fr: 'French', it: 'Italian',
  de: 'German', pt: 'Portuguese', zh: 'Chinese', ja: 'Japanese', ru: 'Russian',
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

const PRODUCT_TITLES: Record<ProductKey, string> = {
  premium_pdf: 'Initial Insight Report',
  complete_report: 'Complete Report — Fundamental Guidance',
  master_premium: 'Master Premium Report — Absolute Revelation',
  brand_report: 'Brand Numerology Report — Complete Identity',
};

const PRODUCT_WORD_RANGES: Record<ProductKey, [number, number]> = {
  premium_pdf:     [1500, 2200],
  complete_report: [3000, 4500],
  master_premium:  [5500, 8000],
  brand_report:    [2500, 3500],
};

// Jung archetypes mapped to numerology (for prompt context)
const JUNG_ARCHETYPES: Record<number, string> = {
  1: 'El Héroe (The Hero) — trailblazer, independent, driven to forge a new path.',
  2: 'El Amante (The Lover) — connector, empathetic, motivated by relationship and beauty.',
  3: 'El Bufón/Creador (The Jester/Creator) — joyful, expressive, moves through creativity and play.',
  4: 'El Cuidador (The Caregiver) — devoted, responsible, serves from strength not guilt.',
  5: 'El Explorador (The Explorer) — freedom-seeking, curious, never truly settled.',
  6: 'El Sabio (The Sage) — truth-seeking, analytical, values knowledge above comfort.',
  7: 'El Sabio Hermético (The Hermit/Sage) — introspective, mystical, withdraws to find depth.',
  8: 'El Gobernante (The Ruler) — authoritative, strategic, creates order and abundance.',
  9: 'El Inocente/Humanitario (The Innocent/Everyman) — optimistic, compassionate, seeks universal love.',
  11: 'El Visionario / Mago (The Visionary/Magician) — intuitive channel between worlds, inspires transformation.',
  22: 'El Arquitecto / Rey (The Architect/King) — brings heavenly blueprints into earthly reality.',
  33: 'El Gran Maestro / Ama (The Great Teacher/Lover) — embodies unconditional love, teaches through being.',
  44: 'El Constructor Maestro (The Master Builder) — builds enduring structures that serve generations.',
};

const COMMON_STYLE = `ESTILO: profundo, sabio, inspirador, espiritual y aplicable. Sin clichés.
Formato: secciones con encabezados Markdown ##. Listas con guiones donde ayude.
IMPORTANTE: Reconoce siempre los números maestros (11, 22, 33, 44) y su responsabilidad espiritual.
Cada arquetipo de Jung debe conectarse explícitamente con el número del consultante.`;

function profileBlock(p: NumerologyProfile): string {
  const jungNote = JUNG_ARCHETYPES[p.lifePath] ?? '';
  return `Nombre completo: ${p.fullName}
Fecha de nacimiento: ${p.birthDate}
Número de vida (Life Path): ${p.lifePath}${p.isMaster ? ' ★ MAESTRO' : ''}
Arquetipo de Jung asociado: ${jungNote}
Número del alma: ${p.soul}
Número de personalidad: ${p.personality}
Número de expresión / destino: ${p.expression}
Año personal actual: ${p.personalYear}
Números kármicos: ${p.karmic.length ? p.karmic.join(', ') : 'ninguno'}`;
}

export function buildPrompt({ product, profile, language = 'en' }: BuildArgs): BuiltPrompt {
  // Brand reports use a dedicated prompt builder
  if (product === 'brand_report') {
    return buildBrandPrompt({ profile, language });
  }

  const langName = LANG_NAME[language] ?? 'English';
  const [minW, maxW] = PRODUCT_WORD_RANGES[product];
  const data = profileBlock(profile);

  // ── INITIAL INSIGHT ────────────────────────────────────────────────────
  if (product === 'premium_pdf') {
    return {
      title: PRODUCT_TITLES[product],
      model: 'gemini-1.5-flash',
      temperature: 0.85,
      maxTokens: 4000,
      wordRange: [minW, maxW],
      system: `Eres un numerólogo profesional especializado en arquetipos de Jung, evolución del alma y desarrollo personal aplicado.
Generas el "Initial Insight Report" — la primera revelación numerológica de pago.
Debe sentirse como una lectura profunda, personal y aplicable desde el primer párrafo.
${COMMON_STYLE}
IMPORTANTE: escribe TODO el informe en ${langName}.`,
      user: `Genera el Initial Insight Report con base en estos datos:

${data}

ESTRUCTURA OBLIGATORIA (8 secciones):

## 1. Apertura energética
Saludo cálido y personalizado. Explica el propósito del informe y qué revelará.

## 2. Tu Número de Vida: ${p.lifePath}${p.isMaster ? ' ★ MAESTRO' : ''}
Arquetipo de Jung: ${JUNG_ARCHETYPES[p.lifePath] ?? ''}
Explica propósito central, don principal, desafío evolutivo y cómo se manifiesta en la vida cotidiana.

## 3. Alma y Personalidad
Número del Alma ${p.soul}: motivación profunda, deseos del corazón, lo que te nutre.
Número de Personalidad ${p.personality}: cómo te perciben, primera impresión, energía social.

## 4. Año Personal ${p.personalYear}: el clima de este ciclo
Energía dominante, oportunidades concretas, qué decisiones favorece este año.

## 5. Vocación y vida laboral
Qué tipo de trabajo o entorno alimenta tu número de vida. Talentos naturales para el ámbito profesional. Qué deberías evitar y hacia dónde apuntar.

## 6. Pareja y relaciones
Cómo el ${p.soul} afecta tus vínculos afectivos. Qué buscas en una pareja. Patrones relacionales que podrías sanar.

## 7. Acciones prácticas: 3 pasos para esta semana
Tres acciones concretas, aplicables hoy, alineadas con la energía de tu mapa numerológico.

## 8. Meditación y cierre
Meditación guiada de 5 minutos basada en tu número de vida.
Mensaje final inspirador y personalizado.

Extensión: ${minW}–${maxW} palabras. Tono cercano, claro y profundo.`,
    };
  }

  // ── COMPLETE REPORT ────────────────────────────────────────────────────
  if (product === 'complete_report') {
    return {
      title: PRODUCT_TITLES[product],
      model: 'gemini-1.5-flash',
      temperature: 0.85,
      maxTokens: 7000,
      wordRange: [minW, maxW],
      system: `Eres un experto en numerología evolutiva, arquetipos de Jung y psicología transpersonal.
Generas el "Complete Report — Fundamental Guidance": una lectura completa de identidad numerológica.
${COMMON_STYLE}
IMPORTANTE: escribe TODO el informe en ${langName}.`,
      user: `Genera el Complete Report con base en estos datos:

${data}

ESTRUCTURA OBLIGATORIA (13 secciones):

## 1. Introducción: el lenguaje de los números
Explica qué es la numerología evolutiva y cómo los arquetipos de Jung se integran en esta lectura.

## 2. Número de Vida: ${p.lifePath}${p.isMaster ? ' ★ MAESTRO' : ''} — Propósito y Misión
Propósito de vida, talentos principales, desafíos evolutivos, lecciones del alma.
${p.isMaster ? 'Explica el rol espiritual especial del número maestro y su responsabilidad energética.' : ''}

## 3. Arquetipo de Jung: ${JUNG_ARCHETYPES[p.lifePath] ?? 'el arquetipo central'}
Análisis profundo del arquetipo asociado. Cómo se manifiesta en la sombra y en la luz. Integración práctica.

## 4. Alma y corazón: Número del Alma ${p.soul}
Motivación profunda, deseos del corazón, conexión espiritual y qué te da verdadera satisfacción.

## 5. Personalidad y expresión social: ${p.personality} y ${p.expression}
Cómo te relacionas, tu energía social, talentos creativos y potencial de expresión.

## 6. Vocación, trabajo y potencial profesional
Análisis detallado del camino vocacional según tu mapa numerológico. Entornos ideales, estilo de liderazgo, talentos que el mercado puede valorar. Qué tipo de trabajo drena tu energía y qué la eleva.

## 7. Pareja, amor y compatibilidad energética
Patrones afectivos según el número del alma. Lo que buscas (consciente e inconscientemente) en una pareja. Dinámicas de pareja que potencian o bloquean tu crecimiento. Cómo amar desde tu número.

## 8. Familia y vínculos profundos
Rol en la familia de origen y en la que construyes. Patrones de apego y cómo sanarlos.

## 9. Aprendizajes y habilidades por desarrollar
Qué habilidades, conocimientos o áreas de vida pide tu número de vida que expandas en esta etapa. Cómo aprendes mejor. Qué sabidurías aún están dormidas.

## 10. Números kármicos: ${p.karmic.length ? p.karmic.join(', ') : 'sin kármicos detectados'}
${p.karmic.length ? 'Análisis de cada número kármico: lección pendiente, patrones repetitivos y cómo integrarlo.' : 'Explica qué significa no tener kármicos y cómo aprovechar esta libertad.'}

## 11. Año Personal ${p.personalYear}: estrategia de este ciclo
Energía dominante, oportunidades únicas, decisiones clave, qué cerrar y qué abrir.

## 12. Ejercicio de integración (journaling)
5 preguntas de autoconocimiento profundo, con espacio para reflexión genuina.

## 13. Meditación + mensaje final
Meditación numerológica guiada de 7 minutos. Mensaje inspirador personalizado y poderoso.

Extensión: ${minW}–${maxW} palabras.`,
    };
  }

  // ── MASTER PREMIUM ─────────────────────────────────────────────────────
  return {
    title: PRODUCT_TITLES[product],
    model: 'gemini-1.5-flash',
    temperature: 0.9,
    maxTokens: 12000,
    wordRange: [minW, maxW],
    system: `Eres un maestro en numerología sagrada, arquetipos de Jung, astrología del alma y evolución espiritual.
Generas el "Master Premium Report — Absolute Revelation": la lectura más completa y transformadora posible.
Cada sección debe ser profunda, original y conectada con la realidad específica del consultante.
${COMMON_STYLE}
IMPORTANTE: escribe TODO el informe en ${langName}.`,
    user: `Genera el Master Premium Report con base en estos datos:

${data}

ESTRUCTURA OBLIGATORIA (15 secciones):

## 1. Activación del campo de conciencia
Apertura poderosa. Prepara al lector para una lectura transformadora. Explica el sistema numerológico y junguiano que se usará.

## 2. Mapa del alma completo
Síntesis de los 5 números principales: ${p.lifePath}, ${p.soul}, ${p.personality}, ${p.expression}, ${p.personalYear}. Cómo dialogan entre sí como un sistema vivo.

## 3. Propósito de vida y misión espiritual: Número ${p.lifePath}${p.isMaster ? ' ★ MAESTRO' : ''}
Misión espiritual profunda. Impacto en el mundo. Evolución del alma. El regalo único de este número al colectivo.
${p.isMaster ? 'Explica el rol espiritual de este número maestro en la humanidad y la responsabilidad que conlleva.' : ''}

## 4. Arquetipo de Jung: ${JUNG_ARCHETYPES[p.lifePath] ?? ''}
Análisis arquetípico completo: la luz y la sombra del arquetipo, su historia universal, cómo vive en esta persona específica, cómo integrarlo conscientemente. Relación entre el arquetipo y los números del alma y personalidad.

## 5. Ciclos de vida: pasado, presente y futuro
Primer ciclo (formación), segundo ciclo (productividad), tercer ciclo (sabiduría). Qué regente numérológico rige cada fase. En qué ciclo se encuentra el consultante ahora.

## 6. Karma y patrones de liberación
${p.karmic.length ? `Números kármicos: ${p.karmic.join(', ')}. Análisis profundo de cada uno: qué patrón señala, cómo se manifiesta en la vida real, y cuál es el camino de liberación.` : 'Sin kármicos: lo que esto revela sobre el estado del alma y cómo aprovechar esta libertad para construir.'}
Patrones repetitivos generales del mapa y cómo disolver los que ya no sirven.

## 7. Talentos y potencial sin explotar
Análisis del número de expresión ${p.expression}. Talentos visibles y dormidos. Dones que el miedo ha silenciado. Potencial real vs potencial actualizado. Qué pequeño paso activa el talento mayor.

## 8. Vocación, camino profesional y abundancia
Análisis profundo de la vocación auténtica. Entornos que elevan esta vibración. Estilo de liderazgo natural. Qué tipo de trabajo genera flujo (estado de flow). Relación del mapa numerológico con la abundancia material. Qué creencias bloquean el éxito económico.

## 9. Pareja, amor y vínculos del alma
Patrones afectivos profundos. Tipo de amor que el alma pide vs lo que la mente cree querer. Dinámicas de codependencia o independencia. Qué tipo de pareja eleva esta vibración. Cómo amar desde la plenitud, no desde la carencia. Aprendizajes kármicos en el amor.

## 10. Familia, linaje y árbol genealógico energético
Rol en el sistema familiar. Patrones heredados (lealtades invisibles, mandatos familiares). Cómo sanar el linaje desde la conciencia individual.

## 11. Aprendizajes espirituales de esta encarnación
Qué sabidurías está aquí a aprender. Áreas de crecimiento acelerado. Tipo de maestros o situaciones que la vida envía para esta alma. Cómo convertir crisis en iniciaciones.

## 12. Año Personal ${p.personalYear}: análisis estratégico profundo
Energía dominante este año. Decisiones clave. Lo que hay que cerrar antes de fin de año. Lo que hay que sembrar. Meses de mayor potencial. Riesgos y cómo neutralizarlos.

## 13. Plan de evolución personal: los próximos 12 meses
Hábitos concretos según el mapa (diarios, semanales, mensuales). Decisiones importantes que tomar este ciclo. Enfoque espiritual: práctica, estudio, transformación interior. Una acción prioritaria para comenzar esta semana.

## 14. Meditación profunda guiada (12 minutos)
Meditación completa paso a paso. Visualización específica con los números del consultante. Mantra o afirmación personalizada.

## 15. Ritual numerológico + mensaje del alma
Ritual personalizado con elementos simbólicos asociados al número de vida. Instrucciones claras paso a paso.
Cierre: el mensaje más poderoso y amoroso que el alma del consultante necesita escuchar hoy.

Extensión: ${minW}–${maxW} palabras. Estilo: sabio, transformacional, profundo, sin clichés.`,
  };
}

// ── BRAND REPORT ──────────────────────────────────────────────────────────
function buildBrandPrompt({ profile, language = 'en' }: { profile: NumerologyProfile; language?: string }): BuiltPrompt {
  const langName = LANG_NAME[language] ?? 'English';
  const [minW, maxW] = PRODUCT_WORD_RANGES['brand_report'];
  const archetype = JUNG_ARCHETYPES[profile.lifePath] ?? '';

  return {
    title: PRODUCT_TITLES['brand_report'],
    model: 'gemini-1.5-flash',
    temperature: 0.87,
    maxTokens: 6000,
    wordRange: [minW, maxW],
    system: `Eres un experto en branding estratégico, numerología aplicada al mundo empresarial y arquetipos de Jung.
Generas el "Brand Numerology Report": una análisis completo de la identidad numerológica de una marca o empresa.
El informe debe sentirse como un brief de estrategia de marca de alto nivel, combinando numerología sagrada con branding moderno.
Estilo: profesional, estratégico, inspirador. Usa Markdown con secciones ##. Sin clichés.
IMPORTANTE: escribe TODO el informe en ${langName}.`,
    user: `Genera el Brand Numerology Report completo para esta marca:

Nombre de la marca: ${profile.fullName}
Número de marca (Expresión / Destino): ${profile.destiny}
Número del alma de la marca (vocales): ${profile.soul}
Número de personalidad (consonantes): ${profile.personality}
Año de energía actual: ${profile.personalYear}
Arquetipo de Jung: ${archetype}

ESTRUCTURA OBLIGATORIA (11 secciones):

## 1. ADN Numerológico de la Marca
Introducción poderosa. El mapa energético completo de "${profile.fullName}": los tres números principales y cómo trabajan juntos para crear una identidad de marca única.

## 2. Número de Marca ${profile.destiny}: Propósito Central
Qué propósito fundamental expresa este número. Qué impacto tiene en el mercado. Cómo se manifiesta en la identidad de la marca. Fortalezas inherentes a este número en el mundo empresarial.

## 3. Arquetipo de Marca: ${archetype}
Análisis profundo del arquetipo en el contexto del branding. Cómo se expresa en la luz (cuando la marca está alineada) y en la sombra (cuando no lo está). Marcas globales con el mismo arquetipo y qué podemos aprender de ellas. Cómo activar conscientemente este arquetipo.

## 4. Alma de Marca (${profile.soul}): Lo que la marca realmente desea
La motivación profunda de esta marca. Qué quiere construir realmente. El legado que intuitivamente busca dejar. Qué valores deben estar en el corazón de todas sus decisiones.

## 5. Personalidad de Marca (${profile.personality}): Cómo se percibe
Cómo el mercado percibe esta marca en el primer contacto. Qué energía proyecta antes de que el cliente conozca el producto. Qué ajustes de comunicación alinearían la percepción con la esencia real.

## 6. Posicionamiento de Mercado
Qué nicho energético ocupa naturalmente este número. Con qué tipo de cliente resuena más. Qué posicionamiento diferencial emerge de la combinación de los tres números. Qué marcas competidoras tienen energías numéricamente similares o contrarias.

## 7. Identidad Visual y Paleta de Energía
Colores que resuenan con los números de esta marca y por qué energéticamente. Tipografías recomendadas (serif, sans-serif, script) y su vibración. Formas, geometrías y simbolismos que amplifican la energía. Qué elementos visuales evitar y por qué.

## 8. Voz de Marca y Estrategia de Comunicación
Tono de voz ideal para este número (formal/informal, directo/evocador, técnico/emocional). Palabras y frases que resuenan con el arquetipo. Temas de contenido que amplifican la energía de la marca. Canales de comunicación más afines a este número. Qué tipo de storytelling conecta con el alma de esta marca.

## 9. Ciclos de Crecimiento para ${new Date().getFullYear()}
Año de energía actual ${profile.personalYear} para esta marca: qué oportunidades específicas está señalando. Qué decisiones estratégicas favorecer. Qué proyectos o lanzamientos tienen mayor potencial este ciclo. Qué cerrar o transformar antes de fin de año.

## 10. Numerología del Equipo y Contrataciones
Qué números de vida en el equipo complementan la energía de la marca. Qué roles necesitan personas con qué números para equilibrar la organización. Cómo reconocer a las personas correctas en el proceso de selección.

## 11. Plan de Acción: Próximos 90 días
12 acciones concretas y aplicables organizadas por semana. Cada acción debe conectar directamente con la energía numerológica identificada. Incluye acciones de: identidad visual, comunicación, posicionamiento, equipo y rituales de marca.

Extensión: ${minW}–${maxW} palabras.`,
  };
}

export function buildPromptForBrand(args: { profile: NumerologyProfile; language?: string }): BuiltPrompt {
  return buildBrandPrompt(args);
}

export function getProductTitle(product: ProductKey): string {
  return PRODUCT_TITLES[product];
}
