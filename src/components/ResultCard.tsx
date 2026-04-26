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
  dynamicMeaning?: string; // Optional dynamic meaning from database
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
  // Use dynamic meaning if provided, otherwise fall back to static
  const meaning = dynamicMeaning || numberMeanings[result.finalNumber]?.[language] || '';

  return (
    <div
      className="card-elegant slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex-shrink-0 text-center md:text-left">
          <span className="result-number">{result.finalNumber}</span>
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
