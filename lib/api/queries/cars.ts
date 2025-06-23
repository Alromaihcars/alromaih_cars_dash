// Car GraphQL queries and mutations with hierarchical selection structure
import { gql, gqlMutate } from '@/lib/api'
import { useState, useEffect } from 'react'

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

// Define MultilingualFieldData type locally
export type MultilingualFieldData = {
  [key: string]: string;
} | string;

export interface Translation {
  code: string;
  value: string;
}

export interface TranslationInput {
  code: string;
  value: string;
}

// Main query for cars with related data
export const GET_CAR_HIERARCHY = `
  query GetCarHierarchy {
    AlromaihCar {
      id
      name @multiLang
      cash_price
      cash_price_with_vat
      finance_price
      vat_percentage
      status
      active
      is_featured
      sequence
      brand_id {
        id
        name @multiLang
        logo
      }
      model_id {
        id
        name @multiLang
      }
      trim_id {
        id
        name @multiLang
      }
      year_id {
        id
        name @multiLang
      }
      primary_color_id {
        id
        name @multiLang
        color_picker
      }
      color_ids {
        id
        name @multiLang
        code
        color_picker
        active
      }
    }
  }
`;

// Query to get available colors
export const GET_CAR_COLORS = `
  query GetCarColors {
    CarColor {
      id
      name @multiLang
      code
      color_picker
      active
    }
  }
`;

// Query to get name preview for selected combination
export const GET_NAME_PREVIEW = `
  query GetNamePreview($brand_id: String, $model_id: String, $trim_id: String, $year_id: String, $primary_color_id: String, $status: String, $is_featured: Boolean) {
    AlromaihCar(method_name: "get_name_preview", method_parameters: {
      brand_id: $brand_id,
      model_id: $model_id, 
      trim_id: $trim_id,
      year_id: $year_id,
      primary_color_id: $primary_color_id,
      status: $status,
      is_featured: $is_featured
    }) {
      name @multiLang
    }
  }
`;

// Query to get car by ID with full details
export const GET_CAR_BY_ID = `
  query GetCarById($id: Int!) {
    AlromaihCar(id: $id) {
      id
      name @multiLang
      cash_price
      cash_price_with_vat
      finance_price
      vat_percentage
      status
      active
      is_featured
      sequence
      brand_id {
        id
        name @multiLang
        logo
      }
      model_id {
        id
        name @multiLang
      }
      trim_id {
        id
        name @multiLang
      }
      year_id {
        id
        name @multiLang
      }
      primary_color_id {
        id
        name @multiLang
        color_picker
      }
      color_ids {
        id
        name @multiLang
        code
        color_picker
        active
      }
    }
  }
`;

// Mutation to create car
export const CREATE_CAR = `
  mutation CreateCar($values: AlromaihCarValues!) {
    AlromaihCar(AlromaihCarValues: $values) {
      id
      name @multiLang
      cash_price
      cash_price_with_vat
      finance_price
      vat_percentage
      status
      active
      brand_id {
        id
        name @multiLang
        logo
      }
      model_id {
        id
        name @multiLang
      }
      trim_id {
        id
        name @multiLang
      }
      year_id {
        id
        name @multiLang
      }
      primary_color_id {
        id
        name @multiLang
        color_picker
      }
      color_ids {
        id
        name @multiLang
        color_picker
      }
      create_date
      write_date
    }
  }
`;

// Mutation to update car
export const UPDATE_CAR = `
  mutation UpdateCar($id: Int!, $values: AlromaihCarValues!) {
    AlromaihCar(id: $id, AlromaihCarValues: $values) {
      id
      name @multiLang
      cash_price
      cash_price_with_vat
      finance_price
      vat_percentage
      status
      active
      brand_id {
        id
        name @multiLang
        logo
      }
      model_id {
        id
        name @multiLang
      }
      trim_id {
        id
        name @multiLang
      }
      year_id {
        id
        name @multiLang
      }
      primary_color_id {
        id
        name @multiLang
        color_picker
      }
      color_ids {
        id
        name @multiLang
        color_picker
      }
      write_date
    }
  }
`;

// Mutation to delete car (set active to false)
export const DELETE_CAR = `
  mutation DeleteCar($id: Int!) {
    AlromaihCar(id: $id, AlromaihCarValues: { active: false }) {
      id
      name @multiLang
      active
    }
  }
`;

