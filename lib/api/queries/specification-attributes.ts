// Query to get all product attributes (simplified, following car brands pattern)
export const GET_PRODUCT_ATTRIBUTES = `
  query {
    ProductAttribute {
      active
      allow_multi_select
      car_info_icon
      category_type
      create_date
      create_variant
      default_expanded
      description
      display_in_car_info
      display_name
      display_type
      edit_widget
      filter_priority
      icon
      icon_display_type
      icon_image
      icon_image_visible
      id
      inline_editable
      is_filterable
      is_key_attribute
      is_website_spec
      name
      number_related_products
      sequence
      sequence_in_category
      show_count
      write_date
      value_ids {
        active
        color
        create_date
        default_extra_price
        default_extra_price_changed
        display_type
        display_value
        html_color
        id
        image
        is_custom
        is_used_on_products
        name
        sequence
        unit
        write_date
        unit_id {
          id
        }
      }
    }
  }
`;

// Query to get product attribute by ID
export const GET_PRODUCT_ATTRIBUTE_BY_ID = `
  query GetProductAttributeById($id: String!) {
    ProductAttribute(id: $id) {
      active
      allow_multi_select
      car_info_icon
      category_type
      create_date
      create_variant
      default_expanded
      description
      display_in_car_info
      display_name
      display_type
      edit_widget
      filter_priority
      icon
      icon_display_type
      icon_image
      icon_image_visible
      id
      inline_editable
      is_filterable
      is_key_attribute
      is_website_spec
      name
      number_related_products
      sequence
      sequence_in_category
      show_count
      write_date
      value_ids {
        active
        color
        create_date
        default_extra_price
        default_extra_price_changed
        display_type
        display_value
        html_color
        id
        image
        is_custom
        is_used_on_products
        name
        sequence
        unit
        write_date
        unit_id {
          id
        }
      }
    }
  }
`;

// Query to get filterable attributes
export const GET_FILTERABLE_ATTRIBUTES = `
  query {
    ProductAttribute {
      id
      name
      display_name
      display_type
      filter_priority
      is_filterable
      is_key_attribute
      value_ids {
        id
        name
        active
      }
    }
  }
`;

// Query to get key attributes
export const GET_KEY_ATTRIBUTES = `
  query {
    ProductAttribute {
      id
      name
      display_name
      display_type
      is_key_attribute
      is_filterable
      display_in_car_info
      value_ids {
        id
        name
        active
      }
    }
  }
`;

// Query to get website spec attributes
export const GET_WEBSITE_SPEC_ATTRIBUTES = `
  query {
    ProductAttribute {
      id
      name
      display_name
      display_type
      is_website_spec
      display_in_car_info
      value_ids {
        id
        name
        active
      }
    }
  }
`;

// Mutation to create product attribute
export const CREATE_PRODUCT_ATTRIBUTE = `
  mutation CreateProductAttribute($values: ProductAttributeInput!) {
    createProductAttribute(values: $values) {
      id
      name
      display_name
      display_type
      is_filterable
      is_key_attribute
      is_website_spec
      display_in_car_info
      active
      create_date
      write_date
    }
  }
`;

// Mutation to update product attribute - Fixed to use working approach
export const UPDATE_PRODUCT_ATTRIBUTE = `
  mutation UpdateProductAttribute($id: Int!, $values: JSON!) {
    updateRecord(model: "ProductAttribute", id: $id, values: $values) {
      id
      name
      display_name
      display_type
      is_filterable
      is_key_attribute
      is_website_spec
      display_in_car_info
      active
    }
  }
`;

// Mutation to delete product attribute
export const DELETE_PRODUCT_ATTRIBUTE = `
  mutation DeleteProductAttribute($id: ID!) {
    deleteProductAttribute(id: $id) {
      id
      name
      display_name
      active
    }
  }
`;

// Query to get attributes statistics
export const GET_ATTRIBUTES_STATISTICS = `
  query {
    ProductAttribute {
      id
      is_filterable
      is_key_attribute
      is_website_spec
      display_in_car_info
      active
      value_ids {
        id
      }
    }
  }
`;

// Static attribute options (replacing introspection queries)
export const ATTRIBUTE_DISPLAY_TYPES = [
  { name: 'text', description: 'Text Input' },
  { name: 'select', description: 'Select Dropdown' },
  { name: 'multiselect', description: 'Multiple Selection' },
  { name: 'radio', description: 'Radio Buttons' },
  { name: 'checkbox', description: 'Checkboxes' },
  { name: 'color', description: 'Color Picker' },
  { name: 'numeric', description: 'Numeric Input' },
  { name: 'boolean', description: 'Boolean Toggle' }
];

export const ATTRIBUTE_CATEGORIES = [
  { name: 'engine', description: 'Engine Specifications' },
  { name: 'exterior', description: 'Exterior Features' },
  { name: 'interior', description: 'Interior Features' },
  { name: 'safety', description: 'Safety Features' },
  { name: 'technology', description: 'Technology Features' },
  { name: 'performance', description: 'Performance Specs' },
  { name: 'dimensions', description: 'Dimensions' },
  { name: 'other', description: 'Other' }
];

export const FILTER_DISPLAY_TYPES = [
  { name: 'list', description: 'List View' },
  { name: 'dropdown', description: 'Dropdown' },
  { name: 'radio', description: 'Radio Buttons' },
  { name: 'checkbox', description: 'Checkboxes' },
  { name: 'slider', description: 'Range Slider' }
];

