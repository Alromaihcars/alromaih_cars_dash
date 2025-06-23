"use client"

import { useState, useCallback, useEffect } from "react"
import { 
  CREATE_CAR, 
  UPDATE_CAR,
  GET_NAME_PREVIEW,
  type CarFormData as CarData, 
  type CarCreateValues,
  type Car 
} from '@/lib/api/queries/cars'
import { gql, gqlMutate } from '@/lib/api'

export interface CarFormData {
  // Basic Info
  name: string
  description: string
  status: "Draft" | "In Review" | "Approved" | "Published" | "Archived"
  language: "English" | "العربية"
  active: boolean
  is_featured: boolean
  sequence: number

  // Car Configuration
  brand_id: string
  model_id: string
  trim_id: string
  year_id: number | null
  color_ids: string[]
  variant: string

  // Pricing
  cash_price: number
  vat_percentage: number
  finance_price: number
  insurance_price: number
  registration_fee: number

  // Media
  images: File[]
  thumbnail: string | null

  // Specifications
  specifications: Record<string, any>
}

export interface CarFormState {
  data: CarFormData
  isLoading: boolean
  isSaving: boolean
  isDirty: boolean
  errors: Record<string, string>
  completionPercentage: number
}

const initialFormData: CarFormData = {
  name: "",
  description: "",
  status: "Draft",
  language: "English",
  active: true,
  is_featured: false,
  sequence: 10,
  brand_id: "",
  model_id: "",
  trim_id: "",
  year_id: null,
  color_ids: [],
  variant: "",
  cash_price: 0,
  vat_percentage: 15,
  finance_price: 0,
  insurance_price: 0,
  registration_fee: 0,
  images: [],
  thumbnail: null,
  specifications: {},
}

interface CarFormErrors {
  brand_id?: string;
  model_id?: string;
  trim_id?: string;
  year_id?: string;
  color_ids?: string;
  cash_price?: string;
  finance_price?: string;
  vat_percentage?: string;
  [key: string]: string | undefined;
}

interface UseCarFormOptions {
  carId?: string;
  initialData?: Partial<CarData>;
  onSuccess?: (car: Car) => void;
  onError?: (error: string) => void;
}

