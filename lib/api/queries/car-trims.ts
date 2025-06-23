// Car Trim GraphQL queries with hierarchical relations using EasyGraphQL (@/alromaih_apis)
import { gql, gqlMutate } from '@/lib/api'

// === TYPES ===

export interface Translation {
  code: string;
  value: string;
}

export interface TranslationObject {
  en_US?: string;
  ar_001?: string;
  [key: string]: string | undefined;
}

export type MultilingualFieldData = TranslationObject | string;

export interface CarYear {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  active: boolean;
  create_date?: string;
  write_date?: string;
}

export interface CarBrand {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  logo?: string;
  display_name?: string;
  active: boolean;
}

export interface CarModel {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  display_name?: string;
  active: boolean;
  brand_id: CarBrand;
}

export interface CarTrim {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  display_name?: string;
  model_id: CarModel;
  code?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
  year_ids: CarYear[];
}

export interface CarTrimValues {
  name_translations?: TranslationObject;
  description_translations?: TranslationObject;
  model_id?: number;
  code?: string;
  active?: boolean;
}

// === HIERARCHICAL QUERIES ===

// Get all car trims with hierarchical structure
export const GET_CAR_TRIMS_HIERARCHY = `
  query GetCarTrimsHierarchy {
    CarTrim {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      active
      model_id {
        id
        name @multiLang
        display_name
        active
        brand_id {
          id
          name @multiLang
          display_name
          active
          logo
        }
      }
      year_ids {
        id
        name @multiLang
        description @multiLang
        active
        create_date
        write_date
      }
      create_date
      write_date
    }
  }
`;

// Get trims for specific model with years
export const GET_TRIMS_FOR_MODEL = `
  query GetTrimsForModel($model_id: String!) {
    CarTrim(model_id: $model_id) {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      active
      year_ids {
        id
        name @multiLang
        description @multiLang
        active
        create_date
        write_date
      }
      create_date
      write_date
    }
  }
`;

// Get years for specific trim
export const GET_YEARS_FOR_TRIM = `
  query GetYearsForTrim($trim_id: String!) {
    CarTrim(id: $trim_id) {
      id
      name @multiLang
      year_ids {
        id
        name @multiLang
        description @multiLang
        active
        create_date
        write_date
      }
    }
  }
`;

// === TRADITIONAL QUERIES ===

// Get all car trims with multilingual support
export const GET_CAR_TRIMS = `
  query GetCarTrims {
    CarTrim {
      id
      name @multiLang
      description @multiLang
      display_name
      model_id {
        id
        name @multiLang
        display_name
        active
        brand_id {
          id
          name @multiLang
          display_name
          active
          logo
        }
      }
      code
      active
      create_date
      write_date
    }
  }
`;

// Get car trim by ID
export const GET_CAR_TRIM_BY_ID = `
  query GetCarTrimById($id: String!) {
    CarTrim(id: $id) {
      id
      name @multiLang
      description @multiLang
      display_name
      model_id {
        id
        name @multiLang
        display_name
        brand_id {
          id
          name @multiLang
          display_name
        }
      }
      code
      active
      create_date
      write_date
    }
  }
`;

// Get all car models for dropdown
export const GET_CAR_MODELS_FOR_DROPDOWN = `
  query GetCarModelsForDropdown {
    CarModel {
      id
      name @multiLang
      display_name
      active
      brand_id {
        id
        name @multiLang
        display_name
      }
    }
  }
`;

// === MUTATIONS ===

// Create car trim
export const CREATE_CAR_TRIM = `
  mutation CreateCarTrim($values: CarTrimValues!) {
    CarTrim(CarTrimValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      model_id {
        id
        name @multiLang
        display_name
        brand_id {
          id
          name @multiLang
          display_name
        }
      }
      code
      active
      create_date
      write_date
    }
  }
`;

// Update car trim
export const UPDATE_CAR_TRIM = `
  mutation UpdateCarTrim($id: String!, $values: CarTrimValues!) {
    CarTrim(id: $id, CarTrimValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      model_id {
        id
        name @multiLang
        display_name
        brand_id {
          id
          name @multiLang
          display_name
        }
      }
      code
      active
      write_date
    }
  }
`;

// Delete (deactivate) car trim
export const DELETE_CAR_TRIM = `
  mutation DeleteCarTrim($id: String!) {
    CarTrim(id: $id, CarTrimValues: { active: false }) {
      id
      name @multiLang
      display_name
      active
    }
  }
`;

