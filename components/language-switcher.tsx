'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Languages, ChevronDown, Check, Loader2, AlertCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import { useActiveLanguages, getLanguageFlag, getDisplayName, type ResLang } from '@/lib/api/queries/languages'
import { cn } from '@/lib/utils'

export function LanguageSwitcher() {
  const { currentLanguage, switchLanguage, isRTL } = useI18n()
  const { 
    languages, 
    loading, 
    error, 
    refetch 
  } = useActiveLanguages()

  const currentLang = languages.find((lang: ResLang) => 
    lang.code === currentLanguage || 
    lang.iso_code === currentLanguage ||
    (currentLanguage === 'en' && lang.code === 'en_US') ||
    (currentLanguage === 'ar' && lang.code === 'ar_001')
  ) || languages[0] // Fallback to first language if no match

  const handleLanguageSwitch = async (languageCode: string) => {
    try {
      await switchLanguage(languageCode)
      // Update document direction
      const lang = languages.find((l: ResLang) => l.code === languageCode)
      if (lang) {
        document.documentElement.dir = lang.direction
        document.documentElement.lang = lang.iso_code || languageCode
      }
    } catch (error) {
      console.error('Failed to switch language:', error)
    }
  }

  if (loading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    )
  }

  if (error || languages.length === 0) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => refetch()}
        className="text-red-600 hover:text-red-700"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        Retry
      </Button>
    )
  }

  if (!currentLang) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => refetch()}
        className="text-yellow-600 hover:text-yellow-700"
      >
        <AlertCircle className="h-4 w-4 mr-2" />
        No Language
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className={cn(
            "min-w-[120px] justify-between",
            isRTL && "flex-row-reverse"
          )}
        >
          <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
            <span className="mr-2 text-sm">
              {getLanguageFlag(currentLang.code)}
            </span>
            <span className="truncate">
              {getDisplayName(currentLang)}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[200px]">
        {languages.map((language: ResLang) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageSwitch(language.code)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
              language.direction === 'rtl' && "flex-row-reverse text-right"
            )}
          >
            <div className={cn(
              "flex items-center", 
              language.direction === 'rtl' && "flex-row-reverse"
            )}>
              <span className="mr-2 text-sm">
                {getLanguageFlag(language.code)}
              </span>
              <span>{getDisplayName(language)}</span>
            </div>
            
            {language.code === currentLanguage && (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => refetch()}
          className="text-sm text-muted-foreground"
        >
          <Languages className="h-4 w-4 mr-2" />
          Refresh Languages
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 