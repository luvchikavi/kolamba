'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/translations';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang: Language = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-teal-600 transition-colors rounded-md hover:bg-gray-100 ${className}`}
      aria-label={language === 'he' ? 'Switch to English' : 'החלף לעברית'}
    >
      <span className="text-base">🌐</span>
      <span>{language === 'he' ? 'EN' : 'עב'}</span>
    </button>
  );
}

// Alternative: Dropdown style switcher
export function LanguageDropdown({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`relative ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="appearance-none bg-transparent border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm font-medium text-gray-700 hover:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
      >
        <option value="he">עברית</option>
        <option value="en">English</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}
