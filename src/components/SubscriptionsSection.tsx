import { useState } from 'react';
import { Language } from '@/lib/translations';
import { Check, Loader2, Star, Sparkles, Crown, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { createCheckoutSession } from '@/lib/stripeCheckout';
import { toast } from '@/hooks/use-toast';

interface Plan {
  id: 'luna' | 'estrella' | 'maestra';
  icon: React.ReactNode;
  price: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

const PLANS: Plan[] = [
  {
    id: 'luna',
    icon: <Star className="w-4 h-4" />,
    price: '€9.99',
    highlighted: false,
    features: [
      '1 personal numerology report/month',
      'Daily universal number',
      'Unlimited compatibility calculator',
      'Email support',
    ],
  },
  {
    id: 'estrella',
    icon: <Sparkles className="w-4 h-4" />,
    price: '€19.99',
    highlighted: true,
    badge: 'Most popular',
    features: [
      '2 full reports/month (any tier)',
      'Everything in Luna',
      'PDF downloads + archive',
      'Yearly numerology forecast',
    ],
  },
  {
    id: 'maestra',
    icon: <Crown className="w-4 h-4" />,
    price: '€39.99',
    highlighted: false,
    features: [
      'Unlimited personal reports',
      '1 Brand Report/month',
      'Everything in Estrella',
      'Master Premium always included',
    ],
  },
];

const COPY: Record<Language, {
  newsletter: string; newsletterSub: string; emailPlaceholder: string; subscribeBtn: string;
  subscribed: string; subscribedSub: string;
  plansTitle: string; plansSub: string; planCta: string; getting: string; period: string;
}> = {
  en: { newsletter:'Subscribe to our Newsletter', newsletterSub:'Weekly numerology insights, moon cycles and personal growth rituals — straight to your inbox.', emailPlaceholder:'your@email.com', subscribeBtn:'Subscribe', subscribed:'You\'re in ✦', subscribedSub:'Check your inbox for your welcome gift.', plansTitle:'Premium Plans', plansSub:'Go deeper every month', planCta:'Get started', getting:'Redirecting…', period:'/mo' },
  es: { newsletter:'Suscríbete al Newsletter', newsletterSub:'Insights de numerología semanales, ciclos lunares y rituales de crecimiento personal — directo a tu bandeja.', emailPlaceholder:'tu@email.com', subscribeBtn:'Suscribirme', subscribed:'¡Estás dentro! ✦', subscribedSub:'Revisa tu bandeja de entrada para tu regalo de bienvenida.', plansTitle:'Planes Premium', plansSub:'Profundiza cada mes', planCta:'Comenzar', getting:'Redirigiendo…', period:'/mes' },
  it: { newsletter:'Iscriviti alla Newsletter', newsletterSub:'Insight di numerologia settimanali, cicli lunari e rituali di crescita personale — direttamente nella tua casella.', emailPlaceholder:'tuo@email.com', subscribeBtn:'Iscriviti', subscribed:'Sei dentro ✦', subscribedSub:'Controlla la tua casella per il tuo regalo di benvenuto.', plansTitle:'Piani Premium', plansSub:'Approfondisci ogni mese', planCta:'Inizia', getting:'Reindirizzamento…', period:'/mese' },
  de: { newsletter:'Newsletter abonnieren', newsletterSub:'Wöchentliche Numerologie-Einblicke, Mondzyklen und persönliche Wachstumsrituale — direkt in dein Postfach.', emailPlaceholder:'deine@email.de', subscribeBtn:'Abonnieren', subscribed:'Du bist dabei ✦', subscribedSub:'Schau in deinen Posteingang für dein Willkommensgeschenk.', plansTitle:'Premium-Pläne', plansSub:'Jeden Monat tiefer gehen', planCta:'Loslegen', getting:'Weiterleiten…', period:'/Mo.' },
  zh: { newsletter:'订阅我们的通讯', newsletterSub:'每周数字命理见解、月亮周期和个人成长仪式——直达您的收件箱。', emailPlaceholder:'your@email.com', subscribeBtn:'订阅', subscribed:'您已加入 ✦', subscribedSub:'请查看您的收件箱领取欢迎礼物。', plansTitle:'高级计划', plansSub:'每月深入探索', planCta:'开始', getting:'跳转中…', period:'/月' },
  ja: { newsletter:'ニュースレター購読', newsletterSub:'毎週の数秘術インサイト、月のサイクル、個人成長の儀式 — 受信トレイへ直接お届けします。', emailPlaceholder:'your@email.com', subscribeBtn:'購読する', subscribed:'登録完了 ✦', subscribedSub:'ウェルカムギフトのためにメールボックスを確認してください。', plansTitle:'プレミアムプラン', plansSub:'毎月さらに深く', planCta:'始める', getting:'リダイレクト中…', period:'/月' },
  fr: { newsletter:'S\'abonner à la Newsletter', newsletterSub:'Insights numérologie hebdomadaires, cycles lunaires et rituels de croissance personnelle — directement dans votre boîte.', emailPlaceholder:'votre@email.fr', subscribeBtn:'S\'abonner', subscribed:'Vous êtes inscrit ✦', subscribedSub:'Vérifiez votre boîte pour votre cadeau de bienvenue.', plansTitle:'Plans Premium', plansSub:'Allez plus loin chaque mois', planCta:'Commencer', getting:'Redirection…', period:'/mois' },
};

export const SubscriptionsSection = ({ language }: { language: Language }) => {
  const [nlEmail, setNlEmail] = useState('');
  const [nlDone, setNlDone] = useState(false);
  const [nlLoading, setNlLoading] = useState(false);
  const [buying, setBuying] = useState<Plan['id'] | null>(null);
  const copy = COPY[language] ?? COPY.en;

  const handleNewsletter = async () => {
    if (!nlEmail.trim() || !nlEmail.includes('@')) return;
    setNlLoading(true);
    try {
      await fetch('/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: nlEmail }),
      });
    } catch { /* silent */ }
    setNlDone(true);
    setNlLoading(false);
  };

  const subscribe = async (plan: Plan) => {
    const email = nlEmail.trim();
    if (!email) {
      toast({ title: 'Email required', description: 'Please enter your email address first.', variant: 'destructive' });
      return;
    }
    setBuying(plan.id);
    try {
      const session = await createCheckoutSession({
        productKey: plan.id,
        customerEmail: email,
        metadata: { plan: plan.id, language },
      });
      window.location.href = session.url!;
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
      setBuying(null);
    }
  };

  return (
    <div className="mt-10 pt-10 border-t border-border/40">

      {/* ── NEWSLETTER BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden mb-10" style={{ minHeight: 220 }}>
        <img
          src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&h=400&fit=crop&crop=center&q=85"
          alt="Meditation on beach"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 60%, rgba(0,0,0,0.25) 100%)' }} />
        <div className="relative z-10 p-7 md:p-9 flex flex-col justify-center h-full" style={{ minHeight: 220 }}>
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-3.5 h-3.5 text-white/60" />
            <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">Newsletter</p>
          </div>
          <h3 className="font-serif text-2xl md:text-3xl font-light text-white mb-1 leading-tight">
            {copy.newsletter}
          </h3>
          <p className="text-xs text-white/60 mb-5 max-w-sm leading-relaxed">{copy.newsletterSub}</p>

          {nlDone ? (
            <div className="max-w-xs">
              <p className="font-serif text-lg text-white">{copy.subscribed}</p>
              <p className="text-xs text-white/60 mt-0.5">{copy.subscribedSub}</p>
            </div>
          ) : (
            <div className="flex gap-2 max-w-sm">
              <Input
                type="email"
                value={nlEmail}
                onChange={(e) => setNlEmail(e.target.value)}
                placeholder={copy.emailPlaceholder}
                onKeyDown={(e) => e.key === 'Enter' && handleNewsletter()}
                className="h-10 text-sm flex-1 bg-white/15 border-white/25 text-white placeholder:text-white/40 focus:border-white/50 rounded-lg"
              />
              <button
                onClick={handleNewsletter}
                disabled={nlLoading || !nlEmail.trim()}
                className="px-4 h-10 rounded-lg text-sm font-semibold bg-white text-foreground hover:bg-white/90 transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
              >
                {nlLoading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <><span>{copy.subscribeBtn}</span><ArrowRight className="w-3 h-3" /></>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PLANS ── */}
      <div className="text-center mb-5">
        <h3 className="font-serif text-xl font-medium text-foreground">{copy.plansTitle}</h3>
        <p className="text-xs text-muted-foreground mt-1">{copy.plansSub}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-xl border p-4 flex flex-col gap-3 relative ${
              plan.highlighted
                ? 'border-foreground/50 bg-foreground/[0.06]'
                : 'border-border/50 bg-muted/30'
            }`}
          >
            {plan.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] uppercase tracking-widest px-3 py-0.5 rounded-full whitespace-nowrap">
                {plan.badge}
              </span>
            )}
            <div className="text-center mt-1">
              <div className={`w-8 h-8 rounded-full border mx-auto flex items-center justify-center mb-1.5 ${plan.highlighted ? 'border-foreground/50 text-foreground' : 'border-border/50 text-foreground/60'}`}>
                {plan.icon}
              </div>
              <p className="font-serif text-sm font-semibold text-foreground capitalize">{plan.id}</p>
              <p className="font-serif text-xl font-bold text-foreground mt-0.5">{plan.price}<span className="text-xs text-muted-foreground font-normal">{copy.period}</span></p>
            </div>
            <ul className="space-y-1.5 flex-1">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-foreground/70">
                  <Check className="w-3 h-3 mt-0.5 flex-shrink-0 text-foreground/40" />
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
                  : 'bg-muted text-foreground hover:bg-muted/70 dark:bg-foreground/10 dark:text-foreground dark:hover:bg-foreground/20'
              } disabled:opacity-50`}
            >
              {buying === plan.id
                ? <><Loader2 className="w-3 h-3 animate-spin" />{copy.getting}</>
                : `${copy.planCta} · ${plan.price}`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
