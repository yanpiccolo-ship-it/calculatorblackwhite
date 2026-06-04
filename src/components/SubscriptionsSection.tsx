import { useState } from 'react';
import { Language } from '@/lib/translations';
import { Check, Loader2, Star, Sparkles, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createCheckoutSession } from '@/lib/stripeCheckout';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: 'luna' | 'estrella' | 'maestra';
  icon: React.ReactNode;
  price: string;
  period: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

const PLANS_EN: Plan[] = [
  {
    id: 'luna',
    icon: <Star className="w-5 h-5" />,
    price: '€9.99',
    period: '/month',
    highlighted: false,
    features: [
      '1 personal numerology report/month',
      'Universal Day number (daily)',
      'Compatibility calculator — unlimited',
      'Brand numerology basic analysis',
      'Priority email support',
    ],
  },
  {
    id: 'estrella',
    icon: <Sparkles className="w-5 h-5" />,
    price: '€19.99',
    period: '/month',
    highlighted: true,
    badge: 'Most popular',
    features: [
      '2 full reports/month (any tier)',
      'Everything in Luna',
      'PDF download for all reports',
      'Yearly numerology forecast',
      'Access to past reports archive',
    ],
  },
  {
    id: 'maestra',
    icon: <Crown className="w-5 h-5" />,
    price: '€39.99',
    period: '/month',
    highlighted: false,
    features: [
      'Unlimited personal reports',
      '1 Brand Numerology Report/month',
      'Everything in Estrella',
      'Master Premium tier always included',
      'Dedicated numerologist email support',
    ],
  },
];

const PLAN_NAMES: Record<Plan['id'], string> = {
  luna: 'Luna',
  estrella: 'Estrella',
  maestra: 'Maestra',
};

const HEADING: Record<Language, { title: string; sub: string; emailLabel: string; emailPlaceholder: string; cta: string; getting: string }> = {
  en: { title: 'Monthly Plans', sub: 'Your numerology companion, every month', emailLabel: 'Your email', emailPlaceholder: 'your@email.com', cta: 'Subscribe', getting: 'Redirecting…' },
  es: { title: 'Planes mensuales', sub: 'Tu compañero de numerología, cada mes', emailLabel: 'Tu email', emailPlaceholder: 'tu@email.com', cta: 'Suscribirme', getting: 'Redirigiendo…' },
  it: { title: 'Piani mensili', sub: 'Il tuo compagno di numerologia, ogni mese', emailLabel: 'La tua email', emailPlaceholder: 'tuo@email.com', cta: 'Iscriviti', getting: 'Reindirizzamento…' },
  de: { title: 'Monatliche Pläne', sub: 'Dein Numerologie-Begleiter, jeden Monat', emailLabel: 'Deine E-Mail', emailPlaceholder: 'deine@email.de', cta: 'Abonnieren', getting: 'Weiterleiten…' },
  zh: { title: '月度计划', sub: '您的每月数字命理伴侣', emailLabel: '您的邮箱', emailPlaceholder: 'your@email.com', cta: '订阅', getting: '跳转中…' },
  ja: { title: '月額プラン', sub: '毎月のあなたの数秘術コンパニオン', emailLabel: 'メールアドレス', emailPlaceholder: 'your@email.com', cta: '購読する', getting: 'リダイレクト中…' },
  fr: { title: 'Plans mensuels', sub: 'Votre compagnon numérologique, chaque mois', emailLabel: 'Votre email', emailPlaceholder: 'votre@email.fr', cta: 'S\'abonner', getting: 'Redirection…' },
};

export const SubscriptionsSection = ({ language }: { language: Language }) => {
  const [email, setEmail] = useState('');
  const [buying, setBuying] = useState<Plan['id'] | null>(null);
  const copy = HEADING[language] ?? HEADING.en;

  const subscribe = async (plan: Plan) => {
    if (!email.trim()) {
      toast({ title: 'Email required', description: 'Please enter your email first.', variant: 'destructive' });
      return;
    }
    setBuying(plan.id);
    try {
      const session = await createCheckoutSession({
        productKey: plan.id,
        customerEmail: email,
        metadata: { plan: plan.id, language },
      });
      window.location.href = session.url;
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      setBuying(null);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-border/40">
      <div className="text-center mb-6">
        <h3 className="font-serif text-xl font-medium text-foreground">{copy.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">{copy.sub}</p>
      </div>

      <div className="max-w-sm mx-auto mb-5">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={copy.emailPlaceholder}
          className="input-elegant h-9 text-sm text-center"
        />
        <p className="text-[10px] text-muted-foreground text-center mt-1">{copy.emailLabel}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {PLANS_EN.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-5 flex flex-col gap-4 relative transition-all ${
              plan.highlighted
                ? 'border-foreground/40 bg-foreground/[0.05] shadow-sm'
                : 'border-border/60 bg-foreground/[0.02]'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] uppercase tracking-widest px-3 py-0.5 rounded-full">
                {plan.badge}
              </span>
            )}
            <div className="text-center">
              <div className={`w-9 h-9 rounded-full border mx-auto flex items-center justify-center mb-2 ${plan.highlighted ? 'border-foreground/40 text-foreground' : 'border-border/50 text-foreground/60'}`}>
                {plan.icon}
              </div>
              <p className="font-serif text-base font-medium text-foreground">{PLAN_NAMES[plan.id]}</p>
              <div className="mt-1">
                <span className="font-serif text-2xl font-bold text-foreground">{plan.price}</span>
                <span className="text-xs text-muted-foreground">{plan.period}</span>
              </div>
            </div>
            <ul className="space-y-2 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/70">
                  <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-foreground/50" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => subscribe(plan)}
              disabled={buying !== null}
              className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                plan.highlighted
                  ? 'bg-foreground text-background hover:bg-foreground/90'
                  : 'border border-foreground/30 text-foreground hover:bg-foreground/5'
              } disabled:opacity-50`}
            >
              {buying === plan.id
                ? <><Loader2 className="w-3 h-3 animate-spin" />{copy.getting}</>
                : `${copy.cta} — ${plan.price}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