// === HELPER FUNCTIONS ===

// GraphQL wrapper using the unified client
export const fetchGraphQL = async (query: string, variables: any = {}) => {
  // Determine if it's a mutation or query
  const queryLowerCase = query.toLowerCase().trim()
  const isMutation = queryLowerCase.startsWith('mutation')
  
  // Use the appropriate unified client method
  return isMutation 
    ? await gqlMutate(query, variables)
    : await gql(query, variables)
}

// Helper function to get localized text
export const getLocalizedText = (field: MultilingualFieldData): string => {
  if (!field) return ""
  if (typeof field === "string") return field
  if (typeof field === "object" && field !== null) {
    const values = Object.values(field)
    return field.en_US || field.ar_001 || (values.length > 0 ? String(values[0]) : "") || ""
  }
  return String(field)
}

// Convert form data to EasyGraphQL translation format
export const convertToTranslations = (data: MultilingualFieldData): TranslationObject => {
  if (typeof data === 'object' && data !== null) {
    return data as TranslationObject
  }
  
  if (typeof data === 'string' && data.trim() !== '') {
    return { en_US: data.trim() }
  }
  
  return {}
}

// Convert EasyGraphQL response to form format
export const convertFromTranslations = (translations: any): MultilingualFieldData => {
  // EasyGraphQL returns translations as objects when using @multiLang
  if (typeof translations === 'object' && translations !== null) {
    return translations
  }
  
  // Handle simple string responses (when @multiLang is not used)
  if (typeof translations === 'string' && translations.trim() !== '') {
    return { en_US: translations.trim() }
  }
  
  return { en_US: '', ar_001: '' }
}

// Helper function to create CarTrimValues
export const createCarTrimValues = (
  name: MultilingualFieldData,
  model_id?: number,
  description?: MultilingualFieldData,
  code?: string,
  active?: boolean
): CarTrimValues => {
  const values: CarTrimValues = {
    name_translations: convertToTranslations(name),
    active: active !== undefined ? active : true
  }

  if (model_id !== undefined) {
    values.model_id = model_id
  }

  if (description) {
    values.description_translations = convertToTranslations(description)
  }

  if (code) {
    values.code = code
  }

  return values
}

// Get display name with Arabic-first priority
export const getDisplayName = (trim: CarTrim | undefined | null, languageCode?: string): string => {
  // Handle undefined or null trim
  if (!trim) {
    return 'Untitled Trim'
  }

  if (trim.display_name) {
    return trim.display_name
  }
  
  if (typeof trim.name === 'object' && trim.name !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return trim.name.ar_001 || trim.name.en_US || Object.values(trim.name)[0] || 'Untitled Trim'
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return trim.name.en_US || trim.name.ar_001 || Object.values(trim.name)[0] || 'Untitled Trim'
    }
    
    // Default: Arabic first, then English, then any available
    return trim.name.ar_001 || trim.name.en_US || Object.values(trim.name)[0] || 'Untitled Trim'
  }
  
  return String(trim.name) || 'Untitled Trim'
}

// Get display description with Arabic-first priority
export const getDisplayDescription = (trim: CarTrim | undefined | null, languageCode?: string): string => {
  // Handle undefined or null trim
  if (!trim || !trim.description) {
    return ''
  }
  
  if (typeof trim.description === 'object' && trim.description !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return trim.description.ar_001 || trim.description.en_US || Object.values(trim.description)[0] || ''
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return trim.description.en_US || trim.description.ar_001 || Object.values(trim.description)[0] || ''
    }
    
    // Default: Arabic first, then English, then any available
    return trim.description.ar_001 || trim.description.en_US || Object.values(trim.description)[0] || ''
  }
  
  return String(trim.description) || ''
}

// Hierarchical data extraction helpers
export const getYearsForTrim = (trim: CarTrim): CarYear[] => {
  return trim.year_ids || [];
}

export const getActiveYearsForTrim = (trim: CarTrim): CarYear[] => {
  return (trim.year_ids || []).filter(year => year.active);
}

export const getBrandForTrim = (trim: CarTrim): CarBrand | null => {
  return trim.model_id?.brand_id || null;
}

export const getModelForTrim = (trim: CarTrim): CarModel => {
  return trim.model_id;
}

// === REACT HOOK ===
// Note: React hooks have been moved to separate client-side files to avoid
// server-side import issues. Use the hooks in /hooks/ directory instead.