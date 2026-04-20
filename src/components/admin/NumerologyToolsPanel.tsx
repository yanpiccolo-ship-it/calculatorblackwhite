import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Star, Calculator } from 'lucide-react';

// ─── Numerology Engine ────────────────────────────────────────────────────────

const LETTER_VALUES: Record<string, number> = {
  a:1,b:2,c:3,d:4,e:5,f:6,g:7,h:8,i:9,
  j:1,k:2,l:3,m:4,n:5,o:6,p:7,q:8,r:9,
  s:1,t:2,u:3,v:4,w:5,x:6,y:7,z:8,
};
const VOWELS = new Set(['a','e','i','o','u']);
const MASTER = [11,22,33,44];

function reduceNum(n: number): number {
  let cur = n;
  while (cur > 9 && !MASTER.includes(cur)) {
    cur = String(cur).split('').reduce((s,d) => s + +d, 0);
  }
  return cur;
}

function letterVal(c: string) { return LETTER_VALUES[c.toLowerCase()] || 0; }

function destinyNumber(name: string) {
  const sum = name.replace(/[^a-zA-Z]/g,'').split('').reduce((s,c) => s + letterVal(c), 0);
  return reduceNum(sum);
}
function soulNumber(name: string) {
  const sum = name.replace(/[^a-zA-Z]/g,'').split('').filter(c => VOWELS.has(c.toLowerCase())).reduce((s,c) => s + letterVal(c), 0);
  return reduceNum(sum);
}
function personalityNumber(name: string) {
  const sum = name.replace(/[^a-zA-Z]/g,'').split('').filter(c => !VOWELS.has(c.toLowerCase())).reduce((s,c) => s + letterVal(c), 0);
  return reduceNum(sum);
}
function personalYearNumber(birthDate: string) {
  const parts = birthDate.split('-');
  if (parts.length < 3) return null;
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  const currentYear = new Date().getFullYear();
  return reduceNum(day + month + currentYear);
}

// ─── Tarot + Archetype Data ──────────────────────────────────────────────────

type TarotEntry = {
  card: string;
  roman: string;
  jungArchetype: string;
  shadow: string;
  light: string;
  essence: string;
  color: { bg: string; accent: string; text: string };
};

