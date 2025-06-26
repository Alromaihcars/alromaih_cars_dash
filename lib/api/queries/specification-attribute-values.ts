// Query to get all product attribute values with full relational data
export const GET_PRODUCT_ATTRIBUTE_VALUES = `
  query GetProductAttributeValues {
    ProductAttributeValue {
      active
      color
      create_date
      display_type
      id
      html_color
      image
      is_custom
      is_used_on_products
      name
      sequence
      unit
      write_date
    }
  }
`;

// Query to get product attribute value by ID
export const GET_PRODUCT_ATTRIBUTE_VALUE_BY_ID = `
  query GetProductAttributeValueById($id: String!) {
    ProductAttributeValue(id: $id) {
      active
      color
      create_date
      display_type
      id
      html_color
      image
      is_custom
      is_used_on_products
      name
      sequence
      unit
      write_date
    }
  }
`;

// Query to get attribute values by attribute ID
export const GET_ATTRIBUTE_VALUES_BY_ATTRIBUTE = `
  query GetAttributeValuesByAttribute($attribute_id: String!) {
    ProductAttribute(id: $attribute_id) {
      id
      name
      display_name
      value_ids {
        active
        color
        create_date
        default_extra_price
        display_name
        display_type
        display_value
        default_extra_price_changed
        html_color
        id
        image
        is_used_on_products
        is_custom
        name
        unit
        sequence
        write_date
        unit_id {
          id
          name
          display_name
          code
        }
      }
    }
  }
`;

// Query to get custom attribute values
export const GET_CUSTOM_ATTRIBUTE_VALUES = `
  query GetCustomAttributeValues {
    ProductAttributeValue(domain: "is_custom=true") {
      id
      name
      display_name
      display_value
      is_custom
      color
      html_color
      image
      default_extra_price
      active
      unit_id {
        id
        name
        display_name
      }
    }
  }
`;

// Query to get used attribute values
export const GET_USED_ATTRIBUTE_VALUES = `
  query GetUsedAttributeValues {
    ProductAttributeValue(domain: "is_used_on_products=true") {
      id
      name
      display_name
      display_value
      is_used_on_products
      color
      html_color
      image
      default_extra_price
      active
      unit_id {
        id
        name
        display_name
      }
    }
  }
`;

// Query to get attribute values with extra price
export const GET_ATTRIBUTE_VALUES_WITH_PRICE = `
  query GetAttributeValuesWithPrice {
    ProductAttributeValue(domain: "default_extra_price>0") {
      id
      name
      display_name
      display_value
      default_extra_price
      default_extra_price_changed
      color
      html_color
      image
      active
      unit_id {
        id
        name
        display_name
      }
    }
  }
`;

// Query to get attribute values by display type
export const GET_ATTRIBUTE_VALUES_BY_DISPLAY_TYPE = `
  query GetAttributeValuesByDisplayType($display_type: String!) {
    ProductAttributeValue(domain: "display_type=$display_type") {
      id
      name
      display_name
      display_value
      display_type
      color
      html_color
      image
      active
      sequence
    }
  }
`;

// Mutation to create product attribute value
export const CREATE_PRODUCT_ATTRIBUTE_VALUE = `
  mutation CreateProductAttributeValue($values: ProductAttributeValueInput!) {
    createProductAttributeValue(values: $values) {
      id
      name
      display_type
      active
      sequence
      color
      html_color
      image
      is_custom
      unit
      create_date
      write_date
    }
  }
`;

// Mutation to update product attribute value
export const UPDATE_PRODUCT_ATTRIBUTE_VALUE = `
  mutation UpdateProductAttributeValue($id: ID!, $values: ProductAttributeValueInput!) {
    updateProductAttributeValue(id: $id, values: $values) {
      id
      name
      display_type
      active
      sequence
      color
      html_color
      image
      is_custom
      unit
      create_date
      write_date
    }
  }
`;

// Mutation to delete product attribute value
export const DELETE_PRODUCT_ATTRIBUTE_VALUE = `
  mutation DeleteProductAttributeValue($id: ID!) {
    deleteProductAttributeValue(id: $id) {
      id
      name
      active
    }
  }
`;

// Mutation to set attribute value as custom
export const SET_ATTRIBUTE_VALUE_AS_CUSTOM = `
  mutation SetAttributeValueAsCustom($id: ID!) {
    updateProductAttributeValue(id: $id, values: { is_custom: true }) {
      id
      name
      display_name
      is_custom
    }
  }
`;

// Mutation to update attribute value price
export const UPDATE_ATTRIBUTE_VALUE_PRICE = `
  mutation UpdateAttributeValuePrice($id: ID!, $price: Float!) {
    updateProductAttributeValue(id: $id, values: { 
      default_extra_price: $price,
      default_extra_price_changed: true
    }) {
      id
      name
      display_name
      default_extra_price
      default_extra_price_changed
    }
  }
`;

// Query to get attribute values statistics
export const GET_ATTRIBUTE_VALUES_STATISTICS = `
  query GetAttributeValuesStatistics {
    ProductAttributeValue {
      id
      active
      is_custom
      is_used_on_products
      default_extra_price
      default_extra_price_changed
    }
  }
`;