export function useCarForm(options: UseCarFormOptions = {}) {
  const { carId, initialData, onSuccess, onError } = options;

  // Form data state
  const [data, setData] = useState<CarData>({
    brand_id: '',
    model_id: '',
    trim_id: '',
    year_id: '',
    color_ids: [],
    primary_color_id: '',
    cash_price: 0,
    finance_price: 0,
    vat_percentage: 15.0,
    status: 'draft',
    active: true,
    is_featured: false,
    sequence: 10,
    ...initialData
  });

  // Form state
  const [errors, setErrors] = useState<CarFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [previewName, setPreviewName] = useState('New Car');

  // Validation rules
  const validateField = useCallback((field: string, value: any): string | undefined => {
    switch (field) {
      case 'brand_id':
        return !value ? 'Brand is required' : undefined;
      case 'model_id':
        return !value ? 'Model is required' : undefined;
      case 'trim_id':
        return !value ? 'Trim is required' : undefined;
      case 'year_id':
        return !value ? 'Year is required' : undefined;
      case 'cash_price':
        return value < 0 ? 'Cash price must be positive' : undefined;
      case 'finance_price':
        return value < 0 ? 'Finance price must be positive' : undefined;
      case 'vat_percentage':
        return (value < 0 || value > 100) ? 'VAT must be between 0 and 100' : undefined;
      default:
        return undefined;
    }
  }, []);

  // Validate all fields
  const validateForm = useCallback((): boolean => {
    const newErrors: CarFormErrors = {};
    
    // Validate required fields
    Object.entries(data).forEach(([field, value]) => {
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
      }
    });

    // Additional validation
    if (data.color_ids.length === 0) {
      newErrors.color_ids = 'At least one color must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [data, validateField]);

  // Calculate completion percentage
  const completionPercentage = useCallback((): number => {
    const requiredFields = ['brand_id', 'model_id', 'trim_id', 'year_id'];
    const optionalFields = ['color_ids', 'cash_price', 'finance_price'];
    
    let completed = 0;
    let total = requiredFields.length + optionalFields.length;

    // Check required fields
    requiredFields.forEach(field => {
      if (data[field as keyof CarData]) completed++;
    });

    // Check optional fields
    if (data.color_ids.length > 0) completed++;
    if ((data.cash_price || 0) > 0) completed++;
    if ((data.finance_price || 0) > 0) completed++;

    return Math.round((completed / total) * 100);
  }, [data]);

  // Update data with validation
  const updateData = useCallback((updates: Partial<CarData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      
      // Clear dependent fields when parent changes
      if ('brand_id' in updates && updates.brand_id !== prev.brand_id) {
        newData.model_id = '';
        newData.trim_id = '';
        newData.color_ids = [];
        newData.primary_color_id = '';
      }
      
      if ('model_id' in updates && updates.model_id !== prev.model_id) {
        newData.trim_id = '';
      }

      // Auto-set primary color if colors change
      if ('color_ids' in updates) {
        if (updates.color_ids && updates.color_ids.length > 0) {
          // If primary color is not in the selected colors, set the first one as primary
          if (!updates.color_ids.includes(newData.primary_color_id || '')) {
            newData.primary_color_id = updates.color_ids[0];
          }
        } else {
          newData.primary_color_id = '';
        }
      }

      return newData;
    });
    
    setIsDirty(true);
    
    // Clear field-specific errors when field is updated
    if (Object.keys(updates).length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        Object.keys(updates).forEach(field => {
          delete newErrors[field];
        });
        return newErrors;
      });
    }
  }, []);

  // Update name preview when key fields change
  useEffect(() => {
    const updateNamePreview = async () => {
      if (data.brand_id && data.model_id && data.trim_id && data.year_id) {
        try {
          const result = await gql(GET_NAME_PREVIEW, {
            brand_id: data.brand_id,
            model_id: data.model_id,
            trim_id: data.trim_id,
            year_id: data.year_id,
            primary_color_id: data.primary_color_id || '',
            status: data.status || 'draft',
            is_featured: data.is_featured || false
          });
          
          if (result?.AlromaihCar?.[0]?.name) {
            setPreviewName(result.AlromaihCar[0].name);
          }
        } catch (error) {
          console.warn('Failed to get name preview:', error);
        }
      } else {
        setPreviewName('New Car');
      }
    };

    updateNamePreview();
  }, [data.brand_id, data.model_id, data.trim_id, data.year_id, data.primary_color_id, data.status, data.is_featured]);

  // Convert form data to Odoo format
  const prepareCarData = useCallback((formData: CarData): CarCreateValues => {
    return {
      brand_id: formData.brand_id,
      model_id: formData.model_id,
      trim_id: formData.trim_id,
      year_id: formData.year_id,
      color_ids: formData.color_ids.length > 0 ? [[6, 0, formData.color_ids]] : [],
      primary_color_id: formData.primary_color_id || undefined,
      cash_price: formData.cash_price || 0,
      finance_price: formData.finance_price || 0,
      vat_percentage: formData.vat_percentage || 15.0,
      status: formData.status || 'draft',
      active: formData.active !== false,
      is_featured: formData.is_featured || false,
      sequence: formData.sequence || 10
    };
  }, []);

  // Save form (create or update)
  const saveForm = useCallback(async () => {
    console.log('💾 Starting car save process...')
    console.log('📋 Current form data:', data)
    console.log('✅ Form validation status:', { errors, isValid: Object.keys(errors).length === 0 })
    
    if (!validateForm()) {
      console.log('❌ Form validation failed:', errors)
      return {
        success: false,
        message: 'Please fix validation errors before saving'
      };
    }

    setIsSaving(true);
    
    try {
      const carData = prepareCarData(data);
      console.log('🚗 Prepared car data for Odoo:', carData)
      
      let result;
      let mutation;
      let variables;

      if (carId) {
        // Update existing car
        mutation = UPDATE_CAR;
        variables = { id: carId, values: carData };
        console.log('🔄 Updating existing car with mutation:', mutation)
        console.log('📤 Update variables:', variables)
        result = await gqlMutate(UPDATE_CAR, variables);
      } else {
        // Create new car
        mutation = CREATE_CAR;
        variables = { values: carData };
        console.log('✨ Creating new car with mutation:', mutation)
        console.log('📤 Create variables:', variables)
        result = await gqlMutate(CREATE_CAR, variables);
      }
      
      console.log('📥 GraphQL response:', result)

      if (result?.AlromaihCar?.[0]) {
        const savedCar = result.AlromaihCar[0];
        setIsDirty(false);
        
        if (onSuccess) {
          onSuccess(savedCar);
        }

        return {
          success: true,
          message: carId ? 'Car updated successfully' : 'Car created successfully',
          data: savedCar
        };
      } else {
        throw new Error('No data returned from server');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save car';
      
      if (onError) {
        onError(errorMessage);
      }

      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsSaving(false);
    }
  }, [data, carId, validateForm, prepareCarData, onSuccess, onError]);

  // Reset form
  const resetForm = useCallback(() => {
    setData({
      brand_id: '',
      model_id: '',
      trim_id: '',
      year_id: '',
      color_ids: [],
      primary_color_id: '',
      cash_price: 0,
      finance_price: 0,
      vat_percentage: 15.0,
      status: 'draft',
      active: true,
      is_featured: false,
      sequence: 10,
      ...initialData
    });
    setErrors({});
    setIsDirty(false);
    setPreviewName('New Car');
  }, [initialData]);

  // Load existing car data (if editing)
  useEffect(() => {
    // This would load existing car data when carId is provided
    // Implementation would fetch car data and populate the form
    if (carId && !initialData) {
      // TODO: Implement car loading
      console.log('Loading car:', carId);
    }
  }, [carId, initialData]);

  return {
    // Data
    data: { ...data, name: previewName },
    errors,
    previewName,
    
    // State
    isLoading,
    isSaving,
    isDirty,
    isValid: Object.keys(errors).length === 0 && completionPercentage() >= 80,
    completionPercentage: completionPercentage(),
    
    // Actions
    updateData,
    saveForm,
    resetForm,
    validateForm,
    
    // Helpers
    getFieldError: (field: string) => errors[field],
    hasFieldError: (field: string) => !!errors[field],
  };
}
