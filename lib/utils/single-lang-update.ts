// Utility functions for single language updates

import { gqlMutate } from '@/lib/api'

interface SingleLangUpdateOptions {
  entityType: 'brand' | 'model' | 'color' | 'trim' | 'year' | 'offer' | 'variant'
  id: string
  field: 'name' | 'description'
  language: 'en' | 'ar'
  value: string
}

// Map entity types to their GraphQL mutation patterns
const ENTITY_MUTATION_MAP = {
  brand: {
    name: {
      en: 'UPDATE_CAR_BRAND_NAME_EN',
      ar: 'UPDATE_CAR_BRAND_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_BRAND_DESC_EN', 
      ar: 'UPDATE_CAR_BRAND_DESC_AR'
    }
  },
  model: {
    name: {
      en: 'UPDATE_CAR_MODEL_NAME_EN',
      ar: 'UPDATE_CAR_MODEL_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_MODEL_DESC_EN',
      ar: 'UPDATE_CAR_MODEL_DESC_AR'
    }
  },
  color: {
    name: {
      en: 'UPDATE_CAR_COLOR_NAME_EN',
      ar: 'UPDATE_CAR_COLOR_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_COLOR_DESC_EN',
      ar: 'UPDATE_CAR_COLOR_DESC_AR'
    }
  },
  trim: {
    name: {
      en: 'UPDATE_CAR_TRIM_NAME_EN',
      ar: 'UPDATE_CAR_TRIM_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_TRIM_DESC_EN',
      ar: 'UPDATE_CAR_TRIM_DESC_AR'
    }
  },
  year: {
    name: {
      en: 'UPDATE_CAR_YEAR_NAME_EN',
      ar: 'UPDATE_CAR_YEAR_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_YEAR_DESC_EN',
      ar: 'UPDATE_CAR_YEAR_DESC_AR'
    }
  },
  offer: {
    name: {
      en: 'UPDATE_CAR_OFFER_NAME_EN',
      ar: 'UPDATE_CAR_OFFER_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_OFFER_DESC_EN',
      ar: 'UPDATE_CAR_OFFER_DESC_AR'
    }
  },
  variant: {
    name: {
      en: 'UPDATE_CAR_VARIANT_NAME_EN',
      ar: 'UPDATE_CAR_VARIANT_NAME_AR'
    },
    description: {
      en: 'UPDATE_CAR_VARIANT_DESC_EN',
      ar: 'UPDATE_CAR_VARIANT_DESC_AR'
    }
  }
}

// Generate GraphQL mutation for single language update
export const generateSingleLangMutation = (
  entityType: string,
  field: string,
  language: string
): string => {
  const entityName = entityType.charAt(0).toUpperCase() + entityType.slice(1)
  const fieldName = field.charAt(0).toUpperCase() + field.slice(1)
  const langCode = language === 'en' ? 'en_US' : 'ar_001'
  const varName = `${field}_${language}`
  
  return `
    mutation Update${entityName}${fieldName}${language.toUpperCase()}($id: String!, $${varName}: String!) {
      Car${entityName}(id: $id, Car${entityName}Values: { 
        ${field}_translations: { ${langCode}: $${varName} }
      }) {
        id
        name @multiLang
        ${field === 'description' ? 'description @multiLang' : ''}
        active
      }
    }
  `
}

// Update single language field
export const updateSingleLanguageField = async (options: SingleLangUpdateOptions) => {
  const { entityType, id, field, language, value } = options
  
  const mutation = generateSingleLangMutation(entityType, field, language)
  const varName = `${field}_${language}`
  
  const variables = {
    id,
    [varName]: value
  }
  
  try {
    const result = await gqlMutate(mutation, variables)
    return result
  } catch (error) {
    console.error(`Failed to update ${field} in ${language} for ${entityType}:`, error)
    throw error
  }
}

// Batch update multiple language fields
export const updateMultipleLanguageFields = async (
  entityType: SingleLangUpdateOptions['entityType'],
  id: string,
  updates: Array<{
    field: 'name' | 'description'
    language: 'en' | 'ar'
    value: string
  }>
) => {
  const results = []
  
  for (const update of updates) {
    try {
      const result = await updateSingleLanguageField({
        entityType,
        id,
        ...update
      })
      results.push({ success: true, ...update, result })
    } catch (error) {
      results.push({ success: false, ...update, error })
    }
  }
  
  return results
}

// Helper to check if value has changed
export const hasLanguageFieldChanged = (
  originalValue: { en_US?: string; ar_001?: string } | undefined,
  newValue: { en_US?: string; ar_001?: string } | undefined
): boolean => {
  if (!originalValue && !newValue) return false
  if (!originalValue || !newValue) return true
  
  return (
    originalValue.en_US !== newValue.en_US ||
    originalValue.ar_001 !== newValue.ar_001
  )
}

// Helper to get changed language fields
export const getChangedLanguageFields = (
  originalValue: { en_US?: string; ar_001?: string } | undefined,
  newValue: { en_US?: string; ar_001?: string } | undefined
): Array<{ language: 'en' | 'ar'; value: string }> => {
  const changes: Array<{ language: 'en' | 'ar'; value: string }> = []
  
  if (!originalValue && !newValue) return changes
  
  const original = originalValue || {}
  const updated = newValue || {}
  
  if (original.en_US !== updated.en_US && updated.en_US) {
    changes.push({ language: 'en', value: updated.en_US })
  }
  
  if (original.ar_001 !== updated.ar_001 && updated.ar_001) {
    changes.push({ language: 'ar', value: updated.ar_001 })
  }
  
  return changes
}

// Helper to validate language field values
export const validateLanguageFields = (
  values: { en_US?: string; ar_001?: string },
  required: boolean = false
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (required) {
    if (!values.en_US?.trim()) {
      errors.push('English name is required')
    }
    if (!values.ar_001?.trim()) {
      errors.push('Arabic name is required')
    }
  }
  
  // Check for minimum length
  if (values.en_US && values.en_US.trim().length < 2) {
    errors.push('English name must be at least 2 characters')
  }
  
  if (values.ar_001 && values.ar_001.trim().length < 2) {
    errors.push('Arabic name must be at least 2 characters')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 