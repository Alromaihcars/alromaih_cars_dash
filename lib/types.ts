// Core Types for Alromaih Cars Dashboard
export interface Car {
  id: string
  name: string
  status: "draft" | "published" | "archived"
  cash_price: number
  cash_price_with_vat: number
  finance_price: number
  vat_percentage: number
  is_featured: boolean
  has_active_offer: boolean
  specification_completion: number
  active: boolean
  sequence: number
  thumbnail?: string
  brand_id: Brand
  model_id: CarModel
  trim_id: CarTrim
  year_id: CarYear
  primary_color_id: CarColor
  primary_variant_id?: CarVariant
  specification_ids: CarSpecification[]
  media_ids: CarMedia[]
  offer_ids: CarOffer[]
  variant_ids: CarVariant[]
}

export interface Brand {
  id: string
  name: string
  description?: string
  logo?: string
  website?: string
  country_of_origin?: string
  established_year?: number
  active: boolean
  sequence: number
}

export interface CarModel {
  id: string
  name: string
  description?: string
  brand_id: Brand
}

export interface CarTrim {
  id: string
  name: string
  description?: string
}

export interface CarYear {
  id: string
  name: string
  year_value: number
}

export interface CarColor {
  id: string
  name: string
  color_code: string
  color_picker?: string
}

export interface CarVariant {
  id: string
  name: string
  color_id: CarColor
  price: number
  stock_status: "in_stock" | "out_of_stock" | "pre_order"
  qty_available: number
  is_primary: boolean
  description?: string
  media_ids?: CarMedia[]
}

export interface CarSpecification {
  id: string
  attribute_id: SpecificationAttribute
  attribute_value_id?: SpecificationValue
  custom_value?: string
  display_value: string
  is_highlighted: boolean
  is_public: boolean
  sequence: number
}

export interface SpecificationAttribute {
  id: string
  name: string
  type: string
  category_id?: SpecificationCategory
}

export interface SpecificationCategory {
  id: string
  name: string
  sequence: number
}

export interface SpecificationValue {
  id: string
  name: string
}

export interface CarMedia {
  id: string
  name: string
  media_type: "exterior" | "interior" | "engine" | "features" | "brochure"
  content_type: "image" | "video" | "document"
  is_primary: boolean
  is_featured: boolean
  is_public: boolean
  video_url?: string
  external_link?: string
  description?: string
  alt_text?: string
  sequence: number
  file_size?: number
  mime_type?: string
  dimensions?: string
  website_visible: boolean
  seo_title?: string
  seo_description?: string
}

export interface CarOffer {
  id: string
  name: string
  description?: string
  discount_type: "percentage" | "fixed"
  discount_value: number
  original_price: number
  final_price: number
  start_date: string
  end_date: string
  is_active: boolean
  offer_tag?: string
  apply_to_all_variants: boolean
}

export interface DashboardStats {
  totalCars: number
  totalBrands: number
  totalOffers: number
  totalVariants: number
  featuredCars: number
  publishedCars: number
  draftCars: number
  activeOffers: number
  totalRevenue: number
  monthlyRevenue: number
}

export interface ApiResponse<T> {
  data: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
    extensions?: {
      code: string
      field?: string
    }
  }>
}
