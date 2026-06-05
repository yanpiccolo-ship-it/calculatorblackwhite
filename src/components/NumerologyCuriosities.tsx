import { useState, useEffect, useRef } from 'react';
import { Language } from '@/lib/translations';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Category = 'fashion' | 'culture' | 'sports' | 'medicine' | 'history' | 'music' | 'science' | 'art';

interface Curiosity {
  number: number;
  category: Category;
  emoji: string;
  headline: Partial<Record<Language, string>> & { en: string };
  en: string; es: string; it: string; de: string; zh: string; ja: string; fr: string;
}

const CAT_LABEL: Record<Category, Record<Language, string>> = {
  fashion:  { en:'Fashion',  es:'Moda',     it:'Moda',     de:'Mode',         zh:'时尚', ja:'ファッション', fr:'Mode' },
  culture:  { en:'Culture',  es:'Cultura',   it:'Cultura',  de:'Kultur',       zh:'文化', ja:'文化',         fr:'Culture' },
  sports:   { en:'Sport',    es:'Deporte',   it:'Sport',    de:'Sport',        zh:'体育', ja:'スポーツ',     fr:'Sport' },
  medicine: { en:'Medicine', es:'Medicina',  it:'Medicina', de:'Medizin',      zh:'医学', ja:'医学',         fr:'Médecine' },
  history:  { en:'History',  es:'Historia',  it:'Storia',   de:'Geschichte',   zh:'历史', ja:'歴史',         fr:'Histoire' },
  music:    { en:'Music',    es:'Música',    it:'Musica',   de:'Musik',        zh:'音乐', ja:'音楽',         fr:'Musique' },
  science:  { en:'Science',  es:'Ciencia',   it:'Scienza',  de:'Wissenschaft', zh:'科学', ja:'科学',         fr:'Science' },
  art:      { en:'Art',      es:'Arte',      it:'Arte',     de:'Kunst',        zh:'艺术', ja:'芸術',         fr:'Art' },
};

const SECTION_LABEL: Record<Language, string> = {
  en:'Numerology & the world', es:'Numerología & el mundo', it:'Numerologia & il mondo',
  de:'Numerologie & die Welt', zh:'数字命理与世界', ja:'数秘術と世界', fr:'Numérologie & le monde',
};

