import { Language } from '@/lib/translations';
import { User, Sparkles, FileText } from 'lucide-react';

const STEPS: Record<Language, { title: string; steps: { icon: React.ReactNode; heading: string; body: string }[] }> = {
  en: {
    title: 'How it works',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: 'Enter your data', body: 'Your full name at birth and date of birth are the keys your unique energetic code is built from.' },
      { icon: <Sparkles className="w-5 h-5" />, heading: 'Get your reading', body: 'We calculate your 4 core numbers instantly — Destiny, Soul, Personality and Personal Year.' },
      { icon: <FileText className="w-5 h-5" />, heading: 'Go deeper', body: 'Choose a report for a complete analysis: archetypes, life cycles, vocation, relationships and 90-day action plan.' },
    ],
  },
  es: {
    title: 'Cómo funciona',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: 'Ingresa tus datos', body: 'Tu nombre completo al nacer y fecha de nacimiento son las llaves de tu código energético único.' },
      { icon: <Sparkles className="w-5 h-5" />, heading: 'Obtén tu lectura', body: 'Calculamos instantáneamente tus 4 números centrales: Destino, Alma, Personalidad y Año Personal.' },
      { icon: <FileText className="w-5 h-5" />, heading: 'Ve más profundo', body: 'Elige un informe para un análisis completo: arquetipos, ciclos de vida, vocación, relaciones y plan de acción 90 días.' },
    ],
  },
  it: {
    title: 'Come funziona',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: 'Inserisci i tuoi dati', body: 'Il tuo nome completo alla nascita e la data di nascita sono le chiavi del tuo codice energetico unico.' },
      { icon: <Sparkles className="w-5 h-5" />, heading: 'Ottieni la tua lettura', body: 'Calcoliamo istantaneamente i tuoi 4 numeri principali: Destino, Anima, Personalità e Anno Personale.' },
      { icon: <FileText className="w-5 h-5" />, heading: 'Approfondisci', body: 'Scegli un report per un\'analisi completa: archetipi, cicli di vita, vocazione, relazioni e piano d\'azione 90 giorni.' },
    ],
  },
  de: {
    title: 'Wie es funktioniert',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: 'Gib deine Daten ein', body: 'Dein vollständiger Geburtsname und dein Geburtsdatum sind die Schlüssel deines einzigartigen Energiecodes.' },
      { icon: <Sparkles className="w-5 h-5" />, heading: 'Erhalte deine Lesung', body: 'Wir berechnen sofort deine 4 Kernzahlen: Schicksal, Seele, Persönlichkeit und Persönliches Jahr.' },
      { icon: <FileText className="w-5 h-5" />, heading: 'Gehe tiefer', body: 'Wähle einen Bericht für eine vollständige Analyse: Archetypen, Lebenszyklen, Berufung, Beziehungen und 90-Tage-Aktionsplan.' },
    ],
  },
  zh: {
    title: '使用方法',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: '输入您的信息', body: '您的出生全名和出生日期是构建您独特能量代码的关键。' },
      { icon: <Sparkles className="w-5 h-5" />, heading: '获取您的解读', body: '我们即时计算您的4个核心数字：命运、灵魂、个性和个人年。' },
      { icon: <FileText className="w-5 h-5" />, heading: '深入了解', body: '选择报告进行完整分析：原型、生命周期、使命、关系和90天行动计划。' },
    ],
  },
  ja: {
    title: '使い方',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: 'データを入力する', body: '生まれた時のフルネームと生年月日が、あなた独自のエネルギーコードを構築する鍵です。' },
      { icon: <Sparkles className="w-5 h-5" />, heading: 'リーディングを受け取る', body: '4つのコアナンバー（運命、魂、個性、個人年）を瞬時に計算します。' },
      { icon: <FileText className="w-5 h-5" />, heading: 'より深く掘り下げる', body: '完全な分析のレポートを選択してください：アーキタイプ、ライフサイクル、使命、関係、90日アクションプラン。' },
    ],
  },
  fr: {
    title: 'Comment ça marche',
    steps: [
      { icon: <User className="w-5 h-5" />, heading: 'Saisissez vos données', body: 'Votre nom complet à la naissance et votre date de naissance sont les clés de votre code énergétique unique.' },
      { icon: <Sparkles className="w-5 h-5" />, heading: 'Obtenez votre lecture', body: 'Nous calculons instantanément vos 4 nombres principaux : Destinée, Âme, Personnalité et Année Personnelle.' },
      { icon: <FileText className="w-5 h-5" />, heading: 'Allez plus loin', body: 'Choisissez un rapport pour une analyse complète : archétypes, cycles de vie, vocation, relations et plan d\'action 90 jours.' },
    ],
  },
};

export const HowItWorks = ({ language }: { language: Language }) => {
  const content = STEPS[language] ?? STEPS.en;
  return (
    <div className="mb-5 pt-2">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-4">{content.title}</p>
      <div className="grid grid-cols-3 gap-3">
        {content.steps.map((step, i) => (
          <div key={i} className="text-center space-y-2">
            <div className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center mx-auto text-foreground/50">
              {step.icon}
            </div>
            <p className="font-serif text-sm font-medium text-foreground leading-tight">{step.heading}</p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
