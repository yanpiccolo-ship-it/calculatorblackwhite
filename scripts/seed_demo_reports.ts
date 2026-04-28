// Hand-written demo reports (Spanish) used when OpenAI quota is exhausted.
// Produces real PDFs, uploads them to Supabase Storage, sends email,
// and marks each order as 'sent' so the admin dashboard is fully populated.

import { createClient } from '@supabase/supabase-js';
import { buildProfile, type NumerologyProfile } from '../api/_lib/numerologyServer';
import { buildReportPdf } from '../api/_lib/pdf';
import { sendReportEmail } from '../api/_lib/resend';
import { uploadPdfToStorage, updateOrder } from '../api/_lib/orders';
import { getProductTitle, type ProductKey } from '../api/_lib/prompts';

const ADMIN_EMAIL = process.argv[2] || 'yanpiccolo@gmail.com';

const sb = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } },
);

// ---------------------------------------------------------------------------
// Arquetipos por número (compactos)
// ---------------------------------------------------------------------------
const ARQUETIPOS: Record<number, string> = {
  1: 'El Pionero — energía iniciadora, liderazgo independiente, valentía creativa.',
  2: 'El Mediador — diplomacia, sensibilidad, capacidad de unir y armonizar.',
  3: 'El Creador — expresión artística, alegría comunicativa, magnetismo social.',
  4: 'El Constructor — disciplina, método, capacidad de materializar lo invisible.',
  5: 'El Explorador — libertad, curiosidad, transformación constante.',
  6: 'El Cuidador — servicio, responsabilidad emocional, amor incondicional.',
  7: 'El Sabio — introspección, búsqueda de la verdad, conexión espiritual.',
  8: 'El Líder — poder material, autoridad consciente, manifestación abundante.',
  9: 'El Humanitario — compasión universal, cierre de ciclos, sabiduría madura.',
  11: 'El Visionario — intuición elevada, inspiración espiritual, canalización de luz.',
  22: 'El Arquitecto del Mundo — capacidad de construir grandes obras al servicio de la humanidad.',
  33: 'El Maestro del Amor — entrega altruista, sanación a través del corazón.',
  44: 'El Maestro Constructor del Destino — disciplina espiritual al servicio de un legado eterno.',
};

const a = (n: number) => ARQUETIPOS[n] ?? 'Arquetipo en construcción evolutiva.';