// Query with domain filtering, pagination, and sorting for cars management page
export const GET_CARS = `
  query GetCars($domain: [String], $limit: Int, $offset: Int, $order: String) {
    AlromaihCar(domain: $domain, limit: $limit, offset: $offset, order: $order) {
      id
      name @multiLang
      description @multiLang
      cash_price
      cash_price_with_vat
      finance_price
      vat_percentage
      status
      active
      is_featured
      sequence
      specification_completion
      filled_specifications
      total_specifications
      has_active_offer
      activity_state
      message_needaction_counter
      message_has_error_counter
      thumbnail
      create_date
      write_date
      brand_id {
        id
        name @multiLang
        logo
      }
      model_id {
        id
        name @multiLang
      }
      trim_id {
        id
        name @multiLang
      }
      year_id {
        id
        name @multiLang
      }
      primary_color_id {
        id
        name @multiLang
        color_picker
      }
      color_ids {
        id
        name @multiLang
        code
        color_picker
        active
      }
    }
  }
`;

// Types for car data structure
export interface CarYear {
  id: string;
  name: MultilingualFieldData;
}

export interface CarTrim {
  id: string;
  name: MultilingualFieldData;
}

export interface CarModel {
  id: string;
  name: MultilingualFieldData;
}

export interface CarBrand {
  id: string;
  name: MultilingualFieldData;
  logo?: string;
}

export interface CarColor {
  id: string;
  name: MultilingualFieldData;
  code?: string;
  color_picker?: string;
  active: boolean;
}

// Enhanced car interface for the cars management page
export interface AlromaihCar {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  cash_price?: number;
  cash_price_with_vat?: number;
  finance_price?: number;
  vat_percentage?: number;
  status?: string;
  active: boolean;
  is_featured?: boolean;
  sequence?: number;
  specification_completion?: number;
  filled_specifications?: number;
  total_specifications?: number;
  has_active_offer?: boolean;
  activity_state?: string | false;
  message_needaction_counter?: number;
  message_has_error_counter?: number;
  thumbnail?: string;
  create_date?: string;
  write_date?: string;
  brand_id?: CarBrand;
  model_id?: CarModel;
  trim_id?: CarTrim;
  year_id?: CarYear;
  primary_color_id?: CarColor;
  color_ids?: CarColor[];
}

// Filters interface for cars
export interface CarFilters {
  search?: string;
  status?: string;
  active?: boolean;
  is_featured?: boolean;
  brand_id?: string;
  model_id?: string;
  trim_id?: string;
  year_id?: string;
}

// Sort options for cars
export interface CarSortOptions {
  field: 'name' | 'create_date' | 'write_date' | 'cash_price' | 'sequence' | 'status';
  direction: 'asc' | 'desc';
}

export interface Car {
  id: number;
  name: MultilingualFieldData;
  cash_price?: number;
  cash_price_with_vat?: number;
  finance_price?: number;
  vat_percentage?: number;
  status?: string;
  active: boolean;
  is_featured?: boolean;
  sequence?: number;
  brand_id?: CarBrand;
  model_id?: CarModel;
  trim_id?: CarTrim;
  year_id?: CarYear;
  primary_color_id?: CarColor;
  color_ids?: CarColor[];
}

export interface AlromaihCarValues {
  name_translations?: TranslationInput[];
  brand_id?: number;
  model_id?: number;
  trim_id?: number;
  year_id?: number;
  color_ids?: number[];
  primary_color_id?: number;
  cash_price?: number;
  finance_price?: number;
  vat_percentage?: number;
  status?: string;
  active?: boolean;
  is_featured?: boolean;
  sequence?: number;
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

// Convert translation format from MultilingualFieldData to GraphQL format
export const convertToTranslations = (data: MultilingualFieldData): TranslationInput[] => {
  if (typeof data === 'object' && data !== null) {
    return Object.entries(data).map(([code, value]) => ({ code, value }));
  }
  
  if (typeof data === 'string') {
    return [{ code: 'en_US', value: data }];
  }
  
  return [];
};

// Helper function to create AlromaihCarValues from inputs
export const createCarValues = (
  name: MultilingualFieldData,
  brand_id: number,
  model_id: number,
  trim_id: number,
  year_id: number,
  options?: {
    primary_color_id?: number;
    color_ids?: number[];
    cash_price?: number;
    finance_price?: number;
    vat_percentage?: number;
    status?: string;
    active?: boolean;
    is_featured?: boolean;
    sequence?: number;
  }
): AlromaihCarValues => {
  const values: AlromaihCarValues = {
    name_translations: convertToTranslations(name),
    brand_id,
    model_id,
    trim_id,
    year_id,
    active: options?.active !== undefined ? options.active : true
  };

  if (options?.primary_color_id !== undefined) {
    values.primary_color_id = options.primary_color_id;
  }

  if (options?.color_ids && options.color_ids.length > 0) {
    values.color_ids = options.color_ids;
  }

  if (options?.cash_price !== undefined) {
    values.cash_price = options.cash_price;
  }

  if (options?.finance_price !== undefined) {
    values.finance_price = options.finance_price;
  }

  if (options?.vat_percentage !== undefined) {
    values.vat_percentage = options.vat_percentage;
  }

  if (options?.status) {
    values.status = options.status;
  }

  if (options?.is_featured !== undefined) {
    values.is_featured = options.is_featured;
  }

  if (options?.sequence !== undefined) {
    values.sequence = options.sequence;
  }

  return values;
};

// Hook for managing car data
export const useCars = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [colors, setColors] = useState<CarColor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const [carsResponse, colorsResponse] = await Promise.all([
        fetchGraphQL(GET_CAR_HIERARCHY),
        fetchGraphQL(GET_CAR_COLORS)
      ]);
      
