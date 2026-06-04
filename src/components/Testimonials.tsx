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

const ITEMS = [
  {
    name: 'Sofía M.',
    country: 'Spain',
    flag: '🇪🇸',
    product: 'Master Premium',
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
    name: 'Luca R.',
    country: 'Italy',
    flag: '🇮🇹',
    product: 'Complete Report',
    avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"The vocation and life cycles section described exactly the professional crossroads I\'m at right now. It was like reading a map I had been looking for for years."',
      es: '"La sección de vocación y ciclos de vida describió exactamente la encrucijada profesional en la que estoy ahora. Fue como leer un mapa que llevaba años buscando."',
      it: '"La sezione sulla vocazione ha descritto esattamente il bivio professionale in cui mi trovo. Come leggere una mappa cercata per anni."',
      de: '"Der Abschnitt über Berufung und Lebenszyklen beschrieb genau den Scheideweg, an dem ich mich befinde. Wie eine Karte, die ich jahrelang gesucht hatte."',
      zh: '"关于职业和人生周期的部分完美描述了我现在面临的职业十字路口。"',
      ja: '"天職とライフサイクルのセクションは、今まさに直面している職業的な岐路を正確に描写していた。"',
      fr: '"La section sur la vocation a décrit exactement le carrefour professionnel auquel je me trouve. Comme une carte que je cherchais depuis des années."',
    },
  },
  {
    name: 'Yuki T.',
    country: 'Japan',
    flag: '🇯🇵',
    product: 'Initial Insight',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face&q=80',
    text: {
      en: '"I was skeptical, but the 3 practical actions section gave me clear direction for the week. Surprisingly accurate. I bought the Complete Report right after."',
      es: '"Era escéptica, pero las 3 acciones prácticas me dieron una dirección clara para la semana. Sorprendentemente preciso. Compré el Complete Report justo después."',
      it: '"Ero scettica, ma le 3 azioni pratiche mi hanno dato una direzione chiara. Sorprendentemente preciso."',
      de: '"Ich war skeptisch, aber die 3 praktischen Aktionen gaben mir klare Orientierung. Überraschend präzise."',
      zh: '"我本来持怀疑态度，但3个实践行动为我提供了明确方向，出乎意料地准确。"',
      ja: '"懐疑的だったが、3つのアクションが明確な方向性を与えてくれた。驚くほど正確。"',
      fr: '"J\'étais sceptique, mais les 3 actions pratiques m\'ont donné une direction claire. Étonnamment précis."',
    },
  },
  {
    name: 'Camille D.',
    country: 'France',
    flag: '🇫🇷',
    product: 'Complete Report',
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
    name: 'Marco A.',
    country: 'Argentina',
    flag: '🇦🇷',
    product: 'Master Premium',
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
];

interface TestimonialsProps { language: Language }

export const Testimonials = ({ language }: TestimonialsProps) => {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [dir, setDir] = useState<'left' | 'right'>('right');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = ITEMS.length;
  const heading = HEADING[language] ?? HEADING.en;

  const go = (next: number, direction: 'left' | 'right') => {
    if (animating) return;
    setDir(direction);
    setAnimating(true);
    setTimeout(() => {
      setActive((next + total) % total);
      setAnimating(false);
    }, 320);
  };

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => go(active + 1, 'right'), 6000);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % total);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [total]);

  const item = ITEMS[active];
  const text = (item.text as any)[language] ?? item.text.en;

  return (
    <div className="mt-12 pt-10 border-t border-border/30">
      <p className="text-[10px] uppercase tracking-[0.2em] text-center text-muted-foreground mb-6">
        {heading}
      </p>

      {/* Main card */}
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
            {/* Quote mark */}
            <Quote className="w-8 h-8 text-foreground/10 mb-4 mx-auto" />

            {/* Text */}
            <p className="font-serif text-base md:text-lg text-foreground/85 text-center leading-relaxed tracking-wide mb-6 italic">
              {text}
            </p>

            {/* Profile */}
            <div className="flex flex-col items-center gap-2">
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

        {/* Nav buttons */}
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

      {/* Dots */}
      <div className="flex items-center justify-center gap-1.5 mt-6">
        {ITEMS.map((_, i) => (
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
