import { useState, useEffect } from 'react';
import { Language } from '@/lib/translations';
import { Sparkles } from 'lucide-react';

type Category = 'fashion' | 'culture' | 'sports' | 'medicine' | 'history' | 'music' | 'science' | 'art';

interface Curiosity {
  number: number;
  category: Category;
  emoji: string;
  en: string;
  es: string;
  it: string;
  de: string;
  zh: string;
  ja: string;
  fr: string;
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

const CURIOSITIES: Curiosity[] = [
  { number:5, category:'fashion', emoji:'👗',
    en:'Chanel No. 5 — Coco Chanel chose 5 because it was her lucky number: she was born on the 19th (1+9=10→1), destined to create the iconic scent of the 20th century.',
    es:'Chanel Nº 5 — Coco Chanel eligió el 5 porque era su número de la suerte: nació el día 19 (1+9=10→1), destinada a crear el perfume icónico del siglo XX.',
    it:'Chanel N°5 — Coco Chanel scelse il 5 perché era il suo numero fortunato: nata il 19 (1+9=10→1), destinata a creare il profumo iconico del XX secolo.',
    de:'Chanel Nr. 5 — Coco Chanel wählte die 5, da es ihre Glückszahl war: geboren am 19. (1+9=10→1), bestimmt, den ikonischen Duft des 20. Jahrhunderts zu kreieren.',
    zh:'香奈儿5号 — 可可·香奈儿选择5是因为这是她的幸运数字：她出生于19日（1+9=10→1），注定要创造20世纪的标志性香水。',
    ja:'シャネルNo.5 — ココ・シャネルは5を選んだ。5がラッキーナンバーだったから。19日生まれ（1+9=10→1）、20世紀のアイコニックな香水を生み出す運命にあった。',
    fr:'Chanel N°5 — Coco Chanel choisit le 5 car c\'était son chiffre porte-bonheur : née le 19 (1+9=10→1), destinée à créer le parfum iconique du XXe siècle.' },

  { number:3, category:'culture', emoji:'🎭',
    en:'The Holy Trinity, Pythagoras\' perfect number. Shakespeare wrote 37 plays (3+7=10→1) and the Globe Theatre had 3 tiers. The number 3 governs all great dramatic storytelling.',
    es:'La Santísima Trinidad, el número perfecto de Pitágoras. Shakespeare escribió 37 obras (3+7=10→1) y el Globe Theatre tenía 3 pisos. El 3 rige toda gran narrativa dramática.',
    it:'La Trinità, il numero perfetto di Pitagora. Shakespeare scrisse 37 opere (3+7=10→1) e il Globe Theatre aveva 3 livelli. Il 3 governa ogni grande narrativa drammatica.',
    de:'Die Heilige Dreifaltigkeit, Pythagoras\' perfekte Zahl. Shakespeare schrieb 37 Stücke (3+7=10→1) und das Globe Theatre hatte 3 Ränge. Die 3 beherrscht jedes große Drama.',
    zh:'神圣三位一体，毕达哥拉斯的完美数字。莎士比亚写了37部戏剧（3+7=10→1），环球剧场有3层。数字3主宰着所有伟大的戏剧叙事。',
    ja:'聖三位一体、ピタゴラスの完全数。シェイクスピアは37作品（3+7=10→1）を書き、グローブ座は3層構造だった。3はすべての偉大な演劇的物語を支配する。',
    fr:'La Sainte Trinité, le nombre parfait de Pythagore. Shakespeare a écrit 37 pièces (3+7=10→1) et le Globe Theatre avait 3 niveaux. Le 3 gouverne toute grande narration dramatique.' },

  { number:23, category:'sports', emoji:'🏀',
    en:'Michael Jordan wore #23 (2+3=5, the number of freedom and mastery). He won 6 NBA titles — a 6 vibration of service and perfection. His jersey is the most sold in basketball history.',
    es:'Michael Jordan usó el #23 (2+3=5, número de libertad y maestría). Ganó 6 títulos de la NBA — vibración 6 de servicio y perfección. Su camiseta es la más vendida en la historia del baloncesto.',
    it:'Michael Jordan indossò il #23 (2+3=5, numero di libertà e maestria). Vinse 6 titoli NBA — vibrazione 6 di servizio e perfezione. La sua maglia è la più venduta nella storia del basket.',
    de:'Michael Jordan trug die #23 (2+3=5, Zahl der Freiheit und Meisterschaft). Er gewann 6 NBA-Titel — eine 6er-Schwingung von Service und Perfektion. Sein Trikot ist das meistverkaufte in der Basketball-Geschichte.',
    zh:'迈克尔·乔丹穿的是#23（2+3=5，自由与精通之数）。他赢得了6个NBA冠军——6的振动代表服务与完美。他的球衣是篮球史上销量最高的。',
    ja:'マイケル・ジョーダンは#23をつけた（2+3=5、自由と熟達の数）。6つのNBAタイトルを獲得——サービスと完璧さの6の振動。彼のジャージはバスケットボール史上最も売れたジャージだ。',
    fr:'Michael Jordan portait le #23 (2+3=5, le nombre de liberté et de maîtrise). Il a remporté 6 titres NBA — vibration 6 de service et perfection. Son maillot est le plus vendu de l\'histoire du basketball.' },

  { number:7, category:'medicine', emoji:'🧬',
    en:'DNA has 4 bases (A, T, G, C). The human cell regenerates every 7 years — which is why ancient wisdom always saw 7 as the number of transformation, healing and the complete cycle of life.',
    es:'El ADN tiene 4 bases (A, T, G, C). La célula humana se regenera cada 7 años — por eso la sabiduría antigua siempre vio el 7 como el número de la transformación, la curación y el ciclo completo de vida.',
    it:'Il DNA ha 4 basi (A, T, G, C). La cellula umana si rigenera ogni 7 anni — ecco perché l\'antica sapienza ha sempre visto il 7 come numero di trasformazione, guarigione e ciclo completo della vita.',
    de:'Die DNA hat 4 Basen (A, T, G, C). Die menschliche Zelle regeneriert sich alle 7 Jahre — weshalb die alte Weisheit die 7 immer als Zahl der Transformation, Heilung und des vollständigen Lebenszyklus sah.',
    zh:'DNA有4个碱基（A、T、G、C）。人体细胞每7年再生一次——这就是为什么古代智慧总是将7视为转化、愈合和生命完整周期的数字。',
    ja:'DNAには4つの塩基（A、T、G、C）がある。人体の細胞は7年ごとに再生される。だから古来の知恵は常に7を変容、癒し、生命の完全なサイクルの数として見てきた。',
    fr:'L\'ADN a 4 bases (A, T, G, C). La cellule humaine se régénère tous les 7 ans — c\'est pourquoi la sagesse ancienne a toujours vu le 7 comme le nombre de transformation, guérison et cycle complet de vie.' },

  { number:1, category:'history', emoji:'👑',
    en:'Napoleon Bonaparte: Life Path 2 (harmony seeker), but born on the 15th (1+5=6). His life was a constant tension between the 1 (absolute leadership) and the 6 (duty to protect). History\'s greatest paradox.',
    es:'Napoleón Bonaparte: Camino de vida 2 (buscador de armonía), pero nacido el día 15 (1+5=6). Su vida fue una tensión constante entre el 1 (liderazgo absoluto) y el 6 (deber de proteger). La paradoja más grande de la historia.',
    it:'Napoleone Bonaparte: Cammino di vita 2 (cercatore di armonia), ma nato il 15 (1+5=6). La sua vita fu una tensione costante tra l\'1 (leadership assoluta) e il 6 (dovere di proteggere). Il paradosso più grande della storia.',
    de:'Napoleon Bonaparte: Lebensweg 2 (Harmoniesucher), aber am 15. geboren (1+5=6). Sein Leben war eine ständige Spannung zwischen 1 (absolute Führung) und 6 (Schutzpflicht). Das größte Paradox der Geschichte.',
    zh:'拿破仑·波拿巴：生命之道2（和谐追求者），但出生在15日（1+5=6）。他的一生是1（绝对领导）和6（保护职责）之间持续的张力。历史上最伟大的悖论。',
    ja:'ナポレオン・ボナパルト：ライフパス2（調和の探求者）、しかし15日生まれ（1+5=6）。彼の人生は1（絶対的リーダーシップ）と6（保護の義務）の間の絶え間ない緊張だった。歴史最大のパラドックス。',
    fr:'Napoléon Bonaparte : Chemin de vie 2 (chercheur d\'harmonie), mais né le 15 (1+5=6). Sa vie fut une tension constante entre le 1 (leadership absolu) et le 6 (devoir de protéger). Le plus grand paradoxe de l\'histoire.' },

  { number:4, category:'music', emoji:'🎸',
    en:'The Beatles were 4 members (the number of structure and foundation). John Lennon was born on the 9th (completion and universality). "Imagine" was released on the 9/9 (September 9) — pure numerological poetry.',
    es:'Los Beatles eran 4 integrantes (el número de la estructura y el fundamento). John Lennon nació el día 9 (completitud y universalidad). "Imagine" fue lanzada el 9/9 (9 de septiembre) — pura poesía numerológica.',
    it:'I Beatles erano 4 membri (il numero della struttura e del fondamento). John Lennon nacque il 9 (completezza e universalità). "Imagine" uscì il 9/9 (9 settembre) — pura poesia numerologica.',
    de:'Die Beatles waren 4 Mitglieder (die Zahl der Struktur und des Fundaments). John Lennon wurde am 9. geboren (Vollendung und Universalität). "Imagine" erschien am 9/9 (9. September) — reine numerologische Poesie.',
    zh:'披头士乐队有4名成员（结构和基础的数字）。约翰·列侬出生在9日（完整性和普遍性）。"Imagine"在9/9（9月9日）发行——纯粹的数字命理诗。',
    ja:'ビートルズは4人のメンバーだった（構造と基盤の数）。ジョン・レノンは9日生まれ（完成と普遍性）。"Imagine"は9/9（9月9日）にリリースされた。純粋な数秘術の詩だ。',
    fr:'Les Beatles étaient 4 membres (le nombre de structure et fondation). John Lennon est né le 9 (complétude et universalité). "Imagine" est sorti le 9/9 (9 septembre) — pure poésie numérologique.' },

  { number:11, category:'science', emoji:'🔬',
    en:'Albert Einstein: Life Path 3 (born 3/14/1879 → 3+1+4+1+8+7+9=33→6). He published his Theory of Relativity at age 26 (2+6=8, the number of power). The Genius Archetype, numerologically perfect.',
    es:'Albert Einstein: Camino de vida 3 (nacido 14/3/1879 → 3+1+4+1+8+7+9=33→6). Publicó su Teoría de la Relatividad a los 26 años (2+6=8, el número del poder). El arquetipo del Genio, numéricamente perfecto.',
    it:'Albert Einstein: Cammino di vita 3 (nato 14/3/1879 → 3+1+4+1+8+7+9=33→6). Pubblicò la sua Teoria della Relatività a 26 anni (2+6=8, il numero del potere). L\'Archetipo del Genio, numerologicamente perfetto.',
    de:'Albert Einstein: Lebensweg 3 (geboren am 14.3.1879 → 3+1+4+1+8+7+9=33→6). Er veröffentlichte seine Relativitätstheorie im Alter von 26 Jahren (2+6=8, die Zahl der Macht). Der Genius-Archetyp, numerologisch perfekt.',
    zh:'阿尔伯特·爱因斯坦：生命之道3（生于1879年3月14日→3+1+4+1+8+7+9=33→6）。他在26岁时发表了相对论（2+6=8，力量的数字）。天才原型，从数字命理学角度来看是完美的。',
    ja:'アルバート・アインシュタイン：ライフパス3（1879年3月14日生まれ→3+1+4+1+8+7+9=33→6）。26歳で相対性理論を発表（2+6=8、力の数）。天才のアーキタイプ、数秘術的に完璧。',
    fr:'Albert Einstein : Chemin de vie 3 (né le 14/3/1879 → 3+1+4+1+8+7+9=33→6). Il publia sa Théorie de la Relativité à 26 ans (2+6=10→1, le nombre du leadership). L\'Archétype du Génie, numériquement parfait.' },

  { number:8, category:'fashion', emoji:'💍',
    en:'Louis Vuitton founded his house in 1854 (1+8+5+4=18→9). The LV monogram has 33 pattern tiles (3+3=6). The brand\'s "8" energy manifests: power, luxury, and the infinite 8 logo mark.',
    es:'Louis Vuitton fundó su casa en 1854 (1+8+5+4=18→9). El monograma LV tiene 33 cuadros (3+3=6). La energía del "8" de la marca se manifiesta: poder, lujo, y el infinito en el logo.',
    it:'Louis Vuitton fondò la sua maison nel 1854 (1+8+5+4=18→9). Il monogramma LV ha 33 riquadri (3+3=6). L\'energia "8" del brand si manifesta: potere, lusso, e l\'infinito nel logo.',
    de:'Louis Vuitton gründete sein Haus 1854 (1+8+5+4=18→9). Das LV-Monogramm hat 33 Musterkacheln (3+3=6). Die "8"-Energie der Marke manifestiert sich: Macht, Luxus und das unendliche 8-Logo.',
    zh:'路易威登于1854年创立（1+8+5+4=18→9）。LV字母组合图案有33个重复单元（3+3=6）。品牌的"8"能量体现：权力、奢华和无限的8形标志。',
    ja:'ルイ・ヴィトンは1854年に創業（1+8+5+4=18→9）。LVモノグラムには33のパターンタイルがある（3+3=6）。ブランドの「8」エネルギーが現れる：力、贅沢、そして無限大のロゴマーク。',
    fr:'Louis Vuitton fonda sa maison en 1854 (1+8+5+4=18→9). Le monogramme LV a 33 carreaux (3+3=6). L\'énergie "8" de la marque se manifeste : pouvoir, luxe, et l\'infini dans le logo.' },

  { number:9, category:'history', emoji:'⚡',
    en:'Nikola Tesla was obsessed with 3, 6 and 9. "If you knew the magnificence of these three numbers, you would have a key to the universe." He was born on the 10th (1+0=1) but his soul was a 9.',
    es:'Nikola Tesla estaba obsesionado con el 3, el 6 y el 9. "Si conocieras la magnificencia de estos tres números, tendrías una clave del universo." Nació el día 10 (1+0=1) pero su alma era un 9.',
    it:'Nikola Tesla era ossessionato da 3, 6 e 9. "Se conoscessi la magnificenza di questi tre numeri, avresti una chiave dell\'universo." Nacque il 10 (1+0=1) ma la sua anima era un 9.',
    de:'Nikola Tesla war besessen von 3, 6 und 9. "Wenn du die Großartigkeit dieser drei Zahlen kennst, hast du den Schlüssel zum Universum." Er wurde am 10. geboren (1+0=1), aber seine Seele war eine 9.',
    zh:'尼古拉·特斯拉痴迷于3、6和9。"如果你知道这三个数字的宏伟，你就会拥有宇宙的钥匙。"他出生于10日（1+0=1），但他的灵魂是9。',
    ja:'ニコラ・テスラは3、6、9に取り憑かれていた。「これら3つの数字の壮大さを知れば、宇宙の鍵を手に入れるだろう。」彼は10日生まれ（1+0=1）だが、魂は9だった。',
    fr:'Nikola Tesla était obsédé par le 3, le 6 et le 9. "Si tu connaissais la magnificence de ces trois nombres, tu aurais une clé de l\'univers." Il est né le 10 (1+0=1) mais son âme était un 9.' },

  { number:6, category:'art', emoji:'🎨',
    en:'Leonardo da Vinci: born April 15 (4+1+5=10→1). The Mona Lisa took 4 years to paint (1+4=5). The Golden Ratio φ=1.618… reduces to 8 (1+6+1+8=16→7). Art encoded with divine mathematics.',
    es:'Leonardo da Vinci: nacido el 15 de abril (4+1+5=10→1). La Mona Lisa le llevó 4 años pintarla (1+4=5). La Proporción Áurea φ=1.618… reduce a 7 (1+6+1+8=16→7). Arte codificado con matemática divina.',
    it:'Leonardo da Vinci: nato il 15 aprile (4+1+5=10→1). La Gioconda richies 4 anni di pittura (1+4=5). La Sezione Aurea φ=1.618… si riduce a 7 (1+6+1+8=16→7). Arte codificata con matematica divina.',
    de:'Leonardo da Vinci: geboren am 15. April (4+1+5=10→1). Die Mona Lisa brauchte 4 Jahre zum Malen (1+4=5). Der Goldene Schnitt φ=1,618… reduziert auf 7 (1+6+1+8=16→7). Kunst kodiert mit göttlicher Mathematik.',
    zh:'列奥纳多·达·芬奇：出生于4月15日（4+1+5=10→1）。《蒙娜丽莎》花了4年时间（1+4=5）。黄金比例φ=1.618…化简为7（1+6+1+8=16→7）。用神圣数学编码的艺术。',
    ja:'レオナルド・ダ・ヴィンチ：4月15日生まれ（4+1+5=10→1）。モナリザの制作に4年かかった（1+4=5）。黄金比φ=1.618…は7に帰着（1+6+1+8=16→7）。神聖な数学でコード化された芸術。',
    fr:'Léonard de Vinci : né le 15 avril (4+1+5=10→1). La Joconde lui a pris 4 ans à peindre (1+4=5). Le Nombre d\'Or φ=1,618… se réduit à 7 (1+6+1+8=16→7). Art codé avec les mathématiques divines.' },

  { number:2, category:'culture', emoji:'🌙',
    en:'Yin and Yang, the dual principle. The number 2 appears in the founding of almost every major civilization: 2 suns in Egyptian cosmology, 2 tablets of Moses, 2 masks of theatre. Duality is the architect of meaning.',
    es:'Yin y Yang, el principio dual. El número 2 aparece en la fundación de casi toda gran civilización: 2 soles en la cosmología egipcia, 2 tablas de Moisés, 2 máscaras del teatro. La dualidad es la arquitecta del significado.',
    it:'Yin e Yang, il principio duale. Il numero 2 appare nella fondazione di quasi ogni grande civiltà: 2 soli nella cosmologia egizia, 2 tavole di Mosè, 2 maschere del teatro. La dualità è l\'architetta del significato.',
    de:'Yin und Yang, das duale Prinzip. Die Zahl 2 erscheint in der Gründung fast jeder großen Zivilisation: 2 Sonnen in der ägyptischen Kosmologie, 2 Tafeln des Moses, 2 Masken des Theaters. Dualität ist die Architektin des Sinns.',
    zh:'阴阳，二元原则。数字2出现在几乎每个主要文明的建立中：埃及宇宙论中的2个太阳，摩西的2块石板，戏剧的2张面具。二元性是意义的建筑师。',
    ja:'陰と陽、二元の原則。数字2はほぼすべての主要文明の創設に現れる：エジプト宇宙論の2つの太陽、モーセの2枚の石板、演劇の2つの仮面。二元性は意味の建築家だ。',
    fr:'Yin et Yang, le principe duel. Le chiffre 2 apparaît dans la fondation de presque toutes les grandes civilisations : 2 soleils dans la cosmologie égyptienne, 2 tables de Moïse, 2 masques du théâtre. La dualité est l\'architecte du sens.' },

  { number:33, category:'history', emoji:'✝️',
    en:'The number 33 is considered the Master Teacher. Jesus Christ was 33 at the Crucifixion. The human spine has 33 vertebrae. The 33rd degree is the highest in Freemasonry. Coincidence? Numerology says: never.',
    es:'El número 33 es considerado el Maestro Enseñante. Jesucristo tenía 33 años en la Crucifixión. La columna vertebral humana tiene 33 vértebras. El grado 33 es el más alto en la Masonería. ¿Coincidencia? La numerología dice: nunca.',
    it:'Il numero 33 è considerato il Maestro Insegnante. Gesù Cristo aveva 33 anni alla Crocifissione. La colonna vertebrale umana ha 33 vertebre. Il 33° grado è il più alto nella Massoneria. Coincidenza? La numerologia dice: mai.',
    de:'Die Zahl 33 gilt als der Meisterlehrer. Jesus Christus war bei der Kreuzigung 33 Jahre alt. Die menschliche Wirbelsäule hat 33 Wirbel. Der 33. Grad ist der höchste in der Freimaurerei. Zufall? Die Numerologie sagt: niemals.',
    zh:'数字33被认为是主宰教师。耶稣基督在受难时33岁。人类脊椎有33节椎骨。第33度是共济会的最高级别。巧合？数字命理学说：从不。',
    ja:'33という数は「マスター・ティーチャー」とされる。イエス・キリストは十字架刑の時33歳だった。人間の脊椎は33個の椎骨がある。第33度はフリーメイソンの最高位。偶然？数秘術は言う：決してそうではない。',
    fr:'Le nombre 33 est considéré comme le Maître Enseignant. Jésus-Christ avait 33 ans lors de la Crucifixion. La colonne vertébrale humaine a 33 vertèbres. Le 33e degré est le plus élevé en Franc-maçonnerie. Coïncidence ? La numérologie dit : jamais.' },
];

const SECTION_TITLE: Record<Language, string> = {
  en: 'Numerology & the world', es: 'Numerología y el mundo', it: 'Numerologia e il mondo',
  de: 'Numerologie & die Welt', zh: '数字命理与世界', ja: '数秘術と世界', fr: 'Numérologie & le monde',
};

function getDailyIndices(): number[] {
  const now = new Date();
  const seed = now.getFullYear() * 1000 + (now.getMonth() + 1) * 31 + now.getDate();
  const shuffle = (arr: number[], s: number) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      const j = s % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const indices = Array.from({ length: CURIOSITIES.length }, (_, i) => i);
  return shuffle(indices, seed).slice(0, 4);
}

export const NumerologyCuriosities = ({ language }: { language: Language }) => {
  const [active, setActive] = useState(0);
  const [indices] = useState(() => getDailyIndices());
  const [fade, setFade] = useState(true);

  const go = (dir: number) => {
    setFade(false);
    setTimeout(() => {
      setActive((prev) => (prev + dir + indices.length) % indices.length);
      setFade(true);
    }, 200);
  };

  useEffect(() => {
    const id = setInterval(() => go(1), 7000);
    return () => clearInterval(id);
  }, [indices]);

  const item = CURIOSITIES[indices[active]];
  const text = item[language] ?? item.en;
  const catLabel = CATEGORY_LABEL[item.category][language] ?? CATEGORY_LABEL[item.category].en;

  return (
    <div className="mt-8 pt-8 border-t border-border/40">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-foreground/50" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{SECTION_TITLE[language]}</p>
        </div>
      </div>
      <div
        className="max-w-lg mx-auto rounded-xl border border-border/60 p-5 bg-foreground/[0.02] transition-opacity duration-200 relative"
        style={{ opacity: fade ? 1 : 0 }}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-foreground/[0.06] border border-border/40 flex items-center justify-center">
            <span className="font-serif text-xl font-bold text-foreground">{item.number}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">{item.emoji}</span>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full px-2 py-0.5">{catLabel}</span>
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{text}</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-4">
          {indices.map((_, i) => (
            <button
              key={i}
              onClick={() => { setFade(false); setTimeout(() => { setActive(i); setFade(true); }, 200); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === active ? 'bg-foreground w-3' : 'bg-foreground/20'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
