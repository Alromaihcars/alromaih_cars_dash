'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { type Locale, defaultLocale, getLocaleDirection, isRTL } from './config'
import { type Dictionary, getDictionary } from './dictionaries'

interface I18nContextType {
  locale: Locale
  dictionary: Dictionary | null
  setLocale: (locale: Locale) => void
  currentLanguage: string
  switchLanguage: (languageCode: string) => Promise<void>
  t: (key: string, params?: Record<string, string | number>) => string
  isRTL: boolean
  direction: 'ltr' | 'rtl'
  isLoading: boolean
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

interface I18nProviderProps {
  children: React.ReactNode
  initialLocale?: Locale
}

export function I18nProvider({ children, initialLocale = defaultLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale)
  const [dictionary, setDictionary] = useState<Dictionary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentLanguage, setCurrentLanguage] = useState<string>(initialLocale)

  // Load dictionary when locale changes
  useEffect(() => {
    let isMounted = true
    setIsLoading(true)
    
    getDictionary(locale).then((dict) => {
      if (isMounted) {
        setDictionary(dict)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [locale])

  // Update document direction and lang attribute
  useEffect(() => {
    const direction = getLocaleDirection(locale)
    document.documentElement.dir = direction
    document.documentElement.lang = locale
    
    // Update body class for RTL styling
    if (isRTL(locale)) {
      document.body.classList.add('rtl')
      document.body.classList.remove('ltr')
    } else {
      document.body.classList.add('ltr')
      document.body.classList.remove('rtl')
    }
  }, [locale])

  // Save locale to localStorage
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem('locale', newLocale)
  }

  // Load locale from localStorage on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale
    if (savedLocale && savedLocale !== locale) {
      setLocaleState(savedLocale)
    }
  }, [])

  // Translation function with nested key support and parameter interpolation
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (!dictionary) return key

    // Support nested keys like 'common.loading'
    const keys = key.split('.')
    let value: any = dictionary
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // Return key if not found
      }
    }

    if (typeof value !== 'string') {
      return key
    }

    // Replace parameters in the string
    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match
      })
    }

    return value
  }

  // Dynamic language switching function
  const switchLanguage = async (languageCode: string) => {
    setCurrentLanguage(languageCode)
    // Map language code to locale for backward compatibility
    const localeMap: Record<string, Locale> = {
      'en_US': 'en',
      'ar_SA': 'ar',
      'en': 'en',
      'ar': 'ar'
    }
    const newLocale = localeMap[languageCode] || (languageCode.includes('ar') ? 'ar' : 'en')
    setLocale(newLocale)
  }

  const contextValue: I18nContextType = {
    locale,
    dictionary,
    setLocale,
    currentLanguage,
    switchLanguage,
    t,
    isRTL: isRTL(locale),
    direction: getLocaleDirection(locale),
    isLoading
  }

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  )
} 