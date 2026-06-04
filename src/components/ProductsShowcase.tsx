import { useState } from 'react';
import { Language } from '@/lib/translations';
import { createCheckoutSession } from '@/lib/stripeCheckout';
import { toast } from 'sonner';
import { Sparkles, Crown, FileText, Loader2, Check } from 'lucide-react';

export interface ProductsShowcaseProps {
  language: Language;
  fullName: string;
  birthDateIso: string;
  email: string;
  enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Per-language copy — all UI strings + tier content
// ---------------------------------------------------------------------------
type TierCopy = {
  tagline: string;
  bullets: string[];
};

type LangCopy = {
  sectionTitle: string;
  sectionSub: string;
  badge: string;
  cta: string;
  footer: string;
  errorMsg: string;
  tiers: [TierCopy, TierCopy, TierCopy]; // [initial, complete, master]
};

const COPY: Record<Language, LangCopy> = {
  en: {
    sectionTitle: 'Go deeper into your reading',
    sectionSub: 'Personalized reports sent to your email',
    badge: 'Most Popular',
    cta: 'Get Report',
    footer: 'Secure payments via Stripe · PDF delivered to your inbox in minutes',
    errorMsg: 'Please complete your name, date of birth and email first.',
    tiers: [
      {
        tagline: 'Your first portal into the numbers',
        bullets: [
          'Life Path number & your core archetype',
          'Soul, Personality & Personal Year decoded',
          '3 practical actions aligned with your energy',
          'Short guided meditation & closing message',
        ],
      },
      {
        tagline: 'The complete picture of your soul',
        bullets: [
          'Full analysis of your 5 core numbers',
          'Deep archetypal & karmic interpretation',
          'Love, vocation & personal growth mapped',
          'Integration exercise + guided meditation',
          'Master numbers (11, 22, 33, 44) recognized',
        ],
      },
      {
        tagline: 'A transformational reading of your soul',
        bullets: [
          'Your complete soul map — nothing withheld',
          'Life cycles: formation, productivity, wisdom',
          'Karmic patterns & liberation paths',
          '10-min deep meditation + personal ritual',
          'A final message from your soul to carry forward',
        ],
      },
    ],
  },

  es: {
    sectionTitle: 'Lleva tu lectura más lejos',
    sectionSub: 'Informes personalizados enviados a tu email',
    badge: 'Más Popular',
    cta: 'Obtener Informe',
    footer: 'Pagos seguros vía Stripe · PDF en tu email en minutos',
    errorMsg: 'Completa nombre, fecha de nacimiento y email primero.',
    tiers: [
      {
        tagline: 'Tu primer portal a los números',
        bullets: [
          'Tu Número de Vida y arquetipo esencial',
          'Alma, Personalidad y Año Personal descifrados',
          '3 acciones prácticas alineadas con tu energía',
          'Meditación corta y mensaje final inspirador',
        ],
      },
      {
        tagline: 'La imagen completa de tu alma',
        bullets: [
          'Análisis completo de tus 5 números clave',
          'Interpretación arquetípica y kármica profunda',
          'Amor, vocación y crecimiento personal mapeados',
          'Ejercicio de integración + meditación guiada',
          'Números maestros (11, 22, 33, 44) reconocidos',
        ],
      },
      {
        tagline: 'Una lectura transformadora del alma',
        bullets: [
          'Tu mapa del alma completo — sin omisiones',
          'Ciclos de vida: formación, productividad, sabiduría',
          'Patrones kármicos y caminos de liberación',
          'Meditación de 10 min + ritual personalizado',
          'Un mensaje del alma que llevarás siempre',
        ],
      },
    ],
  },

  it: {
    sectionTitle: 'Approfondisci la tua lettura',
    sectionSub: 'Report personalizzati inviati alla tua email',
    badge: 'Più Popolare',
    cta: 'Ottieni Report',
    footer: 'Pagamenti sicuri via Stripe · PDF nella tua casella in pochi minuti',
    errorMsg: 'Completa nome, data di nascita ed email prima di continuare.',
    tiers: [
      {
        tagline: 'Il tuo primo portale nei numeri',
        bullets: [
          'Numero della vita e archetipo centrale',
          'Anima, Personalità e Anno Personale svelati',
          '3 azioni pratiche allineate con la tua energia',
          'Breve meditazione guidata e messaggio finale',
        ],
      },
      {
        tagline: 'Il quadro completo della tua anima',
        bullets: [
          'Analisi completa dei tuoi 5 numeri chiave',
          'Interpretazione archetipica e karmica profonda',
          'Amore, vocazione e crescita personale mappati',
          'Esercizio di integrazione + meditazione guidata',
          'Numeri maestri (11, 22, 33, 44) riconosciuti',
        ],
      },
      {
        tagline: 'Una lettura trasformativa della tua anima',
        bullets: [
          'La tua mappa dell\'anima completa — senza omissioni',
          'Cicli di vita: formazione, produttività, saggezza',
          'Schemi karmici e percorsi di liberazione',
          'Meditazione 10 min + rituale personalizzato',
          'Un messaggio finale dell\'anima da portare con te',
        ],
      },
    ],
  },

  de: {
    sectionTitle: 'Vertiefe deine Lesung',
    sectionSub: 'Persönliche Berichte direkt in dein Postfach',
    badge: 'Beliebteste',
    cta: 'Bericht erhalten',
    footer: 'Sichere Zahlung via Stripe · PDF in wenigen Minuten in deiner Inbox',
    errorMsg: 'Bitte fülle zuerst Name, Geburtsdatum und E-Mail aus.',
    tiers: [
      {
        tagline: 'Dein erster Einblick in die Zahlen',
        bullets: [
          'Lebenszahl & dein zentraler Archetyp',
          'Seele, Persönlichkeit & Persönliches Jahr entschlüsselt',
          '3 praktische Handlungen passend zu deiner Energie',
          'Kurze Meditation & abschließende Botschaft',
        ],
      },
      {
        tagline: 'Das vollständige Bild deiner Seele',
        bullets: [
          'Vollständige Analyse deiner 5 Kernzahlen',
          'Tiefe archetypische & karmische Deutung',
          'Liebe, Berufung & persönliches Wachstum kartiert',
          'Integrationsübung + geführte Meditation',
          'Meisterzahlen (11, 22, 33, 44) erkannt',
        ],
      },
      {
        tagline: 'Eine transformierende Seelenlesung',
        bullets: [
          'Deine vollständige Seelenkarte — nichts zurückgehalten',
          'Lebenszyklen: Bildung, Produktivität, Weisheit',
          'Karmische Muster & Befreiungspfade',
          '10-Min-Tiefenmeditation + persönliches Ritual',
          'Eine abschließende Botschaft deiner Seele',
        ],
      },
    ],
  },

  zh: {
    sectionTitle: '深入探索你的解读',
    sectionSub: '个性化报告发送至你的邮箱',
    badge: '最受欢迎',
    cta: '获取报告',
    footer: '通过 Stripe 安全支付 · PDF 在几分钟内发送至你的邮箱',
    errorMsg: '请先填写姓名、出生日期和电子邮件。',
    tiers: [
      {
        tagline: '你走进数字的第一扇门',
        bullets: [
          '生命数字与核心原型解析',
          '灵魂数、个性数和个人年揭示',
          '3个与你能量对齐的实践行动',
          '简短引导冥想与结束语',
        ],
      },
      {
        tagline: '你灵魂的完整图景',
        bullets: [
          '全面分析你的5个核心数字',
          '深度原型与业力诠释',
          '爱情、使命与个人成长完整呈现',
          '整合练习 + 引导冥想',
          '识别主控数字（11、22、33、44）',
        ],
      },
      {
        tagline: '一次灵魂的转化性阅读',
        bullets: [
          '你完整的灵魂地图——毫无保留',
          '生命周期：形成期、创造期、智慧期',
          '业力模式与解脱路径',
          '10分钟深度冥想 + 个人仪式',
          '携带一生的灵魂寄语',
        ],
      },
    ],
  },

  ja: {
    sectionTitle: 'あなたの読み取りをさらに深く',
    sectionSub: 'パーソナライズされたレポートをメールでお届け',
    badge: '最人気',
    cta: 'レポートを入手',
    footer: 'Stripe で安全にお支払い · PDF は数分でメール受信箱へ',
    errorMsg: '氏名・生年月日・メールアドレスを入力してください。',
    tiers: [
      {
        tagline: '数字への最初の扉',
        bullets: [
          'ライフパス数とコアアーキタイプ',
          'ソウル・パーソナリティ・個人年を解読',
          'あなたのエネルギーに合った3つの実践',
          '短い誘導瞑想と締めくくりのメッセージ',
        ],
      },
      {
        tagline: 'あなたの魂の完全な肖像',
        bullets: [
          '5つの核心数字の完全分析',
          '深いアーキタイプ・カルマの解釈',
          '愛・天職・個人的成長を網羅',
          '統合ワーク + 誘導瞑想',
          'マスター数字（11・22・33・44）を認識',
        ],
      },
      {
        tagline: '魂を変容させる読み取り',
        bullets: [
          '完全な魂のマップ——何も隠さず',
          '人生のサイクル：形成・生産・知恵',
          'カルマのパターンと解放の道',
          '10分深層瞑想 + パーソナルリチュアル',
          '魂からの最後のメッセージ',
        ],
      },
    ],
  },

  fr: {
    sectionTitle: 'Approfondissez votre lecture',
    sectionSub: 'Rapports personnalisés envoyés à votre email',
    badge: 'Plus Populaire',
    cta: 'Obtenir le Rapport',
    footer: 'Paiements sécurisés via Stripe · PDF dans votre boîte mail en quelques minutes',
    errorMsg: 'Veuillez d\'abord remplir votre nom, date de naissance et email.',
    tiers: [
      {
        tagline: 'Votre premier portail vers les nombres',
        bullets: [
          'Nombre de Vie & archétype central',
          'Âme, Personnalité & Année Personnelle décodés',
          '3 actions pratiques alignées avec votre énergie',
          'Courte méditation guidée & message final',
        ],
      },
      {
        tagline: 'Le portrait complet de votre âme',
        bullets: [
          'Analyse complète de vos 5 nombres clés',
          'Interprétation archétypale & karmique approfondie',
          'Amour, vocation & croissance personnelle cartographiés',
          'Exercice d\'intégration + méditation guidée',
          'Nombres maîtres (11, 22, 33, 44) reconnus',
        ],
      },
      {
        tagline: 'Une lecture transformatrice de votre âme',
        bullets: [
          'Votre carte d\'âme complète — rien de caché',
          'Cycles de vie : formation, productivité, sagesse',
          'Schémas karmiques & voies de libération',
          'Méditation profonde 10 min + rituel personnalisé',
          'Un message de votre âme à porter toute la vie',
        ],
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// Static tier structure (keys, prices, icons — language-independent)
// ---------------------------------------------------------------------------
const TIER_META = [
  {
    key: 'premium_pdf' as const,
    name: 'Initial Insight',
    price: '€9.99',
    amountCents: 999,
    currency: 'eur',
    icon: FileText,
    highlight: false,
  },
  {
    key: 'complete_report' as const,
    name: 'Complete Report',
    price: '€29.99',
    amountCents: 2999,
    currency: 'eur',
    icon: Sparkles,
    highlight: true,
  },
  {
    key: 'master_premium' as const,
    name: 'Master Premium',
    price: '€59.99',
    amountCents: 5999,
    currency: 'eur',
    icon: Crown,
    highlight: false,
  },
] as const;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const ProductsShowcase = ({
  language,
  fullName,
  birthDateIso,
  email,
  enabled = true,
}: ProductsShowcaseProps) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  if (!enabled) return null;

  const copy = COPY[language] ?? COPY.en;

  const handleBuy = async (meta: (typeof TIER_META)[number]) => {
    if (loadingKey) return;
    if (!fullName.trim() || !birthDateIso || !email) {
      toast.error(copy.errorMsg);
      return;
    }
    setLoadingKey(meta.key);
    try {
      const session = await createCheckoutSession({
        productKey: meta.key,
        amount: meta.amountCents,
        currency: meta.currency,
        customerEmail: email,
        metadata: {
          language,
          customerName: fullName,
          birthDate: birthDateIso,
        },
      });
      window.location.href = session.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to start checkout';
      toast.error(message);
      setLoadingKey(null);
    }
  };

  return (
    <div className="mt-6">
      <div className="text-center mb-5">
        <h3 className="font-serif text-xl md:text-2xl font-medium text-foreground">
          {copy.sectionTitle}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{copy.sectionSub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIER_META.map((meta, idx) => {
          const tierCopy = copy.tiers[idx];
          const Icon = meta.icon;
          const isLoading = loadingKey === meta.key;

          return (
            <div
              key={meta.key}
              className={`relative rounded-xl border p-5 flex flex-col transition-shadow hover:shadow-md ${
                meta.highlight
                  ? 'bg-white border-foreground shadow-sm ring-1 ring-foreground/10'
                  : 'border-border'
              }`}
              style={meta.highlight ? undefined : { backgroundColor: '#EBEBEB' }}
            >
              {meta.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full">
                  {copy.badge}
                </span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {tierCopy.tagline}
                </span>
              </div>

              <h4 className="font-serif text-lg font-medium text-foreground">{meta.name}</h4>
              <p className="text-2xl font-serif font-bold text-foreground mt-1">{meta.price}</p>

              <ul className="mt-4 space-y-1.5 text-xs text-foreground/90 flex-1">
                {tierCopy.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3 h-3 mt-0.5 text-foreground flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(meta)}
                disabled={isLoading}
                className={`mt-5 w-full font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  meta.highlight
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-foreground/5 text-foreground border border-foreground hover:bg-foreground hover:text-background'
                }`}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                {copy.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3">{copy.footer}</p>
    </div>
  );
};