const ALL: Curiosity[] = [
  { number:5, category:'fashion', emoji:'👗',
    headline:{ en:'Chanel No. 5 & the number of freedom', es:'Chanel Nº 5 & el número de la libertad', it:'Chanel N°5 e il numero della libertà', de:'Chanel Nr. 5 & die Zahl der Freiheit', zh:'香奈儿5号与自由之数', ja:'シャネルNo.5と自由の数字', fr:'Chanel N°5 & le chiffre de la liberté' },
    en:'Coco Chanel chose 5 as her lucky number. Born on the 19th (1+9=10→1), she created the most iconic perfume of the 20th century. The 5 vibrates with freedom, sensuality and transgression — every quality that made Chanel revolutionary.',
    es:'Coco Chanel eligió el 5 como su número de la suerte. Nacida el día 19 (1+9=10→1), creó el perfume más icónico del siglo XX. El 5 vibra con libertad, sensualidad y transgresión.',
    it:'Coco Chanel scelse il 5 come numero fortunato. Nata il 19 (1+9=10→1), creò il profumo più iconico del XX secolo.',
    de:'Coco Chanel wählte die 5 als Glückszahl. Nata il 19 (1+9=10→1), sie schuf den ikonischsten Duft des Jahrhunderts.',
    zh:'可可·香奈儿选择5作为幸运数字。出生于19日（1+9=10→1），创造了20世纪最具标志性的香水。',
    ja:'ココ・シャネルは5をラッキーナンバーに選んだ。19日生まれ（1+9=10→1）、20世紀最もアイコニックな香水を生み出した。',
    fr:'Coco Chanel choisit le 5 comme chiffre porte-bonheur. Née le 19 (1+9=10→1), elle créa le parfum le plus iconique du XXe siècle.' },

  { number:23, category:'sports', emoji:'🏀',
    headline:{ en:'Jordan\'s 23 — freedom encoded in a jersey', es:'El 23 de Jordan — libertad en una camiseta', it:'Il 23 di Jordan — la libertà in una maglia', de:'Jordans 23 — Freiheit auf dem Trikot', zh:'乔丹的23——球衣上的自由', ja:'ジョーダンの23 — ジャージに刻まれた自由', fr:'Le 23 de Jordan — la liberté sur un maillot' },
    en:'Michael Jordan wore #23 (2+3=5 — freedom, mastery, change). He won 6 NBA titles. His jersey became the highest-selling in basketball history. Five was his numerological destiny: unstoppable, magnetic, impossible to contain.',
    es:'Michael Jordan usó el #23 (2+3=5 — libertad, maestría, cambio). Ganó 6 títulos NBA. El 5 era su destino numerológico: imparable, magnético, imposible de contener.',
    it:'Jordan portò il #23 (2+3=5). Vinse 6 titoli NBA. La sua maglia è la più venduta del basket mondiale.',
    de:'Jordan trug #23 (2+3=5). 6 NBA-Titel. Das meistverkaufte Trikot der Basketballgeschichte.',
    zh:'迈克尔·乔丹穿#23（2+3=5，自由与精通）。6个NBA冠军，球衣销量史上最高。',
    ja:'マイケル・ジョーダンは#23（2+3=5）をつけ6つのNBAタイトルを獲得。彼のジャージはバスケットボール史上最も売れた。',
    fr:'Jordan portait le #23 (2+3=5). 6 titres NBA. Le maillot le plus vendu de l\'histoire du basketball.' },

  { number:7, category:'medicine', emoji:'🧬',
    headline:{ en:'The body\'s secret numerology', es:'La numerología secreta del cuerpo', it:'La numerologia segreta del corpo', de:'Die geheime Numerologie des Körpers', zh:'身体的秘密数字命理', ja:'体の秘密の数秘術', fr:'La numérologie secrète du corps' },
    en:'Human cells regenerate every 7 years. The body has 7 chakras, music has 7 notes, the rainbow has 7 colors. Ancient wisdom identified 7 as the number of transformation because the body itself follows a 7-year renewal cycle.',
    es:'Las células humanas se regeneran cada 7 años. 7 chakras, 7 notas musicales, 7 colores del arcoíris. La sabiduría antigua identificó el 7 como número de transformación porque el cuerpo sigue un ciclo de renovación de 7 años.',
    it:'Le cellule si rigenerano ogni 7 anni. 7 chakra, 7 note, 7 colori dell\'arcobaleno.',
    de:'Körperzellen regenerieren alle 7 Jahre. 7 Chakren, 7 Noten, 7 Farben. Die 7 ist die Zahl der Transformation.',
    zh:'人体细胞每7年再生。7个脉轮、7个音符、7种彩虹颜色——古老智慧将7识别为转化之数。',
    ja:'人体の細胞は7年ごとに再生される。7つのチャクラ、7つの音符、7色の虹。7は変容の数。',
    fr:'Les cellules se régénèrent tous les 7 ans. 7 chakras, 7 notes, 7 couleurs. Le 7 est le nombre de la transformation.' },

  { number:9, category:'history', emoji:'⚡',
    headline:{ en:'Tesla\'s obsession with 3, 6 & 9', es:'La obsesión de Tesla con el 3, 6 y 9', it:'L\'ossessione di Tesla per il 3, 6 e 9', de:'Teslas Obsession mit 3, 6 und 9', zh:'特斯拉对3、6和9的痴迷', ja:'テスラの3・6・9への執着', fr:'L\'obsession de Tesla pour le 3, 6 et 9' },
    en:'"If you knew the magnificence of 3, 6 and 9, you would have a key to the universe." Tesla walked around a block 3 times before entering buildings, lived in room 3327 (3+3+2+7=15→6). He died on January 7 — the number of spiritual depth.',
    es:'"Si conocieras la magnificencia del 3, el 6 y el 9, tendrías una clave del universo." Tesla rodeaba una manzana 3 veces antes de entrar. Vivía en la habitación 3327 (→6). Murió el 7 de enero.',
    it:'"Se conoscessi il 3, il 6 e il 9, avresti la chiave dell\'universo." Tesla girava 3 volte attorno a un isolato prima di entrare. Morì il 7 gennaio.',
    de:'"Wenn du 3, 6 und 9 verstehst, hast du den Schlüssel zum Universum." Tesla umrundete Blöcke 3 Mal. Starb am 7. Januar.',
    zh:'"如果你知道3、6和9的宏伟，你就会拥有宇宙的钥匙。"特斯拉在进入建筑物前绕街区走3圈。1月7日去世。',
    ja:'"3、6、9の壮大さを知れば宇宙の鍵を手に入れる。"テスラはビル入場前に3回ブロックを歩き回った。1月7日に死去。',
    fr:'"Connais le 3, le 6 et le 9, tu auras la clé de l\'univers." Tesla faisait 3 fois le tour d\'un pâté avant d\'entrer. Décédé le 7 janvier.' },

  { number:4, category:'music', emoji:'🎸',
    headline:{ en:'The Beatles — structure that changed the world', es:'Los Beatles — estructura que cambió el mundo', it:'I Beatles — una struttura che cambiò il mondo', de:'Die Beatles — Struktur, die die Welt veränderte', zh:'披头士——改变世界的结构', ja:'ビートルズ——世界を変えた構造', fr:'Les Beatles — la structure qui a changé le monde' },
    en:'The Beatles were 4 members (structure, foundation). John Lennon: born October 9 (completion). "Imagine" released 9/9. Abbey Road studio at 3 Abbey Road (creativity). Their numerological DNA was the architecture of a cultural revolution.',
    es:'Los Beatles eran 4 integrantes. Lennon nació el 9 de octubre. "Imagine" salió el 9/9. Abbey Road está en el nº 3. Su ADN numerológico era la arquitectura de una revolución cultural.',
    it:'4 membri. Lennon nato il 9 ottobre. "Imagine" uscì il 9/9. Abbey Road al numero 3.',
    de:'4 Mitglieder. Lennon am 9. Oktober geboren. "Imagine" am 9/9. Abbey Road Nummer 3.',
    zh:'4名成员。列侬10月9日出生。"Imagine"于9/9发行。Abbey Road在3号。他们的数字命理DNA是文化革命的架构。',
    ja:'4人。レノンは10月9日生まれ。"Imagine"は9/9にリリース。アビーロードは3番地。',
    fr:'4 membres. Lennon né le 9 octobre. "Imagine" le 9/9. Abbey Road au numéro 3.' },

  { number:6, category:'art', emoji:'🎨',
    headline:{ en:'Da Vinci & the divine proportion', es:'Da Vinci & la proporción divina', it:'Da Vinci e la proporzione divina', de:'Da Vinci & die göttliche Proportion', zh:'达芬奇与神圣比例', ja:'ダ・ヴィンチと黄金比', fr:'Da Vinci & la proportion divine' },
    en:'Leonardo da Vinci (Life Path 1). The Mona Lisa took 4 years (4→liberation). φ=1.618 (the golden ratio used throughout the painting) reduces to 7 — truth and spiritual depth. Every great artwork encodes its own numerological signature.',
    es:'Leonardo da Vinci (Camino de vida 1). La Mona Lisa tardó 4 años. φ=1.618 se reduce a 7 — verdad y profundidad espiritual. Toda gran obra de arte codifica su propia firma numerológica.',
    it:'Da Vinci (Cammino di vita 1). La Gioconda: 4 anni. φ=1,618 → 7.',
    de:'Da Vinci (Lebensweg 1). Mona Lisa: 4 Jahre. φ=1,618 → 7 (Wahrheit und Tiefe).',
    zh:'达芬奇（生命之道1）。蒙娜丽莎耗时4年。黄金比例φ=1.618化简为7——真相与精神深度。',
    ja:'ダ・ヴィンチ（ライフパス1）。モナリザに4年。φ=1.618は7に帰着。',
    fr:'Da Vinci (Chemin de vie 1). La Joconde : 4 ans. φ=1,618 → 7.' },

  { number:33, category:'history', emoji:'✝️',
    headline:{ en:'33 — the number of mastery', es:'33 — el número de la maestría', it:'33 — il numero della maestria', de:'33 — die Zahl der Meisterschaft', zh:'33——精通之数', ja:'33——マスタリーの数字', fr:'33 — le nombre de la maîtrise' },
    en:'The number 33 is the Master Teacher. Jesus was 33 at the Crucifixion. The human spine has exactly 33 vertebrae. The 33rd degree is the highest in Freemasonry. Pythagoras called 33 "the number of divine completion."',
    es:'El 33 es el Maestro Enseñante. Jesucristo tenía 33 años. La columna vertebral tiene exactamente 33 vértebras. El grado 33 es el más alto en la Masonería. Pitágoras lo llamó "el número de la completitud divina."',
    it:'Il 33 è il Maestro Insegnante. Gesù aveva 33 anni. La colonna ha 33 vertebre. 33° grado in Massoneria.',
    de:'33 ist der Meisterlehrer. Jesus war 33. 33 Wirbel. 33. Grad der Freimaurerei.',
    zh:'33是主宰教师。耶稣33岁受难。脊椎恰好33节。共济会最高级别第33度。',
    ja:'33はマスター・ティーチャー。イエスは33歳。脊椎は33個。フリーメイソンの最高位は第33度。',
    fr:'Le 33 est le Maître Enseignant. Jésus avait 33 ans. 33 vertèbres. 33e degré en Franc-maçonnerie.' },

  { number:8, category:'fashion', emoji:'💎',
    headline:{ en:'Louis Vuitton & the infinity of luxury', es:'Louis Vuitton & el infinito del lujo', it:'Louis Vuitton e l\'infinito del lusso', de:'Louis Vuitton & die Unendlichkeit des Luxus', zh:'路易威登与奢华的无限', ja:'ルイ・ヴィトンと贅沢の無限', fr:'Louis Vuitton & l\'infini du luxe' },
    en:'Vuitton founded his house in 1854 (→9, legacy). The LV monogram was created in 1896 (→6, beauty). The number 8 — infinity rotated — is embedded in the visual DNA of the pattern itself. Luxury and eternity, encoded.',
    es:'Vuitton fundó su casa en 1854 (→9, legado). El monograma LV se creó en 1896 (→6, belleza). El 8 — el infinito rotado — está en el ADN visual del patrón.',
    it:'Vuitton fondò nel 1854 (→9). Monogramma 1896 (→6). Il numero 8 è nel DNA visivo del pattern.',
    de:'Vuitton gründete 1854 (→9). Monogramm 1896 (→6). Die 8 — das Unendlichkeitszeichen — im visuellen DNA.',
    zh:'威登1854年创立（→9）。LV字母组合1896年（→6）。数字8——旋转的无限——嵌入图案视觉DNA。',
    ja:'ヴィトンは1854年創業（→9）。モノグラム1896年（→6）。8は回転した∞、パターンのDNAに刻まれている。',
    fr:'Vuitton fonda en 1854 (→9). Monogramme 1896 (→6). Le 8 — l\'infini tourné — dans l\'ADN du motif.' },

  { number:3, category:'culture', emoji:'🎭',
    headline:{ en:'Why every great story uses 3 acts', es:'Por qué toda gran historia usa 3 actos', it:'Perché ogni grande storia usa 3 atti', de:'Warum jede große Geschichte 3 Akte hat', zh:'为什么每个伟大故事都用3幕', ja:'なぜ全ての偉大な物語は3幕なのか', fr:'Pourquoi toute grande histoire a 3 actes' },
    en:'The number 3 governs all storytelling: beginning, middle, end. Holy Trinity. Three primary colors that create all others. Three Musketeers, Three Laws of Robotics, Three Witches in Macbeth. Pythagoras called 3 "the perfect number" — the first with a start, middle AND end.',
    es:'El 3 rige toda narrativa: inicio, nudo, desenlace. La Santísima Trinidad. Los tres colores primarios. Los Tres Mosqueteros. Pitágoras llamó al 3 "el número perfecto" — el primero en tener inicio, medio Y fin.',
    it:'Il 3 governa ogni narrativa: inizio, svolgimento, fine. Trinità. Tre colori primari. Pitagora: "numero perfetto".',
    de:'Die 3 beherrscht Erzählen: Anfang, Mitte, Ende. Dreifaltigkeit. Drei Primärfarben. Pythagoras: "perfekte Zahl".',
    zh:'数字3主宰所有叙事：开始、中间、结束。圣三一。三原色。毕达哥拉斯称3为"完美数字"。',
    ja:'3はすべての物語を支配する：始まり・中間・終わり。三位一体。三原色。ピタゴラスは「完全な数」と呼んだ。',
    fr:'Le 3 gouverne toute narration : début, milieu, fin. Trinité. Trois couleurs primaires. Pythagore : "nombre parfait".' },

  { number:11, category:'science', emoji:'🔭',
    headline:{ en:'Einstein\'s numerological code', es:'El código numerológico de Einstein', it:'Il codice numerologico di Einstein', de:'Einsteins numerologischer Code', zh:'爱因斯坦的数字命理密码', ja:'アインシュタインの数秘術的コード', fr:'Le code numérologique d\'Einstein' },
    en:'Einstein (Life Path 6) published Special Relativity at 26 (2+6=8, power). E=MC² has 4 characters (structure of reality). He was born on March 14 — 3/14 — the first digits of π. The genius and the universe were numerologically aligned.',
    es:'Einstein (Camino de vida 6) publicó la Relatividad Especial a los 26 (2+6=8, poder). E=MC² tiene 4 caracteres. Nació el 14/3 — los primeros dígitos de π.',
    it:'Einstein (CV 6) a 26 anni (2+6=8). E=MC²: 4 caratteri. Nato il 14/3 — le prime cifre di π.',
    de:'Einstein (LW 6) mit 26 (2+6=8). E=MC²: 4 Zeichen. Geboren am 14.3. — die ersten Ziffern von π.',
    zh:'爱因斯坦（生命之道6）在26岁（2+6=8）发表相对论。E=MC²有4个字符。生于3/14——π的前几位数字。',
    ja:'アインシュタイン（ライフパス6）は26歳（2+6=8）で特殊相対性理論を発表。E=MC²は4文字。誕生日3/14はπの最初の数字。',
    fr:'Einstein (CV 6) publia à 26 ans (2+6=8). E=MC² : 4 caractères. Né le 14/3 — premières décimales de π.' },

  { number:2, category:'medicine', emoji:'🧠',
    headline:{ en:'The binary architecture of life', es:'La arquitectura binaria de la vida', it:'L\'architettura binaria della vita', de:'Die binäre Architektur des Lebens', zh:'生命的二元架构', ja:'生命の二元的な構造', fr:'L\'architecture binaire de la vie' },
    en:'The brain has 2 hemispheres (logic/intuition). DNA is a double helix — 2 strands. The heart beats in 2 phases (systole/diastole). Eyes, lungs, kidneys, ears — always 2. The number 2 is not duality: it is the fundamental architecture of every living system.',
    es:'El cerebro tiene 2 hemisferios. El ADN es una doble hélice. El corazón late en 2 fases. Ojos, pulmones, riñones, orejas — siempre 2. El 2 es la arquitectura fundamental de todo sistema vivo.',
    it:'2 emisferi, doppia elica, 2 fasi cardiache. Il 2 è l\'architettura di ogni sistema vivente.',
    de:'2 Hemisphären, Doppelhelix, 2 Herzphasen. Die 2 ist die Grundstruktur jedes Lebewesens.',
    zh:'大脑2个半球，DNA双螺旋，心脏2相跳动。数字2是所有生命系统的基本架构。',
    ja:'2つの半球、二重らせん、2相の心拍。2はすべての生命システムの基本的な構造だ。',
    fr:'2 hémisphères, double hélice, 2 phases cardiaques. Le 2 est l\'architecture fondamentale de tout système vivant.' },

  { number:9, category:'culture', emoji:'🌍',
    headline:{ en:'Why 9 always returns to itself', es:'Por qué el 9 siempre vuelve a sí mismo', it:'Perché il 9 ritorna sempre a sé stesso', de:'Warum die 9 immer zu sich zurückkehrt', zh:'为什么9总是回到自身', ja:'なぜ9は常に自分に戻るのか', fr:'Pourquoi le 9 revient toujours à lui-même' },
    en:'Multiply 9 by any number and the digits always sum back to 9: 9×2=18 (1+8=9), 9×7=63 (6+3=9). This mathematical perfection is why ancient cultures revered 9 as the number of completion, of what cannot be destroyed. The Beatles\' "Revolution 9." The 9th Symphony.',
    es:'Multiplica el 9 por cualquier número y los dígitos siempre suman 9: 9×2=18 (1+8=9), 9×7=63 (6+3=9). Por eso las culturas antiguas reverenciaron el 9 como el número de la completitud.',
    it:'9×qualsiasi numero → cifre che sommano 9. Per questo il 9 è il numero della completezza indistruttibile.',
    de:'9×jede Zahl → Quersumme ergibt 9. Deshalb verehrten alte Kulturen 9 als unzerstörbare Vollendung.',
    zh:'9乘以任何数字，其各位数之和总是9。这就是为什么古代文化将9尊为完成之数，无法被摧毁。',
    ja:'9に任意の数をかけると桁の和は常に9になる。だから古代文化は9を「完成の数」として崇拝した。',
    fr:'9×n\'importe quel nombre → somme des chiffres = 9. C\'est pourquoi les cultures anciennes révéraient le 9 comme l\'accomplissement indéstructible.' },
];