      if (carsResponse?.AlromaihCar) {
        setCars(carsResponse.AlromaihCar);
      }
      
      if (colorsResponse?.CarColor) {
        setColors(colorsResponse.CarColor);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching cars:', err);
      setError('Failed to fetch car data');
    } finally {
      setLoading(false);
    }
  };

  // Get unique brands from cars
  const getBrands = (): CarBrand[] => {
    const brandsMap = new Map<string, CarBrand>();
    
    cars.forEach(car => {
      if (car.brand_id && !brandsMap.has(car.brand_id.id)) {
        brandsMap.set(car.brand_id.id, car.brand_id);
      }
    });
    
    return Array.from(brandsMap.values());
  };

  // Get unique models from cars
  const getModels = (): CarModel[] => {
    const modelsMap = new Map<string, CarModel>();
    
    cars.forEach(car => {
      if (car.model_id && !modelsMap.has(car.model_id.id)) {
        modelsMap.set(car.model_id.id, car.model_id);
      }
    });
    
    return Array.from(modelsMap.values());
  };

  // Get unique trims from cars
  const getTrims = (): CarTrim[] => {
    const trimsMap = new Map<string, CarTrim>();
    
    cars.forEach(car => {
      if (car.trim_id && !trimsMap.has(car.trim_id.id)) {
        trimsMap.set(car.trim_id.id, car.trim_id);
      }
    });
    
    return Array.from(trimsMap.values());
  };

  // Get unique years from cars
  const getYears = (): CarYear[] => {
    const yearsMap = new Map<string, CarYear>();
    
    cars.forEach(car => {
      if (car.year_id && !yearsMap.has(car.year_id.id)) {
        yearsMap.set(car.year_id.id, car.year_id);
      }
    });
    
    return Array.from(yearsMap.values());
  };

  // Create car with provided data
  const createCar = async (values: AlromaihCarValues) => {
    try {
      const response = await fetchGraphQL(CREATE_CAR, { values });
      if (response?.AlromaihCar) {
        setCars(prev => [...prev, response.AlromaihCar]);
        return response.AlromaihCar;
      }
    } catch (err) {
      console.error('Error creating car:', err);
      throw err;
    }
  };

  // Update car
  const updateCar = async (id: number, values: AlromaihCarValues) => {
    try {
      const response = await fetchGraphQL(UPDATE_CAR, { id, values });
      if (response?.AlromaihCar) {
        setCars(prev => prev.map(car => 
          car.id === id ? response.AlromaihCar : car
        ));
        return response.AlromaihCar;
      }
    } catch (err) {
      console.error('Error updating car:', err);
      throw err;
    }
  };

  // Delete car
  const deleteCar = async (id: number) => {
    try {
      await fetchGraphQL(DELETE_CAR, { id });
      setCars(prev => prev.filter(car => car.id !== id));
    } catch (err) {
      console.error('Error deleting car:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  return {
    // Data
    cars,
    colors,
    loading,
    error,
    
    // Derived data
    brands: getBrands(),
    models: getModels(),
    trims: getTrims(),
    years: getYears(),
    
    // Actions
    createCar,
    updateCar,
    deleteCar,
    refetch: fetchCars
  };
};