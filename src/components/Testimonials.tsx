import { useState, useEffect, useRef } from 'react';
import { Language } from '@/lib/translations';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const HEADING: Record<Language, string> = {
  en: 'What our readers say',
  es: 'Lo que dicen nuestros lectores',
  it: 'Cosa dicono i nostri lettori',
  de: 'Was unsere Leser sagen',
  zh: '读者评价',
  ja: '読者の声',
  fr: 'Ce que disent nos lecteurs',
};

const NEW_LABEL: Record<Language, string> = {
  en: 'New', es: 'Nuevo', it: 'Nuovo', de: 'Neu', zh: '新', ja: '新着', fr: 'Nouveau',
};

type TestimonialText = Record<Language, string>;

interface TestimonialItem {
  name: string;
  country: string;
  flag: string;
  product: string;
  avatar: string;
  text: TestimonialText;
}

const ALL_ITEMS: TestimonialItem[] = [
  {
    name: 'Sofía M.', country: 'Spain', flag: '🇪🇸', product: 'Master Premium',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"This report described my inner world with a precision that left me speechless. The Jungian archetype section alone was worth every cent."',
      es: '"Este informe describió mi mundo interior con una precisión que me dejó sin palabras. Solo la sección del arquetipo jungiano ya valió cada céntimo."',
      it: '"Questo report ha descritto il mio mondo interiore con una precisione che mi ha lasciato senza parole."',
      de: '"Dieser Bericht beschrieb meine Innenwelt mit einer Präzision, die mich sprachlos ließ."',
      zh: '"这份报告描述我内心世界的精准度让我无言以对。"',
      ja: '"このレポートは私の内面世界を驚くほどの精度で描写しました。"',
      fr: '"Ce rapport a décrit mon monde intérieur avec une précision qui m\'a laissée sans voix."',
    },
  },
  {
    name: 'Luca R.', country: 'Italy', flag: '🇮🇹', product: 'Complete Report',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The vocation section described exactly the crossroads I\'m at right now. It was like reading a map I had been looking for for years."',
      es: '"La sección de vocación describió exactamente la encrucijada en la que estoy ahora. Fue como leer un mapa que llevaba años buscando."',
      it: '"La sezione sulla vocazione ha descritto esattamente il bivio in cui mi trovo. Come leggere una mappa cercata per anni."',
      de: '"Der Abschnitt über Berufung beschrieb genau den Scheideweg, an dem ich mich befinde."',
      zh: '"关于职业的部分完美描述了我现在面临的十字路口。"',
      ja: '"天職のセクションは、今まさに直面している岐路を正確に描写していた。"',
      fr: '"La section sur la vocation a décrit exactement le carrefour auquel je me trouve."',
    },
  },
  {
    name: 'Yuki T.', country: 'Japan', flag: '🇯🇵', product: 'Initial Insight',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"I was skeptical, but the 3 practical actions gave me clear direction for the week. Surprisingly accurate. I bought the Complete Report right after."',
      es: '"Era escéptica, pero las 3 acciones prácticas me dieron una dirección clara para la semana. Sorprendentemente preciso. Compré el Complete Report justo después."',
      it: '"Ero scettica, ma le 3 azioni pratiche mi hanno dato una direzione chiara. Sorprendentemente preciso."',
      de: '"Ich war skeptisch, aber die 3 praktischen Aktionen gaben mir klare Orientierung. Überraschend präzise."',
      zh: '"我本来持怀疑态度，但3个实践行动为我提供了明确方向，出乎意料地准确。"',
      ja: '"懐疑的だったが、3つのアクションが明確な方向性を与えてくれた。驚くほど正確。"',
      fr: '"J\'étais sceptique, mais les 3 actions pratiques m\'ont donné une direction claire."',
    },
  },
  {
    name: 'Camille D.', country: 'France', flag: '🇫🇷', product: 'Complete Report',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The partner and relationship section was revelatory. I finally understood a pattern I\'ve been repeating for years. Worth every euro."',
      es: '"La sección de pareja y relaciones fue reveladora. Por fin entendí un patrón que llevo años repitiendo. Vale cada euro."',
      it: '"La sezione sulla coppia è stata rivelatoria. Ho finalmente capito un pattern che ripetevo da anni."',
      de: '"Der Partner-Abschnitt war aufschlussreich. Ich verstand endlich ein Muster, das ich jahrelang wiederholt hatte."',
      zh: '"伴侣和关系部分令人大开眼界。我终于明白了一个重复多年的模式。"',
      ja: '"パートナーと関係のセクションは啓示的だった。何年も繰り返してきたパターンをついに理解した。"',
      fr: '"La section partenaire et relations a été révélatrice. J\'ai enfin compris un pattern que je répète depuis des années."',
    },
  },
  {
    name: 'Marco A.', country: 'Argentina', flag: '🇦🇷', product: 'Master Premium',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The 12-month evolution plan is something I actually use. I read a section each Sunday. It\'s become my compass for the year."',
      es: '"El plan de evolución de 12 meses es algo que realmente uso. Leo una sección cada domingo. Se ha convertido en mi brújula del año."',
      it: '"Il piano di evoluzione a 12 mesi lo uso davvero. È diventata la mia bussola per l\'anno."',
      de: '"Den 12-Monats-Evolutionsplan nutze ich wirklich. Er ist mein Kompass für das Jahr geworden."',
      zh: '"12个月进化计划是我真正使用的东西。它成了我今年的指南针。"',
      ja: '"12ヶ月進化プランは本当に使っている。毎週日曜日に読んでいる。今年の羅針盤になった。"',
      fr: '"Le plan d\'évolution sur 12 mois est quelque chose que j\'utilise vraiment. C\'est devenu ma boussole pour l\'année."',
    },
  },
  {
    name: 'Elena V.', country: 'Italy', flag: '🇮🇹', product: 'Brand Report',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The Brand Report identified our Jungian archetype as The Creator — and it explained every branding decision we had been making intuitively for 3 years."',
      es: '"El Brand Report identificó nuestro arquetipo jungiano como El Creador — y explicó cada decisión de branding que habíamos tomado intuitivamente durante 3 años."',
      it: '"Il Brand Report ha identificato il nostro archetipo junghiano come Il Creatore — e ha spiegato ogni decisione di branding presa intuitivamente per 3 anni."',
      de: '"Der Brand Report identifizierte unser jungianisches Archetyp als Den Schöpfer — und erklärte jede Branding-Entscheidung, die wir drei Jahre intuitiv getroffen hatten."',
      zh: '"品牌报告将我们的荣格原型识别为创造者——它解释了我们三年来凭直觉做出的每一个品牌决策。"',
      ja: '"ブランドレポートは私たちのユング的アーキタイプを「創造者」と特定し、3年間直感的に行ってきたすべてのブランディング決定を説明した。"',
      fr: '"Le Brand Report a identifié notre archétype jungien comme Le Créateur — et a expliqué chaque décision de branding que nous avions prise intuitivement depuis 3 ans."',
    },
  },
  {
    name: 'David K.', country: 'Germany', flag: '🇩🇪', product: 'Complete Report',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"As an engineer I was skeptical about numerology. But the life cycles section described my career transitions with uncanny accuracy. I\'ve ordered reports for my whole team."',
      es: '"Como ingeniero era escéptico con la numerología. Pero la sección de ciclos de vida describió mis transiciones profesionales con una precisión asombrosa. He pedido informes para todo mi equipo."',
      it: '"Come ingegnere ero scettico sulla numerologia. Ma la sezione sui cicli di vita ha descritto le mie transizioni di carriera con precisione sorprendente."',
      de: '"Als Ingenieur war ich skeptisch gegenüber Numerologie. Aber der Lebenszyklen-Abschnitt beschrieb meine Karriereübergänge mit verblüffender Genauigkeit."',
      zh: '"作为工程师，我对数字命理学持怀疑态度。但生命周期部分以惊人的准确性描述了我的职业转变。"',
      ja: '"エンジニアとして数秘術には懐疑的だった。しかしライフサイクルのセクションは私のキャリアの転換を不思議なほど正確に描写した。"',
      fr: '"En tant qu\'ingénieur, j\'étais sceptique vis-à-vis de la numérologie. Mais la section sur les cycles de vie a décrit mes transitions professionnelles avec une précision déconcertante."',
    },
  },
  {
    name: 'Amara S.', country: 'Brazil', flag: '🇧🇷', product: 'Master Premium',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The karma section was deeply moving. I cried reading it. For the first time I understood why certain patterns keep appearing in my life — and what to do about them."',
      es: '"La sección de karma fue profundamente conmovedora. Lloré leyéndola. Por primera vez entendí por qué ciertos patrones siguen apareciendo en mi vida — y qué hacer al respecto."',
      it: '"La sezione karmica è stata profondamente commovente. Ho pianto leggendola. Per la prima volta ho capito perché certi schemi continuano ad apparire nella mia vita."',
      de: '"Der Karma-Abschnitt war zutiefst bewegend. Ich weinte beim Lesen. Zum ersten Mal verstand ich, warum bestimmte Muster in meinem Leben immer wieder auftauchen."',
      zh: '"业力部分深深地感动了我。我边读边哭。我第一次理解了为什么某些模式会在我的生活中反复出现——以及该怎么做。"',
      ja: '"カルマのセクションは深く感動的だった。読みながら泣いた。なぜ特定のパターンが人生に繰り返し現れるのかを初めて理解した。"',
      fr: '"La section karmique m\'a profondément émue. J\'ai pleuré en la lisant. Pour la première fois, j\'ai compris pourquoi certains schémas continuent d\'apparaître dans ma vie."',
    },
  },
  {
    name: 'Jin H.', country: 'South Korea', flag: '🇰🇷', product: 'Initial Insight',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"I use the Personal Year number every Monday to set intentions for the week. It\'s become my most used productivity tool — which I didn\'t expect from a numerology report."',
      es: '"Uso el número del Año Personal cada lunes para fijar intenciones para la semana. Se ha convertido en mi herramienta de productividad más usada — lo que no esperaba de un informe de numerología."',
      it: '"Uso il numero dell\'Anno Personale ogni lunedì per fissare le intenzioni della settimana. È diventato il mio strumento di produttività più usato."',
      de: '"Ich nutze die Persönliche Jahreszahl jeden Montag, um Intentionen für die Woche zu setzen. Es ist mein meistgenutztes Produktivitätswerkzeug geworden."',
      zh: '"我每周一用个人年数字来设定这周的意图。它已成为我最常用的生产力工具——这是我从数字命理报告中没有预期到的。"',
      ja: '"毎週月曜日に個人年数を使って週のインテンションを設定している。数秘術レポートからは予想しなかったが、最も使っている生産性ツールになった。"',
      fr: '"J\'utilise le nombre d\'Année Personnelle chaque lundi pour définir mes intentions de la semaine. C\'est devenu mon outil de productivité le plus utilisé."',
    },
  },
  {
    name: 'Clara B.', country: 'France', flag: '🇫🇷', product: 'Brand Report',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"We renamed our studio based on the Brand Report recommendations. Our next project launch saw 40% more engagement. Coincidence? We don\'t think so."',
      es: '"Renombramos nuestro estudio basándonos en las recomendaciones del Brand Report. El siguiente lanzamiento de proyecto vio un 40% más de engagement. ¿Coincidencia? No lo creemos."',
      it: '"Abbiamo rinominato il nostro studio basandoci sulle raccomandazioni del Brand Report. Il prossimo lancio ha visto il 40% di engagement in più."',
      de: '"Wir haben unser Studio auf Basis des Brand Reports umbenannt. Unser nächster Projektstart sah 40% mehr Engagement. Zufall? Das glauben wir nicht."',
      zh: '"我们根据品牌报告的建议重新命名了我们的工作室。下一个项目发布的参与度提高了40%。巧合？我们不这么认为。"',
      ja: '"ブランドレポートの推奨に基づいてスタジオの名前を変更した。次のプロジェクト発表では40%多くのエンゲージメントが得られた。偶然？そう思わない。"',
      fr: '"Nous avons renommé notre studio sur la base des recommandations du Brand Report. Notre prochain lancement de projet a vu 40% d\'engagement en plus."',
    },
  },
  {
    name: 'Rafael M.', country: 'Mexico', flag: '🇲🇽', product: 'Complete Report',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The relationship section explained 10 years of my patterns with partners in 4 pages. My therapist was impressed — she asked me to bring the full report to our next session."',
      es: '"La sección de relaciones explicó 10 años de mis patrones con parejas en 4 páginas. Mi terapeuta quedó impresionada — me pidió que trajera el informe completo a nuestra próxima sesión."',
      it: '"La sezione relazionale ha spiegato 10 anni dei miei schemi con i partner in 4 pagine. La mia terapeuta era colpita — mi ha chiesto di portare il report completo alla prossima sessione."',
      de: '"Die Beziehungssektion erklärte 10 Jahre meiner Muster mit Partnern auf 4 Seiten. Meine Therapeutin war beeindruckt — sie bat mich, den vollständigen Bericht zur nächsten Sitzung mitzubringen."',
      zh: '"关系部分在4页中解释了我与伴侣10年的模式。我的治疗师印象深刻——她要求我在下次会话中带来完整的报告。"',
      ja: '"関係のセクションは4ページでパートナーとの10年のパターンを説明した。セラピストは感銘を受け、次のセッションに完全なレポートを持ってくるよう頼んだ。"',
      fr: '"La section relationnelle a expliqué 10 ans de mes schémas avec mes partenaires en 4 pages. Ma thérapeute était impressionnée — elle m\'a demandé d\'apporter le rapport complet à notre prochaine séance."',
    },
  },
  {
    name: 'Priya N.', country: 'India', flag: '🇮🇳', product: 'Master Premium',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"I\'m a doctor and I approach everything analytically. The precision of the Health & Wellbeing section matched what I know clinically about myself. This changed my view on numerology completely."',
      es: '"Soy médica y me aproximo a todo analíticamente. La precisión de la sección de Salud y Bienestar coincidió con lo que sé clínicamente de mí misma. Esto cambió mi visión sobre la numerología por completo."',
      it: '"Sono medico e mi approccio a tutto analiticamente. La precisione della sezione Salute e Benessere corrispondeva a ciò che so clinicamente di me stessa."',
      de: '"Ich bin Ärztin und gehe analytisch an alles heran. Die Genauigkeit der Gesundheits- und Wellness-Sektion entsprach dem, was ich klinisch über mich selbst weiß."',
      zh: '"我是医生，我以分析的方式对待一切。健康与福祉部分的精准度与我对自己的临床了解相符。这彻底改变了我对数字命理学的看法。"',
      ja: '"私は医師で、すべてを分析的にアプローチする。健康とウェルネスのセクションの精度は、自分について臨床的に知っていることと一致した。これで数秘術に対する見方が完全に変わった。"',
      fr: '"Je suis médecin et j\'approche tout analytiquement. La précision de la section Santé et Bien-être correspondait à ce que je sais cliniquement de moi-même. Cela a complètement changé ma vision de la numérologie."',
    },
  },
  {
    name: 'Thomas W.', country: 'UK', flag: '🇬🇧', product: 'Complete Report',
    avatar: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The 90-day action plan section is practical gold. Not vague affirmations — actual tasks, timing, and energy cycles to align with. I use it like a business strategy document."',
      es: '"La sección del plan de acción de 90 días es oro práctico. No afirmaciones vagas — tareas reales, tiempo y ciclos de energía con los que alinearse. Lo uso como un documento de estrategia empresarial."',
      it: '"La sezione del piano d\'azione a 90 giorni è oro pratico. Non affermazioni vaghe — compiti reali, tempistiche e cicli energetici da allineare. Lo uso come un documento di strategia aziendale."',
      de: '"Der 90-Tage-Aktionsplan ist praktisches Gold. Keine vagen Affirmationen — echte Aufgaben, Timing und Energiezyklen zum Ausrichten. Ich nutze es wie ein Business-Strategiedokument."',
      zh: '"90天行动计划部分是实用的黄金。不是模糊的肯定——而是实际的任务、时机和能量周期。我把它当作商业战略文件使用。"',
      ja: '"90日アクションプランのセクションは実用的な金だ。漠然とした肯定文ではなく、実際のタスク、タイミング、エネルギーサイクルとの整合がある。ビジネス戦略文書として使っている。"',
      fr: '"La section du plan d\'action à 90 jours est de l\'or pratique. Pas des affirmations vagues — de vraies tâches, un timing et des cycles énergétiques à aligner. Je l\'utilise comme un document de stratégie d\'entreprise."',
    },
  },
  {
    name: 'Ana L.', country: 'Portugal', flag: '🇵🇹', product: 'Brand Report',
    avatar: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"I gifted the Brand Report to my daughter for her new bakery. She redesigned her logo, colors, and name based on it. The relaunch exceeded all her expectations."',
      es: '"Le regalé el Brand Report a mi hija para su nueva panadería. Rediseñó su logo, colores y nombre basándose en él. El relanzamiento superó todas sus expectativas."',
      it: '"Ho regalato il Brand Report a mia figlia per la sua nuova panetteria. Ha riprogettato il logo, i colori e il nome in base ad esso. Il rilancio ha superato tutte le sue aspettative."',
      de: '"Ich schenkte meiner Tochter den Brand Report für ihre neue Bäckerei. Sie redesignte Logo, Farben und Namen danach. Der Relaunch übertraf all ihre Erwartungen."',
      zh: '"我把品牌报告作为礼物送给我女儿，用于她的新面包店。她根据报告重新设计了标志、颜色和名称。重新发布超出了她所有的期望。"',
      ja: '"娘の新しいパン屋のためにブランドレポートをプレゼントした。それに基づいてロゴ、色、名前をリデザインした。再ローンチはすべての期待を超えた。"',
      fr: '"J\'ai offert le Brand Report à ma fille pour sa nouvelle boulangerie. Elle a redessiné son logo, ses couleurs et son nom en conséquence. Le relancement a dépassé toutes ses attentes."',
    },
  },
  {
    name: 'Kenji O.', country: 'Japan', flag: '🇯🇵', product: 'Master Premium',
    avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"I\'ve studied Eastern philosophy for 20 years. This report bridges Western Pythagorean numerology with the archetype depth I know from Jungian analysis. Rare quality."',
      es: '"He estudiado filosofía oriental durante 20 años. Este informe une la numerología pitagórica occidental con la profundidad arquetípica que conozco del análisis jungiano. Calidad rarísima."',
      it: '"Ho studiato filosofia orientale per 20 anni. Questo report unisce la numerologia pitagorica occidentale con la profondità archetipica che conosco dall\'analisi junghiana."',
      de: '"Ich habe 20 Jahre östliche Philosophie studiert. Dieser Bericht verbindet westliche pythagoräische Numerologie mit der archetypischen Tiefe, die ich aus der jungianischen Analyse kenne."',
      zh: '"我研究东方哲学20年。这份报告将西方毕达哥拉斯数字命理学与我从荣格分析中了解的原型深度联系起来。罕见的质量。"',
      ja: '"東洋哲学を20年間学んできた。このレポートは西洋のピタゴラス数秘術と、ユング分析から知っているアーキタイプの深さを橋渡しする。稀な質だ。"',
      fr: '"J\'ai étudié la philosophie orientale pendant 20 ans. Ce rapport fait le lien entre la numérologie pythagoricienne occidentale et la profondeur archetypale que je connais de l\'analyse jungienne."',
    },
  },
];

