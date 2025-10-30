import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageContextType {
  language: 'en' | 'ar';
  direction: 'ltr' | 'rtl';
  numerals: 'western' | 'arabic';
  toggleLanguage: () => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  toggleNumerals: () => void;
  setNumerals: (n: 'western' | 'arabic') => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguageState] = useState<'en' | 'ar'>('en');
  const [numerals, setNumeralsState] = useState<'western' | 'arabic'>(() => {
    try {
      const n = localStorage.getItem('numerals') as 'western' | 'arabic' | null;
      return n ?? 'western';
    } catch { return 'western'; }
  });
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (savedLang) {
      setLanguageState(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = language;
    document.documentElement.setAttribute('data-numerals', numerals);
  }, [direction, language]);

  const setLanguage = (lang: 'en' | 'ar') => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const setNumerals = (n: 'western' | 'arabic') => {
    setNumeralsState(n);
    try { localStorage.setItem('numerals', n); } catch {}
    document.documentElement.setAttribute('data-numerals', n);
  };

  const toggleNumerals = () => setNumerals(numerals === 'western' ? 'arabic' : 'western');

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
  };

  return (
    <LanguageContext.Provider value={{ language, direction, numerals, toggleLanguage, setLanguage, toggleNumerals, setNumerals }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

// Provide a simple getter for non-React modules (e.g., API layer)
export function getCurrentLanguage(): 'en' | 'ar' {
  try {
    const saved = localStorage.getItem('language') as 'en' | 'ar' | null;
    if (saved) return saved;
  } catch {}
  const docLang = typeof document !== 'undefined' ? (document.documentElement.lang as 'en'|'ar'|undefined) : undefined;
  return docLang ?? 'en';
}

export function getCurrentNumerals(): 'western' | 'arabic' {
  try {
    const n = localStorage.getItem('numerals') as 'western'|'arabic'|null;
    if (n) return n;
  } catch {}
  const attr = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-numerals') as 'western'|'arabic'|null : null;
  return attr ?? 'western';
}