function randomIndices(count: number): number[] {
  const arr = ALL.map((_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, count);
}

export const NumerologyCuriosities = ({ language }: { language: Language }) => {
  const [indices] = useState(() => randomIndices(5));
  const [active, setActive] = useState(0);
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = (next: number) => {
    setVisible(false);
    setTimeout(() => { setActive((next + indices.length) % indices.length); setVisible(true); }, 250);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => go((active + 1) % indices.length), 9000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, indices]);

  const item = ALL[indices[active]];
  const text = (item as any)[language] ?? item.en;
  const headline = (item.headline as any)[language] ?? item.headline.en;
  const catLabel = CAT_LABEL[item.category][language] ?? CAT_LABEL[item.category].en;
  const sectionLabel = SECTION_LABEL[language] ?? SECTION_LABEL.en;

  return (
    <div className="mt-10 pt-10 border-t border-border/40">

      {/* ── Editorial header ── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-foreground/15" />
        <p className="text-[9px] uppercase tracking-[0.3em] text-foreground/40 font-medium shrink-0">
          {sectionLabel}
        </p>
        <div className="h-px flex-1 bg-foreground/15" />
      </div>

      {/* ── Main editorial card ── */}
      <div
        className="max-w-xl mx-auto transition-opacity duration-250"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {/* Category + number row */}
        <div className="flex items-start justify-between mb-4">
          <span className="text-[9px] uppercase tracking-[0.25em] text-foreground/40 border border-foreground/15 rounded-sm px-2.5 py-1">
            {catLabel}
          </span>
          <div className="text-right">
            <span className="font-serif text-[4.5rem] leading-none font-bold text-foreground/08 select-none" style={{ lineHeight: 1 }}>
              {item.number}
            </span>
          </div>
        </div>

        {/* Headline */}
        <h4 className="font-serif text-xl md:text-2xl font-medium text-foreground leading-tight mb-3 tracking-tight">
          {item.emoji} {headline}
        </h4>

        {/* Hairline */}
        <div className="h-px bg-foreground/10 mb-4" />

        {/* Body text */}
        <p className="text-sm text-foreground/70 leading-relaxed tracking-wide">
          {text}
        </p>

        {/* Bottom nav */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => go(active - 1)}
              className="w-7 h-7 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => go(active + 1)}
              className="w-7 h-7 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/40 hover:text-foreground hover:border-foreground/40 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            {indices.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === active
                    ? 'w-5 h-[3px] bg-foreground'
                    : 'w-[3px] h-[3px] bg-foreground/25 hover:bg-foreground/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
