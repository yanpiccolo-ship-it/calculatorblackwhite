import { useState } from 'react';
import { Language } from '@/lib/translations';
import { Heart } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

// Compatibility scores [1-9] and notes for each pair (both directions equal)
// Key: `${Math.min(a,b)}-${Math.max(a,b)}`
type CompatNote = { score: number; en: string; es: string; it: string; de: string; zh: string; ja: string; fr: string };

const COMPAT: Record<string, CompatNote> = {
  '1-1': { score:7, en:'Two leaders — exciting but competitive. Needs mutual admiration.', es:'Dos líderes — emocionante pero competitivo. Necesita admiración mutua.', it:'Due leader: stimolante ma competitivo.',de:'Zwei Leader — aufregend, aber wetteifernd.',zh:'两位领导者——令人兴奋但竞争激烈。',ja:'二人のリーダー—刺激的だが競争的。',fr:'Deux leaders — passionnant mais compétitif.' },
  '1-2': { score:9, en:'Perfect balance: the leader and the supporter. Natural harmony.', es:'Equilibrio perfecto: el líder y el apoyo. Armonía natural.', it:'Equilibrio perfetto.',de:'Perfekte Balance.',zh:'完美平衡：领导者与支持者。',ja:'完璧なバランス。',fr:'Équilibre parfait.' },
  '1-3': { score:8, en:'Vibrant and creative — 3 inspires 1, 1 gives direction to 3.', es:'Vibrante y creativo — el 3 inspira al 1, el 1 da dirección al 3.', it:'Vibrante e creativo.',de:'Lebendig und kreativ.',zh:'充满活力和创造力。',ja:'活気があり創造的。',fr:'Vibrant et créatif.' },
  '1-4': { score:6, en:'Builders in different modes — 1 moves fast, 4 builds slowly. Patience required.', es:'Constructores en distintos modos — el 1 va rápido, el 4 construye despacio.', it:'Costruttori in modalità diverse.',de:'Verschiedene Bauweisen.',zh:'不同节奏的建设者。',ja:'異なるペースの建設者。',fr:'Constructeurs à rythmes différents.' },
  '1-5': { score:8, en:'Two free spirits — adventure and excitement, but commitment is a challenge.', es:'Dos espíritus libres — aventura y emoción, pero el compromiso es un reto.', it:'Due spiriti liberi.',de:'Zwei freie Seelen.',zh:'两个自由灵魂。',ja:'二人の自由な魂。',fr:'Deux esprits libres.' },
  '1-6': { score:7, en:'6 nurtures what 1 builds. Works beautifully when 1 doesn\'t dominate.', es:'El 6 nutre lo que el 1 construye. Funciona bien cuando el 1 no domina.', it:'6 nutre ciò che 1 costruisce.',de:'6 nährt, was 1 aufbaut.',zh:'6滋养1构建的一切。',ja:'6は1が構築するものを育む。',fr:'6 nourrit ce que 1 construit.' },
  '1-7': { score:6, en:'Intellectual respect, but 1 needs action while 7 needs depth. Balance is key.', es:'Respeto intelectual, pero el 1 necesita acción y el 7 necesita profundidad.', it:'Rispetto intellettuale.',de:'Intellektueller Respekt.',zh:'理智上的尊重。',ja:'知的な尊重。',fr:'Respect intellectuel.' },
  '1-8': { score:8, en:'Power couple — both ambitious. Incredible when they align on vision.', es:'Pareja de poder — ambos ambiciosos. Increíble cuando se alinean en la visión.', it:'Coppia di potere.',de:'Mächtigespaar.',zh:'强力组合。',ja:'パワーカップル。',fr:'Couple de pouvoir.' },
  '1-9': { score:7, en:'1 pioneers, 9 completes. Together they cover the full cycle of creation.', es:'El 1 abre camino, el 9 cierra ciclos. Juntos cubren el ciclo completo.', it:'1 apre, 9 chiude.',de:'1 beginnt, 9 schließt ab.',zh:'1开创，9完成。',ja:'1は開拓し、9は完成させる。',fr:'1 ouvre, 9 clôt.' },
  '2-2': { score:8, en:'Deep emotional bond. Needs one to take the lead to avoid stagnation.', es:'Vínculo emocional profundo. Uno debe tomar el liderazgo para evitar el estancamiento.', it:'Legame emotivo profondo.',de:'Tiefe emotionale Bindung.',zh:'深厚的情感联系。',ja:'深い感情的なつながり。',fr:'Lien émotionnel profond.' },
  '2-3': { score:9, en:'Joy and sensitivity together — one of the most harmonious combinations.', es:'Alegría y sensibilidad juntas — una de las combinaciones más armónicas.', it:'Gioia e sensibilità.',de:'Freude und Sensibilität.',zh:'喜悦与敏感相结合。',ja:'喜びと感受性。',fr:'Joie et sensibilité.' },
  '2-4': { score:8, en:'Solid and caring — 4 builds the structure, 2 fills it with warmth.', es:'Sólido y afectuoso — el 4 construye la estructura, el 2 la llena de calidez.', it:'Solido e premuroso.',de:'Solide und fürsorglich.',zh:'坚实而温暖。',ja:'堅固で思いやりがある。',fr:'Solide et affectueux.' },
  '2-5': { score:5, en:'Challenge: 5 needs freedom, 2 needs closeness. Possible with strong communication.', es:'Desafío: el 5 necesita libertad, el 2 necesita cercanía. Posible con comunicación sólida.', it:'Sfida: libertà vs vicinanza.',de:'Herausforderung: Freiheit vs. Nähe.',zh:'挑战：自由与亲密。',ja:'課題：自由と近さ。',fr:'Défi : liberté vs proximité.' },
  '2-6': { score:9, en:'Deeply nurturing — both care-givers. A relationship of genuine emotional safety.', es:'Profundamente nutritivo — ambos cuidan. Una relación de auténtica seguridad emocional.', it:'Profondamente premuroso.',de:'Tiefgründig fürsorglich.',zh:'深度滋养。',ja:'深い愛情。',fr:'Profondément bienveillant.' },
  '2-7': { score:6, en:'Both introspective, but in different ways. Needs shared intellectual depth.', es:'Ambos introspectivos, pero de forma diferente. Necesita profundidad intelectual compartida.', it:'Entrambi introspettivi.',de:'Beide introspektiv.',zh:'两者都内省，但方式不同。',ja:'両者とも内省的。',fr:'Tous deux introspectifs.' },
  '2-8': { score:7, en:'8 provides strength, 2 provides empathy. Works when power is respected.', es:'El 8 aporta fuerza, el 2 aporta empatía. Funciona cuando se respeta el poder.', it:'8 fornisce forza, 2 empatia.',de:'8 gibt Kraft, 2 Empathie.',zh:'8提供力量，2提供同理心。',ja:'8は力、2は共感。',fr:'8 apporte force, 2 empathie.' },
  '2-9': { score:8, en:'Both compassionate and giving. Soul-level connection, naturally.', es:'Ambos compasivos y generosos. Conexión a nivel de alma, naturalmente.', it:'Entrambi compassionevoli.',de:'Beide mitfühlend.',zh:'两者都富有同情心。',ja:'両者ともに思いやりがある。',fr:'Tous deux compatissants.' },
  '3-3': { score:8, en:'Endless creativity and fun — just make sure real life isn\'t avoided.', es:'Creatividad y diversión sin fin — solo asegúrate de no evadir la vida real.', it:'Creatività e divertimento.',de:'Endlose Kreativität.',zh:'无尽的创意和乐趣。',ja:'無限の創造性と楽しさ。',fr:'Créativité et plaisir sans fin.' },
  '3-4': { score:6, en:'Opposite rhythms — 3 improvises, 4 plans. Beautiful when they respect each other.', es:'Ritmos opuestos — el 3 improvisa, el 4 planifica. Hermoso cuando se respetan.', it:'Ritmi opposti.',de:'Entgegengesetzte Rhythmen.',zh:'相反的节奏。',ja:'対照的なリズム。',fr:'Rythmes opposés.' },
  '3-5': { score:9, en:'Adventures in creativity — spontaneous, vibrant, full of life.', es:'Aventuras creativas — espontáneo, vibrante, lleno de vida.', it:'Avventure creative.',de:'Kreative Abenteuer.',zh:'创意冒险。',ja:'創造的な冒険。',fr:'Aventures créatives.' },
  '3-6': { score:8, en:'3 brings joy, 6 brings love. A home filled with creativity and warmth.', es:'El 3 trae alegría, el 6 trae amor. Un hogar lleno de creatividad y calidez.', it:'3 porta gioia, 6 amore.',de:'3 bringt Freude, 6 Liebe.',zh:'3带来欢乐，6带来爱。',ja:'3は喜び、6は愛。',fr:'3 apporte joie, 6 amour.' },
  '3-7': { score:6, en:'7\'s depth can feel heavy for 3. But the intellectual connection can be remarkable.', es:'La profundidad del 7 puede pesar al 3. Pero la conexión intelectual puede ser notable.', it:'La profondità del 7 pesa al 3.',de:'7s Tiefe kann 3 belasten.',zh:'7的深度对3来说可能沉重。',ja:'7の深さは3には重く感じるかも。',fr:'La profondeur du 7 peut peser sur le 3.' },
  '3-8': { score:7, en:'3 lightens 8\'s seriousness, 8 gives 3 direction. Complementary energies.', es:'El 3 aligera la seriedad del 8, el 8 da dirección al 3. Energías complementarias.', it:'3 alleggerisce l\'8.',de:'3 erleichtert 8s Ernst.',zh:'3减轻8的严肃。',ja:'3は8の重さを軽くする。',fr:'3 allège le sérieux de 8.' },
  '3-9': { score:9, en:'Creative and humanitarian — they inspire each other to give to the world.', es:'Creativo y humanitario — se inspiran mutuamente a dar al mundo.', it:'Creativo e umanitario.',de:'Kreativ und humanitär.',zh:'创造性与人道主义。',ja:'創造的で人道主義的。',fr:'Créatif et humanitaire.' },
  '4-4': { score:7, en:'Rock solid — but may lack spontaneity. Schedule date nights.', es:'Sólido como una roca — pero puede carecer de espontaneidad. Agenda momentos de aventura.', it:'Solidissimo ma manca spontaneità.',de:'Felsenfest, aber wenig Spontaneität.',zh:'非常稳固，但可能缺乏自发性。',ja:'岩のように安定しているが、自発性が乏しい。',fr:'Solide comme un roc, mais manque de spontanéité.' },
  '4-5': { score:5, en:'4 wants stability, 5 wants freedom. Requires major compromises.', es:'El 4 quiere estabilidad, el 5 quiere libertad. Requiere grandes compromisos.', it:'4 vuole stabilità, 5 libertà.',de:'4 will Stabilität, 5 Freiheit.',zh:'4要稳定，5要自由。',ja:'4は安定、5は自由を求める。',fr:'4 veut stabilité, 5 liberté.' },
  '4-6': { score:9, en:'Home builders — devoted, reliable, and nurturing. One of the most stable bonds.', es:'Constructores de hogar — devotos, fiables y cariñosos. Uno de los vínculos más estables.', it:'Costruttori di casa.',de:'Heimerbauer.',zh:'家园建造者。',ja:'家庭の建設者。',fr:'Bâtisseurs de foyer.' },
  '4-7': { score:7, en:'Practical meets philosophical — complementary if they respect the difference.', es:'Lo práctico se encuentra con lo filosófico — complementarios si respetan la diferencia.', it:'Pratico incontra filosofico.',de:'Praktisch trifft philosophisch.',zh:'实用遇上哲学。',ja:'実用的と哲学的の出会い。',fr:'Pratique rencontre philosophique.' },
  '4-8': { score:8, en:'Material power couple — both work hard and build with excellence.', es:'Pareja de poder material — ambos trabajan duro y construyen con excelencia.', it:'Coppia di potere materiale.',de:'Materielles Mächtepaar.',zh:'物质强力组合。',ja:'物質的なパワーカップル。',fr:'Couple de puissance matérielle.' },
  '4-9': { score:6, en:'4 builds for today, 9 builds for eternity. Can be beautiful with shared values.', es:'El 4 construye para hoy, el 9 para la eternidad. Hermoso con valores compartidos.', it:'4 costruisce oggi, 9 per l\'eternità.',de:'4 baut für heute, 9 für die Ewigkeit.',zh:'4为今天而建，9为永恒而建。',ja:'4は今日、9は永遠のために建てる。',fr:'4 construit pour aujourd\'hui, 9 pour l\'éternité.' },
  '5-5': { score:7, en:'Wild adventure — they need to learn to root together or they drift apart.', es:'Aventura salvaje — necesitan aprender a echar raíces juntos o se alejarán.', it:'Avventura selvaggia.',de:'Wilde Abenteuer.',zh:'狂野冒险。',ja:'ワイルドな冒険。',fr:'Aventure sauvage.' },
  '5-6': { score:6, en:'5 wants freedom, 6 wants commitment. Possible with clear boundaries.', es:'El 5 quiere libertad, el 6 quiere compromiso. Posible con límites claros.', it:'5 vuole libertà, 6 impegno.',de:'5 will Freiheit, 6 Engagement.',zh:'5要自由，6要承诺。',ja:'5は自由、6はコミットメントを求める。',fr:'5 veut liberté, 6 engagement.' },
  '5-7': { score:8, en:'Both independent — deep intellectual and spiritual chemistry.', es:'Ambos independientes — profunda química intelectual y espiritual.', it:'Entrambi indipendenti.',de:'Beide unabhängig.',zh:'两者都独立。',ja:'両者とも独立している。',fr:'Tous deux indépendants.' },
  '5-8': { score:7, en:'Ambitious and adventurous — powerful if goals align.', es:'Ambicioso y aventurero — poderoso si los objetivos se alinean.', it:'Ambizioso e avventuroso.',de:'Ehrgeizig und abenteuerlustig.',zh:'雄心勃勃而充满冒险精神。',ja:'野心的で冒険的。',fr:'Ambitieux et aventurier.' },
  '5-9': { score:8, en:'The traveler and the philosopher — expansive, curious, life-embracing.', es:'El viajero y el filósofo — expansivo, curioso, que abraza la vida.', it:'Il viaggiatore e il filosofo.',de:'Der Reisende und der Philosoph.',zh:'旅行者与哲学家。',ja:'旅行者と哲学者。',fr:'Le voyageur et le philosophe.' },
  '6-6': { score:8, en:'A nurturing paradise — must be careful not to lose individual identity.', es:'Un paraíso afectuoso — deben cuidar de no perder la identidad individual.', it:'Paradiso amorevole.',de:'Fürsorgendes Paradies.',zh:'滋养的天堂。',ja:'愛情深い楽園。',fr:'Paradis nourricier.' },
  '6-7': { score:6, en:'6 wants togetherness, 7 needs solitude. Requires clear communication.', es:'El 6 quiere unión, el 7 necesita soledad. Requiere comunicación clara.', it:'6 vuole unione, 7 solitudine.',de:'6 will Gemeinschaft, 7 Einsamkeit.',zh:'6要在一起，7需要独处。',ja:'6は一緒にいたい、7は孤独が必要。',fr:'6 veut union, 7 solitude.' },
  '6-8': { score:7, en:'Love and power — 6 softens 8, 8 protects 6. Beautiful complementarity.', es:'Amor y poder — el 6 suaviza al 8, el 8 protege al 6. Hermosa complementariedad.', it:'Amore e potere.',de:'Liebe und Macht.',zh:'爱与力量。',ja:'愛と力。',fr:'Amour et pouvoir.' },
  '6-9': { score:9, en:'Both give unconditionally. A relationship of service, love, and deep purpose.', es:'Ambos dan incondicionalmente. Una relación de servicio, amor y propósito profundo.', it:'Entrambi danno incondizionatamente.',de:'Beide geben bedingungslos.',zh:'两者都无条件给予。',ja:'両者とも無条件に与える。',fr:'Tous deux donnent inconditionnellement.' },
  '7-7': { score:7, en:'Two sages — profound connection but may isolate together from the world.', es:'Dos sabios — conexión profunda pero pueden aislarse juntos del mundo.', it:'Due saggi.',de:'Zwei Weise.',zh:'两位智者。',ja:'二人の賢者。',fr:'Deux sages.' },
  '7-8': { score:6, en:'7 seeks truth, 8 seeks results. Possible if both value depth AND achievement.', es:'El 7 busca la verdad, el 8 los resultados. Posible si ambos valoran la profundidad Y el logro.', it:'7 cerca verità, 8 risultati.',de:'7 sucht Wahrheit, 8 Ergebnisse.',zh:'7寻求真相，8寻求结果。',ja:'7は真実を、8は結果を求める。',fr:'7 cherche vérité, 8 résultats.' },
  '7-9': { score:8, en:'The philosopher and the visionary — profound, spiritual, mutually elevating.', es:'El filósofo y el visionario — profundo, espiritual, mutuamente elevador.', it:'Il filosofo e il visionario.',de:'Der Philosoph und der Visionär.',zh:'哲学家与先知。',ja:'哲学者とビジョナリー。',fr:'Le philosophe et le visionnaire.' },
  '8-8': { score:7, en:'Unstoppable together — but must share power or it becomes a power struggle.', es:'Imparables juntos — pero deben compartir el poder o se convierte en una lucha de poder.', it:'Inarrestabili insieme.',de:'Gemeinsam unaufhaltsam.',zh:'在一起势不可挡。',ja:'一緒に止まらない。',fr:'Inarrêtables ensemble.' },
  '8-9': { score:7, en:'8 accumulates, 9 distributes. Together they can create abundance and meaning.', es:'El 8 acumula, el 9 distribuye. Juntos pueden crear abundancia y significado.', it:'8 accumula, 9 distribuisce.',de:'8 sammelt, 9 verteilt.',zh:'8积累，9分配。',ja:'8は蓄積し、9は分配する。',fr:'8 accumule, 9 distribue.' },
  '9-9': { score:8, en:'Compassionate and purposeful — together they serve humanity beautifully.', es:'Compasivos y con propósito — juntos sirven a la humanidad de forma hermosa.', it:'Compassionevoli e intenzionali.',de:'Mitfühlend und zweckorientiert.',zh:'富有同情心和目的感。',ja:'思いやりがあり目的がある。',fr:'Compatissants et intentionnels.' },
};