export const EDIT_WIDGET_TYPES = [
  { name: 'input', description: 'Input Field' },
  { name: 'textarea', description: 'Text Area' },
  { name: 'select', description: 'Select Field' },
  { name: 'multiselect', description: 'Multi Select' },
  { name: 'color', description: 'Color Picker' },
  { name: 'date', description: 'Date Picker' },
  { name: 'number', description: 'Number Input' }
];

// TypeScript interfaces for ProductAttribute
export interface ProductAttributeValue {
  active: boolean;
  color?: string;
  create_date?: string;
  default_extra_price?: number;
  default_extra_price_changed?: boolean;
  display_type?: string;
  display_value?: string;
  html_color?: string;
  id: string;
  image?: string;
  is_custom?: boolean;
  is_used_on_products?: boolean;
  name: string | { [key: string]: string };
  sequence?: number;
  unit?: string;
  write_date?: string;
  unit_id?: {
    id: string;
  };
}

export interface ProductAttribute {
  active: boolean;
  allow_multi_select?: boolean;
  car_info_icon?: string;
  category_type?: string;
  create_date?: string;
  create_variant?: boolean;
  default_expanded?: boolean;
  description?: string | { [key: string]: string };
  display_in_car_info?: boolean;
  display_name?: string | { [key: string]: string };
  display_type?: string;
  edit_widget?: string;
  filter_priority?: number;
  icon?: string;
  icon_display_type?: string;
  icon_image?: string;
  icon_image_visible?: boolean;
  id: string;
  inline_editable?: boolean;
  is_filterable?: boolean;
  is_key_attribute?: boolean;
  is_website_spec?: boolean;
  name: string | { [key: string]: string };
  number_related_products?: number;
  sequence?: number;
  sequence_in_category?: number;
  show_count?: boolean;
  write_date?: string;
  value_ids: ProductAttributeValue[];
}

export interface ProductAttributeInput {
  name?: string;
  display_name?: string;
  display_type?: string;
  description?: string;
  is_filterable?: boolean;
  is_key_attribute?: boolean;
  is_website_spec?: boolean;
  display_in_car_info?: boolean;
  allow_multi_select?: boolean;
  create_variant?: boolean;
  filter_priority?: number;
  edit_widget?: string;
  icon?: string;
  car_info_icon?: string;
  category_type?: string;
  active?: boolean;
  sequence?: number;
  sequence_in_category?: number;
  show_count?: boolean;
  default_expanded?: boolean;
  inline_editable?: boolean;
}

// Interface for attribute option values
export interface AttributeOption {
  name: string;
  description?: string;
}

// Interface for attribute options response (static data)
export interface AttributeOptionsResponse {
  AttributeDisplayTypes: {
    enumValues: AttributeOption[];
  };
  AttributeCategories: {
    enumValues: AttributeOption[];
  };
  FilterDisplayTypes: {
    enumValues: AttributeOption[];
  };
  EditWidgetTypes: {
    enumValues: AttributeOption[];
  };
}

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

// Function to get static attribute options (replacing the introspection query)
export const getAttributeOptions = (): AttributeOptionsResponse => {
  return {
    AttributeDisplayTypes: {
      enumValues: ATTRIBUTE_DISPLAY_TYPES
    },
    AttributeCategories: {
      enumValues: ATTRIBUTE_CATEGORIES
    },
    FilterDisplayTypes: {
      enumValues: FILTER_DISPLAY_TYPES
    },
    EditWidgetTypes: {
      enumValues: EDIT_WIDGET_TYPES
    }
  }
}


// === RELATIONAL QUERIES - DO NOT MODIFY EXISTING QUERIES ABOVE ===

// Get attribute with its category relationship
export const GET_ATTRIBUTE_CATEGORY_RELATION = `
  query GetAttributeCategoryRelation($attribute_id: String!) {
    ProductAttribute(id: $attribute_id) {
      id
      spec_category_id {
        id
        name
        display_name
        sequence
      }
    }
  }
`;

// Get attribute with its values relationship
export const GET_ATTRIBUTE_VALUES_RELATION = `
  query GetAttributeValuesRelation($attribute_id: String!) {
    ProductAttribute(id: $attribute_id) {
      id
      value_ids {
        id
        name
        display_name
        sequence
        active
        color
        html_color
      }
    }
  }
`;

// Get attributes by category ID
export const GET_ATTRIBUTES_BY_CATEGORY_ID = `
  query GetAttributesByCategoryId($category_id: String!) {
    ProductAttribute(domain: ["spec_category_id", "=", $category_id]) {
      id
      name
      display_name
      display_type
      sequence
      is_key_attribute
      is_filterable
    }
  }
`;

// Get category with its attributes count
export const GET_CATEGORY_ATTRIBUTES_COUNT = `
  query GetCategoryAttributesCount($category_id: String!) {
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

// Assign attribute to category
export const ASSIGN_ATTRIBUTE_TO_CATEGORY = `
  mutation AssignAttributeToCategory($attribute_id: ID!, $category_id: ID!) {
    updateProductAttribute(id: $attribute_id, values: { spec_category_id: $category_id }) {
      id
      spec_category_id {
        id
        name
        display_name
      }
    }
  }
`;

// Remove attribute from category
export const REMOVE_ATTRIBUTE_FROM_CATEGORY = `
  mutation RemoveAttributeFromCategory($attribute_id: ID!) {
    updateProductAttribute(id: $attribute_id, values: { spec_category_id: false }) {
      id
      spec_category_id {
        id
      }
    }
  }
`;