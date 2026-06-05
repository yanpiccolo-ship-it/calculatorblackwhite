import { useState, useEffect, useRef } from 'react';
import { Language } from '@/lib/translations';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

type Category = 'fashion' | 'culture' | 'sports' | 'medicine' | 'history' | 'music' | 'science' | 'art';

interface Curiosity {
  number: number;
  category: Category;
  emoji: string;
  en: string; es: string; it: string; de: string; zh: string; ja: string; fr: string;
}

const CATEGORY_LABEL: Record<Category, Record<Language, string>> = {
  fashion: { en:'Fashion', es:'Moda', it:'Moda', de:'Mode', zh:'时尚', ja:'ファッション', fr:'Mode' },
  culture: { en:'Culture', es:'Cultura', it:'Cultura', de:'Kultur', zh:'文化', ja:'文化', fr:'Culture' },
  sports:  { en:'Sports',  es:'Deporte', it:'Sport',  de:'Sport', zh:'体育', ja:'スポーツ', fr:'Sport' },
  medicine:{ en:'Medicine',es:'Medicina',it:'Medicina',de:'Medizin',zh:'医学', ja:'医学', fr:'Médecine' },
  history: { en:'History', es:'Historia',it:'Storia', de:'Geschichte',zh:'历史',ja:'歴史', fr:'Histoire' },
  music:   { en:'Music',   es:'Música',  it:'Musica', de:'Musik', zh:'音乐', ja:'音楽', fr:'Musique' },
  science: { en:'Science', es:'Ciencia', it:'Scienza',de:'Wissenschaft',zh:'科学',ja:'科学', fr:'Science' },
  art:     { en:'Art',     es:'Arte',    it:'Arte',   de:'Kunst', zh:'艺术', ja:'芸術', fr:'Art' },
};

