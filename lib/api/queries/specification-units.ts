// Query to get all product attribute units
export const GET_PRODUCT_ATTRIBUTE_UNITS = `
  query GetProductAttributeUnits {
    ProductAttributeUnit {
      active
      category
      code
      conversion_factor
      create_date
      description
      display_name
      display_position
      id
      name
      write_date
    }
  }
`;

// Query to get product attribute unit by ID
export const GET_PRODUCT_ATTRIBUTE_UNIT_BY_ID = `
  query GetProductAttributeUnitById($id: String!) {
    ProductAttributeUnit(id: $id) {
      active
      category
      code
      conversion_factor
      create_date
      description
      display_name
      display_position
      id
      name
      write_date
    }
  }
`;

// Query to get units by category
export const GET_UNITS_BY_CATEGORY = `
  query GetUnitsByCategory($category: String!) {
    ProductAttributeUnit(domain: "category=$category") {
      active
      category
      code
      conversion_factor
      create_date
      description
      display_name
      display_position
      id
      name
      write_date
    }
  }
`;

// Query to get active units only
export const GET_ACTIVE_UNITS = `
  query GetActiveUnits {
    ProductAttributeUnit(domain: "active=true") {
      active
      category
      code
      conversion_factor
      description
      display_name
      display_position
      id
      name
    }
  }
`;

// Query to get units with conversion factors
export const GET_UNITS_WITH_CONVERSION = `
  query GetUnitsWithConversion {
    ProductAttributeUnit(domain: "conversion_factor!=1.0") {
      active
      category
      code
      conversion_factor
      description
      display_name
      display_position
      id
      name
    }
  }
`;

// Mutation to create product attribute unit
export const CREATE_PRODUCT_ATTRIBUTE_UNIT = `
  mutation CreateProductAttributeUnit($values: ProductAttributeUnitInput!) {
    createProductAttributeUnit(values: $values) {
      id
      name
      display_name
      description
      active
      category
      code
      conversion_factor
      display_position
      create_date
      write_date
    }
  }
`;

// Mutation to update product attribute unit
export const UPDATE_PRODUCT_ATTRIBUTE_UNIT = `
  mutation UpdateProductAttributeUnit($id: ID!, $values: ProductAttributeUnitInput!) {
    updateProductAttributeUnit(id: $id, values: $values) {
      id
      name
      display_name
      description
      active
      category
      code
      conversion_factor
      display_position
      create_date
      write_date
    }
  }
`;

// Mutation to delete product attribute unit
export const DELETE_PRODUCT_ATTRIBUTE_UNIT = `
  mutation DeleteProductAttributeUnit($id: ID!) {
    deleteProductAttributeUnit(id: $id) {
      id
      name
      display_name
      active
    }
  }
`;

// Query to get units count
export const GET_UNITS_COUNT = `
  query GetUnitsCount {
    ProductAttributeUnit {
      id
    }
  }
`;

// Query to get units statistics
export const GET_UNITS_STATISTICS = `
  query GetUnitsStatistics {
    ProductAttributeUnit {
      id
      active
      category
    }
  }
`;

// Use imported types
export interface ProductAttributeUnit {
  id: string;
  name: string | { [key: string]: string };
  display_name?: string | { [key: string]: string };
  description?: string | { [key: string]: string };
  active: boolean;
  category?: string;
  code?: string;
  conversion_factor?: number;
  display_position?: number;
  create_date?: string;
  write_date?: string;
}

export interface ProductAttributeUnitInput {
  name?: string;
  display_name?: string;
  description?: string;
  active?: boolean;
  category?: string;
  code?: string;
  conversion_factor?: number;
  display_position?: number;
}

// Unit categories with their labels for display
export const UNIT_CATEGORIES: Record<string, { label: string, icon: string }> = {
  length: { label: 'Length', icon: '📏' },
  weight: { label: 'Weight', icon: '⚖️' },
  volume: { label: 'Volume', icon: '🪣' },
  power: { label: 'Power', icon: '⚡' },
  speed: { label: 'Speed', icon: '🏃' },
  pressure: { label: 'Pressure', icon: '🌡️' },
  temperature: { label: 'Temperature', icon: '🌡️' },
  other: { label: 'Other', icon: '📊' }
}; 