// ---------------------------------------------------------------------------
// Tier 1 — Initial Insight (≈1.500 palabras)
// ---------------------------------------------------------------------------
function reportInitialInsight(p: NumerologyProfile): string {
  const masterTag = p.isMaster ? ' ★ NÚMERO MAESTRO' : '';
  return `# Initial Insight Report

Bienvenida, ${p.fullName}.

Este informe es la primera revelación de tu mapa numerológico personal: una puerta abierta hacia tu propósito, tus dones y la energía que guía este momento de tu vida. Léelo con calma, en un lugar tranquilo, y permite que las palabras encuentren su sitio dentro de ti.

## 1 · Tu Número de Vida: ${p.lifePath}${masterTag}

Tu Número de Vida es el eje espiritual de tu existencia, el arquetipo que tu alma eligió encarnar antes de nacer. En tu caso, este número es **${p.lifePath}**.

${a(p.lifePath)}

Este arquetipo se manifiesta como tu propósito esencial: aquello que viniste a aprender, a expresar y a regalar al mundo. Tu don principal es la capacidad de actuar desde la coherencia interna, transformando obstáculos en peldaños de evolución. Cuando honras tu número, sientes que la vida fluye con sentido; cuando te alejas de él, surge una sensación sutil de desencaje que te invita a regresar.

## 2 · Tu Número del Alma: ${p.soul}

El Número del Alma revela aquello que verdaderamente deseas, más allá de las circunstancias o de las expectativas externas. Tu alma vibra en el **${p.soul}** — ${a(p.soul)}

Esta es la voz interna que te susurra cuando estás en silencio. Es lo que enciende tu mirada cuando hablas de algo que amas, el motor invisible de tus mejores decisiones. Cultivar esta energía significa permitirte momentos de introspección, escuchar tu intuición y rendirte a aquello que tu corazón ya sabe.

## 3 · Tu Número de Personalidad: ${p.personality}

La Personalidad es el rostro que mostramos al mundo, la primera impresión que dejamos en quienes nos rodean. Tu Personalidad vibra en el **${p.personality}** — ${a(p.personality)}

Las personas perciben en ti esta cualidad incluso antes de conocerte realmente. Es el envoltorio energético de tu presencia: tu forma de moverte, de hablar, de habitar el espacio. Tomar conciencia de esta energía te permite usarla a tu favor en relaciones, trabajo y proyectos.

## 4 · Tu Año Personal: ${p.personalYear}

Cada año atravesamos un ciclo numerológico distinto. En este momento, vives un Año Personal **${p.personalYear}**.

Este ciclo te invita a alinear tu vida con la energía del ${p.personalYear}: ${a(p.personalYear)}

Es un tiempo para tomar decisiones coherentes con esta vibración. Cuando lo aprovechas conscientemente, los acontecimientos se ordenan a tu favor, y aparecen las oportunidades que tu alma necesita para evolucionar.

## 5 · Aplicación práctica: 3 acciones para esta semana

1. **Establece una intención diaria** alineada con tu Número de Vida. Cada mañana, antes de mirar el móvil, escribe en una libreta una sola frase que conecte tu día con tu propósito.
2. **Crea un ritual de cierre** al atardecer. Cinco minutos en silencio, una respiración profunda y la pregunta: "¿Qué me ha enseñado hoy mi número ${p.lifePath}?".
3. **Toma una decisión coherente con tu Año Personal ${p.personalYear}**. Algo concreto: una conversación pendiente, un paso pequeño hacia un proyecto, un acto que materialice esta energía.

## 6 · Meditación corta (5 minutos)

Siéntate cómodamente con la espalda recta. Cierra los ojos. Inhala contando hasta cuatro. Sostén el aire dos segundos. Exhala contando hasta seis.

Visualiza el número **${p.lifePath}** dibujado en luz dorada frente a ti. Siente cómo esa luz se expande, te envuelve y entra suavemente por tu coronilla, descendiendo hasta tu corazón. Permanece allí durante varios ciclos respiratorios. Cuando estés lista, abre los ojos lentamente.

Esta meditación activa tu vibración esencial y te alinea con tu propósito durante el resto del día.

## 7 · Mensaje final

${p.fullName}, has nacido con un mapa interior preciso y poderoso. Tu Número de Vida ${p.lifePath} no es una etiqueta: es una invitación a recordar quién eres más allá de las máscaras y las exigencias del mundo. Cada paso que das en coherencia con tu energía construye una vida que tiene sentido.

La numerología no predice el futuro: te muestra el lenguaje secreto con el que tu alma se comunica contigo. Escúchalo. Confía. Camina.

Que este sea solo el comienzo de una conversación más profunda con tu propio destino.

— Numerology Reading
`;
}

