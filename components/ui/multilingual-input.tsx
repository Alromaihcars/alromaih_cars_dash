'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Languages, ChevronDown, Check } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { cn } from '@/lib/utils'

interface Translation {
  en_US: string
  ar_001: string
}

interface MultilingualInputProps {
  id?: string
  label: string
  placeholder?: string
  value: Translation
  onChange: (value: Translation) => void
  required?: boolean
  className?: string
  inputClassName?: string
}

const SUPPORTED_LANGUAGES = [
  { code: 'ar_001', name: 'العربية', flag: '🇸🇦', direction: 'rtl' },
  { code: 'en_US', name: 'English', flag: '🇺🇸', direction: 'ltr' }
]

export function MultilingualInput({
  id,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className,
  inputClassName
}: MultilingualInputProps) {
  const { currentLanguage, isRTL } = useI18n()
  
  const getDefaultLanguage = () => {
    if (currentLanguage === 'ar' || currentLanguage === 'ar_001') {
      return 'ar_001'
    }
    if (currentLanguage === 'en' || currentLanguage === 'en_US') {
      return 'en_US'
    }
    return 'ar_001'
  }
  
  const [activeLanguage, setActiveLanguage] = useState<string>(getDefaultLanguage())
  
  useEffect(() => {
    setActiveLanguage(getDefaultLanguage())
  }, [currentLanguage])

  const getCurrentValue = () => {
    return value[activeLanguage as keyof Translation] || ''
  }

  const handleInputChange = (inputValue: string) => {
    const newValue = {
      ...value,
      [activeLanguage]: inputValue
    }
    onChange(newValue)
  }

  const getCurrentLanguage = () => {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === activeLanguage) || SUPPORTED_LANGUAGES[0]
  }

  const getLanguageCompleteness = () => {
    const completed = SUPPORTED_LANGUAGES.filter(lang => 
      value[lang.code as keyof Translation]?.trim()
    ).length
    return `${completed}/${SUPPORTED_LANGUAGES.length}`
  }

  const isLanguageCompleted = (langCode: string) => {
    return !!(value[langCode as keyof Translation]?.trim())
  }

  const getOrderedLanguages = () => {
    if (currentLanguage === 'ar' || currentLanguage === 'ar_001' || isRTL) {
      return SUPPORTED_LANGUAGES
    }
    return SUPPORTED_LANGUAGES
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {getLanguageCompleteness()}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2">
                <span className="mr-1">{getCurrentLanguage().flag}</span>
                <span className="text-xs">{getCurrentLanguage().name}</span>
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              {getOrderedLanguages().map((language) => (
                <DropdownMenuItem
                  key={language.code}
                  onClick={() => setActiveLanguage(language.code)}
                  className={cn(
                    "flex items-center justify-between cursor-pointer text-xs",
                    language.direction === 'rtl' && "flex-row-reverse text-right"
                  )}
                >
                  <div className={cn(
                    "flex items-center gap-2", 
                    language.direction === 'rtl' && "flex-row-reverse"
                  )}>
                    <span>{language.flag}</span>
                    <span>{language.name}</span>
                  </div>
                  {(isLanguageCompleted(language.code) || language.code === activeLanguage) && (
                    <Check className="h-3 w-3 text-green-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="relative">
        <Input
          id={id}
          value={getCurrentValue()}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          dir={getCurrentLanguage().direction}
          className={cn(
            inputClassName,
            getCurrentLanguage().direction === 'rtl' && "text-right"
          )}
        />
      </div>
    </div>
  )
}