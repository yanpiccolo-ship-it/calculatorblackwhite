import { Language } from '@/lib/translations';
import { Star } from 'lucide-react';

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
    country: '🇪🇸',
    product: 'Master Premium',
    text: {
      en: 'I had a reading done years ago that didn\'t resonate at all. This report was different — it described my inner world with a precision that left me speechless. The Jungian archetype section alone was worth every cent.',
      es: 'Me hice una lectura hace años que no resonó nada. Este informe fue diferente — describió mi mundo interior con una precisión que me dejó sin palabras. Solo la sección del arquetipo jungiano ya valió cada céntimo.',
      it: 'Ho avuto una lettura anni fa che non mi aveva convinto. Questo report è stato diverso — ha descritto il mio mondo interiore con una precisione che mi ha lasciato senza parole.',
      de: 'Ich hatte vor Jahren eine Lesung, die gar nicht stimmte. Dieser Bericht war anders — er beschrieb meine Innenwelt mit einer Präzision, die mich sprachlos ließ.',
      zh: '多年前我做过一次阅读，完全没有共鸣。这份报告不同——它描述我内心世界的精准度让我无言以对。',
      ja: '何年か前に読んでもらったことがあるが全く共感できなかった。このレポートは違った——精度が素晴らしく、言葉を失った。',
      fr: 'J\'avais eu une lecture il y a des années qui ne m\'avait pas du tout parlé. Ce rapport était différent — il a décrit mon monde intérieur avec une précision qui m\'a laissée sans voix.',
    },
  },
  {
    name: 'Luca R.',
    country: '🇮🇹',
    product: 'Complete Report',
    text: {
      en: 'The section on vocation and life cycles described exactly the professional crossroads I\'m at right now. It was like reading a map I had been looking for for years.',
      es: 'La sección de vocación y ciclos de vida describió exactamente la encrucijada profesional en la que estoy ahora. Fue como leer un mapa que llevaba años buscando.',
      it: 'La sezione sulla vocazione e i cicli di vita ha descritto esattamente il bivio professionale in cui mi trovo ora. È stato come leggere una mappa che cercavo da anni.',
      de: 'Der Abschnitt über Berufung und Lebenszyklen beschrieb genau den beruflichen Scheideweg, an dem ich mich gerade befinde. Es war wie eine Karte zu lesen, die ich jahrelang gesucht hatte.',
      zh: '关于职业和人生周期的部分，完美描述了我现在正处于的职业十字路口。就像找到了我寻找多年的地图。',
      ja: '天職とライフサイクルのセクションは、今まさに自分が直面している職業的な岐路を正確に描写していた。',
      fr: 'La section sur la vocation et les cycles de vie a décrit exactement le carrefour professionnel auquel je me trouve en ce moment. C\'était comme lire une carte que je cherchais depuis des années.',
    },
  },
  {
    name: 'Yuki T.',
    country: '🇯🇵',
    product: 'Initial Insight',
    text: {
      en: 'I was skeptical, but the three practical actions section gave me clear direction for the week. Simple, useful, surprisingly accurate. I bought the Complete Report right after.',
      es: 'Era escéptica, pero la sección de 3 acciones prácticas me dio una dirección clara para la semana. Simple, útil, sorprendentemente preciso. Compré el Complete Report justo después.',
      it: 'Ero scettica, ma la sezione delle 3 azioni pratiche mi ha dato una direzione chiara per la settimana. Semplice, utile, sorprendentemente preciso.',
      de: 'Ich war skeptisch, aber der Abschnitt mit 3 praktischen Aktionen gab mir klare Orientierung für die Woche. Einfach, nützlich, überraschend präzise.',
      zh: '我本来持怀疑态度，但3个实际行动部分为我这周提供了明确的方向。简单、实用、出乎意料地准确。',
      ja: '懐疑的だったが、3つの実践的アクションのセクションが今週の明確な方向性を与えてくれた。シンプルで実用的、驚くほど正確。',
      fr: 'J\'étais sceptique, mais la section des 3 actions pratiques m\'a donné une direction claire pour la semaine. Simple, utile, étonnamment précis.',
    },
  },
];

interface TestimonialsProps {
  language: Language;
}

export const Testimonials = ({ language }: TestimonialsProps) => {
  const heading = HEADING[language] ?? HEADING.en;

  return (
    <div className="mt-10 pt-8 border-t border-border/40">
      <h3 className="font-serif text-xl text-center font-medium text-foreground mb-6">{heading}</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ITEMS.map((item) => {
          const text = (item.text as any)[language] ?? item.text.en;
          return (
            <div key={item.name} className="rounded-xl border border-border/60 p-4 bg-foreground/[0.02] flex flex-col gap-2">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-foreground/80 flex-1 leading-relaxed">"{text}"</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[11px] font-medium text-foreground">{item.country} {item.name}</span>
                <span className="text-[10px] text-muted-foreground">{item.product}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
