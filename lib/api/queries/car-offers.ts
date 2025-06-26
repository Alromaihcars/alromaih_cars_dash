// Car Offer GraphQL queries and mutations
import { gql, gqlMutate } from '@/lib/api'
import { useState, useEffect } from 'react'

// Types matching the GraphQL schema
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

export interface CarOffer {
  id: string;
  name: MultilingualFieldData;
  description?: MultilingualFieldData;
  display_name?: string;
  offer_tag?: string;
  original_price?: number;
  final_price?: number;
  discount_value?: number;
  discount_type?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  banner_url?: string;
  primary_banner_id?: {
    id: string;
    name?: string;
  };
  banner_media_ids?: Array<{
    id: string;
    name?: string;
    external_url?: string;
    is_primary?: boolean;
  }>;
  car_id?: {
    id: string;
    name?: MultilingualFieldData;
  };
  create_date?: string;
  write_date?: string;
}

export interface CarOfferValues {
  name_translations?: TranslationObject;
  description_translations?: TranslationObject;
  offer_tag?: string;
  original_price?: number;
  final_price?: number;
  discount_value?: number;
  discount_type?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  car_id?: number;
}

// GraphQL Queries
export const GET_CAR_OFFERS = `
  query GetCarOffers {
    AlromaihCarOffer {
      id
      name @multiLang
      offer_tag
      original_price
      start_date
      write_date
      final_price
      is_active
      end_date
      display_name
      discount_value
      discount_type
      description @multiLang
      create_date
      banner_url
      primary_banner_id {
        id
        name
      }
      banner_media_ids {
        id
        name
        external_url
        is_primary
      }
      car_id {
        id
        name @multiLang
      }
    }
  }
`;

export const CREATE_CAR_OFFER = `
  mutation CreateCarOffer($values: CarOfferValues!) {
    AlromaihCarOffer(CarOfferValues: $values) {
      id
      name @multiLang
      offer_tag
      original_price
      start_date
      final_price
      is_active
      end_date
      display_name
      discount_value
      discount_type
      description @multiLang
      banner_url
      primary_banner_id {
        id
        name
      }
      car_id {
        id
        name @multiLang
      }
    }
  }
`;

export const UPDATE_CAR_OFFER = `
  mutation UpdateCarOffer($id: String!, $values: CarOfferValues!) {
    AlromaihCarOffer(id: $id, CarOfferValues: $values) {
      id
      name @multiLang
      offer_tag
      original_price
      start_date
      final_price
      is_active
      end_date
      display_name
      discount_value
      discount_type
      description @multiLang
      banner_url
      primary_banner_id {
        id
        name
      }
      car_id {
        id
        name @multiLang
      }
    }
  }
`;

export const DELETE_CAR_OFFER = `
  mutation DeleteCarOffer($id: String!) {
    AlromaihCarOffer(id: $id, CarOfferValues: { is_active: false }) {
      id
      name @multiLang
      display_name
      is_active
    }
  }
`;

export const GET_CARS_FOR_DROPDOWN = `
  query GetCarsForDropdown {
    AlromaihCar(active: true) {
      id
      name @multiLang
      display_name
      active
    }
  }
`;

// Get car offer by ID
export const GET_CAR_OFFER_BY_ID = `
  query GetCarOfferById($id: String!) {
    AlromaihCarOffer(id: $id) {
      id
      name @multiLang
      description @multiLang
      display_name
      offer_tag
      original_price
      final_price
      discount_value
      discount_type
      start_date
      end_date
      is_active
      banner_url
      primary_banner_id {
        id
        name
      }
      banner_media_ids {
        id
        name
        external_url
        is_primary
      }
      create_date
      write_date
      car_id {
        id
        name @multiLang
      }
    }
  }
`;

// Get active offers only
export const GET_ACTIVE_CAR_OFFERS = `
  query GetActiveCarOffers {
    AlromaihCarOffer(domain: "is_active=true") {
      id
      name @multiLang
      description @multiLang
      display_name
      offer_tag
      original_price
      final_price
      discount_value
      discount_type
      start_date
      end_date
      is_active
      banner_url
      primary_banner_id {
        id
        name
      }
      car_id {
        id
        name @multiLang
      }
    }
  }
`;

// Get offers by date range
export const GET_CAR_OFFERS_BY_DATE_RANGE = `
  query GetCarOffersByDateRange($start_date: String!, $end_date: String!) {
    AlromaihCarOffer(domain: ["start_date", "<=", $end_date], domain2: ["end_date", ">=", $start_date]) {
      id
      name @multiLang
      description @multiLang
      display_name
      offer_tag
      original_price
      final_price
      discount_value
      discount_type
      start_date
      end_date
      is_active
      banner_url
      primary_banner_id {
        id
        name
      }
      car_id {
        id
        name @multiLang
      }
    }
  }
`;

// Permanently delete car offer (use with caution)
export const PERMANENTLY_DELETE_CAR_OFFER = `
  mutation PermanentlyDeleteCarOffer($id: String!) {
    deleteAlromaihCarOffer(id: $id) {
      id
      name @multiLang
      display_name
    }
  }
`;

