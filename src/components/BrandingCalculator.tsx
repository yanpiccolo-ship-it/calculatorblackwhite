import { useState } from 'react';
import { Language } from '@/lib/translations';
import { calculateDestinyNumber, calculateSoulNumber } from '@/lib/numerology';
import { Building2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Jungian brand archetypes by number
const BRAND_ARCHETYPES: Record<number, { name: string; keywords: string[]; brands: string }> = {
  1: { name: 'The Pioneer', keywords: ['innovation', 'leadership', 'first-mover'], brands: 'Tesla, Apple, Nike' },
  2: { name: 'The Connector', keywords: ['partnership', 'community', 'harmony'], brands: 'LinkedIn, Airbnb, Dove' },
  3: { name: 'The Creator', keywords: ['creativity', 'joy', 'self-expression'], brands: 'Lego, Disney, Spotify' },
  4: { name: 'The Builder', keywords: ['reliability', 'structure', 'trust'], brands: 'IKEA, Amazon, Bosch' },
  5: { name: 'The Explorer', keywords: ['freedom', 'adventure', 'discovery'], brands: 'Jeep, National Geographic, Red Bull' },
  6: { name: 'The Caregiver', keywords: ['nurturing', 'service', 'wellness'], brands: 'Johnson & Johnson, Whole Foods, TOMS' },
  7: { name: 'The Sage', keywords: ['wisdom', 'truth', 'expertise'], brands: 'Google, BBC, Harvard' },
  8: { name: 'The Ruler', keywords: ['power', 'luxury', 'achievement'], brands: 'Rolex, Mercedes, Goldman Sachs' },
  9: { name: 'The Humanitarian', keywords: ['purpose', 'inclusion', 'legacy'], brands: 'Patagonia, TOMS, Ben & Jerry\'s' },
  11: { name: 'The Visionary', keywords: ['inspiration', 'intuition', 'transformation'], brands: 'SpaceX, TED, Headspace' },
  22: { name: 'The World Architect', keywords: ['scale', 'impact', 'mastery'], brands: 'WHO, UNICEF, McKinsey' },
  33: { name: 'The Healer', keywords: ['love', 'healing', 'elevation'], brands: 'Calm, Oprah\'s OWN, Deepak Chopra' },
  44: { name: 'The Master Builder', keywords: ['legacy', 'discipline', 'endurance'], brands: 'NASA, CERN, Berkshire Hathaway' },
};

const COPY: Record<Language, {
  title: string; sub: string; label: string; placeholder: string;
  btn: string; brandNum: string; soulNum: string; archetype: string;
  keywords: string; similar: string; tagline: string; taglineSub: string;
}> = {
  en: { title:'Brand Numerology', sub:'Discover the energy of your brand name', label:'Brand or Company Name', placeholder:'e.g. Coca-Cola, Zara, Studio Luna…', btn:'Analyze Brand', brandNum:'Brand Number', soulNum:'Brand Soul', archetype:'Brand Archetype', keywords:'Key Energies', similar:'Brands with same energy', tagline:'Brand Message Direction', taglineSub:'Suggested brand voice' },
  es: { title:'Numerología de Branding', sub:'Descubre la energía de tu marca', label:'Nombre de marca o empresa', placeholder:'Ej. Coca-Cola, Zara, Studio Luna…', btn:'Analizar Marca', brandNum:'Número de Marca', soulNum:'Alma de Marca', archetype:'Arquetipo de Marca', keywords:'Energías clave', similar:'Marcas con la misma energía', tagline:'Dirección del mensaje de marca', taglineSub:'Voz de marca sugerida' },
  it: { title:'Numerologia del Brand', sub:'Scopri l\'energia del tuo nome di marca', label:'Nome del brand o azienda', placeholder:'Es. Coca-Cola, Zara, Studio Luna…', btn:'Analizza Brand', brandNum:'Numero di Brand', soulNum:'Anima del Brand', archetype:'Archetipo del Brand', keywords:'Energie chiave', similar:'Brand con la stessa energia', tagline:'Direzione del messaggio', taglineSub:'Voce del brand suggerita' },
  de: { title:'Branding-Numerologie', sub:'Entdecke die Energie deines Markennamens', label:'Marken- oder Firmenname', placeholder:'z.B. Coca-Cola, Zara, Studio Luna…', btn:'Marke analysieren', brandNum:'Markenzahl', soulNum:'Marken-Soul', archetype:'Marken-Archetyp', keywords:'Schlüsselenergien', similar:'Marken mit gleicher Energie', tagline:'Markenbotschaft-Richtung', taglineSub:'Empfohlene Markenstimme' },
  zh: { title:'品牌数字命理', sub:'发现你品牌名称的能量', label:'品牌或公司名称', placeholder:'例如：可口可乐、Zara、Luna Studio…', btn:'分析品牌', brandNum:'品牌数字', soulNum:'品牌灵魂', archetype:'品牌原型', keywords:'核心能量', similar:'相同能量的品牌', tagline:'品牌信息方向', taglineSub:'建议的品牌声音' },
  ja: { title:'ブランド数秘術', sub:'ブランド名のエネルギーを発見する', label:'ブランドまたは会社名', placeholder:'例：コカ・コーラ、Zara、Studio Luna…', btn:'ブランドを分析', brandNum:'ブランド数字', soulNum:'ブランドソウル', archetype:'ブランドアーキタイプ', keywords:'キーエネルギー', similar:'同じエネルギーのブランド', tagline:'ブランドメッセージの方向性', taglineSub:'推奨ブランドボイス' },
  fr: { title:'Numérologie de Marque', sub:'Découvrez l\'énergie de votre nom de marque', label:'Nom de marque ou d\'entreprise', placeholder:'Ex. Coca-Cola, Zara, Studio Luna…', btn:'Analyser la Marque', brandNum:'Nombre de Marque', soulNum:'Âme de Marque', archetype:'Archétype de Marque', keywords:'Énergies clés', similar:'Marques avec la même énergie', tagline:'Direction du message de marque', taglineSub:'Voix de marque suggérée' },
};

const TAGLINES: Record<number, Record<Language, string>> = {
  1:  { en:'Be first. Be bold. Lead.',            es:'Sé el primero. Sé audaz. Lidera.',        it:'Sii il primo. Sii audace.',        de:'Sei Erster. Sei kühn. Führe.',       zh:'第一·勇敢·引领。',                    ja:'最初に。大胆に。リードする。',          fr:'Sois le premier. Sois audacieux.' },
  2:  { en:'Together, we grow.',                  es:'Juntos, crecemos.',                       it:'Insieme, cresciamo.',               de:'Gemeinsam wachsen wir.',              zh:'一起，我们成长。',                     ja:'共に成長する。',                       fr:'Ensemble, nous grandissons.' },
  3:  { en:'Create. Celebrate. Express.',         es:'Crea. Celebra. Exprésate.',               it:'Crea. Celebra. Esprimi.',           de:'Erschaffe. Feiere. Drücke dich aus.',zh:'创造·庆祝·表达。',                    ja:'創造。祝う。表現する。',               fr:'Crée. Célèbre. Exprime-toi.' },
  4:  { en:'Built to last. Built to trust.',      es:'Construido para durar. Para confiar.',    it:'Costruito per durare.',             de:'Gebaut um zu bleiben.',               zh:'经久耐用，值得信赖。',                 ja:'長持ちするために建てられた。',          fr:'Construit pour durer.' },
  5:  { en:'Dare to discover.',                   es:'Atrévete a descubrir.',                   it:'Osa scoprire.',                    de:'Wage die Entdeckung.',                zh:'敢于探索。',                           ja:'発見する勇気を持て。',                  fr:'Ose découvrir.' },
  6:  { en:'Care more. Serve better.',            es:'Cuida más. Sirve mejor.',                 it:'Prenditi cura. Servi meglio.',     de:'Mehr fürsorgen. Besser dienen.',      zh:'更多关怀，更好服务。',                 ja:'もっとケアを。より良く奉仕する。',     fr:'Prends soin. Sers mieux.' },
  7:  { en:'Truth, depth, mastery.',              es:'Verdad, profundidad, maestría.',          it:'Verità, profondità, maestria.',    de:'Wahrheit, Tiefe, Meisterschaft.',    zh:'真相·深度·精通。',                    ja:'真実、深さ、精通。',                   fr:'Vérité, profondeur, maîtrise.' },
  8:  { en:'Power meets purpose.',                es:'El poder encuentra su propósito.',        it:'Il potere incontra lo scopo.',     de:'Stärke trifft Sinn.',                zh:'力量与目标相遇。',                     ja:'力と目的の出会い。',                   fr:'Le pouvoir rencontre le sens.' },
  9:  { en:'For a better world.',                 es:'Por un mundo mejor.',                     it:'Per un mondo migliore.',           de:'Für eine bessere Welt.',             zh:'为了更美好的世界。',                   ja:'より良い世界のために。',               fr:'Pour un monde meilleur.' },
  11: { en:'Imagine what\'s possible.',           es:'Imagina lo posible.',                     it:'Immagina il possibile.',           de:'Stell dir vor, was möglich ist.',    zh:'想象可能性。',                         ja:'可能性を想像せよ。',                   fr:'Imagine ce qui est possible.' },
  22: { en:'Building the future, today.',         es:'Construyendo el futuro, hoy.',            it:'Costruire il futuro, oggi.',       de:'Die Zukunft bauen, heute.',          zh:'今天，建造未来。',                     ja:'今日、未来を築く。',                   fr:'Construire l\'avenir, aujourd\'hui.' },
  33: { en:'Elevate the human experience.',       es:'Eleva la experiencia humana.',            it:'Eleva l\'esperienza umana.',       de:'Die menschliche Erfahrung erheben.', zh:'提升人类体验。',                       ja:'人間の経験を高める。',                  fr:'Élevez l\'expérience humaine.' },
  44: { en:'Endurance. Excellence. Impact.',      es:'Resistencia. Excelencia. Impacto.',       it:'Resistenza. Eccellenza. Impatto.', de:'Ausdauer. Exzellenz. Wirkung.',     zh:'耐久·卓越·影响。',                    ja:'耐久。卓越。影響。',                   fr:'Endurance. Excellence. Impact.' },
};

interface BrandingCalculatorProps {
  language: Language;
}

export const BrandingCalculator = ({ language }: BrandingCalculatorProps) => {
  const [brandName, setBrandName] = useState('');
  const [result, setResult] = useState<null | { brandNum: number; soulNum: number }>(null);
  const copy = COPY[language] ?? COPY.en;

  const analyze = () => {
    if (!brandName.trim()) return;
    const destiny = calculateDestinyNumber(brandName);
    const soul = calculateSoulNumber(brandName);
    setResult({ brandNum: destiny.finalNumber, soulNum: soul.finalNumber });
  };

  const archetype = result ? BRAND_ARCHETYPES[result.brandNum] : null;
  const tagline = result ? (TAGLINES[result.brandNum]?.[language] ?? TAGLINES[result.brandNum]?.en ?? '') : '';

  return (
    <div className="mt-8 pt-8 border-t border-border/40">
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Building2 className="w-4 h-4 text-foreground/60" />
          <h3 className="font-serif text-xl font-medium text-foreground">{copy.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{copy.sub}</p>
      </div>

      <div className="max-w-md mx-auto space-y-3">
        <div>
          <Label className="text-xs font-medium">{copy.label}</Label>
          <div className="flex gap-2 mt-1">
            <Input
              value={brandName}
              onChange={(e) => { setBrandName(e.target.value); setResult(null); }}
              placeholder={copy.placeholder}
              className="input-elegant h-9 text-sm flex-1"
              onKeyDown={(e) => e.key === 'Enter' && analyze()}
            />
            <button
              onClick={analyze}
              disabled={!brandName.trim()}
              className="px-4 py-2 bg-foreground text-background text-xs font-medium rounded-lg disabled:opacity-40 hover:bg-foreground/90 transition-colors whitespace-nowrap"
            >
              {copy.btn}
            </button>
          </div>
        </div>
      </div>

      {result && archetype && (
        <div className="mt-5 max-w-lg mx-auto space-y-4 fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-4 text-center bg-foreground/[0.02]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{copy.brandNum}</p>
              <p className="font-serif text-4xl font-bold text-foreground mt-1">{result.brandNum}</p>
            </div>
            <div className="rounded-xl border border-border p-4 text-center bg-foreground/[0.02]">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{copy.soulNum}</p>
              <p className="font-serif text-4xl font-bold text-foreground mt-1">{result.soulNum}</p>
            </div>
          </div>

          <div className="rounded-xl border border-border/80 p-4 bg-foreground/[0.03]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-foreground/60" />
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{copy.archetype}</p>
            </div>
            <p className="font-serif text-lg font-medium text-foreground">{archetype.name}</p>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 mb-1">{copy.keywords}</p>
            <div className="flex flex-wrap gap-1.5">
              {archetype.keywords.map((k) => (
                <span key={k} className="text-[10px] border border-border/60 rounded-full px-2 py-0.5 text-foreground/70">{k}</span>
              ))}
            </div>

            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-3 mb-1">{copy.similar}</p>
            <p className="text-xs text-foreground/70">{archetype.brands}</p>

            <div className="mt-3 pt-3 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{copy.tagline}</p>
              <p className="font-serif text-sm text-foreground italic">"{tagline}"</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{copy.taglineSub}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
