// Car Brand GraphQL queries using EasyGraphQL (@/alromaih_apis)
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

export interface CarBrand {
  id: number;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  slug?: string;
  logo?: string;
  display_name?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
  model_ids?: Array<{ id: number; name: MultilingualFieldData }>;
}

export interface CarBrandValues {
  name_translations?: TranslationObject;
  description_translations?: TranslationObject;
  slug?: string;
  logo?: string | null;
  active?: boolean;
}

// === QUERIES ===

// Get all car brands with multilingual support
export const GET_CAR_BRANDS = `
  query GetCarBrands {
    CarBrand {
      id
      name @multiLang
      description @multiLang
      slug
      logo
      display_name
      active
      create_date
      write_date
      model_ids {
        id
        name @multiLang
      }
    }
  }
`;

// Get car brand by ID
export const GET_CAR_BRAND_BY_ID = `
  query GetCarBrandById($id: String!) {
    CarBrand(id: $id) {
      id
      name @multiLang
      description @multiLang
      slug
      logo
      display_name
      active
      create_date
      write_date
      model_ids {
        id
        name @multiLang
      }
    }
  }
`;

// Get car brands with logos only
export const GET_CAR_BRANDS_WITH_LOGOS = `
  query GetCarBrandsWithLogos {
    CarBrand {
      id
      name @multiLang
      logo
      display_name
      active
    }
  }
`;

// === MUTATIONS ===

// Create car brand
export const CREATE_CAR_BRAND = `
  mutation CreateCarBrand($values: CarBrandValues!) {
    CarBrand(CarBrandValues: $values) {
      id
      name @multiLang
      description @multiLang
      slug
      logo
      display_name
      active
      create_date
      write_date
    }
  }
`;

// Update car brand
export const UPDATE_CAR_BRAND = `
  mutation UpdateCarBrand($id: String!, $values: CarBrandValues!) {
    CarBrand(id: $id, CarBrandValues: $values) {
      id
      name @multiLang
      description @multiLang
      slug
      logo
      display_name
      active
      write_date
    }
  }
`;

// Upload brand logo
export const UPLOAD_CAR_BRAND_LOGO = `
  mutation UploadCarBrandLogo($id: String!, $logo: String!) {
    CarBrand(id: $id, CarBrandValues: { logo: $logo }) {
      id
      name @multiLang
      logo
      display_name
      active
    }
  }
`;

// Remove brand logo
export const REMOVE_CAR_BRAND_LOGO = `
  mutation RemoveCarBrandLogo($id: String!) {
    CarBrand(id: $id, CarBrandValues: { logo: null }) {
      id
      name @multiLang
      logo
      display_name
      active
    }
  }
`;

// Delete (deactivate) car brand
export const DELETE_CAR_BRAND = `
  mutation DeleteCarBrand($id: String!) {
    CarBrand(id: $id, CarBrandValues: { active: false }) {
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

// Helper function to create CarBrandValues
export const createCarBrandValues = (
  name: MultilingualFieldData,
  description?: MultilingualFieldData,
  logo?: string,
  active?: boolean,
  slug?: string
): CarBrandValues => {
  const values: CarBrandValues = {
    name_translations: convertToTranslations(name),
    active: active !== undefined ? active : true
  }

  if (description) {
    values.description_translations = convertToTranslations(description)
  }

  if (logo !== undefined) {
    values.logo = logo
  }

  if (slug) {
    values.slug = slug
  }

  return values
}

// Get display name with Arabic-first priority
export const getDisplayName = (brand: CarBrand, languageCode?: string): string => {
  if (brand.display_name) {
    return brand.display_name
  }
  
  if (typeof brand.name === 'object' && brand.name !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return brand.name.ar_001 || brand.name.en_US || Object.values(brand.name)[0] || 'Untitled Brand'
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return brand.name.en_US || brand.name.ar_001 || Object.values(brand.name)[0] || 'Untitled Brand'
    }
    
    // Default: Arabic first, then English, then any available
    return brand.name.ar_001 || brand.name.en_US || Object.values(brand.name)[0] || 'Untitled Brand'
  }
  
  return String(brand.name) || 'Untitled Brand'
}

// Get display description with Arabic-first priority
export const getDisplayDescription = (brand: CarBrand, languageCode?: string): string => {
  if (!brand.description) return ''
  
  if (typeof brand.description === 'object' && brand.description !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return brand.description.ar_001 || brand.description.en_US || Object.values(brand.description)[0] || ''
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return brand.description.en_US || brand.description.ar_001 || Object.values(brand.description)[0] || ''
    }
    
    // Default: Arabic first, then English, then any available
    return brand.description.ar_001 || brand.description.en_US || Object.values(brand.description)[0] || ''
  }
  
  return String(brand.description) || ''
}

// === REACT HOOK ===
// Note: React hooks have been moved to separate client-side files to avoid
// server-side import issues. Use the hooks in /hooks/ directory instead.

 