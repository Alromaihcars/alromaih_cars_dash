/**
 * AlRomaih Cars Dashboard - GraphQL Queries
 * 
 * Central export for all GraphQL query definitions
 * Note: Only queries, mutations, and types are exported to avoid conflicts
 */

// Car Related Queries - Selective exports to avoid utility function conflicts
export { 
  GET_CARS, UPDATE_CAR, CREATE_CAR, DELETE_CAR, GET_NAME_PREVIEW,
  type Car, type CarBrand, type CarModel, type CarTrim, type CarYear,
  type CarColor, type AlromaihCarValues
} from './cars'

export { 
  GET_CAR_BRANDS, GET_CAR_BRAND_BY_ID, GET_CAR_BRANDS_WITH_LOGOS,
  CREATE_CAR_BRAND, UPDATE_CAR_BRAND, DELETE_CAR_BRAND,
  UPLOAD_CAR_BRAND_LOGO, REMOVE_CAR_BRAND_LOGO,
  type CarBrandValues
} from './car-brands'

export { 
  GET_CAR_MODELS, GET_CAR_MODEL_BY_ID, CREATE_CAR_MODEL, UPDATE_CAR_MODEL, DELETE_CAR_MODEL
} from './car-models'

export { 
  GET_CAR_TRIMS, GET_CAR_TRIM_BY_ID, CREATE_CAR_TRIM, UPDATE_CAR_TRIM, DELETE_CAR_TRIM
} from './car-trims'

export { 
  GET_CAR_VARIANTS, GET_CAR_VARIANTS_BY_CAR, CREATE_CAR_VARIANT, UPDATE_CAR_VARIANT, DELETE_CAR_VARIANT
} from './car-variants'

export { 
  GET_CAR_COLORS, GET_CAR_COLOR_BY_ID, CREATE_CAR_COLOR, UPDATE_CAR_COLOR, DELETE_CAR_COLOR
} from './car-colors'

export { 
  GET_CAR_YEARS, GET_CAR_YEAR_BY_ID, CREATE_CAR_YEAR, UPDATE_CAR_YEAR, DELETE_CAR_YEAR
} from './car-years'

export { 
  GET_CAR_OFFERS, GET_CAR_OFFER_BY_ID, GET_ACTIVE_CAR_OFFERS, GET_CAR_OFFERS_BY_DATE_RANGE,
  CREATE_CAR_OFFER, UPDATE_CAR_OFFER, DELETE_CAR_OFFER, PERMANENTLY_DELETE_CAR_OFFER, REACTIVATE_CAR_OFFER,
  UPLOAD_CAR_OFFER_BANNER, REMOVE_CAR_OFFER_BANNER, GET_CARS_FOR_DROPDOWN
} from './car-offers'

export { 
  GET_CAR_MEDIA, GET_CAR_MEDIA_BY_ID, CREATE_CAR_MEDIA, UPDATE_CAR_MEDIA, DELETE_CAR_MEDIA
} from './car-media'

// Specification Queries
export { 
  GET_PRODUCT_ATTRIBUTES, CREATE_PRODUCT_ATTRIBUTE, UPDATE_PRODUCT_ATTRIBUTE, DELETE_PRODUCT_ATTRIBUTE
} from './specification-attributes'

export { 
  GET_PRODUCT_ATTRIBUTE_VALUES, CREATE_PRODUCT_ATTRIBUTE_VALUE, UPDATE_PRODUCT_ATTRIBUTE_VALUE, DELETE_PRODUCT_ATTRIBUTE_VALUE
} from './specification-attribute-values'

export { 
  GET_PRODUCT_ATTRIBUTE_CATEGORIES, CREATE_PRODUCT_ATTRIBUTE_CATEGORY, UPDATE_PRODUCT_ATTRIBUTE_CATEGORY, DELETE_PRODUCT_ATTRIBUTE_CATEGORY
} from './specification-categories'

export { 
  GET_SPECIFICATION_TEMPLATES, GET_SPECIFICATION_TEMPLATE_BY_ID, CREATE_SPECIFICATION_TEMPLATE, UPDATE_SPECIFICATION_TEMPLATE, DELETE_SPECIFICATION_TEMPLATE
} from './specification-templates'

export { 
  GET_SPECIFICATION_TEMPLATE_LINES, CREATE_TEMPLATE_LINE, UPDATE_TEMPLATE_LINE, DELETE_TEMPLATE_LINE
} from './specification-template-lines'

export { 
  GET_PRODUCT_ATTRIBUTE_UNITS, CREATE_PRODUCT_ATTRIBUTE_UNIT, UPDATE_PRODUCT_ATTRIBUTE_UNIT, DELETE_PRODUCT_ATTRIBUTE_UNIT
} from './specification-units'

// System Queries
export { 
  GET_SYSTEM_SETTINGS, UPDATE_SYSTEM_SETTINGS
} from './system-settings'

// Utility functions from car-brands (as the main utility source)
export { 
  convertToTranslations, convertFromTranslations, 
  getDisplayName, getDisplayDescription, 
  fetchGraphQL, createCarBrandValues
} from './car-brands'