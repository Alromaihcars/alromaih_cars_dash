// Car Variant GraphQL queries and mutations
import { fetchGraphQL } from '../index'
import { useState, useEffect } from 'react'

// Define MultilingualFieldData type locally
export type MultilingualFieldData = {
  [key: string]: string;
} | string;

// Query to get all car variants
export const GET_CAR_VARIANTS = `
  query GetCarVariants {
    AlromaihCarVariant {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      is_primary
      stock_quantity
      reserved_quantity
      available_quantity
      price
      price_with_vat
      sku
      barcode
      create_date
      write_date
      car_id {
        id
        name @multiLang
        model_id {
          id
          name @multiLang
          brand_id {
            id
            name @multiLang
            logo
          }
        }
      }
      color_id {
        id
        name @multiLang
        code
        hex_value
      }
      media_ids {
        id
        media_type
        content_type
        file_url
        thumbnail_url
      }
    }
  }
`;

// Query to get car variants by car ID
export const GET_CAR_VARIANTS_BY_CAR = `
  query GetCarVariantsByCar($car_id: Int!) {
    AlromaihCarVariant(filters: { car_id: $car_id }) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      is_primary
      stock_quantity
      reserved_quantity
      available_quantity
      price
      price_with_vat
      sku
      barcode
      create_date
      write_date
      car_id {
        id
        name @multiLang
      }
      color_id {
        id
        name @multiLang
        code
        hex_value
      }
      media_ids {
        id
        media_type
        content_type
        file_url
        thumbnail_url
      }
    }
  }
`;

// Query to get active car variants only
export const GET_ACTIVE_CAR_VARIANTS = `
  query GetActiveCarVariants {
    AlromaihCarVariant(filters: { active: true }) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      is_primary
      stock_quantity
      reserved_quantity
      available_quantity
      price
      price_with_vat
      sku
      barcode
      create_date
      write_date
      car_id {
        id
        name @multiLang
        model_id {
          id
          name @multiLang
          brand_id {
            id
            name @multiLang
            logo
          }
        }
      }
      color_id {
        id
        name @multiLang
        code
        hex_value
      }
    }
  }
`;

// Query to get low stock variants
export const GET_LOW_STOCK_VARIANTS = `
  query GetLowStockVariants($threshold: Int) {
    AlromaihCarVariant(filters: { available_quantity__lte: $threshold }) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      stock_quantity
      reserved_quantity
      available_quantity
      price
      price_with_vat
      sku
      barcode
      car_id {
        id
        name @multiLang
        model_id {
          id
          name @multiLang
          brand_id {
            id
            name @multiLang
            logo
          }
        }
      }
      color_id {
        id
        name @multiLang
        code
        hex_value
      }
    }
  }
`;

// Mutation to create car variant
export const CREATE_CAR_VARIANT = `
  mutation CreateCarVariant($values: AlromaihCarVariantValues!) {
    AlromaihCarVariant(AlromaihCarVariantValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      is_primary
      stock_quantity
      reserved_quantity
      available_quantity
      price
      price_with_vat
      sku
      barcode
      create_date
      write_date
      car_id {
        id
        name @multiLang
      }
      color_id {
        id
        name @multiLang
        code
        hex_value
      }
    }
  }
`;

// Mutation to update car variant
export const UPDATE_CAR_VARIANT = `
  mutation UpdateCarVariant($id: Int!, $values: AlromaihCarVariantValues!) {
    AlromaihCarVariant(id: $id, AlromaihCarVariantValues: $values) {
      id
      name @multiLang
      description @multiLang
      display_name
      active
      is_primary
      stock_quantity
      reserved_quantity
      available_quantity
      price
      price_with_vat
      sku
      barcode
      create_date
      write_date
      car_id {
        id
        name @multiLang
      }
      color_id {
        id
        name @multiLang
        code
        hex_value
      }
    }
  }
`;

// Mutation to update variant stock
export const UPDATE_CAR_VARIANT_STOCK = `
  mutation UpdateCarVariantStock($id: Int!, $stock_quantity: Int!) {
    AlromaihCarVariant(id: $id, AlromaihCarVariantValues: { stock_quantity: $stock_quantity }) {
      id
      name @multiLang
      stock_quantity
      reserved_quantity
      available_quantity
    }
  }
`;

// Mutation to update variant price
export const UPDATE_CAR_VARIANT_PRICE = `
  mutation UpdateCarVariantPrice($id: Int!, $price: Float!, $price_with_vat: Float!) {
    AlromaihCarVariant(id: $id, AlromaihCarVariantValues: { 
      price: $price, 
      price_with_vat: $price_with_vat 
    }) {
      id
      name @multiLang
      price
      price_with_vat
    }
  }
`;

