// Query to get all product attribute categories
export const GET_PRODUCT_ATTRIBUTE_CATEGORIES = `
  query GetProductAttributeCategories {
    ProductAttributeCategory {
      active
      attribute_count
      create_date
      description
      display_name
      display_type
      icon
      icon_display_type
      icon_image
      id
      is_information_category
      is_inline_editable
      is_website_visible
      name
      sequence
      website_css_class
      website_display_style
      website_fold_by_default
      website_meta_description
      website_meta_keywords
      website_meta_title
      website_sequence
      website_short_description
      website_url_key
      write_date
    }
  }
`;

// Query to get product attribute category by ID
export const GET_PRODUCT_ATTRIBUTE_CATEGORY_BY_ID = `
  query GetProductAttributeCategoryById($id: String!) {
    ProductAttributeCategory(id: $id) {
      active
      attribute_count
      create_date
      description
      display_name
      display_type
      icon
      icon_display_type
      icon_image
      id
      is_information_category
      is_inline_editable
      is_website_visible
      name
      sequence
      website_css_class
      website_display_style
      website_fold_by_default
      website_meta_description
      website_meta_keywords
      website_meta_title
      website_sequence
      website_short_description
      website_url_key
      write_date
    }
  }
`;

// Query to get website visible product attribute categories
export const GET_WEBSITE_PRODUCT_ATTRIBUTE_CATEGORIES = `
  query GetWebsiteProductAttributeCategories {
    ProductAttributeCategory(domain: "is_website_visible=true") {
      id
      name
      display_name
      description
      active
      sequence
      website_sequence
      display_type
      icon
      icon_display_type
      icon_image
      is_website_visible
      website_css_class
      website_display_style
      website_fold_by_default
      website_short_description
      website_url_key
      attribute_count
    }
  }
`;

// Query to get information categories
export const GET_INFORMATION_CATEGORIES = `
  query GetInformationCategories {
    ProductAttributeCategory(domain: "is_information_category=true") {
      id
      name
      display_name
      description
      active
      sequence
      is_information_category
      display_type
      icon
      icon_display_type
      attribute_count
    }
  }
`;

// Query to get inline editable categories
export const GET_INLINE_EDITABLE_CATEGORIES = `
  query GetInlineEditableCategories {
    ProductAttributeCategory(domain: "is_inline_editable=true") {
      id
      name
      display_name
      description
      active
      sequence
      is_inline_editable
      display_type
      icon
      icon_display_type
      attribute_count
    }
  }
`;

// Query to get product attributes by category
export const GET_PRODUCT_ATTRIBUTES_BY_CATEGORY = `
  query GetProductAttributesByCategory($category_id: String!) {
    ProductAttribute(domain: "category_type=$category_id") {
      id
      name
      display_name
      description
      active
      sequence
      sequence_in_category
      is_key_attribute
      is_filterable
      is_website_spec
      display_type
      display_in_car_info
      create_variant
      allow_multi_select
      filter_priority
      category_type
    }
  }
`;

// Mutation to create product attribute category
export const CREATE_PRODUCT_ATTRIBUTE_CATEGORY = `
  mutation CreateProductAttributeCategory($values: ProductAttributeCategoryInput!) {
    createProductAttributeCategory(values: $values) {
      id
      name
      display_name
      description
      active
      sequence
      website_sequence
      display_type
      icon
      icon_display_type
      icon_image
      is_information_category
      is_inline_editable
      is_website_visible
      attribute_count
      create_date
      write_date
    }
  }
`;

// Mutation to update product attribute category
export const UPDATE_PRODUCT_ATTRIBUTE_CATEGORY = `
  mutation UpdateProductAttributeCategory($id: ID!, $values: ProductAttributeCategoryInput!) {
    updateProductAttributeCategory(id: $id, values: $values) {
      id
      name
      display_name
      description
      active
      sequence
      website_sequence
      display_type
      icon
      icon_display_type
      icon_image
      is_information_category
      is_inline_editable
      is_website_visible
      attribute_count
      create_date
      write_date
    }
  }
`;