function getCompat(a: number, b: number): CompatNote | null {
  const key = `${Math.min(a,b)}-${Math.max(a,b)}`;
  return COMPAT[key] ?? null;
}

function getLifePath(day: number, month: number, year: number): number {
  const MASTERS = [11, 22, 33, 44];
  const reduce = (n: number): number => {
    while (n > 9 && !MASTERS.includes(n)) {
      n = String(n).split('').reduce((s, d) => s + +d, 0);
    }
    return n;
  };
  return reduce(reduce(day) + reduce(month) + reduce(year));
}

const COPY: Record<Language, {
  title: string; sub: string; person1: string; person2: string;
  name: string; born: string; analyze: string; score: string; result: string;
  day: string; month: string; year: string;
}> = {
  en: { title:'Numerological Compatibility', sub:'Discover the energy between two people', person1:'Person 1', person2:'Person 2', name:'Name', born:'Date of birth', analyze:'Check Compatibility', score:'Compatibility', result:'Reading', day:'Day', month:'Month', year:'Year' },
  es: { title:'Compatibilidad Numerológica', sub:'Descubre la energía entre dos personas', person1:'Persona 1', person2:'Persona 2', name:'Nombre', born:'Fecha de nacimiento', analyze:'Ver Compatibilidad', score:'Compatibilidad', result:'Lectura', day:'Día', month:'Mes', year:'Año' },
  it: { title:'Compatibilità Numerologica', sub:'Scopri l\'energia tra due persone', person1:'Persona 1', person2:'Persona 2', name:'Nome', born:'Data di nascita', analyze:'Verifica Compatibilità', score:'Compatibilità', result:'Lettura', day:'Giorno', month:'Mese', year:'Anno' },
  de: { title:'Numerologische Kompatibilität', sub:'Entdecke die Energie zwischen zwei Menschen', person1:'Person 1', person2:'Person 2', name:'Name', born:'Geburtsdatum', analyze:'Kompatibilität prüfen', score:'Kompatibilität', result:'Lesung', day:'Tag', month:'Monat', year:'Jahr' },
  zh: { title:'数字命理相容性', sub:'发现两人之间的能量', person1:'人物1', person2:'人物2', name:'姓名', born:'出生日期', analyze:'查看相容性', score:'相容性', result:'解读', day:'日', month:'月', year:'年' },
  ja: { title:'数秘術の相性', sub:'二人のエネルギーを発見する', person1:'人物1', person2:'人物2', name:'名前', born:'生年月日', analyze:'相性を確認', score:'相性', result:'解読', day:'日', month:'月', year:'年' },
  fr: { title:'Compatibilité Numérologique', sub:'Découvrez l\'énergie entre deux personnes', person1:'Personne 1', person2:'Personne 2', name:'Prénom', born:'Date de naissance', analyze:'Voir la Compatibilité', score:'Compatibilité', result:'Lecture', day:'Jour', month:'Mois', year:'Année' },
};

