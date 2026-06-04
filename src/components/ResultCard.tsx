import { useState, useEffect, useRef } from 'react';
import { NumerologyResult, numberMeanings } from '@/lib/numerology';
import { Language, translations } from '@/lib/translations';
import { StepByStepDisplay } from './StepByStepDisplay';
import { TarotBinomialDisplay } from './TarotBinomialDisplay';

export interface ResultCardProps {
  title: string;
  description: string;
  result: NumerologyResult;
  language: Language;
  showTarot: boolean;
  type: 'letters' | 'vowels' | 'consonants' | 'personal';
  delay?: number;
  dynamicMeaning?: string;
}

function useCountUp(target: number, duration = 900, startDelay = 0) {
  const [count, setCount] = useState(0);
  const rafRef = useRef<number>(0);
  useEffect(() => {
    let started = false;
    const timeout = setTimeout(() => {
      started = true;
      const startTime = performance.now();
      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    }, startDelay);
    return () => {
      clearTimeout(timeout);
      if (started) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, startDelay]);
  return count;
}

export const ResultCard = ({
  title,
  description,
  result,
  language,
  showTarot,
  type,
  delay = 0,
  dynamicMeaning,
}: ResultCardProps) => {
  const meaning = dynamicMeaning || numberMeanings[result.finalNumber]?.[language] || '';
  const displayNumber = useCountUp(result.finalNumber, 800, delay + 200);

  return (
    <div
      className="card-elegant slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0 text-center md:text-left">
          <span className="result-number">{displayNumber}</span>
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="section-heading text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
          
          <p className="text-foreground/90 leading-relaxed">{meaning}</p>
          
          <StepByStepDisplay result={result} language={language} type={type} />
          
          {showTarot && <TarotBinomialDisplay number={result.finalNumber} language={language} />}
        </div>
      </div>
    </div>
  );
};
