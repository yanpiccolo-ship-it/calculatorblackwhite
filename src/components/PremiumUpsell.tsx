import { useState } from 'react';
import { Language, translations } from '@/lib/translations';
import { AppContent, getContentValue } from '@/hooks/useAppContent';
import { AppSetting, getSettingValue, getSettingNumber } from '@/hooks/useAppSettings';
import { FileText, Sparkles, ChevronRight, Loader2 } from 'lucide-react';
import { createCheckoutSession } from '@/lib/stripeCheckout';
import { toast } from 'sonner';

export interface PremiumUpsellProps {
  language: Language;
  dynamicContent?: AppContent[];
  settings?: AppSetting[];
}

export const PremiumUpsell = ({ language, dynamicContent, settings }: PremiumUpsellProps) => {
  const staticT = translations[language];
  const [isLoading, setIsLoading] = useState(false);

  // Get pricing from database settings
  const price = getSettingNumber(settings, 'premium_price', 9.99);
  const currency = getSettingValue(settings, 'premium_currency', 'USD');
  const currencySymbol = getSettingValue(settings, 'premium_currency_symbol', '$');

  // Helper to get text - tries database first, falls back to static
  const getText = (key: string): string => {
    if (dynamicContent) {
      const dbValue = getContentValue(dynamicContent, key, '');
      if (dbValue) return dbValue;
    }
    return staticT[key] || key;
  };

  const handleBuyClick = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const session = await createCheckoutSession({
        productKey: 'premium_pdf',
        productName: getText('premiumTitle'),
        amount: Math.round(price * 100),
        currency: (currency || 'USD').toLowerCase(),
        metadata: { language },
      });
      window.location.href = session.url;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to start checkout';
      toast.error(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4 relative overflow-hidden rounded-lg border border-border" style={{ backgroundColor: '#EBEBEB' }}>
      <div className="p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 rounded-lg bg-white border border-border">
            <FileText className="w-6 h-6 text-foreground" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <h3 className="font-serif text-lg md:text-xl font-medium text-foreground">
                {getText('premiumTitle')}
              </h3>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {getText('premiumDescription')}
            </p>
            
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-foreground" />
                {getText('premiumFeature1')}
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-foreground" />
                {getText('premiumFeature2')}
              </li>
              <li className="flex items-center gap-2">
                <ChevronRight className="w-3 h-3 text-foreground" />
                {getText('premiumFeature3')}
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border">
          <div className="text-center sm:text-left">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">{getText('premiumOnlyFor')}</span>
            <p className="text-2xl font-serif font-bold text-foreground">
              {currencySymbol}{price} <span className="text-sm font-normal text-muted-foreground">{currency}</span>
            </p>
          </div>
          
          <button
            onClick={handleBuyClick}
            disabled={isLoading}
            className="w-full sm:w-auto bg-foreground text-background font-medium px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {getText('buyFullReport')}
          </button>
        </div>
      </div>
    </div>
  );
};