const SCORE_LABELS: Record<Language, (s: number) => string> = {
  en: (s) => s >= 9 ? 'Exceptional ✦' : s >= 8 ? 'Very High' : s >= 7 ? 'High' : s >= 6 ? 'Moderate' : 'Challenging',
  es: (s) => s >= 9 ? 'Excepcional ✦' : s >= 8 ? 'Muy Alta' : s >= 7 ? 'Alta' : s >= 6 ? 'Moderada' : 'Desafiante',
  it: (s) => s >= 9 ? 'Eccezionale ✦' : s >= 8 ? 'Molto Alta' : s >= 7 ? 'Alta' : s >= 6 ? 'Moderata' : 'Impegnativa',
  de: (s) => s >= 9 ? 'Außergewöhnlich ✦' : s >= 8 ? 'Sehr Hoch' : s >= 7 ? 'Hoch' : s >= 6 ? 'Mittel' : 'Herausfordernd',
  zh: (s) => s >= 9 ? '卓越 ✦' : s >= 8 ? '非常高' : s >= 7 ? '高' : s >= 6 ? '中等' : '具有挑战性',
  ja: (s) => s >= 9 ? '卓越 ✦' : s >= 8 ? '非常に高い' : s >= 7 ? '高い' : s >= 6 ? '中程度' : '挑戦的',
  fr: (s) => s >= 9 ? 'Exceptionnelle ✦' : s >= 8 ? 'Très Haute' : s >= 7 ? 'Haute' : s >= 6 ? 'Modérée' : 'Défiant',
};

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = Array.from({ length: 12 }, (_, i) => i + 1);
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

