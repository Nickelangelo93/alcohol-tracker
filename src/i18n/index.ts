import nl from './nl';
import en from './en';
import type { Language } from '../types';

export type { Translations } from './nl';

const translations: Record<Language, typeof nl> = {
  nl,
  en,
};

export function getTranslations(language: Language): typeof nl {
  return translations[language] ?? translations.nl;
}
