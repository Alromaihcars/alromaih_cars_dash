// Language-related static data and utilities
import { useState, useEffect } from 'react'

// Types for language data
export interface ResLang {
  code: string
  name: string
  iso_code: string
  direction: 'ltr' | 'rtl'
  active: boolean
}

export interface LanguageFormData {
  [key: string]: string
}

export interface TranslatableContent {
  [languageCode: string]: string
}

// Static languages configuration
const STATIC_LANGUAGES: ResLang[] = [
  {
    code: 'en_US',
    name: 'English',
    iso_code: 'en',
    direction: 'ltr',
    active: true
  },
  {
    code: 'ar_001',
    name: 'العربية',
    iso_code: 'ar',
    direction: 'rtl',
    active: true
  }
]

// Hook to get static languages
export const useActiveLanguages = () => {
  const [languages, setLanguages] = useState<ResLang[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLanguages = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Simulate a brief loading time for consistency
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setLanguages(STATIC_LANGUAGES)
      console.log('✅ Static languages loaded:', STATIC_LANGUAGES.length, 'languages')
      setError(null)
      
    } catch (err) {
      console.error('❌ Error loading static languages:', err)
      setLanguages(STATIC_LANGUAGES) // Still return static languages even on "error"
      setError(null) // Don't show error for static data
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLanguages()
  }, [])

  return { 
    languages, 
    loading, 
    error, 
    refetch: fetchLanguages,
    hasApiData: false // Always false since it's static
  }
}

// Utility functions
export const getLanguageByCode = (languages: ResLang[], code: string): ResLang | undefined => {
  return languages.find(lang => lang.code === code || lang.iso_code === code)
}

export const getLanguageFlag = (language: ResLang | string): string => {
  // Handle string input (language code)
  if (typeof language === 'string') {
    const flagMap: Record<string, string> = {
      'en_US': '🇺🇸',
      'en_GB': '🇬🇧',
      'ar_001': '🇸🇦', // Saudi flag for Arabic
      'ar_SA': '🇸🇦',
      'en': '🇺🇸',
      'ar': '🇸🇦'
    }
    return flagMap[language] || '🌐'
  }
  
  // For ResLang objects, fall through to flag mapping
  
  // Fallback flags based on common language codes
  const flagMap: Record<string, string> = {
    'en_US': '🇺🇸',
    'en_GB': '🇬🇧',
    'ar_001': '🇸🇦', // Saudi flag for Arabic
    'ar_SA': '🇸🇦',
    'fr_FR': '🇫🇷',
    'es_ES': '🇪🇸',
    'de_DE': '🇩🇪',
    'it_IT': '🇮🇹',
    'ja_JP': '🇯🇵',
    'ko_KR': '🇰🇷',
    'zh_CN': '🇨🇳',
    'pt_BR': '🇧🇷',
    'ru_RU': '🇷🇺',
    'hi_IN': '🇮🇳',
    'th_TH': '🇹🇭',
    'vi_VN': '🇻🇳',
    'tr_TR': '🇹🇷',
    'nl_NL': '🇳🇱',
    'sv_SE': '🇸🇪',
    'da_DK': '🇩🇰',
    'no_NO': '🇳🇴',
    'fi_FI': '🇫🇮',
    'pl_PL': '🇵🇱',
    'cs_CZ': '🇨🇿',
    'hu_HU': '🇭🇺',
    'ro_RO': '🇷🇴',
    'bg_BG': '🇧🇬',
    'hr_HR': '🇭🇷',
    'sk_SK': '🇸🇰',
    'sl_SI': '🇸🇮',
    'et_EE': '🇪🇪',
    'lv_LV': '🇱🇻',
    'lt_LT': '🇱🇹',
    'uk_UA': '🇺🇦',
    'he_IL': '🇮🇱',
    'fa_IR': '🇮🇷',
    'ur_PK': '🇵🇰',
    'bn_BD': '🇧🇩',
    'ta_IN': '🇮🇳',
    'te_IN': '🇮🇳',
    'ml_IN': '🇮🇳',
    'kn_IN': '🇮🇳',
    'gu_IN': '🇮🇳',
    'mr_IN': '🇮🇳',
    'pa_IN': '🇮🇳',
    'or_IN': '🇮🇳',
    'as_IN': '🇮🇳',
    'ne_NP': '🇳🇵',
    'si_LK': '🇱🇰',
    'my_MM': '🇲🇲',
    'km_KH': '🇰🇭',
    'lo_LA': '🇱🇦',
    'ka_GE': '🇬🇪',
    'am_ET': '🇪🇹',
    'sw_TZ': '🇹🇿',
    'zu_ZA': '🇿🇦',
    'af_ZA': '🇿🇦',
    'xh_ZA': '🇿🇦'
  }
  
  return flagMap[language.code] || flagMap[language.iso_code] || '🌐'
}

export const convertLegacyToModernCode = (legacyCode: string): string => {
  const codeMap: Record<string, string> = {
    'en': 'en_US',
    'ar': 'ar_001', // Use ar_001 as the modern code for Arabic
    'fr': 'fr_FR',
    'es': 'es_ES',
    'de': 'de_DE',
    'it': 'it_IT'
  }
  
  return codeMap[legacyCode] || legacyCode
}

export const getDisplayName = (language: ResLang): string => {
  return language.name || language.code
}

// Function to convert multilingual data to GraphQL format
export const convertToTranslations = (data: TranslatableContent): Record<string, string> => {
  return Object.entries(data).reduce((acc, [langCode, value]) => {
    if (value && value.trim()) {
      acc[langCode] = value
    }
    return acc
  }, {} as Record<string, string>)
}

// Function to convert GraphQL response to multilingual data
export const convertFromTranslations = (translations: Record<string, string> | null): TranslatableContent => {
  if (!translations) return {}
  return { ...translations }
}

// Get all available static languages
export const getAllLanguages = (): ResLang[] => {
  return [...STATIC_LANGUAGES]
}

// Check if a language code is supported
export const isLanguageSupported = (code: string): boolean => {
  return STATIC_LANGUAGES.some(lang => lang.code === code || lang.iso_code === code)
} 