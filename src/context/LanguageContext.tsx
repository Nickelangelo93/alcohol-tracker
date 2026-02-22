import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { getTranslations } from '../i18n';
import type { Translations } from '../i18n';
import { getAppSettings, saveAppSettings } from '../database/database';

interface LanguageContextType {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'nl',
  t: getTranslations('nl'),
  setLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('nl');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const settings = await getAppSettings();
      setLanguageState(settings.language);
    } catch {
      // Use default 'nl'
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    setLanguageState(lang);
    try {
      const settings = await getAppSettings();
      await saveAppSettings({ ...settings, language: lang });
    } catch {
      // Silently fail
    }
  }, []);

  const t = getTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, t, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  return useContext(LanguageContext);
}
