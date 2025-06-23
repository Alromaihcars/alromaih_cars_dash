// Car Model GraphQL queries with hierarchical relations using EasyGraphQL (@/alromaih_apis)
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
}

export interface CarTrim {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  code?: string;
  active: boolean;
  year_ids: CarYear[];
}

export interface CarBrand {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  slug?: string;
  logo?: string;
  display_name?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
}

export interface CarModel {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  brand_id?: CarBrand;
  display_name?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
  trim_ids: CarTrim[];
}

export interface CarModelValues {
  name_translations?: TranslationObject;
  description_translations?: TranslationObject;
  brand_id?: number;
  active?: boolean;
}

// === HIERARCHICAL QUERIES ===

// Get all car models with hierarchical structure
export const GET_CAR_MODELS_HIERARCHY = `
  query GetCarModelsHierarchy {
    CarModel {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      brand_id {
        id
        name @multiLang
        description @multiLang
        logo
        display_name
        active
      }
      trim_ids {
        id
        name @multiLang
        description @multiLang
        code
        active
        year_ids {
          id
          name @multiLang
          description @multiLang
          active
        }
      }
      create_date
      write_date
    }
  }
`;

// Get models for specific brand with hierarchy
export const GET_MODELS_FOR_BRAND = `
  query GetModelsForBrand($brand_id: String!) {
    CarModel(brand_id: $brand_id) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      trim_ids {
        id
        name @multiLang
        description @multiLang
        code
        active
        year_ids {
          id
          name @multiLang
          description @multiLang
          active
        }
      }
      create_date
      write_date
    }
  }
`;

// === TRADITIONAL QUERIES ===

// Get all car models with multilingual support
export const GET_CAR_MODELS = `
  query GetCarModels {
    CarModel {
      id
      name @multiLang
      description @multiLang
      brand_id
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Get car model by ID
export const GET_CAR_MODEL_BY_ID = `
  query GetCarModelById($id: String!) {
    CarModel(id: $id) {
      id
      name @multiLang
      description @multiLang
      brand_id
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Get car models by brand
export const GET_CAR_MODELS_BY_BRAND = `
  query GetCarModelsByBrand($brand_id: String!) {
    CarModel(brand_id: $brand_id) {
      id
      name @multiLang
      description @multiLang
      brand_id
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Get car brands for dropdown
export const GET_CAR_BRANDS_FOR_DROPDOWN = `
  query GetCarBrandsForDropdown {
    CarBrand {
      id
      name @multiLang
      description @multiLang
      logo
      display_name
      active
    }
  }
`;

// === MUTATIONS ===

// Create car model
export const CREATE_CAR_MODEL = `
  mutation CreateCarModel($values: CarModelValues!) {
    CarModel(CarModelValues: $values) {
      id
      name @multiLang
      description @multiLang
      brand_id
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Update car model
export const UPDATE_CAR_MODEL = `
  mutation UpdateCarModel($id: String!, $values: CarModelValues!) {
    CarModel(id: $id, CarModelValues: $values) {
      id
      name @multiLang
      description @multiLang
      brand_id
      display_name
      active
      write_date
    }
  }
`;

// Delete (deactivate) car model
export const DELETE_CAR_MODEL = `
  mutation DeleteCarModel($id: String!) {
    CarModel(id: $id, CarModelValues: { active: false }) {
      id
      name @multiLang
      description @multiLang
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

// Helper function to create CarModelValues
export const createCarModelValues = (
  name: MultilingualFieldData,
  brand_id?: number,
  description?: MultilingualFieldData,
  active?: boolean
): CarModelValues => {
  const values: CarModelValues = {
    name_translations: convertToTranslations(name),
    active: active !== undefined ? active : true
  }

  if (brand_id !== undefined) {
    values.brand_id = brand_id
  }

  if (description) {
    values.description_translations = convertToTranslations(description)
  }

  return values
}

// Get display name with Arabic-first priority
export const getDisplayName = (model: CarModel | undefined | null, languageCode?: string): string => {
  // Handle undefined or null model
  if (!model) {
    return 'Untitled Model'
  }

  if (model.display_name) {
    return model.display_name
  }
  
  if (typeof model.name === 'object' && model.name !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return model.name.ar_001 || model.name.en_US || Object.values(model.name)[0] || 'Untitled Model'
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return model.name.en_US || model.name.ar_001 || Object.values(model.name)[0] || 'Untitled Model'
    }
    
    // Default: Arabic first, then English, then any available
    return model.name.ar_001 || model.name.en_US || Object.values(model.name)[0] || 'Untitled Model'
  }
  
  return String(model.name) || 'Untitled Model'
}

// Get display description with Arabic-first priority
export const getDisplayDescription = (model: CarModel | undefined | null, languageCode?: string): string => {
  // Handle undefined or null model
  if (!model || !model.description) {
    return ''
  }
  
  if (typeof model.description === 'object' && model.description !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return model.description.ar_001 || model.description.en_US || Object.values(model.description)[0] || ''
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return model.description.en_US || model.description.ar_001 || Object.values(model.description)[0] || ''
    }
    
    // Default: Arabic first, then English, then any available
    return model.description.ar_001 || model.description.en_US || Object.values(model.description)[0] || ''
  }
  
  return String(model.description) || ''
}

// Hierarchical data extraction helpers
export const getTrimsForModel = (model: CarModel): CarTrim[] => {
  return model.trim_ids || [];
}

export const getYearsForTrim = (trim: CarTrim): CarYear[] => {
  return trim.year_ids || [];
}

export const getYearsForModel = (model: CarModel): CarYear[] => {
  const allYears: CarYear[] = [];
  model.trim_ids?.forEach(trim => {
    trim.year_ids?.forEach(year => {
      if (!allYears.find(y => y.id === year.id)) {
        allYears.push(year);
      }
    });
  });
  return allYears;
}

// === REACT HOOK ===
// Note: React hooks have been moved to separate client-side files to avoid
// server-side import issues. Use the hooks in /hooks/ directory instead. 