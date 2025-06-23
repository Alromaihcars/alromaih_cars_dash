// Enhanced Car Types based on MCP Odoo GraphQL Analysis
// AlromaihCar model has 85 fields total

export interface AlromaihCarBase {
  // Core Identity Fields
  id: string
  name: string
  suggested_name?: string
  description?: string
  display_name: string

  // SEO & Meta Fields
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  seo_url_slug?: string
  seo_canonical_url?: string
  seo_og_title?: string
  seo_og_description?: string
  seo_og_image?: string
  auto_meta_title?: string
  auto_meta_description?: string
  auto_seo_keywords?: string

  // Car Hierarchy Relationships
  brand_id?: AlromaihCarBrand
  model_id?: AlromaihCarModel
  trim_id?: AlromaihCarTrim
  year_id?: AlromaihCarYear
  
  // Variant & Color Relationships
  variant_ids?: AlromaihCarVariant[]
  primary_variant_id?: AlromaihCarVariant
  color_ids?: AlromaihCarColor[]
  primary_color_id?: AlromaihCarColor
  color_index?: string

  // Pricing & Finance
  cash_price?: number
  vat_percentage?: number
  cash_price_with_vat?: number
  finance_price?: number

  // Offers & Promotions
  offer_ids?: AlromaihCarOffer[]
  has_active_offer?: boolean

  // Specifications
  specification_ids?: AlromaihCarSpecification[]
  specification_template_id?: AlromaihCarSpecificationTemplate
  specification_categories?: any
  specifications_by_category?: any
  total_specifications?: number
  filled_specifications?: number
  specification_completion?: number
  key_specification_ids?: AlromaihCarSpecification[]

  // Media & Assets
  media_ids?: AlromaihCarMedia[]
  media_count_by_type?: any
  thumbnail?: string

  // Status & Display
  active: boolean
  sequence?: number
  is_featured?: boolean
  status: 'draft' | 'published' | 'out_of_stock' | 'discontinued' | 'coming_soon'
  current_form_language?: string

  // System & Audit Fields
  create_uid?: any
  create_date: string
  write_uid?: any
  write_date: string

  // Activity & Workflow Fields
  activity_ids?: any[]
  activity_state?: 'overdue' | 'today' | 'planned' | false
  activity_user_id?: any
  activity_type_id?: any
  activity_type_icon?: string
  activity_date_deadline?: string
  my_activity_date_deadline?: string
  activity_summary?: string
  activity_exception_decoration?: string
  activity_exception_icon?: string
  activity_calendar_event_id?: any

  // Messaging & Collaboration
  message_is_follower?: boolean
  message_follower_ids?: any[]
  message_partner_ids?: any[]
  message_ids?: any[]
  has_message?: boolean
  message_needaction?: boolean
  message_needaction_counter?: number
  message_has_error?: boolean
  message_has_error_counter?: number
  message_attachment_count?: number
  website_message_ids?: any[]
  message_has_sms_error?: boolean

  // Company Context
  company_id?: any
}

export interface AlromaihCarBrand {
  id: string
  name: string
  logo?: string
  active?: boolean
  sequence?: number
  description?: string
  country_id?: any
  website_url?: string
  create_date?: string
  write_date?: string
}

export interface AlromaihCarModel {
  id: string
  name: string
  brand_id?: AlromaihCarBrand
  active?: boolean
  sequence?: number
  description?: string
  body_type?: string
  fuel_type?: string
  transmission_type?: string
  create_date?: string
  write_date?: string
}

export interface AlromaihCarTrim {
  id: string
  name: string
  model_id?: AlromaihCarModel
  active?: boolean
  sequence?: number
  description?: string
  trim_level?: string
  create_date?: string
  write_date?: string
}

export interface AlromaihCarYear {
  id: string
  name: string
  year: number
  active?: boolean
  is_current?: boolean
  create_date?: string
  write_date?: string
}

export interface AlromaihCarVariant {
  id: string
  name: string
  model_id?: AlromaihCarModel
  active?: boolean
  sequence?: number
  description?: string
  engine_size?: string
  horsepower?: number
  torque?: number
  drivetrain?: string
  create_date?: string
  write_date?: string
}