const ALL: Curiosity[] = [
  { number:5, category:'fashion', emoji:'👗',
    en:'Chanel No. 5 — Coco Chanel chose number 5 as her lucky number. Born on the 19th (1+9=10→1), she created the most iconic perfume of the 20th century. The number 5 vibrates with freedom, sensuality and transgression.',
    es:'Chanel Nº 5 — Coco Chanel eligió el 5 como su número de la suerte. Nacida el día 19 (1+9=10→1), creó el perfume más icónico del siglo XX. El 5 vibra con libertad, sensualidad y transgresión.',
    it:'Chanel N°5 — Coco Chanel scelse il 5 come numero fortunato. Nata il 19 (1+9=10→1), creò il profumo più iconico del XX secolo.',
    de:'Chanel Nr. 5 — Coco Chanel wählte die 5 als ihre Glückszahl. Sie schuf den ikonischsten Duft des 20. Jahrhunderts.',
    zh:'香奈儿5号 — 可可·香奈儿选择5作为她的幸运数字。她出生于19日（1+9=10→1），创造了20世纪最具标志性的香水。',
    ja:'シャネルNo.5 — ココ・シャネルは5をラッキーナンバーに選んだ。19日生まれ（1+9=10→1）、20世紀最もアイコニックな香水を生み出した。',
    fr:'Chanel N°5 — Coco Chanel choisit le 5 comme chiffre porte-bonheur. Née le 19 (1+9=10→1), elle créa le parfum le plus iconique du XXe siècle.' },

  { number:23, category:'sports', emoji:'🏀',
    en:'Michael Jordan wore #23 (2+3=5, the number of freedom and mastery). He won 6 NBA titles — the vibration of service and perfection. His jersey number is the highest-selling in basketball history.',
    es:'Michael Jordan usó el #23 (2+3=5, el número de la libertad y la maestría). Ganó 6 títulos NBA. Su número de camiseta es el más vendido en la historia del baloncesto.',
    it:'Michael Jordan portò il #23 (2+3=5). Vinse 6 titoli NBA. La sua maglia è la più venduta nella storia del basket.',
    de:'Michael Jordan trug #23 (2+3=5). Er gewann 6 NBA-Titel. Sein Trikot ist das meistverkaufte in der Basketballgeschichte.',
    zh:'迈克尔·乔丹穿的是#23（2+3=5，自由与精通之数）。他赢得了6个NBA冠军。他的球衣号是篮球史上销量最高的。',
    ja:'マイケル・ジョーダンは#23（2+3=5）をつけた。6つのNBAタイトルを獲得。彼のジャージはバスケットボール史上最も売れた。',
    fr:'Michael Jordan portait le #23 (2+3=5). Il remporta 6 titres NBA. Son numéro est le plus vendu de l\'histoire du basketball.' },

  { number:7, category:'medicine', emoji:'🧬',
    en:'Human cells regenerate every 7 years — which is why ancient wisdom identified 7 as the number of transformation and healing. The 7 chakras, 7 notes of the musical scale, 7 colors of the rainbow: the body itself is a numerological map.',
    es:'Las células humanas se regeneran cada 7 años — por eso la sabiduría antigua identificó el 7 como el número de la transformación y la sanación. Los 7 chakras, 7 notas musicales, 7 colores del arcoíris: el cuerpo es un mapa numerológico.',
    it:'Le cellule umane si rigenerano ogni 7 anni. I 7 chakra, le 7 note musicali, i 7 colori dell\'arcobaleno: il corpo è una mappa numerologica.',
    de:'Menschliche Zellen regenerieren alle 7 Jahre. Die 7 Chakren, 7 Noten, 7 Regenfarben: Der Körper ist eine numerologische Karte.',
    zh:'人体细胞每7年再生一次。7个脉轮、7个音符、7种彩虹颜色：身体本身就是一张数字命理图。',
    ja:'人体の細胞は7年ごとに再生される。7つのチャクラ、7つの音符、7色の虹：体そのものが数秘術の地図だ。',
    fr:'Les cellules humaines se régénèrent tous les 7 ans. Les 7 chakras, 7 notes musicales, 7 couleurs de l\'arc-en-ciel : le corps est une carte numérologique.' },

  { number:9, category:'history', emoji:'⚡',
    en:'Nikola Tesla was obsessed with 3, 6 and 9. "If you knew the magnificence of these three numbers, you would have a key to the universe." He always walked around a block 3 times before entering a building and lived in room 3327 (3+3+2+7=15→6).',
    es:'Nikola Tesla estaba obsesionado con el 3, el 6 y el 9. "Si conocieras la magnificencia de estos tres números, tendrías una clave del universo." Siempre rodeaba una manzana 3 veces antes de entrar y vivía en la habitación 3327 (3+3+2+7=15→6).',
    it:'Nikola Tesla era ossessionato da 3, 6 e 9. "Se conoscessi la magnificenza di questi tre numeri, avresti la chiave dell\'universo."',
    de:'Nikola Tesla war besessen von 3, 6 und 9. "Wenn du die Größe dieser Zahlen kennst, hast du den Schlüssel zum Universum."',
    zh:'尼古拉·特斯拉痴迷于3、6和9。"如果你知道这三个数字的宏伟，你就会拥有宇宙的钥匙。"他总是绕着一个街区走3圈才进入建筑物。',
    ja:'ニコラ・テスラは3、6、9に取り憑かれていた。「これら3つの数字の壮大さを知れば、宇宙の鍵を手に入れるだろう。」',
    fr:'Nikola Tesla était obsédé par le 3, le 6 et le 9. "Si tu connaissais la magnificence de ces trois nombres, tu aurais la clé de l\'univers."' },

  { number:4, category:'music', emoji:'🎸',
    en:'The Beatles were 4 members (structure, foundation). John Lennon was born on the 9th (completion). "Imagine" was released 9/9 — pure numerological poetry. Their Abbey Road studio is at 3 Abbey Road (3: creativity and expression).',
    es:'Los Beatles eran 4 integrantes (estructura, fundamento). John Lennon nació el día 9 (completitud). "Imagine" fue lanzada el 9/9 — pura poesía numerológica. Abbey Road está en el número 3 (creatividad y expresión).',
    it:'I Beatles erano 4 membri. John Lennon nato il 9. "Imagine" uscì il 9/9. Abbey Road è al numero 3.',
    de:'Die Beatles waren 4 Mitglieder. John Lennon am 9. geboren. "Imagine" erschien am 9/9. Abbey Road ist Nummer 3.',
    zh:'披头士乐队有4名成员（结构、基础）。约翰·列侬出生在9日（完整性）。"Imagine"在9/9发行——纯粹的数字命理诗。',
    ja:'ビートルズは4人。ジョン・レノンは9日生まれ。"Imagine"は9/9にリリース。アビーロードは3番地。',
    fr:'Les Beatles étaient 4 membres. John Lennon né le 9. "Imagine" sortie le 9/9. Abbey Road est au numéro 3.' },

  { number:11, category:'science', emoji:'🔭',
    en:'Albert Einstein (Life Path: born 3/14/1879 → 3+1+4+1+8+7+9=33→6). He published Special Relativity at 26 (2+6=8, power). His famous equation E=MC² has 4 characters (4: structure and foundation of reality). The Genius archetype, numerologically encoded.',
    es:'Albert Einstein (Camino de vida: nacido 14/3/1879 → seis). Publicó la Relatividad Especial a los 26 (2+6=8, poder). Su famosa ecuación E=MC² tiene 4 caracteres (4: estructura y fundamento de la realidad).',
    it:'Albert Einstein (Cammino di vita: 6). Pubblicò la Relatività Speciale a 26 anni (2+6=8). E=MC² ha 4 caratteri.',
    de:'Albert Einstein (Lebensweg: 6). Mit 26 Jahren (2+6=8) veröffentlichte er die Spezielle Relativitätstheorie. E=MC² hat 4 Zeichen.',
    zh:'阿尔伯特·爱因斯坦（生命之道：6）。在26岁（2+6=8，力量）发表了狭义相对论。他著名的方程E=MC²有4个字符（4：现实的结构和基础）。',
    ja:'アルバート・アインシュタイン（ライフパス：6）。26歳（2+6=8）で特殊相対性理論を発表。E=MC²は4文字（4：現実の構造と基盤）。',
    fr:'Albert Einstein (Chemin de vie : 6). À 26 ans (2+6=8) il publia la Relativité Restreinte. E=MC² a 4 caractères.' },

  { number:8, category:'fashion', emoji:'💎',
    en:'Louis Vuitton founded his house in 1854 (1+8+5+4=18→9, completion and legacy). The LV monogram was created in 1896 (1+8+9+6=24→6, love and beauty). The number 8 — infinity rotated — is embedded in the pattern\'s visual DNA.',
    es:'Louis Vuitton fundó su casa en 1854 (1+8+5+4=18→9, completitud y legado). El monograma LV se creó en 1896 (1+8+9+6=24→6, amor y belleza). El 8 — el infinito rotado — está en el ADN visual del patrón.',
    it:'Louis Vuitton fondò la sua maison nel 1854 (→9). Il monogramma fu creato nel 1896 (→6). Il numero 8 — l\'infinito ruotato — è nel DNA visivo del pattern.',
    de:'Louis Vuitton gründete 1854 (→9). Das Monogramm entstand 1896 (→6). Die 8 — gedrehtes Unendlichkeitszeichen — ist im visuellen DNA des Musters.',
    zh:'路易威登于1854年创立（1+8+5+4=18→9，完成与遗产）。LV字母组合于1896年（1+8+9+6=24→6，爱与美丽）创作。数字8——旋转的无限大——嵌入在图案的视觉DNA中。',
    ja:'ルイ・ヴィトンは1854年創業（→9）。モノグラムは1896年（→6）。数字8——回転した無限大——はパターンのビジュアルDNAに刻まれている。',
    fr:'Louis Vuitton fonda sa maison en 1854 (→9). Le monogramme fut créé en 1896 (→6). Le 8 — l\'infini tourné — est dans l\'ADN visuel du motif.' },

  { number:6, category:'art', emoji:'🎨',
    en:'Leonardo da Vinci (born April 15 → Life Path 1). The Mona Lisa took 4 years to paint (1+4=5, freedom and change). The divine proportion φ=1.618 — used throughout the painting — reduces to 7 (truth and spiritual depth).',
    es:'Leonardo da Vinci (nacido el 15 de abril → Camino de vida 1). La Mona Lisa tardó 4 años (1+4=5, libertad y cambio). La proporción divina φ=1.618 usada en el cuadro se reduce a 7 (verdad y profundidad espiritual).',
    it:'Leonardo da Vinci (nato il 15 aprile → Cammino di vita 1). La Gioconda richiese 4 anni. La proporzione divina φ=1,618 si riduce a 7.',
    de:'Leonardo da Vinci (geboren 15. April → Lebensweg 1). Die Mona Lisa dauerte 4 Jahre. φ=1,618 reduziert auf 7.',
    zh:'列奥纳多·达·芬奇（4月15日生，生命之道1）。《蒙娜丽莎》花了4年。神圣比例φ=1.618化简为7（真相与精神深度）。',
    ja:'レオナルド・ダ・ヴィンチ（4月15日生まれ→ライフパス1）。モナリザの制作に4年。黄金比φ=1.618は7に帰着。',
    fr:'Léonard de Vinci (né le 15 avril → Chemin de vie 1). La Joconde prit 4 ans. φ=1,618 se réduit à 7.' },

  { number:33, category:'history', emoji:'✝️',
    en:'The number 33 is the Master Teacher. Jesus was 33 at the Crucifixion. The human spine has exactly 33 vertebrae. The 33rd degree is the highest in Freemasonry. Pythagoras called 33 "the number of divine completion."',
    es:'El 33 es el Maestro Enseñante. Jesucristo tenía 33 años en la Crucifixión. La columna vertebral humana tiene exactamente 33 vértebras. El grado 33 es el más alto en la Masonería. Pitágoras llamó al 33 "el número de la completitud divina."',
    it:'Il 33 è il Maestro Insegnante. Gesù aveva 33 anni. La colonna vertebrale ha 33 vertebre. Il 33° grado è il più alto in Massoneria.',
    de:'Die 33 ist der Meisterlehrer. Jesus war 33. Die Wirbelsäule hat 33 Wirbel. Der 33. Grad ist der höchste in der Freimaurerei.',
    zh:'数字33是主宰教师。耶稣基督在受难时33岁。人类脊椎恰好有33节椎骨。第33度是共济会的最高级别。',
    ja:'33はマスター・ティーチャー。イエス・キリストは33歳だった。人間の脊椎には正確に33個の椎骨がある。第33度はフリーメイソンの最高位。',
    fr:'Le 33 est le Maître Enseignant. Jésus avait 33 ans. La colonne vertébrale a 33 vertèbres. Le 33e degré est le plus élevé en Franc-maçonnerie.' },

  { number:1, category:'culture', emoji:'🌍',
    en:'Every great monotheistic religion begins with 1 (The One God). Every sports legend has a #1 moment. Every startup has a Day 1. The number 1 is the first breath of every creation — in numerology, it\'s the archetype of pure potential and beginnings.',
    es:'Cada gran religión monoteísta comienza con el 1 (El Único Dios). Cada leyenda deportiva tiene un momento #1. Cada startup tiene un Día 1. El 1 es el primer aliento de toda creación.',
    it:'Ogni grande religione monoteista inizia con 1. Ogni leggenda sportiva ha il suo momento #1. Il numero 1 è il primo respiro di ogni creazione.',
    de:'Jede monotheistische Religion beginnt mit 1. Jede Sportlegende hat ihren #1-Moment. Die 1 ist der erste Atemzug jeder Schöpfung.',
    zh:'每个伟大的一神论宗教都以1（唯一真神）开始。每位体育传奇都有一个#1时刻。每家初创公司都有第一天。数字1是每次创造的第一口呼吸。',
    ja:'すべての偉大な一神教宗教は1（唯一の神）から始まる。すべてのスポーツ伝説には#1の瞬間がある。1はすべての創造の最初の息吹だ。',
    fr:'Chaque grande religion monothéiste commence par 1. Chaque légende sportive a son moment #1. Le 1 est le premier souffle de toute création.' },

  { number:2, category:'medicine', emoji:'🧠',
    en:'The human brain has 2 hemispheres (left/right: logic/intuition). DNA is a double helix — 2 strands. The heart beats in 2 phases (systole/diastole). The number 2 is not just duality — it\'s the fundamental architecture of life itself.',
    es:'El cerebro humano tiene 2 hemisferios (izquierdo/derecho: lógica/intuición). El ADN es una doble hélice — 2 hebras. El corazón late en 2 fases (sístole/diástole). El 2 es la arquitectura fundamental de la vida.',
    it:'Il cervello umano ha 2 emisferi. Il DNA è una doppia elica — 2 catene. Il cuore batte in 2 fasi. Il 2 è l\'architettura fondamentale della vita.',
    de:'Das menschliche Gehirn hat 2 Hemisphären. DNA ist eine Doppelhelix. Das Herz schlägt in 2 Phasen. Die 2 ist die fundamentale Architektur des Lebens.',
    zh:'人类大脑有2个半球（左/右：逻辑/直觉）。DNA是双螺旋——2条链。心脏以2个阶段跳动。数字2是生命本身的基本架构。',
    ja:'人間の脳は2つの半球を持つ。DNAは二重らせん——2本の鎖。心臓は2相で拍動する。2は生命そのものの基本的な構造だ。',
    fr:'Le cerveau humain a 2 hémisphères. L\'ADN est une double hélice — 2 brins. Le cœur bat en 2 phases. Le 2 est l\'architecture fondamentale de la vie.' },

  { number:3, category:'culture', emoji:'🎭',
    en:'The number 3 governs storytelling: beginning, middle, end. The Holy Trinity. The three acts of a play. Three primary colors that create all others. Pythagoras called 3 "the perfect number" — the first to have a beginning, middle AND end.',
    es:'El 3 rige la narrativa: inicio, nudo, desenlace. La Santísima Trinidad. Los tres actos. Los tres colores primarios que crean todos los demás. Pitágoras llamó al 3 "el número perfecto" — el primero en tener inicio, medio Y fin.',
    it:'Il 3 governa la narrativa: inizio, svolgimento, fine. La Trinità. I tre atti. I tre colori primari. Pitagora chiamò il 3 "il numero perfetto".',
    de:'Die 3 beherrscht das Erzählen: Anfang, Mitte, Ende. Die Heilige Dreifaltigkeit. Drei Akte. Drei Primärfarben. Pythagoras nannte 3 "die perfekte Zahl".',
    zh:'数字3主宰叙事：开始、中间、结束。神圣三位一体。三幕。三原色，创造所有其他颜色。毕达哥拉斯称3为"完美数字"。',
    ja:'3は物語を支配する：始まり、中間、終わり。聖三位一体。三幕。三原色。ピタゴラスは3を「完全な数」と呼んだ。',
    fr:'Le 3 gouverne la narration : début, milieu, fin. La Trinité. Les trois actes. Les trois couleurs primaires. Pythagore appela le 3 "le nombre parfait".' },
];

