import React from 'react';
import LanguageSwitcher from './LanguageSwitcher';

interface HeaderProps {
    currentLanguage: string;
    onLanguageChange: (lang: string) => void;
    t: any;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onLanguageChange, t }) => {
  return (
    <header className="bg-brand-surface/50 backdrop-blur-sm sticky top-0 z-10 border-b border-brand-muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 bg-gradient-to-tr from-brand-primary to-brand-accent rounded-lg flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c.251.023.501.05.75.082a9.75 9.75 0 016 8.076M9.75 3.104a9.75 9.75 0 00-7.5 8.076M12 21a9.75 9.75 0 01-9.75-9.75c0-3.342 1.82-6.248 4.5-8.076" /></svg>
             </div>
            <h1 className="text-xl font-bold text-brand-text">{t.headerTitle}</h1>
            <span className="text-sm text-brand-text-dim hidden md:inline-block">{t.headerSubtitle}</span>
          </div>
          <LanguageSwitcher currentLanguage={currentLanguage} onLanguageChange={onLanguageChange} />
        </div>
      </div>
    </header>
  );
};

export default Header;
