import { Language } from '@/lib/translations';

const reduceToSingle = (n: number): number => {
  const MASTERS = [11, 22, 33];
  while (n > 9 && !MASTERS.includes(n)) {
    n = String(n).split('').reduce((s, d) => s + +d, 0);
  }
  return n;
};

function getTodayUniversalDay(): number {
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  return reduceToSingle(d + m + reduceToSingle(y));
}

const DAY_LABELS: Record<Language, { title: string; sub: string }> = {
  en: { title: "Today's energy", sub: 'Universal Day' },
  es: { title: 'Energía del día', sub: 'Día Universal' },
  it: { title: "Energia del giorno", sub: 'Giorno Universale' },
  de: { title: 'Energie des Tages', sub: 'Universaltag' },
  zh: { title: '今日能量', sub: '通用日数字' },
  ja: { title: '今日のエネルギー', sub: 'ユニバーサルデー' },
  fr: { title: "Énergie du jour", sub: 'Jour Universel' },
};

const ARCHETYPES: Record<number, Record<Language, string>> = {
  1: { en:'New beginnings · Leadership', es:'Nuevos comienzos · Liderazgo', it:'Nuovi inizi · Leadership', de:'Neubeginn · Führung', zh:'新开始·领导力', ja:'新しい始まり・リーダーシップ', fr:'Nouveau départ · Leadership' },
  2: { en:'Cooperation · Sensitivity', es:'Cooperación · Sensibilidad', it:'Cooperazione · Sensibilità', de:'Kooperation · Sensibilität', zh:'合作·敏感', ja:'協力・感受性', fr:'Coopération · Sensibilité' },
  3: { en:'Creativity · Joy · Expression', es:'Creatividad · Alegría · Expresión', it:'Creatività · Gioia', de:'Kreativität · Freude', zh:'创造力·喜悦', ja:'創造性・喜び', fr:'Créativité · Joie' },
  4: { en:'Work · Method · Foundation', es:'Trabajo · Método · Bases', it:'Lavoro · Metodo', de:'Arbeit · Methode', zh:'工作·方法', ja:'仕事・方法', fr:'Travail · Méthode' },
  5: { en:'Change · Freedom · Adventure', es:'Cambio · Libertad · Aventura', it:'Cambiamento · Libertà', de:'Wandel · Freiheit', zh:'变化·自由', ja:'変化・自由', fr:'Changement · Liberté' },
  6: { en:'Love · Harmony · Service', es:'Amor · Armonía · Servicio', it:'Amore · Armonia', de:'Liebe · Harmonie', zh:'爱·和谐', ja:'愛・調和', fr:'Amour · Harmonie' },
  7: { en:'Reflection · Wisdom · Solitude', es:'Reflexión · Sabiduría · Solitud', it:'Riflessione · Saggezza', de:'Reflexion · Weisheit', zh:'反思·智慧', ja:'内省・知恵', fr:'Réflexion · Sagesse' },
  8: { en:'Power · Abundance · Achievement', es:'Poder · Abundancia · Logro', it:'Potere · Abbondanza', de:'Macht · Fülle', zh:'力量·丰盛', ja:'力・豊かさ', fr:'Pouvoir · Abondance' },
  9: { en:'Completion · Compassion · Release', es:'Cierre · Compasión · Soltar', it:'Completamento · Compassione', de:'Abschluss · Mitgefühl', zh:'完成·慈悲', ja:'完了・慈悲', fr:'Achèvement · Compassion' },
  11:{ en:'Intuition · Inspiration · Vision', es:'Intuición · Inspiración · Visión', it:'Intuizione · Ispirazione', de:'Intuition · Inspiration', zh:'直觉·灵感', ja:'直感・インスピレーション', fr:'Intuition · Inspiration' },
  22:{ en:'Master Builder · Grand Vision', es:'Arquitecto del Mundo · Gran Visión', it:'Grande Costruttore', de:'Weltarchitekt · Große Vision', zh:'大建造者·宏大愿景', ja:'マスタービルダー', fr:'Grand Architecte · Grande Vision' },
  33:{ en:'Master Teacher · Universal Love', es:'Maestro del Amor · Amor Universal', it:'Maestro dell\'Amore', de:'Liebesmeister', zh:'爱的大师·普世之爱', ja:'愛のマスター', fr:'Maître de l\'Amour' },
};

interface DayNumberProps {
  language: Language;
}

export const DayNumber = ({ language }: DayNumberProps) => {
  const n = getTodayUniversalDay();
  const labels = DAY_LABELS[language] ?? DAY_LABELS.en;
  const archetype = ARCHETYPES[n]?.[language] ?? ARCHETYPES[n]?.en ?? '';
  const today = new Date().toLocaleDateString(
    language === 'zh' ? 'zh-CN' : language === 'ja' ? 'ja-JP' : `${language}-${language.toUpperCase()}`,
    { weekday: 'long', month: 'long', day: 'numeric' },
  );

  return (
    <div className="flex items-center justify-between px-4 py-2.5 mb-4 rounded-xl border border-border/60 bg-foreground/[0.03]">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{labels.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{today}</p>
        <p className="text-xs text-foreground/80 mt-0.5 font-medium">{archetype}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{labels.sub}</p>
        <p className="font-serif text-4xl font-bold text-foreground leading-none mt-0.5">{n}</p>
      </div>
    </div>
  );
};