const TAROT_MAP: Record<number, TarotEntry> = {
  1: {
    roman:'I', card:'I · Le Bateleur (El Mago)', jungArchetype:'El Héroe · El Yo Consciente',
    shadow:'Manipulación, arrogancia, uso del poder sin ética',
    light:'Manifestación creativa, voluntad alineada, maestría de los propios recursos',
    essence:'Voluntad y manifestación',
    color: { bg:'#FF6B35', accent:'#FF4500', text:'#fff' },
  },
  2: {
    roman:'II', card:'II · La Papesse (La Papisa)', jungArchetype:'El Ánima · La Sabia Interior',
    shadow:'Secretismo, pasividad excesiva, bloqueo de la intuición',
    light:'Sabiduría intuitiva, conexión con el inconsciente, receptividad sagrada',
    essence:'Intuición y misterio',
    color: { bg:'#7B68EE', accent:'#5A4CD6', text:'#fff' },
  },
  3: {
    roman:'III', card:"III · L'Impératrice (La Emperatriz)", jungArchetype:'La Gran Madre · Ánima Fértil',
    shadow:'Dependencia afectiva, sobreprotección, caos creativo',
    light:'Creatividad desbordante, amor incondicional, abundancia y expresión del alma',
    essence:'Creatividad y abundancia',
    color: { bg:'#F39C12', accent:'#D68910', text:'#fff' },
  },
  4: {
    roman:'IIII', card:"IIII · L'Empereur (El Emperador)", jungArchetype:'El Padre · El Rey Interior',
    shadow:'Rigidez, control, autoritarismo, miedo al cambio',
    light:'Estructura sagrada, liderazgo con integridad, dominio de la realidad material',
    essence:'Orden y construcción',
    color: { bg:'#2ECC71', accent:'#1A9A50', text:'#fff' },
  },
  5: {
    roman:'V', card:'V · Le Pape (El Papa / Hierofante)', jungArchetype:'El Sabio · El Guía Espiritual',
    shadow:'Dogmatismo, conformismo, dependencia de la aprobación externa',
    light:'Transmisión de conocimiento sagrado, puente entre lo humano y lo divino',
    essence:'Conocimiento y tradición',
    color: { bg:'#E74C3C', accent:'#C0392B', text:'#fff' },
  },
  6: {
    roman:'VI', card:"VI · L'Amoureux (El Enamorado)", jungArchetype:'Ánima/Ánimus · Integración de Polaridades',
    shadow:'Indecisión crónica, dependencia emocional, conflicto de valores',
    light:'Elección consciente, integración de polaridades, amor como elección del alma',
    essence:'Amor y elección',
    color: { bg:'#E91E8C', accent:'#B5157A', text:'#fff' },
  },
  7: {
    roman:'VII', card:'VII · Le Chariot (El Carro)', jungArchetype:'El Guerrero · La Voluntad Triunfante',
    shadow:'Control rígido, victoria vacía, falta de integración emocional',
    light:'Dominio de fuerzas internas opuestas, avance con propósito, conquista del destino',
    essence:'Determinación y conquista',
    color: { bg:'#3498DB', accent:'#1A6FAD', text:'#fff' },
  },
  8: {
    roman:'VIII', card:'VIII · La Justice (La Justicia)', jungArchetype:'El Árbitro · La Conciencia Moral',
    shadow:'Juicio implacable, frialdad, inflexibilidad moral',
    light:'Equilibrio kármico, discernimiento elevado, integridad en todas las decisiones',
    essence:'Justicia y equilibrio',
    color: { bg:'#8E44AD', accent:'#6C2E8A', text:'#fff' },
  },
  9: {
    roman:'VIIII', card:"VIIII · L'Ermite (El Ermitaño)", jungArchetype:'El Viejo Sabio · El Sí-Mismo Profundo',
    shadow:'Aislamiento patológico, soledad como huida, perfeccionismo estéril',
    light:'Búsqueda interior luminosa, guía espiritual auténtica, sabiduría ganada en silencio',
    essence:'Sabiduría y completitud',
    color: { bg:'#1ABC9C', accent:'#0E8C72', text:'#fff' },
  },
  11: {
    roman:'XI', card:'XI · La Force (La Fuerza)', jungArchetype:'El Domador · La Energía Integrada',
    shadow:'Represión de la sombra, lucha constante con los instintos',
    light:'Integración del instinto y el espíritu, fuerza desde la compasión, coraje del alma',
    essence:'Fuerza espiritual y dominio',
    color: { bg:'#D4AF37', accent:'#A08020', text:'#111' },
  },
  22: {
    roman:'★', card:'Le Mat (El Loco) — sin número', jungArchetype:'El Trickster · El Espíritu Libre',
    shadow:'Irresponsabilidad, huida de la realidad, caos sin propósito',
    light:'Libertad absoluta, confianza en el universo, potencial ilimitado del Arquitecto del Mundo',
    essence:'Potencial infinito y libertad',
    color: { bg:'#D4AF37', accent:'#A08020', text:'#111' },
  },
  33: {
    roman:'VI★', card:"VI★ · L'Amoureux — Vibración Superior", jungArchetype:'Maestro del Amor · Integración Total',
    shadow:'Sacrificio excesivo, martirio emocional, amor desde la herida',
    light:'Amor incondicional como misión de vida, sanación colectiva a través de la presencia',
    essence:'Amor universal y sanación',
    color: { bg:'#D4AF37', accent:'#A08020', text:'#111' },
  },
  44: {
    roman:'IIII★', card:"IIII★ · L'Empereur — Maestro Planificador", jungArchetype:'El Maestro Planificador · Constructor Universal',
    shadow:'Carga abrumadora de responsabilidad, desequilibrio entre ambición material y ética espiritual; el perfeccionismo puede paralizar y aislar',
    light:'Creación de estructuras duraderas que benefician a muchos; manifestación a escala global con eficiencia, estabilidad extrema y sabiduría ética',
    essence:'Planificación maestra y manifestación global',
    color: { bg:'#D4AF37', accent:'#A08020', text:'#111' },
  },
};

function getTarot(n: number): TarotEntry {
  if (TAROT_MAP[n]) return TAROT_MAP[n];
  const r = n % 9 || 9;
  return TAROT_MAP[r] || TAROT_MAP[1];
}

const ARCHETYPES: Record<number, string> = {
  1:'El Pionero', 2:'El Mediador', 3:'El Creador', 4:'El Constructor',
  5:'El Explorador', 6:'El Cuidador', 7:'El Sabio', 8:'El Líder', 9:'El Humanitario',
  11:'El Visionario', 22:'El Arquitecto del Mundo', 33:'El Maestro del Amor', 44:'El Maestro Planificador',
};

// ─── Number Card ─────────────────────────────────────────────────────────────

type NumberCardProps = { label: string; number: number; sublabel?: string };

