"use client"

import { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  SystemSettings, 
  SystemSettingsInput, 
  LanguageCode,
  CHECK_SYSTEM_SETTINGS_EXIST,
  GET_SYSTEM_SETTINGS_FULL,
  GET_SYSTEM_SETTINGS_WITH_BINARY,
  GET_SYSTEM_SETTINGS_BASIC,
  UPDATE_SYSTEM_SETTINGS,
  localizationUtils,
  binaryDataUtils,
  handleGraphQLResponse
} from '@/lib/api/queries/system-settings'
import { gql, gqlMutate } from '@/lib/api/graphql-client'

interface UseSystemSettingsOptions {
  language?: LanguageCode
  includeBinary?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseSystemSettingsReturn {
  // Data
  settings: SystemSettings | null
  isLoading: boolean
  isUpdating: boolean
  error: string | null
  
  // Status
  exists: boolean
  hasUnsavedChanges: boolean
  lastSaved: string | null
  
  // Actions
  refresh: () => Promise<void>
  updateSettings: (updates: Partial<SystemSettingsInput>) => Promise<boolean>
  updateField: (field: keyof SystemSettingsInput, value: any) => Promise<boolean>
  updateTranslation: (field: string, language: LanguageCode, value: string) => Promise<boolean>
  uploadBinaryAsset: (field: string, file: File) => Promise<boolean>
  
  // Utilities
  getLocalizedValue: (field: string, language?: LanguageCode) => string
  getBinaryAssetUrl: (field: string) => string | undefined
  validateSettings: () => { isValid: boolean; errors: string[] }
  
  // Status checkers
  isFieldComplete: (field: string) => boolean
  getTranslationStatus: () => { completed: number; total: number; percentage: number }
}

export function useSystemSettings(options: UseSystemSettingsOptions = {}): UseSystemSettingsReturn {
  const {
    language = 'en_US',
    includeBinary = false,
    autoRefresh = false,
    refreshInterval = 300000 // 5 minutes
  } = options

  // State
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exists, setExists] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSaved, setLastSaved] = useState<string | null>(null)

  // Memoized queries based on options
  const query = useMemo(() => {
    if (includeBinary) {
      return GET_SYSTEM_SETTINGS_WITH_BINARY
    }
    return GET_SYSTEM_SETTINGS_FULL
  }, [includeBinary])

  // Check if settings exist
  const checkExistence = useCallback(async () => {
    try {
      const response = await gql(CHECK_SYSTEM_SETTINGS_EXIST)
      const data = response.AlromaihSystemSettings
      setExists(Array.isArray(data) && data.length > 0)
      return Array.isArray(data) && data.length > 0
    } catch (err) {
      console.error('Error checking settings existence:', err)
      setError('Failed to check settings existence')
      return false
    }
  }, [])

  // Load settings data
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check existence first
      const existsResult = await checkExistence()
      if (!existsResult) {
        setSettings(null)
        setIsLoading(false)
        return
      }

      // Load full settings
      const variables = includeBinary ? {} : { lang: language }
      const response = await gql(query, variables)
      const data = response.AlromaihSystemSettings

      if (Array.isArray(data) && data.length > 0) {
        setSettings(data[0])
        setLastSaved(data[0].write_date || null)
      } else {
        setSettings(null)
      }
    } catch (err) {
      console.error('Error loading settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [query, language, includeBinary, checkExistence])

  // Refresh data
  const refresh = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  // Update settings
  const updateSettings = useCallback(async (updates: Partial<SystemSettingsInput>): Promise<boolean> => {
    if (!settings?.id) {
      setError('No settings record found to update')
      return false
    }

    try {
      setIsUpdating(true)
      setError(null)

      const response = await gqlMutate(UPDATE_SYSTEM_SETTINGS, {
        id: settings.id,
        values: updates
      })

      if (response.updateAlromaihSystemSettings) {
        setSettings(response.updateAlromaihSystemSettings)
        setLastSaved(response.updateAlromaihSystemSettings.write_date || new Date().toISOString())
        setHasUnsavedChanges(false)
        return true
      }

      return false
    } catch (err) {
      console.error('Error updating settings:', err)
      setError(err instanceof Error ? err.message : 'Failed to update settings')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [settings?.id])

  // Update single field
  const updateField = useCallback(async (field: keyof SystemSettingsInput, value: any): Promise<boolean> => {
    return updateSettings({ [field]: value })
  }, [updateSettings])

  // Update translation for a field
  const updateTranslation = useCallback(async (
    field: string, 
    targetLanguage: LanguageCode, 
    value: string
  ): Promise<boolean> => {
    if (!settings) return false

    const currentValue = settings[field as keyof SystemSettings] as string
    const currentTranslations = settings[`${field}_translations` as keyof SystemSettings]

    const updatedTranslations = localizationUtils.setTranslation(
      currentTranslations,
      targetLanguage,
      value
    )

    return updateSettings({
      [`${field}_translations`]: updatedTranslations
    } as Partial<SystemSettingsInput>)
  }, [settings, updateSettings])

  // Upload binary asset
  const uploadBinaryAsset = useCallback(async (field: string, file: File): Promise<boolean> => {
    try {
      setIsUpdating(true)
      setError(null)

      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1] // Remove data URL prefix
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Update the field with base64 data
      return await updateField(field as keyof SystemSettingsInput, base64Data)
    } catch (err) {
      console.error('Error uploading binary asset:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload asset')
      return false
    } finally {
      setIsUpdating(false)
    }
  }, [updateField])

  // Get localized value
  const getLocalizedValue = useCallback((field: string, targetLanguage?: LanguageCode): string => {
    if (!settings) return ''

    const baseValue = settings[field as keyof SystemSettings] as string
    const translations = settings[`${field}_translations` as keyof SystemSettings]

    return localizationUtils.getLocalizedValue(
      baseValue,
      translations,
      targetLanguage || language
    )
  }, [settings, language])

  // Get binary asset URL
  const getBinaryAssetUrl = useCallback((field: string): string | undefined => {
    if (!settings) return undefined

    const binaryField = settings[field as keyof SystemSettings] as string
    const cdnField = settings[`${field}_cdn_url` as keyof SystemSettings] as string

    // Priority: Binary data -> CDN URL -> undefined
    if (binaryField) {
      return binaryDataUtils.toDataURL(binaryField)
    }

    if (cdnField) {
      return cdnField
    }

    return undefined
  }, [settings])

  // Validate settings
  const validateSettings = useCallback(() => {
    const errors: string[] = []

    if (!settings) {
      errors.push('No settings data available')
      return { isValid: false, errors }
    }

    // Required fields validation
    if (!settings.website_name?.trim()) {
      errors.push('Website name is required')
    }

    if (!settings.primary_color?.trim()) {
      errors.push('Primary color is required')
    }

    if (!settings.company_email?.trim()) {
      errors.push('Company email is required')
    }

    // Email format validation
    if (settings.company_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.company_email)) {
      errors.push('Company email format is invalid')
    }

    // URL validation for social media
    const urlFields = ['facebook_url', 'instagram_url', 'youtube_url', 'app_store_url', 'play_store_url']
    urlFields.forEach(field => {
      const value = settings[field as keyof SystemSettings] as string
      if (value && !/^https?:\/\/.+/.test(value)) {
        errors.push(`${field.replace('_', ' ')} must be a valid URL`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [settings])

  // Check if field is complete
  const isFieldComplete = useCallback((field: string): boolean => {
    if (!settings) return false

    const baseValue = settings[field as keyof SystemSettings] as string
    const translations = settings[`${field}_translations` as keyof SystemSettings]

    // Check if base value exists
    const hasBaseValue = Boolean(baseValue?.trim())

    // Check if translations exist
    const hasTranslations = localizationUtils.hasTranslations(translations)

    return hasBaseValue || hasTranslations
  }, [settings])

  // Get translation status
  const getTranslationStatus = useCallback(() => {
    if (!settings) {
      return { completed: 0, total: 0, percentage: 0 }
    }

    const translatableFields = [
      'website_name', 'meta_title', 'meta_description', 'meta_keywords',
      'company_phone', 'company_email', 'company_address',
      'copyright_text', 'business_days', 'app_name'
    ]

    let completed = 0
    const total = translatableFields.length * 2 // 2 languages

    translatableFields.forEach(field => {
      // Check English (base value)
      if (settings[field as keyof SystemSettings]) {
        completed++
      }

      // Check Arabic translation
      const translations = settings[`${field}_translations` as keyof SystemSettings]
      if (localizationUtils.getLocalizedValue('', translations, 'ar_SA')) {
        completed++
      }
    })

    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    }
  }, [settings])

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(refresh, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval, refresh])

  // Initial load
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return {
    // Data
    settings,
    isLoading,
    isUpdating,
    error,

    // Status
    exists,
    hasUnsavedChanges,
    lastSaved,

    // Actions
    refresh,
    updateSettings,
    updateField,
    updateTranslation,
    uploadBinaryAsset,

    // Utilities
    getLocalizedValue,
    getBinaryAssetUrl,
    validateSettings,

    // Status checkers
    isFieldComplete,
    getTranslationStatus
  }
} 