// Mutation to set variant as primary
export const SET_CAR_VARIANT_PRIMARY = `
  mutation SetCarVariantPrimary($id: Int!, $is_primary: Boolean!) {
    AlromaihCarVariant(id: $id, AlromaihCarVariantValues: { is_primary: $is_primary }) {
      id
      name @multiLang
      is_primary
    }
  }
`;

// Mutation to delete car variant (set active to false)
export const DELETE_CAR_VARIANT = `
  mutation DeleteCarVariant($id: Int!) {
    AlromaihCarVariant(id: $id, AlromaihCarVariantValues: { active: false }) {
      id
      name @multiLang
      display_name
      active
    }
  }
`;

// Types for TypeScript
export interface Translation {
  code: string;
  value: string;
}

export interface TranslationInput {
  code: string;
  value: string;
}

export interface CarColor {
  id: number;
  name: MultilingualFieldData;
  code?: string;
  hex_value?: string;
}

export interface CarBrand {
  id: number;
  name: MultilingualFieldData;
  logo?: string;
}

export interface CarModel {
  id: number;
  name: MultilingualFieldData;
  brand_id?: CarBrand;
}

export interface Car {
  id: number;
  name: MultilingualFieldData;
  model_id?: CarModel;
}

export interface CarMedia {
  id: number;
  media_type: string;
  content_type: string;
  file_url?: string;
  thumbnail_url?: string;
  title?: MultilingualFieldData;
  description?: MultilingualFieldData;
}

export interface CarVariant {
  id: number;
  name: MultilingualFieldData;
  name_translations?: Translation[];
  description?: MultilingualFieldData;
  description_translations?: Translation[];
  display_name?: string;
  active: boolean;
  is_primary: boolean;
  stock_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  price?: number;
  price_with_vat?: number;
  sku?: string;
  barcode?: string;
  create_date?: string;
  write_date?: string;
  car_id: Car;
  color_id: CarColor;
  media_ids?: CarMedia[];
}