const NumberCard = ({ label, number, sublabel }: NumberCardProps) => {
  const [showShadow, setShowShadow] = useState(false);
  const tarot = getTarot(number);
  const archetype = ARCHETYPES[number] || ARCHETYPES[(number % 9) || 9];
  const isMaster = MASTER.includes(number);

  return (
    <div className="rounded-2xl overflow-hidden shadow-md border border-gray-100">
      {/* Top color band */}
      <div className="p-5 text-white" style={{ background: `linear-gradient(135deg, ${tarot.color.bg}, ${tarot.color.accent})` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest font-semibold opacity-70 mb-1">{label}</p>
            <div className="flex items-center gap-2">
              <span className="text-5xl font-bold" style={{ color: tarot.color.text }}>{number}</span>
              {isMaster && <Star className="w-5 h-5 text-yellow-200 fill-yellow-200" />}
            </div>
            <p className="text-sm font-medium mt-1 opacity-90" style={{ color: tarot.color.text }}>{archetype}</p>
            {sublabel && <p className="text-[10px] opacity-60 mt-0.5" style={{ color: tarot.color.text }}>{sublabel}</p>}
          </div>
          {/* Roman numeral */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: 'rgba(0,0,0,0.2)', color: tarot.color.text }}
          >
            {tarot.roman}
          </div>
        </div>

        {/* Tarot card name */}
        <div className="mt-3 bg-black/20 rounded-xl px-3 py-2">
          <p className="text-[9px] uppercase tracking-widest opacity-60" style={{ color: tarot.color.text }}>Tarot de Marsella</p>
          <p className="text-sm font-serif font-medium" style={{ color: tarot.color.text }}>{tarot.card}</p>
          <p className="text-[10px] opacity-70 mt-0.5" style={{ color: tarot.color.text }}>{tarot.jungArchetype}</p>
        </div>
      </div>

      {/* Essence */}
      <div className="px-4 pt-3 pb-2 bg-white">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Esencia</p>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{tarot.essence}</p>
      </div>

      {/* Toggle Shadow / Light */}
      <div className="px-4 pb-4 bg-white">
        <div className="flex border rounded-lg overflow-hidden mt-2 mb-3">
          <button
            className={`flex-1 text-[10px] py-1.5 font-medium transition-colors ${!showShadow ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            onClick={() => setShowShadow(false)}
          >
            ☀️ Luz
          </button>
          <button
            className={`flex-1 text-[10px] py-1.5 font-medium transition-colors ${showShadow ? 'bg-gray-900 text-white' : 'text-gray-400 hover:bg-gray-50'}`}
            onClick={() => setShowShadow(true)}
          >
            🌑 Sombra
          </button>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          {showShadow ? tarot.shadow : tarot.light}
        </p>
      </div>
    </div>
  );
};

// ─── Personal Year History ────────────────────────────────────────────────────

const PersonalYearTimeline = ({ birthDate }: { birthDate: string }) => {
  const parts = birthDate.split('-');
  if (parts.length < 3) return null;
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);
  const currentYear = new Date().getFullYear();

  const years = Array.from({ length: 9 }, (_, i) => {
    const year = currentYear - 2 + i;
    const num = reduceNum(day + month + year);
    const tarot = getTarot(num);
    return { year, num, tarot };
  });

  return (
    <div className="rounded-2xl border overflow-hidden">
      <div className="bg-gray-900 px-5 py-3">
        <p className="text-white font-semibold text-sm">Ciclo de Años Personales</p>
        <p className="text-white/40 text-xs">Evolución numerológica 9-12 años</p>
      </div>
      <div className="overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {years.map(({ year, num, tarot }) => {
            const isCurrent = year === currentYear;
            return (
              <div
                key={year}
                className={`flex-1 min-w-[90px] p-3 border-r last:border-r-0 ${isCurrent ? 'bg-yellow-50' : 'bg-white'}`}
              >
                <p className={`text-[10px] font-bold ${isCurrent ? 'text-yellow-600' : 'text-gray-400'}`}>
                  {year}{isCurrent ? ' ◀' : ''}
                </p>
                <p
                  className="text-2xl font-bold mt-1"
                  style={{ color: tarot.color.bg }}
                >
                  {num}
                </p>
                <p className="text-[9px] text-gray-500 leading-tight mt-1">{tarot.essence}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const NumerologyToolsPanel = () => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [result, setResult] = useState<{
    destiny: number;
    soul: number;
    personality: number;
    personalYear: number | null;
  } | null>(null);

  const calculate = () => {
    if (!name.trim()) return;
    setResult({
      destiny: destinyNumber(name),
      soul: soulNumber(name),
      personality: personalityNumber(name),
      personalYear: birthDate ? personalYearNumber(birthDate) : null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Herramientas de Numerología & Tarot</h2>
        <p className="text-xs text-muted-foreground">Calcula los números de cualquier persona y ve su perfil arquetípico completo</p>
      </div>

      {/* Input form */}
      <div className="bg-gray-900 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-1">
            <Label className="text-white/60 text-xs uppercase tracking-wider">Nombre Completo</Label>
            <Input
              placeholder="Nombre completo (como aparece en el documento)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && calculate()}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30 focus:border-yellow-400"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-white/60 text-xs uppercase tracking-wider">Fecha de Nacimiento</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={e => setBirthDate(e.target.value)}
              className="bg-white/10 border-white/20 text-white focus:border-yellow-400"
            />
          </div>
        </div>
        <Button
          onClick={calculate}
          disabled={!name.trim()}
          className="mt-4 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-8"
        >
          <Calculator className="w-4 h-4 mr-2" />
          Calcular Perfil Numerológico
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary strip */}
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 flex-wrap">
            <div className="font-serif text-lg font-semibold text-gray-800 flex-1 min-w-[150px]">
              {name}
              {birthDate && <span className="text-gray-400 text-sm font-normal ml-2">· {birthDate}</span>}
            </div>
            {[
              { label: 'Destino', n: result.destiny },
              { label: 'Alma', n: result.soul },
              { label: 'Pers.', n: result.personality },
              ...(result.personalYear ? [{ label: `Año ${new Date().getFullYear()}`, n: result.personalYear }] : []),
            ].map(({ label, n }) => {
              const c = getTarot(n).color;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-base font-bold shadow" style={{ background: c.bg, color: c.text }}>
                    {n}
                  </div>
                  <span className="text-xs text-gray-500">{label}</span>
                </div>
              );
            })}
          </div>

          {/* Number Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <NumberCard label="Número de Vida · Destino" number={result.destiny} sublabel="Propósito y misión del alma" />
            <NumberCard label="Número del Alma" number={result.soul} sublabel="Deseo profundo del corazón" />
            <NumberCard label="Número de Personalidad" number={result.personality} sublabel="Cómo te perciben los demás" />
            {result.personalYear && (
              <NumberCard label={`Año Personal ${new Date().getFullYear()}`} number={result.personalYear} sublabel="Ciclo actual de vida" />
            )}
          </div>

          {/* Personal Year Timeline */}
          {birthDate && <PersonalYearTimeline birthDate={birthDate} />}

          {/* Compatibility Quick Guide */}
          <div className="rounded-2xl border overflow-hidden">
            <div className="bg-gray-900 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold text-sm">Guía Rápida de Compatibilidad</p>
                <p className="text-white/40 text-xs">Números que armonizan con el {result.destiny} de Vida</p>
              </div>
            </div>
            <div className="p-5 bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                {getCompatibility(result.destiny).map((group, i) => (
                  <div key={i}>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${
                      i === 0 ? 'text-green-600' : i === 1 ? 'text-yellow-600' : 'text-red-500'
                    }`}>
                      {i === 0 ? '✓ Alta afinidad' : i === 1 ? '◎ Compatible' : '✗ Tensión / Crecimiento'}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {group.map(n => {
                        const c = getTarot(n).color;
                        return (
                          <div key={n} className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm" style={{ background: c.bg, color: c.text }}>
                            {n}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reference table */}
      {!result && (
        <div className="rounded-2xl border overflow-hidden">
          <div className="bg-gray-50 px-5 py-3 border-b">
            <p className="text-sm font-semibold text-gray-700">Tabla de Referencia — Arcanos Mayores del Tarot de Marsella</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="text-left px-4 py-2.5">#</th>
                  <th className="text-left px-4 py-2.5">Carta</th>
                  <th className="text-left px-4 py-2.5">Arquetipo Junguiano</th>
                  <th className="text-left px-4 py-2.5 hidden md:table-cell">Esencia</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TAROT_MAP).map(([num, entry]) => (
                  <tr key={num} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm" style={{ background: entry.color.bg, color: entry.color.text }}>
                        {num}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-serif">{entry.card}</td>
                    <td className="px-4 py-2.5 text-gray-500">{entry.jungArchetype}</td>
                    <td className="px-4 py-2.5 text-gray-400 hidden md:table-cell">{entry.essence}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple numerology compatibility map
function getCompatibility(n: number): number[][] {
  const map: Record<number, number[][]> = {
    1: [[5,3,9],[2,4,8],[6,7]],
    2: [[6,4,8],[1,3,9],[5,7]],
    3: [[1,5,9],[2,6],[4,7,8]],
    4: [[2,6,8],[1,4,7],[3,5,9]],
    5: [[1,3,7],[5,9],[2,4,6,8]],
    6: [[2,4,9],[1,3,8],[5,7]],
    7: [[5,7,9],[1,2,4],[3,6,8]],
    8: [[2,4,6],[1,8],[3,5,7,9]],
    9: [[3,6,9],[1,5,7],[2,4,8]],
    11: [[11,22,33],[2,6],[4,8]],
    22: [[11,22,44],[4,8],[3,9]],
    33: [[11,33,6],[2,9],[4,7]],
    44: [[22,44,8],[4,1],[3,6]],
  };
  return map[n] || map[(n % 9) || 9] || [[1],[2],[3]];
}

export default NumerologyToolsPanel;