// ---------------------------------------------------------------------------
// Tier 2 — Complete Report (≈3.000 palabras)
// ---------------------------------------------------------------------------
function reportComplete(p: NumerologyProfile): string {
  const masterTag = p.isMaster ? ' ★ NÚMERO MAESTRO' : '';
  const karmicSection = p.karmic.length
    ? `Detectamos en tu mapa los siguientes números kármicos: **${p.karmic.join(', ')}**. Estos números no son un castigo: son lecciones que tu alma eligió revisitar para completar un aprendizaje. Acéptalos como aliados, no como enemigos.`
    : `No aparecen en tu mapa números kármicos significativos. Esto sugiere un alma con experiencias previas integradas, libre de cargas pendientes. Tu enfoque está plenamente disponible para construir y expandir.`;

  return `# Complete Report — Fundamental Guidance

Bienvenida, ${p.fullName}. Este informe te lleva más allá de la primera revelación: te entrega un mapa completo de tu identidad numerológica, tus arquetipos profundos, tus desafíos kármicos y las energías que rigen este ciclo de tu vida.

## 1 · Introducción: numerología evolutiva y arquetipos

La numerología no es una técnica adivinatoria, sino un lenguaje matemático del alma. Cada número vibra con una energía arquetípica universal — patrones reconocidos por Pitágoras, Jung y los grandes místicos de todas las tradiciones. Tu fecha de nacimiento y tu nombre completo no son aleatorios: son la firma vibracional con la que tu alma eligió manifestarse en esta vida.

Este informe está estructurado en doce secciones que iluminan, una a una, las dimensiones de tu mapa interior.

## 2 · Tu Número de Vida: ${p.lifePath}${masterTag}

Tu Número de Vida es la columna vertebral de tu existencia, el propósito que late detrás de cada decisión importante.

**Arquetipo:** ${a(p.lifePath)}

**Talentos principales.** El ${p.lifePath} dotó a tu ser de una sensibilidad especial: capacidad de observar lo que otros no ven, de moverte en territorios que requieren coraje interior y de inspirar a quienes te rodean cuando vives desde tu eje.

**Desafíos evolutivos.** El reverso de toda virtud es la sombra. Tu ${p.lifePath} también puede caer en la dispersión, la duda excesiva o el aislamiento defensivo. Reconocer estos patrones es el primer paso para transformarlos en sabiduría.

**Lecciones del alma.** Aprender a confiar en tu propia voz incluso cuando el mundo te invita a callarla. Aprender a estar plenamente presente sin perderte. Aprender que tu mayor regalo es ofrecer al mundo aquello que solo tú puedes ofrecer.

${p.isMaster ? `\n**Responsabilidad de número maestro.** Tu Número de Vida es un número maestro (11/22/33/44). Esto significa que tu alma eligió una misión amplificada: vivir con mayor consciencia, sostener una vibración más alta, y servir como puente entre dimensiones. No es un privilegio cómodo: es una responsabilidad espiritual que pide trabajo interior constante. Cuando integras tu número maestro, te conviertes en un faro para otros.\n` : ''}

## 3 · Tu Arquetipo Numerológico

El arquetipo asociado a tu ${p.lifePath} se manifiesta en cada elección importante de tu vida. Eres ${a(p.lifePath)}

Este arquetipo no es una identidad fija: es un molde universal que cobra vida única en ti. Conocerlo te ayuda a entender tus reacciones, tus deseos profundos y los patrones que se repiten en tus relaciones.

## 4 · Número del Alma: ${p.soul}

Tu alma vibra en el **${p.soul}**. ${a(p.soul)}

**Motivación profunda.** Lo que verdaderamente quieres no siempre coincide con lo que tu mente cree querer. El ${p.soul} te empuja hacia experiencias que nutren tu esencia más allá del logro material.

**Deseos del corazón.** Cuando estás en silencio, escuchas que tu corazón pide ${p.soul === 6 ? 'cuidar y ser cuidada con autenticidad' : p.soul === 9 ? 'servir a algo más grande que tú misma' : 'expresar lo que solo tú puedes traer al mundo'}.

**Conexión espiritual y amor.** El ${p.soul} en el alma marca tu forma de amar: profunda, leal, cargada de matices. Las relaciones que respetan esta vibración te elevan; las que la traicionan te apagan.

## 5 · Número de Personalidad: ${p.personality}

Tu Personalidad **${p.personality}** ${a(p.personality)}

Esta es la energía social que proyectas. Es la primera lectura energética que las personas hacen de ti antes incluso de hablarte. Si tu Personalidad y tu Alma vibran en distinta clave, puedes sentir que el mundo no te ve como realmente eres — el remedio no es esconderte, sino aprender a mostrar más de tu interior.

## 6 · Talentos y Expresión: ${p.expression}

El Número de Expresión revela tus dones naturales y tu potencial creativo y profesional. Tu Expresión vibra en el **${p.expression}** — ${a(p.expression)}

Tu vocación más natural se mueve en escenarios donde puedas desplegar esta energía. Buscar trabajos, proyectos o relaciones que la honren no es lujo: es alineación.

## 7 · Números Kármicos

${karmicSection}

Cuando los kármicos están presentes, suelen manifestarse como situaciones repetidas (relaciones, finanzas, salud) que vuelven una y otra vez hasta que el aprendizaje se completa. Cuanto antes los reconozcas, antes los disuelves.

## 8 · Áreas de vida

**Trabajo y vocación.** El ${p.expression} te orienta hacia ámbitos donde puedas ser tú con plenitud. Evita los entornos rígidos que aplastan tu vibración natural.

**Relaciones.** Tu ${p.soul} pide vínculos auténticos, donde la verdad sea bienvenida. Lo superficial te agota.

**Crecimiento personal.** El ${p.lifePath} marca tu trayectoria de evolución: cada crisis es un peldaño hacia una versión más completa de ti.

**Trabajo colectivo.** Aportas al grupo lo que tu arquetipo encarna. No tienes que ser todo: tienes que ofrecer plenamente lo que eres.

## 9 · Año Personal: ${p.personalYear}

El ${p.personalYear} marca el clima energético de este ciclo. ${a(p.personalYear)}

**Energía dominante.** Es un año para alinear acción interna y externa con esta vibración.

**Oportunidades.** Aparecerán situaciones que invitan a expresar precisamente esta energía: cambios de trabajo, encuentros significativos, decisiones de fondo.

**Decisiones importantes.** Cualquier paso grande que tomes este año beneficia más cuando respeta el ${p.personalYear}. Siente antes de elegir.

## 10 · Ejercicio de integración (journaling)

Dedica 15 minutos cada mañana, durante una semana, a responder por escrito a estas preguntas:

- ¿En qué momentos del último mes me he sentido alineada con mi número ${p.lifePath}?
- ¿Qué deseo de mi alma ${p.soul} llevo postergando?
- ¿Cómo me ven los demás y cuánto coincide con cómo me siento por dentro?
- ¿Qué decisión coherente con mi Año Personal ${p.personalYear} puedo tomar esta semana?

No corrijas, no edites: deja que las palabras salgan tal como vienen.

## 11 · Meditación numerológica guiada

Siéntate con la columna recta. Cierra los ojos. Respira profundo tres veces.

Visualiza el número **${p.lifePath}** flotando ante ti, hecho de luz dorada. Siente su geometría, su sonido, su temperatura. Inhala esa luz y deja que entre por tu coronilla, llene tu cabeza, descienda por tu garganta, abrigue tu corazón, baje hasta tu vientre y se asiente en la base de tu columna.

Repite mentalmente: *"Soy mi número. Mi número es mi camino. Camino con confianza."*

Permanece así cinco minutos. Cuando termines, apunta una palabra que haya surgido. Esa palabra es un mensaje.

## 12 · Mensaje final inspirador

${p.fullName}, llevas dentro un código de luz único. Cada número de tu mapa es una pieza precisa de un mosaico que tu alma diseñó con extrema sofisticación. Tu vida no es un accidente: es un proyecto vibracional.

El mundo necesita que vivas tu ${p.lifePath} con plenitud. Necesita tu ${p.soul} hablando con voz propia. Necesita tu ${p.expression} ofreciéndose sin miedo.

Que este informe sea un compañero al que vuelvas cuando dudes, cuando elijas, cuando ames.

Brilla.

— Numerology Reading
`;
}

