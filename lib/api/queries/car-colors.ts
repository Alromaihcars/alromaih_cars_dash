// Car Color GraphQL queries with hierarchical relations using EasyGraphQL (@/alromaih_apis)
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

export interface CarColor {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  display_name?: string;
  code?: string;
  color_picker?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
}

export interface CarColorValues {
  name_translations?: TranslationObject;
  description_translations?: TranslationObject;
  code?: string;
  color_picker?: string;
  active?: boolean;
}

// === HIERARCHICAL QUERIES ===

// Get all car colors with complete information
export const GET_CAR_COLORS_HIERARCHY = `
  query GetCarColorsHierarchy {
    CarColor {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      color_picker
      active
      create_date
      write_date
    }
  }
`;

// Get active colors only (for car selection)
export const GET_ACTIVE_CAR_COLORS = `
  query GetActiveCarColors {
    CarColor(active: true) {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      color_picker
      active
    }
  }
`;

// === TRADITIONAL QUERIES ===

// Get all car colors with multilingual support
export const GET_CAR_COLORS = `
  query GetCarColors {
    CarColor {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      color_picker
      active
      create_date
      write_date
    }
  }
`;

// Get car color by ID
export const GET_CAR_COLOR_BY_ID = `
  query GetCarColorById($id: String!) {
    CarColor(id: $id) {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      color_picker
      active
      create_date
      write_date
    }
  }
`;

// === MUTATIONS ===

// Create car color
export const CREATE_CAR_COLOR = `
  mutation CreateCarColor($values: CarColorValues!) {
    CarColor(CarColorValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      color_picker
      active
      create_date
      write_date
    }
  }
`;

// Update car color
export const UPDATE_CAR_COLOR = `
  mutation UpdateCarColor($id: String!, $values: CarColorValues!) {
    CarColor(id: $id, CarColorValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      code
      color_picker
      active
      write_date
    }
  }
`;

// Delete (deactivate) car color
export const DELETE_CAR_COLOR = `
  mutation DeleteCarColor($id: String!) {
    CarColor(id: $id, CarColorValues: { active: false }) {
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

// Helper function to create CarColorValues
export const createCarColorValues = (
  name: MultilingualFieldData,
  description?: MultilingualFieldData,
  code?: string,
  color_picker?: string,
  active?: boolean
): CarColorValues => {
  const values: CarColorValues = {
    name_translations: convertToTranslations(name),
    active: active !== undefined ? active : true
  }

  if (description) {
    values.description_translations = convertToTranslations(description)
  }

  if (code && code.trim()) {
    values.code = code.trim()
  }

  if (color_picker && color_picker.trim()) {
    values.color_picker = color_picker.trim()
  }

  return values
}

// Get display name with Arabic-first priority
export const getDisplayName = (color: CarColor | undefined | null, languageCode?: string): string => {
  // Handle undefined or null color
  if (!color) {
    return 'Untitled Color'
  }

  if (color.display_name) {
    return color.display_name
  }
  
  if (typeof color.name === 'object' && color.name !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return color.name.ar_001 || color.name.en_US || Object.values(color.name)[0] || 'Untitled Color'
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return color.name.en_US || color.name.ar_001 || Object.values(color.name)[0] || 'Untitled Color'
    }
    
    // Default: Arabic first, then English, then any available
    return color.name.ar_001 || color.name.en_US || Object.values(color.name)[0] || 'Untitled Color'
  }
  
  return String(color.name) || 'Untitled Color'
}

// Get display description with Arabic-first priority
export const getDisplayDescription = (color: CarColor | undefined | null, languageCode?: string): string => {
  // Handle undefined or null color
  if (!color || !color.description) {
    return ''
  }
  
  if (typeof color.description === 'object' && color.description !== null) {
    // Arabic-first priority
    if (languageCode === 'ar_001') {
      return color.description.ar_001 || color.description.en_US || Object.values(color.description)[0] || ''
    }
    
    // English priority
    if (languageCode === 'en_US') {
      return color.description.en_US || color.description.ar_001 || Object.values(color.description)[0] || ''
    }
    
    // Default: Arabic first, then English, then any available
    return color.description.ar_001 || color.description.en_US || Object.values(color.description)[0] || ''
  }
  
  return String(color.description) || ''
}

// Helper function to validate hex color
export const validateHexColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

// Helper function to generate color code from name
export const generateColorCode = (name: string): string => {
  return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

// Color selection helpers for car configuration
export const getActiveColors = (colors: CarColor[]): CarColor[] => {
  return colors.filter(color => color.active);
}

export const getColorById = (colors: CarColor[], colorId: string): CarColor | undefined => {
  return colors.find(color => color.id === colorId);
}

export const getColorsByIds = (colors: CarColor[], colorIds: string[]): CarColor[] => {
  return colors.filter(color => colorIds.includes(color.id));
}

// Helper to sort colors by name (Arabic-first)
export const sortColorsByName = (colors: CarColor[], languageCode?: string): CarColor[] => {
  return [...colors].sort((a, b) => {
    const nameA = getDisplayName(a, languageCode);
    const nameB = getDisplayName(b, languageCode);
    return nameA.localeCompare(nameB);
  });
}

// === REACT HOOK ===
// Note: React hooks have been moved to separate client-side files to avoid
// server-side import issues. Use the hooks in /hooks/ directory instead. 