interface PersonForm { name: string; day: string; month: string; year: string }
const empty = (): PersonForm => ({ name: '', day: '', month: '', year: '' });

interface CompatibilityCalculatorProps { language: Language }

export const CompatibilityCalculator = ({ language }: CompatibilityCalculatorProps) => {
  const [p1, setP1] = useState<PersonForm>(empty());
  const [p2, setP2] = useState<PersonForm>(empty());
  const [result, setResult] = useState<null | { lp1: number; lp2: number; compat: CompatNote }>(null);
  const copy = COPY[language] ?? COPY.en;

  const analyze = () => {
    if (!p1.day || !p1.month || !p1.year || !p2.day || !p2.month || !p2.year) return;
    const lp1 = getLifePath(+p1.day, +p1.month, +p1.year);
    const lp2 = getLifePath(+p2.day, +p2.month, +p2.year);
    const compat = getCompat(lp1, lp2);
    if (compat) setResult({ lp1, lp2, compat });
  };

  const scoreLabel = result ? (SCORE_LABELS[language] ?? SCORE_LABELS.en)(result.compat.score) : '';
  const note = result ? ((result.compat as any)[language] ?? result.compat.en) : '';
  const scoreColor = result
    ? result.compat.score >= 9 ? 'text-emerald-700' : result.compat.score >= 7 ? 'text-amber-700' : 'text-orange-700'
    : '';

  const PersonFields = ({ label, value, onChange }: { label: string; value: PersonForm; onChange: (v: PersonForm) => void }) => (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{label}</p>
      <Input
        placeholder={copy.name}
        value={value.name}
        onChange={(e) => onChange({ ...value, name: e.target.value })}
        className="input-elegant h-9 text-sm"
      />
      <div className="grid grid-cols-3 gap-1.5">
        {(['day', 'month', 'year'] as const).map((field) => (
          <Select key={field} value={value[field]} onValueChange={(v) => onChange({ ...value, [field]: v })}>
            <SelectTrigger className="input-elegant h-9 text-xs">
              <SelectValue placeholder={copy[field]} />
            </SelectTrigger>
            <SelectContent>
              {(field === 'day' ? days : field === 'month' ? months : years).map((v) => (
                <SelectItem key={v} value={String(v)}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-8 pt-8 border-t border-border/40">
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Heart className="w-4 h-4 text-foreground/60" />
          <h3 className="font-serif text-xl font-medium text-foreground">{copy.title}</h3>
        </div>
        <p className="text-xs text-muted-foreground">{copy.sub}</p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <PersonFields label={copy.person1} value={p1} onChange={setP1} />
        <PersonFields label={copy.person2} value={p2} onChange={setP2} />

        <button
          onClick={analyze}
          disabled={!p1.day || !p1.month || !p1.year || !p2.day || !p2.month || !p2.year}
          className="w-full py-2.5 bg-foreground text-background text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-foreground/90 transition-colors"
        >
          {copy.analyze}
        </button>
      </div>

      {result && (
        <div className="mt-5 max-w-md mx-auto fade-in">
          <div className="rounded-xl border border-border p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[10px] text-muted-foreground">{p1.name || copy.person1}</p>
                <p className="font-serif text-3xl font-bold text-foreground">{result.lp1}</p>
              </div>
              <Heart className="w-5 h-5 text-foreground/30 flex-shrink-0" />
              <div className="text-center flex-1">
                <p className="text-[10px] text-muted-foreground">{p2.name || copy.person2}</p>
                <p className="font-serif text-3xl font-bold text-foreground">{result.lp2}</p>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{copy.score}</p>
              <div className="flex items-center justify-center gap-2 mt-0.5">
                <p className={`font-serif text-2xl font-bold ${scoreColor}`}>{result.compat.score}/9</p>
                <span className={`text-xs font-medium ${scoreColor}`}>{scoreLabel}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/40">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{copy.result}</p>
              <p className="text-xs text-foreground/80 leading-relaxed">{note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