function getDailyPool(today: Date): TestimonialItem[] {
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  let s = seed;
  const arr = [...ALL_ITEMS];
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 5);
}

function getNewIndices(pool: TestimonialItem[], today: Date): number[] {
  const dayNum = today.getDate();
  const seed2 = dayNum * 7919;
  return [(seed2 % pool.length), ((seed2 + 3) % pool.length)];
}

interface TestimonialsProps { language: Language }

export const Testimonials = ({ language }: TestimonialsProps) => {
  const [today] = useState(() => new Date());
  const [pool] = useState(() => getDailyPool(today));
  const [newIndices] = useState(() => getNewIndices(pool, today));
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = pool.length;
  const heading = HEADING[language] ?? HEADING.en;

  const go = (nextIndex: number, direction: 'left' | 'right') => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setActive((nextIndex + total) % total);
      setAnimating(false);
    }, 320);
  };

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]);

  const item = pool[active];
  const text = (item.text as any)[language] ?? item.text.en;
  const isNew = newIndices.includes(active);
  const newLabel = NEW_LABEL[language] ?? 'New';

  return (
    <div className="mt-12 pt-10 border-t border-border/30">
      <p className="text-[10px] uppercase tracking-[0.2em] text-center text-muted-foreground mb-6">
        {heading}
      </p>

      <div className="relative overflow-hidden">
        <div
          className="transition-all duration-300"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating
              ? `translateX(${dir === 'right' ? '-16px' : '16px'})`
              : 'translateX(0)',
          }}
        >
          <div className="max-w-xl mx-auto px-8">
            <Quote className="w-8 h-8 text-foreground/10 mb-4 mx-auto" />
            <p className="font-serif text-base md:text-lg text-foreground/85 text-center leading-relaxed tracking-wide mb-6 italic">
              {text}
            </p>
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden border border-border/60 ring-2 ring-background">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const t = e.target as HTMLImageElement;
                      t.style.display = 'none';
                      const parent = t.parentElement;
                      if (parent) {
                        parent.style.background = 'hsl(var(--muted))';
                        parent.innerHTML = `<span style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;font-family:serif;font-size:18px;color:hsl(var(--muted-foreground))">${item.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
                {isNew && (
                  <span className="absolute -top-1 -right-1 bg-foreground text-background text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded-full leading-none">
                    {newLabel}
                  </span>
                )}
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{item.flag} {item.name}</p>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className="w-2.5 h-2.5 fill-amber-400/80 text-amber-400/80" />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">{item.product}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => { go(active - 1, 'left'); restart(); }}
          className="absolute left-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => { go(active + 1, 'right'); restart(); }}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Next"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-6">
        {pool.map((_, i) => (
          <button
            key={i}
            onClick={() => { go(i, i > active ? 'right' : 'left'); restart(); }}
            className={`rounded-full transition-all duration-200 ${
              i === active
                ? 'w-4 h-1.5 bg-foreground'
                : 'w-1.5 h-1.5 bg-foreground/20 hover:bg-foreground/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