// Mutation to set category as website visible
export const SET_CATEGORY_WEBSITE_VISIBLE = `
  mutation SetCategoryWebsiteVisible($id: ID!) {
    updateProductAttributeCategory(id: $id, values: { is_website_visible: true }) {
      id
      name
      display_name
      is_website_visible
      active
    }
  }
`;

// Mutation to set category as information category
export const SET_CATEGORY_AS_INFORMATION = `
  mutation SetCategoryAsInformation($id: ID!) {
    updateProductAttributeCategory(id: $id, values: { is_information_category: true }) {
      id
      name
      display_name
      is_information_category
      active
    }
  }
`;

// Mutation to set category as inline editable
export const SET_CATEGORY_INLINE_EDITABLE = `
  mutation SetCategoryInlineEditable($id: ID!) {
    updateProductAttributeCategory(id: $id, values: { is_inline_editable: true }) {
      id
      name
      display_name
      is_inline_editable
      active
    }
  }
`;

// Mutation to upload category icon
export const UPLOAD_CATEGORY_ICON = `
  mutation UploadCategoryIcon($id: ID!, $icon_image: String!) {
    updateProductAttributeCategory(id: $id, values: { icon_image: $icon_image }) {
      id
      name
      display_name
      icon_image
      active
    }
  }
`;

// Mutation to delete product attribute category
export const DELETE_PRODUCT_ATTRIBUTE_CATEGORY = `
  mutation DeleteProductAttributeCategory($id: ID!) {
    deleteProductAttributeCategory(id: $id) {
      id
      name
      display_name
      active
    }
  }
`;

// Mutation to duplicate product attribute category
export const DUPLICATE_PRODUCT_ATTRIBUTE_CATEGORY = `
  mutation DuplicateProductAttributeCategory($original_id: ID!, $values: ProductAttributeCategoryInput!) {
    createProductAttributeCategory(values: $values) {
      id
      name
      display_name
      description
      active
      sequence
      is_website_visible
      is_information_category
      is_inline_editable
      create_date
      write_date
    }
  }
`;

// Query to get categories count
export const GET_PRODUCT_ATTRIBUTE_CATEGORIES_COUNT = `
  query GetProductAttributeCategoriesCount {
    ProductAttributeCategory {
      id
    }
  }
`;

// Query to get categories statistics
export const GET_PRODUCT_ATTRIBUTE_CATEGORIES_STATS = `
  query GetProductAttributeCategoriesStats {
    ProductAttributeCategory {
      id
      active
      is_website_visible
      is_information_category
      is_inline_editable
      attribute_count
    }
  }
`;

// TypeScript interfaces based on ProductAttributeCategory schema
export interface ProductAttributeCategory {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  active: boolean;
  sequence: number;
  website_sequence: number;
  display_type: string;
  icon?: string;
  icon_display_type: string;
  icon_image?: string;
  is_information_category: boolean;
  is_inline_editable: boolean;
  is_website_visible: boolean;
  attribute_count: number;
  website_css_class?: string;
  website_display_style?: string;
  website_fold_by_default: boolean;
  website_meta_title?: string;
  website_meta_description?: string;
  website_meta_keywords?: string;
  website_short_description?: string;
  website_url_key?: string;
  create_date?: string;
  write_date?: string;
}

export interface ProductAttributeCategoryValues {
  name?: string;
  display_name?: string;
  description?: string;
  active?: boolean;
  sequence?: number;
  website_sequence?: number;
  display_type?: string;
  icon?: string;
  icon_display_type?: string;
  icon_image?: string;
  is_information_category?: boolean;
  is_inline_editable?: boolean;
  is_website_visible?: boolean;
  website_css_class?: string;
  website_display_style?: string;
  website_fold_by_default?: boolean;
  website_meta_title?: string;
  website_meta_description?: string;
  website_meta_keywords?: string;
  website_short_description?: string;
  website_url_key?: string;
}