// TypeScript interfaces for ProductAttributeValue with full model structure
export interface ProductAttributeValue {
  // Core fields
  id: string;
  name: string | { [key: string]: string };
  name_translations?: { [key: string]: string };
  display_name?: string | { [key: string]: string };
  display_value?: string;
  sequence?: number;
  active: boolean;
  
  // Attribute relationship
  attribute_id?: ProductAttributeReference;
  
  // Template attribute lines relationship
  pav_attribute_line_ids?: ProductTemplateAttributeLine[];
  
  // Pricing
  default_extra_price?: number;
  default_extra_price_changed?: boolean;
  
  // Display properties
  is_custom: boolean;
  html_color?: string;
  display_type?: string;
  color?: number; // Color Index
  image?: string;
  
  // Usage tracking
  is_used_on_products?: boolean;
  
  // Audit fields
  create_uid?: ResUsersReference;
  create_date?: string;
  write_uid?: ResUsersReference;
  write_date?: string;
  
  // Deprecated/legacy field
  unit?: string;
}

export interface ProductAttributeValueInput {
  name?: string;
  display_name?: string;
  sequence?: number;
  active?: boolean;
  attribute_id?: string;
  default_extra_price?: number;
  default_extra_price_changed?: boolean;
  is_custom?: boolean;
  html_color?: string;
  display_type?: string;
  color?: number;
  image?: string;
  is_used_on_products?: boolean;
  unit?: string;
}

// Related model interfaces for relationships
export interface ProductAttributeReference {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
  display_type?: string;
  spec_category_id?: ProductAttributeCategoryReference;
}

export interface ProductAttributeCategoryReference {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
  sequence?: number;
}

export interface ProductTemplateAttributeLine {
  id: string;
  attribute_id?: ProductAttributeReference;
  value_ids?: ProductAttributeValue[];
  product_tmpl_id?: ProductTemplateReference;
  required?: boolean;
}

export interface ProductTemplateReference {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
}

export interface ResUsersReference {
  id: string;
  name: string;
  login?: string;
  email?: string;
}

export interface AttributeWithValues {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
  display_type?: string;
  value_ids: ProductAttributeValue[];
}

// Value statistics interface
export interface AttributeValueStatistics {
  total: number;
  active: number;
  custom: number;
  used_on_products: number;
  with_extra_price: number;
  by_display_type: { [key: string]: number };
}

// Value display types
export const VALUE_DISPLAY_TYPES: Record<string, { label: string, description: string, icon: string }> = {
  text: { label: 'Text', description: 'Plain text value', icon: '📝' },
  number: { label: 'Number', description: 'Numeric value', icon: '🔢' },
  color: { label: 'Color', description: 'Color swatch', icon: '🎨' },
  image: { label: 'Image', description: 'Image thumbnail', icon: '🖼️' },
  icon: { label: 'Icon', description: 'Icon display', icon: '⭐' },
  badge: { label: 'Badge', description: 'Badge style', icon: '🏷️' },
  chip: { label: 'Chip', description: 'Chip style', icon: '🎯' },
  button: { label: 'Button', description: 'Button style', icon: '🔘' }
};

// Value categories for organization
export const VALUE_CATEGORIES: Record<string, { label: string, icon: string, color: string }> = {
  color: { label: 'Colors', icon: '🎨', color: 'purple' },
  size: { label: 'Sizes', icon: '📏', color: 'blue' },
  material: { label: 'Materials', icon: '🧱', color: 'orange' },
  feature: { label: 'Features', icon: '⭐', color: 'yellow' },
  option: { label: 'Options', icon: '⚙️', color: 'gray' },
  variant: { label: 'Variants', icon: '🔄', color: 'green' },
  custom: { label: 'Custom', icon: '✨', color: 'pink' },
  other: { label: 'Other', icon: '📊', color: 'slate' }
};

// Predefined colors for attribute values
export const PREDEFINED_COLORS = [
  { name: 'Red', value: '#EF4444', hex: '#EF4444' },
  { name: 'Orange', value: '#F97316', hex: '#F97316' },
  { name: 'Yellow', value: '#EAB308', hex: '#EAB308' },
  { name: 'Green', value: '#22C55E', hex: '#22C55E' },
  { name: 'Blue', value: '#3B82F6', hex: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1', hex: '#6366F1' },
  { name: 'Purple', value: '#A855F7', hex: '#A855F7' },
  { name: 'Pink', value: '#EC4899', hex: '#EC4899' },
  { name: 'Gray', value: '#6B7280', hex: '#6B7280' },
  { name: 'Black', value: '#000000', hex: '#000000' },
  { name: 'White', value: '#FFFFFF', hex: '#FFFFFF' },
  { name: 'Silver', value: '#C0C0C0', hex: '#C0C0C0' },
  { name: 'Gold', value: '#FFD700', hex: '#FFD700' },
  { name: 'Bronze', value: '#CD7F32', hex: '#CD7F32' }
];

// Helper function to get current language context
const getCurrentLanguageContext = (): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    // Check document direction
    const isRTL = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar'
    if (isRTL) return 'ar_001'
    
    // Check localStorage or other client-side language indicators
    const storedLang = localStorage.getItem('language') || localStorage.getItem('locale')
    if (storedLang === 'ar' || storedLang === 'ar_001') return 'ar_001'
    if (storedLang === 'en' || storedLang === 'en_US') return 'en_US'
  }
  
  // Default to Arabic as primary language
  return 'ar_001'
}