// Reactivate car offer
export const REACTIVATE_CAR_OFFER = `
  mutation ReactivateCarOffer($id: String!) {
    AlromaihCarOffer(id: $id, CarOfferValues: { is_active: true }) {
      id
      name @multiLang
      display_name
      is_active
    }
  }
`;

// Utility functions
export const getLocalizedText = (field: MultilingualFieldData): string => {
  if (!field) return ""
  if (typeof field === "string") return field
  if (typeof field === "object" && field !== null) {
    return field.en_US || field.ar_001 || Object.values(field)[0] || ""
  }
  return String(field)
}

export const convertToTranslations = (data: MultilingualFieldData): TranslationObject => {
  if (typeof data === 'string') {
    return {
      en_US: data,
      ar_001: data
    }
  }
  if (typeof data === 'object' && data !== null) {
    return data as TranslationObject
  }
  return { en_US: '', ar_001: '' }
}

export const createCarOfferValues = (
  name: MultilingualFieldData,
  description?: MultilingualFieldData,
  offer_tag?: string,
  discount_type?: string,
  discount_value?: number,
  start_date?: string,
  end_date?: string,
  is_active?: boolean,
  car_id?: number
): CarOfferValues => {
  const nameTranslations = convertToTranslations(name)
  const descriptionTranslations = description ? convertToTranslations(description) : undefined

  const values: CarOfferValues = {
    name_translations: nameTranslations,
    description_translations: descriptionTranslations,
    offer_tag: offer_tag || 'special',
    discount_type: discount_type || 'fixed',
    discount_value: discount_value || 0,
    start_date,
    end_date,
    is_active: is_active !== false,
    car_id
  }

  return values
}

export const getDisplayName = (offer: CarOffer | undefined | null, languageCode?: string): string => {
  if (!offer) return ''
  
  // Try display_name first
  if (offer.display_name) return offer.display_name
  
  // Then try multilingual name
  if (offer.name) {
    const name = offer.name
    if (typeof name === 'string') return name
    if (typeof name === 'object' && name !== null) {
      const targetLang = languageCode || 'en_US'
      return name[targetLang] || name.en_US || name.ar_001 || Object.values(name)[0] || ''
    }
  }
  
  return `Offer ${offer.id}`
}

export const getDisplayDescription = (offer: CarOffer | undefined | null, languageCode?: string): string => {
  if (!offer?.description) return ''
  
  const description = offer.description
  if (typeof description === 'string') return description
  if (typeof description === 'object' && description !== null) {
    const targetLang = languageCode || 'en_US'
    return description[targetLang] || description.en_US || description.ar_001 || Object.values(description)[0] || ''
  }
  
  return ''
}

export const formatOfferPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export const getOfferStatus = (offer: CarOffer): 'active' | 'expired' | 'upcoming' => {
  const now = new Date()
  const startDate = new Date(offer.start_date)
  const endDate = new Date(offer.end_date)
  
  if (now < startDate) return 'upcoming'
  if (now > endDate) return 'expired'
  return 'active'
}

export const isOfferActive = (offer: CarOffer): boolean => {
  return offer.is_active && getOfferStatus(offer) === 'active'
}

export const getOfferTagColor = (tag: string) => {
  switch (tag) {
    case 'hot_deal': return 'bg-red-100 text-red-800 border-red-200'
    case 'clearance': return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'limited': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'special': return 'bg-blue-100 text-blue-800 border-blue-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const getOfferTagIcon = (tag: string) => {
  switch (tag) {
    case 'hot_deal': return '🔥'
    case 'clearance': return '💥'
    case 'limited': return '⏰'
    case 'special': return '⭐'
    default: return '🏷️'
  }
}

// Get the primary banner URL for an offer
export const getOfferBannerUrl = (offer: CarOffer): string | null => {
  // First try the computed banner_url field
  if (offer.banner_url) {
    return offer.banner_url
  }
  
  // Then try to find a primary banner in banner_media_ids
  if (offer.banner_media_ids && offer.banner_media_ids.length > 0) {
    const primaryBanner = offer.banner_media_ids.find(media => media.is_primary)
    if (primaryBanner?.external_url) {
      return primaryBanner.external_url
    }
    
    // If no primary banner, use the first one
    if (offer.banner_media_ids[0]?.external_url) {
      return offer.banner_media_ids[0].external_url
    }
  }
  
  return null
}

// Hook for using car offers
export const useCarOffers = () => {
  const fetchOffers = async () => {
    const data = await gql(GET_CAR_OFFERS)
    return data?.AlromaihCarOffer || []
  }

  const fetchCars = async () => {
    const data = await gql(GET_CARS_FOR_DROPDOWN)
    return data?.AlromaihCar || []
  }

  const createOffer = async (values: CarOfferValues) => {
    return await gqlMutate(CREATE_CAR_OFFER, { values })
  }

  const updateOffer = async (id: string, values: CarOfferValues) => {
    return await gqlMutate(UPDATE_CAR_OFFER, { id, values })
  }

  const deleteOffer = async (id: string) => {
    return await gqlMutate(DELETE_CAR_OFFER, { id })
  }

  return {
    fetchOffers,
    fetchCars,
    createOffer,
    updateOffer,
    deleteOffer
  }
}