import React from 'react';
import { languages } from '../locales/i18n';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (languageCode: string) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center space-x-1 bg-brand-bg p-1 rounded-lg border border-brand-muted">
      {languages.map(({ code }) => (
        <button
          key={code}
          onClick={() => onLanguageChange(code)}
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-surface
            ${currentLanguage === code 
              ? 'bg-brand-primary text-white' 
              : 'text-brand-text-dim hover:bg-brand-muted/50 hover:text-brand-text'
            }`}
          aria-pressed={currentLanguage === code}
          title={languages.find(l => l.code === code)?.name}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
