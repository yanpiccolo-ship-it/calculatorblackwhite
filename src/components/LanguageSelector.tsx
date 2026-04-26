import { Language, languageNames } from '@/lib/translations';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LanguageSelector = ({ language, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <Select value={language} onValueChange={(value) => onLanguageChange(value as Language)}>
      <SelectTrigger className="w-[140px] bg-transparent border-border/50 text-sm font-medium">
        <Globe className="w-4 h-4 mr-2 opacity-60" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(languageNames).map(([code, name]) => (
          <SelectItem key={code} value={code} className="text-sm">
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