export interface CarVariantValues {
  name_translations?: TranslationInput[];
  description_translations?: TranslationInput[];
  car_id: number;
  color_id: number;
  is_primary?: boolean;
  stock_quantity?: number;
  reserved_quantity?: number;
  price?: number;
  price_with_vat?: number;
  sku?: string;
  barcode?: string;
  active?: boolean;
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

// Convert translation format from GraphQL to MultilingualFieldData
export const convertFromTranslations = (translations: Translation[] | any): MultilingualFieldData => {
  if (Array.isArray(translations)) {
    const result: { [key: string]: string } = {};
    translations.forEach(({ code, value }) => {
      result[code] = value;
    });
    return result;
  }
  
  if (typeof translations === 'string') {
    return { 'en_US': translations };
  }
  
  if (typeof translations === 'object' && translations !== null) {
    return translations;
  }
  
  return {};
};

// Helper function to create CarVariantValues from multilingual inputs
export const createCarVariantValues = (
  name: MultilingualFieldData,
  car_id: number,
  color_id: number,
  description?: MultilingualFieldData,
  is_primary?: boolean,
  stock_quantity?: number,
  reserved_quantity?: number,
  price?: number,
  price_with_vat?: number,
  sku?: string,
  barcode?: string,
  active?: boolean
): CarVariantValues => {
  const values: CarVariantValues = {
    name_translations: convertToTranslations(name),
    car_id,
    color_id,
    active: active !== undefined ? active : true
  };

  if (description) {
    values.description_translations = convertToTranslations(description);
  }

  if (is_primary !== undefined) {
    values.is_primary = is_primary;
  }

  if (stock_quantity !== undefined) {
    values.stock_quantity = stock_quantity;
  }

  if (reserved_quantity !== undefined) {
    values.reserved_quantity = reserved_quantity;
  }

  if (price !== undefined) {
    values.price = price;
  }

  if (price_with_vat !== undefined) {
    values.price_with_vat = price_with_vat;
  }

  if (sku) {
    values.sku = sku;
  }

  if (barcode) {
    values.barcode = barcode;
  }

  return values;
};

// Helper function to get current language context
const getCurrentLanguageContext = (): string => {
  if (typeof window !== 'undefined') {
    const isRTL = document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar'
    if (isRTL) return 'ar_001'
    
    const storedLang = localStorage.getItem('language') || localStorage.getItem('locale')
    if (storedLang === 'ar' || storedLang === 'ar_001') return 'ar_001'
    if (storedLang === 'en' || storedLang === 'en_US') return 'en_US'
  }
  
  return 'ar_001'
}

// Helper function to get display name with Arabic priority
export const getDisplayName = (variant: CarVariant, languageCode?: string): string => {
  if (variant.display_name) {
    return variant.display_name;
  }
  
  const targetLang = languageCode || getCurrentLanguageContext()
  
  if (typeof variant.name === 'object' && variant.name !== null) {
    if (targetLang === 'ar_001' && variant.name['ar_001']) {
      return variant.name['ar_001']
    }
    
    if (targetLang === 'en_US' && variant.name['en_US']) {
      return variant.name['en_US']
    }
    
    return variant.name['ar_001'] || variant.name['en_US'] || Object.values(variant.name)[0] || 'Untitled Variant'
  }
  
  return String(variant.name) || 'Untitled Variant';
};

// Helper function to get display description with Arabic priority
export const getDisplayDescription = (variant: CarVariant, languageCode?: string): string => {
  if (!variant.description) return '';
  
  const targetLang = languageCode || getCurrentLanguageContext()
  
  if (typeof variant.description === 'object' && variant.description !== null) {
    if (targetLang === 'ar_001' && variant.description['ar_001']) {
      return variant.description['ar_001']
    }
    
    if (targetLang === 'en_US' && variant.description['en_US']) {
      return variant.description['en_US']
    }
    
    return variant.description['ar_001'] || variant.description['en_US'] || Object.values(variant.description)[0] || ''
  }
  
  return String(variant.description) || '';
};

// Helper function to format price display
export const getFormattedPrice = (variant: CarVariant, includeVAT: boolean = false, languageCode?: string): string => {
  const price = includeVAT ? variant.price_with_vat : variant.price;
  if (!price) return '';
  
  const formattedPrice = new Intl.NumberFormat('en-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(price);
  
  if (languageCode === 'ar_001') {
    return `${formattedPrice} ${includeVAT ? '(شامل الضريبة)' : '(بدون ضريبة)'}`;
  }
  
  return `${formattedPrice} ${includeVAT ? '(incl. VAT)' : '(excl. VAT)'}`;
};

// Helper function to get stock status
export const getStockStatus = (variant: CarVariant): 'in_stock' | 'low_stock' | 'out_of_stock' | 'reserved' => {
  if (variant.available_quantity <= 0) return 'out_of_stock';
  if (variant.available_quantity <= 5) return 'low_stock';
  if (variant.reserved_quantity > 0) return 'reserved';
  return 'in_stock';
};

// Helper function to get stock status display
export const getStockStatusDisplay = (variant: CarVariant, languageCode?: string): string => {
  const status = getStockStatus(variant);
  const isArabic = languageCode === 'ar_001';
  
  switch (status) {
    case 'in_stock':
      return isArabic ? 'متوفر' : 'In Stock';
    case 'low_stock':
      return isArabic ? 'كمية قليلة' : 'Low Stock';
    case 'out_of_stock':
      return isArabic ? 'غير متوفر' : 'Out of Stock';
    case 'reserved':
      return isArabic ? 'محجوز' : 'Reserved';
    default:
      return isArabic ? 'غير محدد' : 'Unknown';
  }
};

// Hook for managing car variants with multilingual support
export const useCarVariants = (filters?: {
  car_id?: number;
  active_only?: boolean;
  low_stock_threshold?: number;
}) => {
  const [variants, setVariants] = useState<CarVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      
      let query = GET_CAR_VARIANTS;
      let variables: any = {};
      
      if (filters?.car_id) {
        query = GET_CAR_VARIANTS_BY_CAR;
        variables = { car_id: filters.car_id };
      } else if (filters?.active_only) {
        query = GET_ACTIVE_CAR_VARIANTS;
      } else if (filters?.low_stock_threshold) {
        query = GET_LOW_STOCK_VARIANTS;
        variables = { threshold: filters.low_stock_threshold };
      }
      
      const response = await fetchGraphQL(query, variables);
      
      if (response?.AlromaihCarVariant) {
        const processedVariants = response.AlromaihCarVariant.map((variant: any) => ({
          ...variant,
          name: convertFromTranslations(variant.name_translations || variant.name),
          description: convertFromTranslations(variant.description_translations || variant.description),
          car_id: {
            ...variant.car_id,
            name: convertFromTranslations(variant.car_id?.name_translations || variant.car_id?.name)
          },
          color_id: {
            ...variant.color_id,
            name: convertFromTranslations(variant.color_id?.name_translations || variant.color_id?.name)
          }
        }));
        setVariants(processedVariants);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching car variants:', err);
      setError('Failed to fetch car variants');
    } finally {
      setLoading(false);
    }
  };

  const createVariant = async (
    name: MultilingualFieldData,
    car_id: number,
    color_id: number,
    description?: MultilingualFieldData,
    is_primary?: boolean,
    stock_quantity?: number,
    reserved_quantity?: number,
    price?: number,
    price_with_vat?: number,
    sku?: string,
    barcode?: string,
    active?: boolean
  ) => {
    try {
      const values = createCarVariantValues(
        name, car_id, color_id, description, is_primary,
        stock_quantity, reserved_quantity, price, price_with_vat,
        sku, barcode, active
      );
      const response = await fetchGraphQL(CREATE_CAR_VARIANT, { values });
      
      if (response?.AlromaihCarVariant) {
        const newVariant = {
          ...response.AlromaihCarVariant,
          name: convertFromTranslations(response.AlromaihCarVariant.name_translations || response.AlromaihCarVariant.name),
          description: convertFromTranslations(response.AlromaihCarVariant.description_translations || response.AlromaihCarVariant.description),
          car_id: {
            ...response.AlromaihCarVariant.car_id,
            name: convertFromTranslations(response.AlromaihCarVariant.car_id?.name_translations || response.AlromaihCarVariant.car_id?.name)
          },
          color_id: {
            ...response.AlromaihCarVariant.color_id,
            name: convertFromTranslations(response.AlromaihCarVariant.color_id?.name_translations || response.AlromaihCarVariant.color_id?.name)
          }
        };
        setVariants(prev => [...prev, newVariant]);
        return newVariant;
      }
    } catch (err) {
      console.error('Error creating car variant:', err);
      throw err;
    }
  };

  const updateVariant = async (
    id: number,
    name: MultilingualFieldData,
    car_id: number,
    color_id: number,
    description?: MultilingualFieldData,
    is_primary?: boolean,
    stock_quantity?: number,
    reserved_quantity?: number,
    price?: number,
    price_with_vat?: number,
    sku?: string,
    barcode?: string,
    active?: boolean
  ) => {
    try {
      const values = createCarVariantValues(
        name, car_id, color_id, description, is_primary,
        stock_quantity, reserved_quantity, price, price_with_vat,
        sku, barcode, active
      );
      const response = await fetchGraphQL(UPDATE_CAR_VARIANT, { id, values });
      
      if (response?.AlromaihCarVariant) {
        const updatedVariant = {
          ...response.AlromaihCarVariant,
          name: convertFromTranslations(response.AlromaihCarVariant.name_translations || response.AlromaihCarVariant.name),
          description: convertFromTranslations(response.AlromaihCarVariant.description_translations || response.AlromaihCarVariant.description),
          car_id: {
            ...response.AlromaihCarVariant.car_id,
            name: convertFromTranslations(response.AlromaihCarVariant.car_id?.name_translations || response.AlromaihCarVariant.car_id?.name)
          },
          color_id: {
            ...response.AlromaihCarVariant.color_id,
            name: convertFromTranslations(response.AlromaihCarVariant.color_id?.name_translations || response.AlromaihCarVariant.color_id?.name)
          }
        };
        setVariants(prev => prev.map(variant => 
          variant.id === id ? updatedVariant : variant
        ));
        return updatedVariant;
      }
    } catch (err) {
      console.error('Error updating car variant:', err);
      throw err;
    }
  };

  const updateStock = async (id: number, stock_quantity: number) => {
    try {
      await fetchGraphQL(UPDATE_CAR_VARIANT_STOCK, { id, stock_quantity });
      setVariants(prev => prev.map(variant => 
        variant.id === id ? { 
          ...variant, 
          stock_quantity,
          available_quantity: stock_quantity - variant.reserved_quantity
        } : variant
      ));
    } catch (err) {
      console.error('Error updating variant stock:', err);
      throw err;
    }
  };

  const updatePrice = async (id: number, price: number, price_with_vat: number) => {
    try {
      await fetchGraphQL(UPDATE_CAR_VARIANT_PRICE, { id, price, price_with_vat });
      setVariants(prev => prev.map(variant => 
        variant.id === id ? { ...variant, price, price_with_vat } : variant
      ));
    } catch (err) {
      console.error('Error updating variant price:', err);
      throw err;
    }
  };

  const setPrimary = async (id: number, is_primary: boolean) => {
    try {
      await fetchGraphQL(SET_CAR_VARIANT_PRIMARY, { id, is_primary });
      setVariants(prev => prev.map(variant => 
        variant.id === id ? { ...variant, is_primary } : variant
      ));
    } catch (err) {
      console.error('Error setting variant as primary:', err);
      throw err;
    }
  };

  const deleteVariant = async (id: number) => {
    try {
      await fetchGraphQL(DELETE_CAR_VARIANT, { id });
      setVariants(prev => prev.filter(variant => variant.id !== id));
    } catch (err) {
      console.error('Error deleting car variant:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [filters]);

  return {
    variants,
    loading,
    error,
    fetchVariants,
    createVariant,
    updateVariant,
    updateStock,
    updatePrice,
    setPrimary,
    deleteVariant,
    refetch: fetchVariants
  };
};