function getRandomIndices(count: number): number[] {
  const shuffled = [...ALL].map((_, i) => i);
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

const SECTION_TITLE: Record<Language, string> = {
  en: 'Numerology & the world', es: 'Numerología y el mundo', it: 'Numerologia e il mondo',
  de: 'Numerologie & die Welt', zh: '数字命理与世界', ja: '数秘術と世界', fr: 'Numérologie & le monde',
};

export const NumerologyCuriosities = ({ language }: { language: Language }) => {
  const [indices] = useState(() => getRandomIndices(5));
  const [active, setActive] = useState(0);
  const [fade, setFade] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (next: number) => {
    setFade(false);
    setTimeout(() => { setActive((next + indices.length) % indices.length); setFade(true); }, 200);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => go((active + 1) % indices.length), 8000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, indices]);

  const item = ALL[indices[active]];
  const text = (item as any)[language] ?? item.en;
  const catLabel = CATEGORY_LABEL[item.category][language] ?? CATEGORY_LABEL[item.category].en;

  return (
    <div className="mt-8 pt-8 border-t border-border/40">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-foreground/50" />
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{SECTION_TITLE[language]}</p>
        <Sparkles className="w-3.5 h-3.5 text-foreground/50" />
      </div>

      <div
        className="max-w-lg mx-auto rounded-2xl border border-border/60 overflow-hidden"
        style={{ background: 'hsl(var(--muted) / 0.5)' }}
      >
        {/* Number badge bar */}
        <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-border/30">
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-lg font-bold text-background">{item.number}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{item.emoji}</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2.5 py-0.5 bg-background/50">{catLabel}</span>
          </div>
        </div>

        {/* Content */}
        <div
          className="px-5 py-4 transition-opacity duration-200"
          style={{ opacity: fade ? 1 : 0, minHeight: 100 }}
        >
          <p className="text-sm text-foreground/85 leading-relaxed">{text}</p>
        </div>

        {/* Controls */}
        <div className="px-5 pb-4 flex items-center justify-between">
          <div className="flex gap-1">
            <button onClick={() => go(active - 1)} className="w-7 h-7 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => go(active + 1)} className="w-7 h-7 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {indices.map((_, i) => (
              <button key={i} onClick={() => go(i)}
                className={`rounded-full transition-all ${i === active ? 'w-4 h-1.5 bg-foreground' : 'w-1.5 h-1.5 bg-foreground/25 hover:bg-foreground/50'}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