// Helper functions for attribute values with Arabic priority
export const getValueDisplayText = (value: ProductAttributeValue, languageCode?: string): string => {
  if (value.display_value) return value.display_value;
  if (typeof value.display_name === 'string') return value.display_name;
  
  // Use provided language or detect current context
  const targetLang = languageCode || getCurrentLanguageContext()
  
  if (typeof value.display_name === 'object' && value.display_name !== null) {
    const displayNameObj = value.display_name as { [key: string]: string };
    
    // Arabic-first logic: if Arabic is requested or detected, prioritize Arabic
    if (targetLang === 'ar_001' && displayNameObj.ar_001) {
      return displayNameObj.ar_001
    }
    
    // If English is specifically requested
    if (targetLang === 'en_US' && displayNameObj.en_US) {
      return displayNameObj.en_US
    }
    
    // Fallback priority: Arabic first, then English, then any available
    return displayNameObj.ar_001 || displayNameObj.en_US || Object.values(displayNameObj)[0] || '';
  }
  
  if (typeof value.name === 'string') return value.name;
  if (typeof value.name === 'object' && value.name !== null) {
    const nameObj = value.name as { [key: string]: string };
    
    // Arabic-first logic: if Arabic is requested or detected, prioritize Arabic
    if (targetLang === 'ar_001' && nameObj.ar_001) {
      return nameObj.ar_001
    }
    
    // If English is specifically requested
    if (targetLang === 'en_US' && nameObj.en_US) {
      return nameObj.en_US
    }
    
    // Fallback priority: Arabic first, then English, then any available
    return nameObj.ar_001 || nameObj.en_US || Object.values(nameObj)[0] || '';
  }
  return '';
};

export const getValueColor = (value: ProductAttributeValue): string => {
  return value.html_color || value.color || '#6B7280';
};

export const formatValuePrice = (price: number): string => {
  if (price === 0) return 'Free';
  if (price > 0) return `+$${price.toFixed(2)}`;
  return `-$${Math.abs(price).toFixed(2)}`;
};

export const getValueIcon = (value: ProductAttributeValue): string => {
  if (value.image) return '🖼️';
  if (value.color || value.html_color) return '🎨';
  if (value.is_custom) return '✨';
  if (value.default_extra_price && value.default_extra_price > 0) return '💰';
  return '📝';
};

// Import the unified GraphQL client
import { gql, gqlMutate } from '@/lib/api'

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

// === RELATIONAL QUERIES - DO NOT MODIFY EXISTING QUERIES ABOVE ===

// Get value with its attribute relationship
export const GET_VALUE_ATTRIBUTE_RELATION = `
  query GetValueAttributeRelation($value_id: String!) {
    ProductAttributeValue(id: $value_id) {
      id
      attribute_id {
        id
        name
        display_name
        display_type
        spec_category_id {
          id
          name
          display_name
        }
      }
    }
  }
`;

// Get values by attribute ID - Fixed domain syntax
export const GET_VALUES_BY_ATTRIBUTE_ID = `
  query GetValuesByAttributeId($attribute_id: Int!) {
    ProductAttributeValue(domain: [["attribute_id", "=", $attribute_id]]) {
      id
      name
      display_name
      sequence
      active
      color
      html_color
      image
      is_custom
      default_extra_price
      attribute_id {
        id
        name
        display_name
        display_type
      }
    }
  }
`;

// Get attribute with all its values - Fixed ID type
export const GET_ATTRIBUTE_WITH_VALUES = `
  query GetAttributeWithValues($attribute_id: Int!) {
    ProductAttribute(id: $attribute_id) {
      id
      name
      display_name
      display_type
      value_ids {
        id
        name
        display_name
        sequence
        active
        color
        html_color
        image
        is_custom
        default_extra_price
      }
    }
  }
`;

// Create value for specific attribute - Use simple working approach  
export const CREATE_VALUE_FOR_ATTRIBUTE = `
  mutation CreateValueForAttribute($values: ProductAttributeValueInput!) {
    createProductAttributeValue(values: $values) {
      id
      name
      sequence
      active
    }
  }
`;

// Get values by display type through attribute
export const GET_VALUES_BY_ATTRIBUTE_DISPLAY_TYPE = `
  query GetValuesByAttributeDisplayType($display_type: String!) {
    ProductAttributeValue(join: ["attribute_id"], domain: ["attribute_id.display_type", "=", $display_type]) {
      id
      name
      display_name
      sequence
      color
      html_color
      image
      attribute_id {
        id
        name
        display_name
        display_type
      }
    }
  }
`; 