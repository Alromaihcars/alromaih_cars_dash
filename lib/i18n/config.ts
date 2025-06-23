import { ResLang } from '../api/queries/languages'

export const defaultLocale = 'en' as const
export const locales = ['en', 'ar'] as const

export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ar: 'العربية'
}

export const localeDirections: Record<Locale, 'ltr' | 'rtl'> = {
  en: 'ltr',
  ar: 'rtl'
}

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  ar: '🇸🇦'
}

// Legacy functions for backward compatibility
export function getLocaleDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeDirections[locale] || 'ltr'
}

export function isRTL(locale: Locale): boolean {
  return getLocaleDirection(locale) === 'rtl'
}

// New dynamic language functions
export function getLanguageDirection(language: ResLang): 'ltr' | 'rtl' {
  return language.direction || 'ltr'
}

export function isLanguageRTL(language: ResLang): boolean {
  return getLanguageDirection(language) === 'rtl'
}

export function convertResLangToLocale(language: ResLang): string {
  // Convert ResLang code to simplified locale for backward compatibility
  const codeMap: Record<string, string> = {
    'en_US': 'en',
    'en_GB': 'en',
    'ar_SA': 'ar',
    'ar_001': 'ar',
    'ar_EG': 'ar',
    'ar_AE': 'ar'
  }
  
  return codeMap[language.code] || codeMap[language.iso_code] || language.code
}

export function getLanguageCodeByLocale(locale: Locale): string {
  const localeToCode: Record<Locale, string> = {
    'en': 'en_US',
    'ar': 'ar_SA'
  }
  
  return localeToCode[locale] || locale
} 