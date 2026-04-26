import { useState } from 'react';
import { Language, translations } from '@/lib/translations';
import { appConfig } from '@/lib/appConfig';
import { useAppContent, getContentValue, getNumberMeaning } from '@/hooks/useAppContent';
import { useAppSettings, getSettingValue, getSettingBoolean } from '@/hooks/useAppSettings';
import {
  calculateDestinyNumber,
  calculateSoulNumber,
  calculatePersonalityNumber,
  calculatePersonalYearNumber,
  reduceForTarot,
  NumerologyResult,
} from '@/lib/numerology';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LanguageSelector } from './LanguageSelector';
import { ResultCard } from './ResultCard';
import { PremiumUpsell } from './PremiumUpsell';
import { Sparkles, Mail, Calendar, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NumerologyResults {
  destiny: NumerologyResult | null;
  soul: NumerologyResult | null;
  personality: NumerologyResult | null;
  personalYear: NumerologyResult | null;
}

export const NumerologyCalculator = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [fullName, setFullName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [email, setEmail] = useState('');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear().toString());
  const [showTarot, setShowTarot] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState<NumerologyResults>({
    destiny: null,
    soul: null,
    personality: null,
    personalYear: null,
  });

  // Fetch dynamic content and settings from database
  const { data: dynamicContent } = useAppContent(language);
  const { data: settings } = useAppSettings();
  
  // Static translations as fallback
  const staticT = translations[language];
  
  // Helper to get text - tries database first, falls back to static
  const getText = (key: string): string => {
    const dbValue = getContentValue(dynamicContent, key, '');
    return dbValue || staticT[key] || key;
  };

  // Helper to get number meaning from database or static
  const getMeaning = (num: number): string => {
    const dbMeaning = getNumberMeaning(dynamicContent, num);
    return dbMeaning || '';
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYearNum = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYearNum - i);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleCalculate = () => {
    if (!fullName.trim() || !birthDay || !birthMonth || !birthYear || !email) {
      toast({
        title: getText('fillRequired'),
        variant: 'destructive',
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: getText('invalidEmail'),
        variant: 'destructive',
      });
      return;
    }

    setIsCalculating(true);

    // Calculate numerology results
    const destiny = calculateDestinyNumber(fullName);
    const soul = calculateSoulNumber(fullName);
    const personality = calculatePersonalityNumber(fullName);
    const personalYear = calculatePersonalYearNumber(
      parseInt(birthDay),
      parseInt(birthMonth),
      parseInt(currentYear)
    );

    // Build archetype binomial string for Mailchimp (T_ARCH merge tag)
    const destinyBinomial = reduceForTarot(destiny.finalNumber);
    const archetypeString = destinyBinomial.masterNumber 
      ? `${destinyBinomial.masterNumber} + ${destinyBinomial.reducedNumber}`
      : String(destiny.finalNumber);

    // Send to Mailchimp via edge function (non-blocking)
    const mailchimpApiKey = getSettingValue(settings, 'mailchimp_api_key', '');
    if (mailchimpApiKey) {
      supabase.functions.invoke('mailchimp-subscribe', {
        body: {
          email,
          name: fullName,
          numerologyResult: destiny.finalNumber,
          archetypeResult: archetypeString,
        },
      }).catch(err => console.error('Mailchimp subscription error:', err));
    }

    // Small delay for visual feedback
    setTimeout(() => {
      setResults({
        destiny,
        soul,
        personality,
        personalYear,
      });
      setIsCalculating(false);
    }, 500);
  };

  const hasResults = results.destiny !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Compact */}
      <header className="border-b border-border/50 py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 gold-accent" />
            <span className="font-serif text-sm font-medium cursor-pointer" onClick={() => window.location.href = '/pricing'}>
              {getContentValue(dynamicContent, 'app_name', appConfig.branding.appName)}
            </span>
          </div>
          <LanguageSelector language={language} onLanguageChange={setLanguage} />
        </div>
      </header>

      {/* Hero Section - Compact */}
      <section className="py-4 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-serif text-2xl md:text-3xl font-light tracking-tight text-foreground mb-1">
            {getText('title')}
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            {getText('subtitle')}
          </p>
        </div>
      </section>

      {/* Calculator Form - Compact */}
      <section className="px-4 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="card-elegant space-y-4 p-4 md:p-5">
            {/* Name Input */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-xs font-medium">
                <User className="w-3 h-3 opacity-60" />
                {getText('fullName')}
              </Label>
              <Input
                id="fullName"
                placeholder={getText('fullNamePlaceholder')}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input-elegant h-9 text-sm"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <Label className="flex items-center gap-2 text-xs font-medium">
                <Calendar className="w-3 h-3 opacity-60" />
                {getText('dateOfBirth')}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Select value={birthDay} onValueChange={setBirthDay}>
                  <SelectTrigger className="input-elegant h-9 text-sm">
                    <SelectValue placeholder={getText('day')} />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((day) => (
                      <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={birthMonth} onValueChange={setBirthMonth}>
                  <SelectTrigger className="input-elegant h-9 text-sm">
                    <SelectValue placeholder={getText('month')} />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month.toString()}>{month}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={birthYear} onValueChange={setBirthYear}>
                  <SelectTrigger className="input-elegant h-9 text-sm">
                    <SelectValue placeholder={getText('year')} />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-1">
              <Label htmlFor="email" className="flex items-center gap-2 text-xs font-medium">
                <Mail className="w-3 h-3 opacity-60" />
                {getText('email')}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={getText('emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-elegant h-9 text-sm"
              />
              <p className="text-[10px] text-muted-foreground">{getText('emailRequired')}</p>
            </div>

            {/* Tarot Toggle & Calculate Button Row */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Switch
                  id="tarot-toggle"
                  checked={showTarot}
                  onCheckedChange={setShowTarot}
                />
                <Label htmlFor="tarot-toggle" className="text-xs font-medium cursor-pointer flex items-center gap-1">
                  <Sparkles className="w-3 h-3 gold-accent" />
                  {getText('tarotToggle')}
                </Label>
              </div>

              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="btn-calculate disabled:opacity-50 disabled:cursor-not-allowed text-sm px-6 py-2"
              >
                {isCalculating ? getText('calculating') : getText('calculate')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section - Full Content + Premium Upsell at bottom */}
      {hasResults && (
        <section className="px-4 pb-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-lg text-center mb-3 fade-in">{getText('yourResults')}</h2>

            <div className="space-y-3">
              {results.destiny && (
                <ResultCard
                  title={getText('destinyNumber')}
                  description={getText('destinyDescription')}
                  result={results.destiny}
                  language={language}
                  showTarot={showTarot}
                  type="letters"
                  delay={0}
                  dynamicMeaning={getMeaning(results.destiny.finalNumber)}
                />
              )}

              {results.soul && (
                <ResultCard
                  title={getText('soulNumber')}
                  description={getText('soulDescription')}
                  result={results.soul}
                  language={language}
                  showTarot={showTarot}
                  type="vowels"
                  delay={100}
                  dynamicMeaning={getMeaning(results.soul.finalNumber)}
                />
              )}

              {results.personality && (
                <ResultCard
                  title={getText('personalityNumber')}
                  description={getText('personalityDescription')}
                  result={results.personality}
                  language={language}
                  showTarot={showTarot}
                  type="consonants"
                  delay={200}
                  dynamicMeaning={getMeaning(results.personality.finalNumber)}
                />
              )}

              {results.personalYear && (
                <ResultCard
                  title={getText('personalYearNumber')}
                  description={getText('personalYearDescription')}
                  result={results.personalYear}
                  language={language}
                  showTarot={showTarot}
                  type="personal"
                  delay={300}
                  dynamicMeaning={getMeaning(results.personalYear.finalNumber)}
                />
              )}
            </div>

            {/* Premium Upsell at the very end */}
            {getSettingBoolean(settings, 'premium_enabled', true) && (
              <PremiumUpsell language={language} dynamicContent={dynamicContent} settings={settings} />
            )}
          </div>
        </section>
      )}
      {/* Footer Branding */}
      <footer className="mt-8 pt-6 border-t border-border/30 text-center pb-4">
        <p className="text-[10px] text-muted-foreground font-serif italic tracking-wider">
          Design by Just Bee Brand Agency
        </p>
      </footer>
    </div>
  );
};
