import { useState, useEffect, useCallback } from 'react'
import { gql } from '@/lib/api'
import { 
  GET_CAR_BRANDS, 
  type CarBrand 
} from '@/lib/api/queries/car-brands'
import { 
  GET_CAR_MODELS, 
  type CarModel 
} from '@/lib/api/queries/car-models'
import { 
  GET_CAR_COLORS, 
  type CarColor 
} from '@/lib/api/queries/car-colors'
import { 
  GET_CAR_YEARS, 
  type CarYear 
} from '@/lib/api/queries/car-years'

// Car trims query - using proper Odoo GraphQL format
export const GET_CAR_TRIMS = `
  query GetCarTrims {
    CarTrim(id: "", domain: "") {
      id
      name @multiLang
      description @multiLang
      code
      active
      create_date
      write_date
      model_id {
        id
        name @multiLang
        active
      }
    }
  }
`;

export interface CarTrim {
  id: string;
  name: string;
  description?: string;
  code?: string;
  active: boolean;
  create_date?: string;
  write_date?: string;
  model_id?: {
    id: string;
    name: string;
    active: boolean;
  };
}

// Hook for car brands
export function useCarBrands() {
  const [brands, setBrands] = useState<CarBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        const result = await gql(GET_CAR_BRANDS);
        if (result?.CarBrand) {
          // Process multilingual fields
          const processedBrands = result.CarBrand
            .filter((brand: any) => brand.active)
            .map((brand: any) => ({
              ...brand,
              name: typeof brand.name === 'object' ? brand.name.en_US || brand.name.ar_001 || 'Unnamed' : brand.name,
              description: typeof brand.description === 'object' ? brand.description.en_US || brand.description.ar_001 : brand.description
            }));
          setBrands(processedBrands);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brands');
        console.error('Error fetching brands:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  return { brands, isLoading, error };
}

// Hook for car models filtered by brand
export function useCarModels(brandId?: string) {
  const [models, setModels] = useState<CarModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!brandId) {
      setModels([]);
      return;
    }

    const fetchModels = async () => {
      try {
        setIsLoading(true);
        console.log('🔍 Fetching models for brand ID:', brandId);
        
        // Use the models query that includes brand relationship
        const GET_MODELS_FOR_BRAND = `
          query GetModelsForBrand($brand_id: String!) {
            CarModel(brand_id: $brand_id) {
              id
              name @multiLang
              description @multiLang
              display_name
              active
              brand_id {
                id
                name @multiLang
                display_name
              }
              create_date
              write_date
            }
          }
        `;
        
        const result = await gql(GET_MODELS_FOR_BRAND, { brand_id: brandId });
        console.log('📊 Models result for brand', brandId, ':', result);
        
        if (result?.CarModel) {
          console.log('✅ Found', result.CarModel.length, 'models for brand', brandId);
          
          // Process multilingual fields for filtered models
          const processedModels = result.CarModel
            .filter((model: any) => model.active)
            .map((model: any) => ({
              ...model,
              name: typeof model.name === 'object' ? model.name.en_US || model.name.ar_001 || 'Unnamed' : model.name,
              description: typeof model.description === 'object' ? model.description.en_US || model.description.ar_001 : model.description,
              brand_id: model.brand_id ? {
                ...model.brand_id,
                name: typeof model.brand_id.name === 'object' ? model.brand_id.name.en_US || model.brand_id.name.ar_001 : model.brand_id.name
              } : null
            }));
          
          console.log('🔄 Processed models:', processedModels);
          setModels(processedModels);
        } else {
          console.log('❌ No models found in result for brand', brandId);
          setModels([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch models');
        console.error('Error fetching models for brand:', brandId, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, [brandId]);

  return { models, isLoading, error };
}

// Hook for car trims filtered by model
export function useCarTrims(modelId?: string) {
  const [trims, setTrims] = useState<CarTrim[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modelId) {
      setTrims([]);
      return;
    }

    const fetchTrims = async () => {
      try {
        setIsLoading(true);
        // Use the trims query that filters by model
        const GET_TRIMS_FOR_MODEL = `
          query GetTrimsForModel($model_id: String!) {
            CarTrim(model_id: $model_id) {
              id
              name @multiLang
              description @multiLang
              display_name
              code
              active
              model_id {
                id
                name @multiLang
                display_name
                active
                brand_id {
                  id
                  name @multiLang
                  display_name
                  active
                  logo
                }
              }
              create_date
              write_date
            }
          }
        `;
        
        const result = await gql(GET_TRIMS_FOR_MODEL, { model_id: modelId });
        if (result?.CarTrim) {
          // Process multilingual fields for filtered trims
          const processedTrims = result.CarTrim
            .filter((trim: any) => trim.active)
            .map((trim: any) => ({
              ...trim,
              name: typeof trim.name === 'object' ? trim.name.en_US || trim.name.ar_001 || 'Unnamed' : trim.name,
              description: typeof trim.description === 'object' ? trim.description.en_US || trim.description.ar_001 : trim.description,
              model_id: trim.model_id ? {
                ...trim.model_id,
                name: typeof trim.model_id.name === 'object' ? trim.model_id.name.en_US || trim.model_id.name.ar_001 : trim.model_id.name
              } : null
            }));
          setTrims(processedTrims);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trims');
        console.error('Error fetching trims for model:', modelId, err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrims();
  }, [modelId]);

  return { trims, isLoading, error };
}

// Hook for car years
export function useCarYears() {
  const [years, setYears] = useState<CarYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        setIsLoading(true);
        const result = await gql(GET_CAR_YEARS);
        if (result?.CarYear) {
          // Filter, process multilingual fields, and sort years
          const processedYears = result.CarYear
            .filter((year: any) => year.active)
            .map((year: any) => ({
              ...year,
              name: typeof year.name === 'object' ? year.name.en_US || year.name.ar_001 || 'Unnamed' : year.name,
              description: typeof year.description === 'object' ? year.description.en_US || year.description.ar_001 : year.description
            }))
            .sort((a: any, b: any) => parseInt(b.name) - parseInt(a.name));
          setYears(processedYears);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch years');
        console.error('Error fetching years:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYears();
  }, []);

  return { years, isLoading, error };
}

// Hook for car colors
export function useCarColors() {
  const [colors, setColors] = useState<CarColor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        setIsLoading(true);
        const result = await gql(GET_CAR_COLORS);
        if (result?.CarColor) {
          // Process multilingual fields
          const processedColors = result.CarColor
            .filter((color: any) => color.active)
            .map((color: any) => ({
              ...color,
              name: typeof color.name === 'object' ? color.name.en_US || color.name.ar_001 || 'Unnamed' : color.name,
              description: typeof color.description === 'object' ? color.description.en_US || color.description.ar_001 : color.description
            }));
          setColors(processedColors);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch colors');
        console.error('Error fetching colors:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchColors();
  }, []);

  return { colors, isLoading, error };
}

// Combined hook for all car data
export function useCarMasterData() {
  const brandsData = useCarBrands();
  const colorsData = useCarColors();
  const yearsData = useCarYears();

  const isLoading = brandsData.isLoading || colorsData.isLoading || yearsData.isLoading;
  const error = brandsData.error || colorsData.error || yearsData.error;

  return {
    brands: brandsData.brands,
    colors: colorsData.colors,
    years: yearsData.years,
    isLoading,
    error,
    // Individual loading states
    brandsLoading: brandsData.isLoading,
    colorsLoading: colorsData.isLoading,
    yearsLoading: yearsData.isLoading,
  };
} 