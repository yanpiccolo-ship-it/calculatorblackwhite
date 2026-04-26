import { useState } from 'react';
import { Language } from '@/lib/translations';
import { createCheckoutSession } from '@/lib/stripeCheckout';
import { toast } from 'sonner';
import { Sparkles, Crown, FileText, Loader2, Check } from 'lucide-react';

export interface ProductsShowcaseProps {
  language: Language;
  fullName: string;
  birthDateIso: string; // YYYY-MM-DD
  email: string;
  enabled?: boolean;
}

type Tier = {
  key: 'premium_pdf' | 'complete_report' | 'master_premium';
  name: string;
  tagline: string;
  price: string;
  amountCents: number;
  currency: string;
  words: string;
  highlight?: boolean;
  bullets: string[];
  icon: typeof FileText;
};

const TIERS: Tier[] = [
  {
    key: 'premium_pdf',
    name: 'Initial Insight',
    tagline: 'Introductorio y funcional',
    price: '€9.99',
    amountCents: 999,
    currency: 'eur',
    words: '1.200 – 1.800 palabras',
    icon: FileText,
    bullets: [
      'Tu Número de Vida y arquetipo central',
      'Alma, Personalidad y Año Personal',
      '3 acciones prácticas + meditación corta',
      'Mensaje final inspirador',
    ],
  },
  {
    key: 'complete_report',
    name: 'Complete Report',
    tagline: 'Fundamental Guidance',
    price: '€29.99',
    amountCents: 2999,
    currency: 'eur',
    words: '2.500 – 3.500 palabras',
    icon: Sparkles,
    highlight: true,
    bullets: [
      'Análisis completo de los 5 números clave',
      'Arquetipo numerológico profundo',
      'Números kármicos y áreas de vida',
      'Ejercicio de integración + meditación',
      'Reconoce números maestros (11, 22, 33, 44)',
    ],
  },
  {
    key: 'master_premium',
    name: 'Master Premium',
    tagline: 'Absolute Revelation',
    price: '€59.99',
    amountCents: 5999,
    currency: 'eur',
    words: '4.500 – 6.500 palabras',
    icon: Crown,
    bullets: [
      'Una lectura transformadora del alma',
      'Propósito, ciclos de vida y vocación',
      'Plan de evolución personal completo',
      'Meditación profunda de 10 minutos',
      'Ritual numerológico personalizado',
    ],
  },
];

export const ProductsShowcase = ({
  language,
  fullName,
  birthDateIso,
  email,
  enabled = true,
}: ProductsShowcaseProps) => {
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  if (!enabled) return null;

  const handleBuy = async (tier: Tier) => {
    if (loadingKey) return;
    if (!fullName.trim() || !birthDateIso || !email) {
      toast.error('Completa nombre, fecha de nacimiento y email primero.');
      return;
    }
    setLoadingKey(tier.key);
    try {
      const session = await createCheckoutSession({
        productKey: tier.key,
        amount: tier.amountCents,
        currency: tier.currency,
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
          Lleva tu lectura más profundo
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Informes personalizados generados con IA y enviados a tu email
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const isLoading = loadingKey === tier.key;
          return (
            <div
              key={tier.key}
              className={`relative rounded-xl border p-5 flex flex-col bg-white transition-shadow hover:shadow-md ${
                tier.highlight
                  ? 'border-foreground shadow-sm ring-1 ring-foreground/10'
                  : 'border-border'
              }`}
            >
              {tier.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] uppercase tracking-wider font-medium px-2.5 py-1 rounded-full">
                  Recomendado
                </span>
              )}

              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4 text-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {tier.tagline}
                </span>
              </div>

              <h4 className="font-serif text-lg font-medium text-foreground">
                {tier.name}
              </h4>
              <p className="text-2xl font-serif font-bold text-foreground mt-1">
                {tier.price}
              </p>
              <p className="text-[11px] text-muted-foreground">{tier.words}</p>

              <ul className="mt-4 space-y-1.5 text-xs text-foreground/90 flex-1">
                {tier.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="w-3 h-3 mt-0.5 text-foreground flex-shrink-0" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBuy(tier)}
                disabled={isLoading}
                className={`mt-5 w-full font-medium px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  tier.highlight
                    ? 'bg-foreground text-background hover:bg-foreground/90'
                    : 'bg-white text-foreground border border-foreground hover:bg-foreground hover:text-background'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
                Comprar
              </button>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] text-center text-muted-foreground mt-3">
        Pagos seguros vía Stripe · Recibes el PDF en tu email en unos minutos
      </p>
    </div>
  );
};
