"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Languages, Globe, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  SUPPORTED_LANGUAGES, 
  LanguageCode, 
  FieldTranslation,
  localizationUtils 
} from "@/lib/api/queries/system-settings"

interface LocalizedInputProps {
  label: string
  value: string
  translations?: any
  onChange: (value: string, translations?: any) => void
  placeholder?: string
  required?: boolean
  type?: 'input' | 'textarea'
  disabled?: boolean
  description?: string
  rows?: number
  className?: string
}

export function LocalizedInput({
  label,
  value,
  translations,
  onChange,
  placeholder,
  required = false,
  type = 'input',
  disabled = false,
  description,
  rows = 3,
  className
}: LocalizedInputProps) {
  const [activeLanguage, setActiveLanguage] = useState<LanguageCode>('en_US')
  const [showTranslations, setShowTranslations] = useState(false)

  // Get all translations including base value
  const allTranslations = localizationUtils.getAllTranslations(value, translations)
  const hasTranslations = localizationUtils.hasTranslations(translations)

  // Get current value for active language
  const getCurrentValue = () => {
    if (activeLanguage === 'en_US') {
      return value || ''
    }
    return localizationUtils.getLocalizedValue(value, translations, activeLanguage)
  }

  // Handle value change for current language
  const handleValueChange = (newValue: string) => {
    if (activeLanguage === 'en_US') {
      // Update base value
      onChange(newValue, translations)
    } else {
      // Update translation
      const updatedTranslations = localizationUtils.setTranslation(
        translations, 
        activeLanguage, 
        newValue
      )
      onChange(value, updatedTranslations)
    }
  }

  // Check if language has content
  const hasContent = (langCode: LanguageCode) => {
    if (langCode === 'en_US') {
      return Boolean(value?.trim())
    }
    return Boolean(allTranslations[langCode]?.trim())
  }

  // Get completion stats
  const completedLanguages = SUPPORTED_LANGUAGES.filter(lang => hasContent(lang.code))
  const completionRate = Math.round((completedLanguages.length / SUPPORTED_LANGUAGES.length) * 100)

  const InputComponent = type === 'textarea' ? Textarea : Input

  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label className="text-sm font-medium">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Completion Badge */}
          {hasTranslations && (
            <Badge variant="secondary" className="text-xs">
              <Globe className="w-3 h-3 mr-1" />
              {completionRate}% Complete
            </Badge>
          )}
          
          {/* Toggle Translations Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowTranslations(!showTranslations)}
            className="text-xs"
          >
            <Languages className="w-3 h-3 mr-1" />
            {showTranslations ? 'Hide' : 'Show'} Translations
          </Button>
        </div>
      </div>

      {/* Main Input (English) */}
      {!showTranslations && (
        <InputComponent
          value={value || ''}
          onChange={(e) => onChange(e.target.value, translations)}
          placeholder={placeholder}
          disabled={disabled}
          rows={type === 'textarea' ? rows : undefined}
          className="w-full"
        />
      )}

      {/* Translations Interface */}
      {showTranslations && (
        <Card>
          <CardContent className="p-4">
            <Tabs value={activeLanguage} onValueChange={(value) => setActiveLanguage(value as LanguageCode)}>
              {/* Language Tabs */}
              <TabsList className="grid w-full grid-cols-2 mb-4">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <TabsTrigger 
                    key={lang.code} 
                    value={lang.code}
                    className="flex items-center gap-2"
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.native}</span>
                    {hasContent(lang.code) && (
                      <Check className="w-3 h-3 text-green-500" />
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Language Content */}
              {SUPPORTED_LANGUAGES.map((lang) => (
                <TabsContent key={lang.code} value={lang.code} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-muted-foreground">
                      {lang.name} {lang.flag}
                    </Label>
                    {hasContent(lang.code) && (
                      <Badge variant="success" className="text-xs">
                        <Check className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <InputComponent
                    value={getCurrentValue()}
                    onChange={(e) => handleValueChange(e.target.value)}
                    placeholder={`${placeholder} (${lang.native})`}
                    disabled={disabled}
                    rows={type === 'textarea' ? rows : undefined}
                    className="w-full"
                    dir={lang.code === 'ar_SA' ? 'rtl' : 'ltr'}
                  />
                  
                  {lang.code !== 'en_US' && !hasContent(lang.code) && hasContent('en_US') && (
                    <p className="text-xs text-muted-foreground">
                      Will fallback to English: "{value}"
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Translation Summary */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Translation Progress</span>
                <span>{completedLanguages.length} of {SUPPORTED_LANGUAGES.length} languages</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <div key={lang.code} className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span className="text-xs">{lang.native}</span>
                    {hasContent(lang.code) ? (
                      <Check className="w-3 h-3 text-green-500 ml-auto" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-200 ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Export type for external use
export type { LocalizedInputProps } 