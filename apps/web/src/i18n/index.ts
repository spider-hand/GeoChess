import { createI18n } from "vue-i18n";

import de from "@/locales/de.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import fr from "@/locales/fr.json";
import ja from "@/locales/ja.json";
import pt from "@/locales/pt.json";
import zh from "@/locales/zh.json";

export const DEFAULT_LOCALE = "en";

export const messages = {
  de,
  en,
  es,
  fr,
  ja,
  pt,
  zh,
} as const;

export type AppLocale = keyof typeof messages;

export function createAppI18n(locale: AppLocale = DEFAULT_LOCALE) {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
  });
}

export const appI18n = createAppI18n();