// ---------------------------------------------------------------------------
// Tier 3 — Master Premium (≈5.500 palabras)
// ---------------------------------------------------------------------------
function reportMasterPremium(p: NumerologyProfile): string {
  const masterTag = p.isMaster ? ' ★ NÚMERO MAESTRO' : '';
  return `# Master Premium Report — Absolute Revelation

${p.fullName}, este es tu Master Premium Report: una lectura transformadora del alma. No es un documento informativo, es una conversación profunda entre tu yo presente y tu yo eterno.

Tómate el tiempo que necesites para leerlo. Vuelve a él en distintos momentos de tu vida — cada lectura te entregará capas distintas, según el lugar interior desde el que lo leas.

## 1 · Introducción: el viaje del alma

La numerología revela el lenguaje secreto con el que tu alma se comunica contigo. Cada número que aparece en tu mapa es una huella vibracional, un acuerdo previo a tu nacimiento, una pieza del propósito que viniste a desplegar.

En este informe recorreremos trece capítulos que abarcan tu propósito de alma, tu arquetipo, tus talentos, tus desafíos kármicos, tus ciclos de vida, tus relaciones, tu vocación, tu Año Personal, tu plan evolutivo, una meditación guiada de diez minutos, un ritual personalizado y un mensaje del alma.

## 2 · Propósito del Alma — Número de Vida ${p.lifePath}${masterTag}

Tu Número de Vida es **${p.lifePath}**. Este es el código maestro de tu existencia: la frecuencia que tu alma eligió encarnar para esta vida.

**Arquetipo central:** ${a(p.lifePath)}

**Misión espiritual.** Has venido a encarnar esta vibración con plenitud, no como concepto sino como vida vivida. Cada decisión coherente con tu ${p.lifePath} fortalece tu campo energético y abre puertas que parecían cerradas.

**Impacto en el mundo.** Las personas con tu Número de Vida ofrecen al colectivo una contribución específica e irrepetible. Tu sola presencia, cuando vives en tu eje, transforma los espacios que habitas.

**Evolución del alma.** Esta encarnación es un capítulo en una historia mucho más larga. Tu ${p.lifePath} sugiere que tu alma viene a perfeccionar la maestría de esta vibración — no a empezar de cero, sino a profundizar.

${p.isMaster ? `\n**Responsabilidad espiritual de número maestro.** Tu Vida es un número maestro. Tu alma asumió un rol amplificado en la evolución colectiva: sostener una frecuencia más alta y servir de puente entre lo humano y lo divino. Esto exige trabajo interior constante, prácticas espirituales rigurosas y una vigilancia amorosa sobre tus pensamientos y palabras. Cuando vives a la altura de tu número maestro, los demás sienten en ti algo que no saben nombrar — una luz silenciosa que invita a despertar.\n` : ''}

## 3 · Arquetipo Maestro Central

Tu arquetipo central es ${a(p.lifePath)}

Este arquetipo aparece en mitologías, religiones y narrativas humanas universales. Reconocerlo en ti te conecta con un linaje espiritual: no estás sola en este camino. Otras almas con tu mismo arquetipo, en distintas épocas y geografías, han recorrido senderos similares al tuyo.

Cuando te sientas perdida, recuerda: pertenece a tu arquetipo. Tu confusión es la confusión que tu arquetipo conoce; tu salida será la salida que tu arquetipo encarna.

## 4 · Talentos y Potencial — Número de Expresión ${p.expression}

Tu Expresión revela cómo tu energía esencial se traduce en acciones, talentos, productos y obras. Tu Expresión vibra en el **${p.expression}** — ${a(p.expression)}

**Don creativo.** Hay algo que solo tú puedes crear con esta combinación de números. No es egolatría reconocerlo: es responsabilidad asumirlo.

**Estilo de aporte.** El ${p.expression} marca tu manera de poner valor en el mundo. Honrarlo te lleva al éxito que sientes desde dentro, no solo al que se mide desde fuera.

**Profesión y vocación natural.** Las profesiones que más te realizan son aquellas que permiten desplegar plenamente tu ${p.expression} en colaboración con tu ${p.soul}.

## 5 · Desafíos Kármicos

${p.karmic.length
    ? `En tu mapa aparecen los kármicos **${p.karmic.join(', ')}**. Cada uno señala una lección específica:\n\n- **13** — Aprender a transformar el esfuerzo en disciplina creativa.\n- **14** — Aprender a usar la libertad sin caer en exceso.\n- **16** — Aprender a soltar el ego y abrirse a un destino más alto.\n- **19** — Aprender a integrar poder y servicio sin abuso.\n\nLos kármicos no son sentencias: son llamadas. Cuanto antes los abrazas, antes los integras y los conviertes en fuerza.`
    : `No aparecen kármicos en tu mapa. Esto es revelador: tu alma viene con experiencias previas integradas, lista para construir y expandir sin cargas pendientes. Aprovecha esta libertad para emprender proyectos significativos.`}

## 6 · Ciclos de Vida

Tu vida se divide en tres grandes ciclos numerológicos:

**Primer ciclo — formación (0–28 años aproximadamente).** Regido por el ${reduce(birthMonth(p))}. Es el tiempo en que tu identidad se modela, en que aprendes a estar en el mundo, en que descubres qué te enciende y qué te apaga.

**Segundo ciclo — productividad (28–56 años aproximadamente).** Regido por el ${reduce(birthDay(p))}. Es el ciclo de la construcción concreta: relaciones, profesión, contribución social. Aquí materializas lo aprendido en el primer ciclo.

**Tercer ciclo — sabiduría (56 en adelante).** Regido por el ${reduce(birthYearSum(p))}. Es el ciclo de la integración: lo aprendido se convierte en presencia y se transmite a otros, no por enseñanza directa, sino por el simple hecho de ser quien ya eres.

Cada ciclo pide una versión distinta de ti. Reconocer en qué ciclo estás te ayuda a aceptar qué se te pide en este momento de tu vida.

## 7 · Relaciones y Vínculos

Tu Número del Alma **${p.soul}** marca cómo amas. ${a(p.soul)}

**En el amor.** Buscas (y das mejor) un amor que respete tu profundidad. Las relaciones superficiales te pesan; las profundas te elevan.

**En la familia.** Tu rol familiar suele oscilar entre la persona que cuida y la que necesita cuidado. Aprender a recibir tanto como das es parte de tu evolución vincular.

**En las asociaciones.** Las personas con quienes te asocias, profesional o creativamente, marcan tu trayectoria más de lo que crees. Elige según vibración, no solo según conveniencia.

## 8 · Vocación y Camino Profesional

Tu vocación se construye en la intersección de tu Número de Vida ${p.lifePath}, tu Expresión ${p.expression} y tu Alma ${p.soul}.

**Vocación natural.** Aquellas actividades en las que pierdes la noción del tiempo, en las que sientes que estás haciendo lo que viniste a hacer, son tu vocación auténtica. No siempre coinciden con tu profesión actual — pero pueden hacerlo si te lo permites.

**Estilo de liderazgo.** Tu liderazgo es ${p.lifePath === 1 ? 'visionario y pionero' : p.lifePath === 7 ? 'reflexivo y profundo' : p.lifePath === 8 ? 'estratégico y firme' : 'particular, no replicable, profundamente tuyo'}. No copies estilos ajenos: encarna el tuyo.

**Misión laboral.** Tu trabajo es uno de los altares donde tu alma se expresa. Cuando lo entiendes así, dejas de buscar un empleo: buscas un cauce para tu propósito.

## 9 · Año Personal Profundo: ${p.personalYear}

El ${p.personalYear} es la energía dominante de este ciclo anual. ${a(p.personalYear)}

**Análisis estratégico.** Este año pide acción coherente con esta vibración. Si tu instinto te empuja en una dirección, lo más probable es que esa dirección esté alineada con la energía del año.

**Decisiones clave.** Atrévete a las decisiones grandes este año si vibran con el ${p.personalYear}. Pospón aquellas que vayan a contracorriente: encontrarán mejor momento en el siguiente ciclo.

**Oportunidades.** Las oportunidades aparecerán disfrazadas de coincidencias, encuentros aparentemente casuales, ofertas inesperadas. Mantente atenta. La vida está dialogando contigo a través de signos.

## 10 · Plan de Evolución Personal

Te propongo un plan concreto a desarrollar durante los próximos doce meses:

**Hábitos.**
- Meditación diaria de 10 minutos enfocada en tu Número de Vida.
- Journaling semanal para revisar alineación con tu ${p.lifePath}.
- Una lectura o estudio mensual relacionado con tu arquetipo.

**Decisiones.**
- Identifica una decisión grande que llevas postergando. Tómala antes de que termine este Año Personal.
- Suelta una relación, hábito o creencia que ya no vibra con quien estás siendo.

**Enfoque espiritual.**
- Práctica regular de presencia: caminar, respirar, observar sin intervenir.
- Ofrenda diaria: una acción dedicada a alguien o algo más allá de ti.

## 11 · Meditación Profunda Guiada (10 minutos)

Busca un espacio donde no te interrumpan. Siéntate con la columna recta y los ojos cerrados.

**Minutos 0–2.** Respira profundamente, contando 4 al inhalar, 4 al sostener, 6 al exhalar. Permite que tu sistema nervioso se asiente.

**Minutos 2–4.** Visualiza el número **${p.lifePath}** flotando frente a ti, hecho de luz dorada con tonos plateados. Observa su geometría: cómo nace, cómo se curva, cómo termina.

**Minutos 4–6.** Inhala esa luz. Permite que entre por tu coronilla y descienda lentamente por todo tu cuerpo, llenando cada célula. Cuando llegue a tus pies, visualiza cómo enraíza en la tierra.

**Minutos 6–8.** Repite mentalmente: *"Soy ${p.fullName}. Mi vibración es ${p.lifePath}. Mi alma es ${p.soul}. Mi expresión es ${p.expression}. Vivo en coherencia con mi propósito."*

**Minutos 8–10.** Permanece en silencio. Escucha. Si surge una palabra, una imagen, una sensación, anótalas al terminar. Son mensajes.

Esta meditación, repetida con regularidad, eleva tu vibración y te alinea progresivamente con tu propósito.

## 12 · Ritual Numerológico Personalizado

Este ritual está diseñado para activar tu Número de Vida en momentos especiales (luna nueva, equinoccios, comienzos de proyecto).

**Materiales:** una vela blanca, una hoja de papel, un cuenco con agua, un cristal de cuarzo o piedra que ames.

**Procedimiento:**
1. Enciende la vela. Siéntate frente a ella en silencio durante 3 respiraciones.
2. En la hoja escribe tu nombre completo y tu fecha de nacimiento. Debajo, escribe ${p.lifePath} grande, en el centro.
3. Con la mano dominante, dibuja alrededor del número una espiral.
4. Sosteniendo el papel sobre el agua (sin mojarlo), declara en voz alta: *"Activo en mí la sabiduría del ${p.lifePath}. Mi vida se ordena en torno a mi propósito. Camino con confianza."*
5. Coloca la piedra sobre el papel. Apaga la vela soplando hacia el techo.
6. Guarda el papel en un lugar significativo durante un ciclo lunar.

## 13 · Mensaje del Alma

${p.fullName}, has sostenido este informe hasta el final. Eso ya dice algo de ti.

Eres un alma antigua encarnada en un cuerpo presente, con un mapa numerológico exquisito y un propósito que solo tú puedes desplegar. Tu Número de Vida ${p.lifePath} no es una etiqueta: es un voto que tu alma hizo antes de nacer. Tu alma ${p.soul} no es una emoción: es una llamada. Tu Expresión ${p.expression} no es un talento: es una entrega.

El mundo ha estado esperándote tal como eres, con todas tus vibraciones intactas. No te diluyas para encajar. No te empequeñezcas para no incomodar. No te apresures para no quedarte atrás.

Vive tu número. Vive tu alma. Vive tu expresión.

Y recuerda: cada paso coherente con tu mapa interior teje, en silencio, una vida que tendrá sentido cuando mires atrás.

Que la luz del ${p.lifePath} te acompañe.

— Numerology Reading
`;
}