export interface ProductAttributeCategoryInput {
  name?: string;
  display_name?: string;
  description?: string;
  active?: boolean;
  sequence?: number;
  website_sequence?: number;
  display_type?: string;
  icon?: string;
  icon_display_type?: string;
  icon_image?: File | string | null;
  is_information_category?: boolean;
  is_inline_editable?: boolean;
  is_website_visible?: boolean;
  website_css_class?: string;
  website_display_style?: string;
  website_fold_by_default?: boolean;
  website_meta_title?: string;
  website_meta_description?: string;
  website_meta_keywords?: string;
  website_short_description?: string;
  website_url_key?: string;
}

// Helper types for filtering
export interface ProductAttributeCategoryFilters {
  active?: boolean;
  is_information_category?: boolean;
  is_inline_editable?: boolean;
  is_website_visible?: boolean;
  display_type?: string;
}

// Statistics interface
export interface ProductAttributeCategoryStats {
  total: number;
  active: number;
  inactive: number;
  websiteVisible: number;
  informationCategories: number;
  inlineEditable: number;
  totalAttributes: number;
  averageAttributesPerCategory: number;
}

// Constants for display types
export const CATEGORY_DISPLAY_TYPES = {
  LIST: 'list',
  GRID: 'grid',
  ACCORDION: 'accordion',
  TABS: 'tabs',
  CARDS: 'cards'
} as const;

// Constants for icon display types
export const CATEGORY_ICON_DISPLAY_TYPES = {
  ICON: 'icon',
  IMAGE: 'image',
  COLOR: 'color',
  TEXT: 'text'
} as const;

// Constants for website display styles
export const WEBSITE_DISPLAY_STYLES = {
  DEFAULT: 'default',
  COMPACT: 'compact',
  DETAILED: 'detailed',
  MINIMAL: 'minimal'
} as const;

// Re-export ProductAttribute types for relationship usage
export type { ProductAttribute, ProductAttributeInput } from './specification-attributes';

// === HELPER FUNCTIONS ===

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

// Get category with its attributes relationship
export const GET_CATEGORY_ATTRIBUTES_RELATION = `
  query GetCategoryAttributesRelation($category_id: String!) {
    ProductAttributeCategory(id: $category_id) {
      id
      name
      display_name
      attribute_ids {
        id
        name
        display_name
        display_type
        sequence
        is_key_attribute
        is_filterable
      }
    }
  }
`;

// Get attributes count for category
export const GET_CATEGORY_ATTRIBUTE_COUNT = `
  query GetCategoryAttributeCount($category_id: String!) {
    ProductAttributeCategory(id: $category_id) {
      id
      name
      display_name
      attribute_ids {
        id
      }
    }
  }
`;

// Get categories with attribute counts
export const GET_CATEGORIES_WITH_COUNTS = `
  query GetCategoriesWithCounts {
    ProductAttributeCategory {
      id
      name
      display_name
      sequence
      active
      is_website_visible
      attribute_count: attribute_ids(count: true)
    }
  }
`;

// Assign attributes to category
export const ASSIGN_ATTRIBUTES_TO_CATEGORY = `
  mutation AssignAttributesToCategory($category_id: ID!, $attribute_ids: [ID!]!) {
    updateProductAttributeCategory(id: $category_id, values: { attribute_ids: $attribute_ids }) {
      id
      name
      display_name
      attribute_ids {
        id
        name
        display_name
      }
    }
  }
`;

// Remove attributes from category
export const REMOVE_ATTRIBUTES_FROM_CATEGORY = `
  mutation RemoveAttributesFromCategory($attribute_ids: [ID!]!) {
    bulkUpdateProductAttribute(ids: $attribute_ids, values: { spec_category_id: false }) {
      id
      name
      display_name
      spec_category_id {
        id
      }
    }
  }
`;

// Get category hierarchy with attributes
export const GET_CATEGORY_HIERARCHY = `
  query GetCategoryHierarchy {
    ProductAttributeCategory(order: "sequence asc") {
      id
      name
      display_name
      sequence
      website_sequence
      active
      is_website_visible
      attribute_ids {
        id
        name
        display_name
        sequence
        is_key_attribute
      }
    }
  }
`; 