export interface AlromaihCarColor {
  id: string
  name: string
  color_picker?: string
  color_code?: string
  active?: boolean
  sequence?: number
  is_metallic?: boolean
  is_premium?: boolean
  additional_cost?: number
  create_date?: string
  write_date?: string
}

export interface AlromaihCarOffer {
  id: string
  name: string
  discount_percentage?: number
  discount_amount?: number
  start_date?: string
  end_date?: string
  active: boolean
  offer_type?: string
  terms_conditions?: string
  create_date?: string
  write_date?: string
}

export interface AlromaihCarSpecification {
  id: string
  name: string
  category_id?: AlromaihCarSpecificationCategory
  attribute_id?: AlromaihCarSpecificationAttribute
  car_id?: string
  value_text?: string
  value_number?: number
  value_boolean?: boolean
  value_selection?: string
  unit_id?: any
  is_key_spec?: boolean
  sequence?: number
  create_date?: string
  write_date?: string
}

export interface AlromaihCarSpecificationCategory {
  id: string
  name: string
  sequence?: number
  icon?: string
  active?: boolean
  create_date?: string
  write_date?: string
}

export interface AlromaihCarSpecificationAttribute {
  id: string
  name: string
  category_id?: AlromaihCarSpecificationCategory
  type: 'text' | 'number' | 'boolean' | 'selection'
  unit_id?: any
  selection_options?: string
  is_required?: boolean
  is_key_attribute?: boolean
  sequence?: number
  active?: boolean
  create_date?: string
  write_date?: string
}

export interface AlromaihCarSpecificationTemplate {
  id: string
  name: string
  description?: string
  active?: boolean
  create_date?: string
  write_date?: string
}

export interface AlromaihCarMedia {
  id: string
  name: string
  media_type: 'image' | 'video' | '360_view' | 'brochure' | 'manual'
  file_url?: string
  thumbnail_url?: string
  car_id?: string
  sequence?: number
  is_primary?: boolean
  alt_text?: string
  caption?: string
  file_size?: number
  mime_type?: string
  active?: boolean
  create_date?: string
  write_date?: string
}

// Enhanced Type Exports
export type AlromaihCar = AlromaihCarBase
export type Car = AlromaihCar // Alias for backward compatibility

// Form Data Types
export interface CarFormData {
  name?: string
  suggested_name?: string
  description?: string
  
  // Relationships (stored as IDs in form)
  brand_id: string
  model_id: string
  trim_id: string
  year_id: string
  variant_ids: string[]
  primary_variant_id: string
  color_ids: string[]
  primary_color_id: string
  
  // Pricing
  cash_price: number
  vat_percentage: number
  finance_price: number
  
  // Status
  active: boolean
  is_featured: boolean
  status: 'draft' | 'published' | 'out_of_stock' | 'discontinued' | 'coming_soon'
  sequence?: number
  
  // SEO
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  seo_url_slug?: string
}

// API Response Types
export interface CarQueryResponse {
  AlromaihCar: AlromaihCar[]
  pageInfo?: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor?: string
    endCursor?: string
  }
}

export interface CarMutationResponse {
  car: AlromaihCar
  success: boolean
  message?: string
  errors?: string[]
}

// Utility Types
export type CarStatus = AlromaihCar['status']
export type MediaType = AlromaihCarMedia['media_type']
export type SpecificationType = AlromaihCarSpecificationAttribute['type']

// Filter Types
export interface CarFilters {
  search?: string
  brand_ids?: string[]
  model_ids?: string[]
  year_ids?: string[]
  status?: CarStatus[]
  price_min?: number
  price_max?: number
  is_featured?: boolean
  active?: boolean
  has_offers?: boolean
}

// Sort Options
export type CarSortField = 'name' | 'create_date' | 'write_date' | 'cash_price' | 'sequence'
export type SortDirection = 'asc' | 'desc'

export interface CarSortOptions {
  field: CarSortField
  direction: SortDirection
} 