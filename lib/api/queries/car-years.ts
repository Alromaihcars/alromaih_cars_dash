// Car Year GraphQL queries using EasyGraphQL (@/alromaih_apis)
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
  id: number;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  display_name?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
}

export interface CarYearValues {
  name_translations?: TranslationObject;
  description_translations?: TranslationObject;
  active?: boolean;
}

// === QUERIES ===

// Get all car years with multilingual support
export const GET_CAR_YEARS = `
  query GetCarYears {
    CarYear {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Get car year by ID
export const GET_CAR_YEAR_BY_ID = `
  query GetCarYearById($id: String!) {
    CarYear(id: $id) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Get active years only
export const GET_ACTIVE_CAR_YEARS = `
  query GetActiveCarYears {
    CarYear {
      id
      name @multiLang
      description @multiLang
      display_name
      active
    }
  }
`;

// Get years sorted by name
export const GET_CAR_YEARS_SORTED = `
  query GetCarYearsSorted {
    CarYear(orderBy: "name DESC") {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      create_date
      write_date
    }
  }
`;

// === MUTATIONS ===

// Create car year
export const CREATE_CAR_YEAR = `
  mutation CreateCarYear($values: CarYearValues!) {
    CarYear(CarYearValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Update car year
export const UPDATE_CAR_YEAR = `
  mutation UpdateCarYear($id: String!, $values: CarYearValues!) {
    CarYear(id: $id, CarYearValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      write_date
    }
  }
`;

// Delete (deactivate) car year
export const DELETE_CAR_YEAR = `
  mutation DeleteCarYear($id: String!) {
    CarYear(id: $id, CarYearValues: { active: false }) {
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

// Helper function to create CarYearValues
export const createCarYearValues = (
  name: MultilingualFieldData,
  description?: MultilingualFieldData,
  active?: boolean
): CarYearValues => {
  const values: CarYearValues = {
    name_translations: convertToTranslations(name),
    active: active !== undefined ? active : true
  }

  if (description) {
    values.description_translations = convertToTranslations(description)
  }

  return values
}

// Get display name with Arabic-first priority
export const getDisplayName = (year: CarYear | undefined | null, languageCode?: string): string => {
  // Handle undefined or null year
  if (!year) {
    return 'Untitled Year'
  }

  if (year.display_name) {
    return year.display_name
  }
  
  if (typeof year.name === 'object' && year.name !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return year.name.ar_001 || year.name.en_US || Object.values(year.name)[0] || 'Untitled Year'
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return year.name.en_US || year.name.ar_001 || Object.values(year.name)[0] || 'Untitled Year'
    }
    
    // Default: Arabic first, then English, then any available
    return year.name.ar_001 || year.name.en_US || Object.values(year.name)[0] || 'Untitled Year'
  }
  
  return String(year.name) || 'Untitled Year'
}

// Get display description with Arabic-first priority
export const getDisplayDescription = (year: CarYear | undefined | null, languageCode?: string): string => {
  // Handle undefined or null year
  if (!year || !year.description) {
    return ''
  }
  
  if (typeof year.description === 'object' && year.description !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return year.description.ar_001 || year.description.en_US || Object.values(year.description)[0] || ''
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return year.description.en_US || year.description.ar_001 || Object.values(year.description)[0] || ''
    }
    
    // Default: Arabic first, then English, then any available
    return year.description.ar_001 || year.description.en_US || Object.values(year.description)[0] || ''
  }
  
  return String(year.description) || ''
}

// Helper function to extract numeric year from name
export const getYearValue = (year: CarYear): number => {
  const name = getDisplayName(year)
  const yearMatch = name.match(/\d{4}/)
  return yearMatch ? parseInt(yearMatch[0]) : 0
}

// Helper function to generate year list for current and future years
export const generateYearList = (startYear?: number, endYear?: number): CarYearValues[] => {
  const currentYear = new Date().getFullYear()
  const start = startYear || currentYear - 20
  const end = endYear || currentYear + 5
  
  const years: CarYearValues[] = []
  
  for (let year = end; year >= start; year--) {
    years.push({
      name_translations: {
        en_US: year.toString(),
        ar_001: year.toString()
      },
      active: true
    })
  }
  
  return years
}

// === REACT HOOK ===
// Note: React hooks have been moved to separate client-side files to avoid
// server-side import issues. Use the hooks in /hooks/ directory instead. 