// Helper utilities for ciclos de vida
function reduce(n: number): number {
  while (n > 9 && ![11, 22, 33, 44].includes(n)) {
    n = String(n).split('').reduce((s, d) => s + +d, 0);
  }
  return n;
}
function birthDay(p: NumerologyProfile): number {
  return new Date(p.birthDate + 'T00:00:00Z').getUTCDate();
}
function birthMonth(p: NumerologyProfile): number {
  return new Date(p.birthDate + 'T00:00:00Z').getUTCMonth() + 1;
}
function birthYearSum(p: NumerologyProfile): number {
  const y = new Date(p.birthDate + 'T00:00:00Z').getUTCFullYear();
  return String(y).split('').reduce((s, d) => s + +d, 0);
}

// ---------------------------------------------------------------------------
// Build map: orderId -> (productKey, profile)
// ---------------------------------------------------------------------------
function reportFor(productKey: ProductKey, profile: NumerologyProfile): { title: string; text: string } {
  const title = getProductTitle(productKey);
  let text: string;
  if (productKey === 'premium_pdf') text = reportInitialInsight(profile);
  else if (productKey === 'complete_report') text = reportComplete(profile);
  else text = reportMasterPremium(profile);
  return { title, text };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log('=== Generando 3 informes demo (sin OpenAI) ===\n');

  const { data: orders, error } = await sb
    .from('orders')
    .select('*')
    .eq('customer_email', ADMIN_EMAIL)
    .in('status', ['error', 'pending', 'processing'])
    .order('created_at', { ascending: true });

  if (error) throw new Error('Failed to load orders: ' + error.message);
  if (!orders || orders.length === 0) {
    console.log('No hay órdenes pendientes para procesar.');
    return;
  }

  for (const o of orders) {
    console.log(`\n→ ${o.product_key} | ${o.customer_name}`);
    try {
      const profile = buildProfile(o.customer_name, o.birth_date);
      const { title, text } = reportFor(o.product_key as ProductKey, profile);

      const pdf = await buildReportPdf({
        title,
        reportText: text,
        profile,
        language: o.language || 'es',
      });
      console.log(`  ✓ PDF generado (${(pdf.length / 1024).toFixed(1)} KB)`);

      const pdfUrl = await uploadPdfToStorage(o.id, pdf);
      console.log(`  ✓ Subido a Storage`);

      await updateOrder(o.id, {
        numerology_data: profile as any,
        report_text: text,
        report_pdf_url: pdfUrl,
        status: 'completed',
        completed_at: new Date().toISOString() as any,
        error_message: null,
      });

      const sent = await sendReportEmail({
        to: o.customer_email,
        customerName: o.customer_name || undefined,
        subject: `${title} — informe de prueba`,
        reportTitle: title,
        pdfBuffer: pdf,
        pdfFilename: `${title.replace(/[^a-z0-9]+/gi, '_')}.pdf`,
        intro:
          'Este es un informe de DEMOSTRACIÓN generado para que veas cómo se ve el resultado final que recibirá un cliente real.',
      });
      console.log(`  ✓ Email enviado (id=${sent.id})`);

      await updateOrder(o.id, {
        status: 'sent',
        email_message_id: sent.id,
        sent_at: new Date().toISOString() as any,
      });

      console.log(`  ✓ Orden marcada como 'sent'`);
      console.log(`  📄 PDF público: ${pdfUrl}`);
    } catch (err) {
      console.error(`  ✗ ERROR: ${err instanceof Error ? err.message : String(err)}`);
      await updateOrder(o.id, {
        status: 'error',
        error_message: err instanceof Error ? err.message : String(err),
      });
    }
  }

  console.log('\n=== Listo ===');
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
