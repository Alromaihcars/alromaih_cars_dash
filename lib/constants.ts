// Constants for the Alromaih Cars Dashboard
export const BRAND_COLORS = {
  primary: "#1a365d",
  secondary: "#2d3748",
  accent: "#3182ce",
  success: "#38a169",
  warning: "#d69e2e",
  error: "#e53e3e",
  info: "#3182ce",
} as const

export const CAR_STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "gray" },
  { value: "published", label: "Published", color: "green" },
  { value: "archived", label: "Archived", color: "red" },
] as const

export const STOCK_STATUS_OPTIONS = [
  { value: "in_stock", label: "In Stock", color: "green" },
  { value: "out_of_stock", label: "Out of Stock", color: "red" },
  { value: "pre_order", label: "Pre Order", color: "yellow" },
] as const

export const MEDIA_TYPES = [
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "engine", label: "Engine" },
  { value: "features", label: "Features" },
  { value: "brochure", label: "Brochure" },
] as const

export const CONTENT_TYPES = [
  { value: "image", label: "Image" },
  { value: "video", label: "Video" },
  { value: "document", label: "Document" },
] as const

export const DISCOUNT_TYPES = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
] as const

export const API_ENDPOINTS = {
  GRAPHQL: "/odoo/graphqldocdata",
  UPLOAD: "/odoo/graphqldocdata/upload",
} as const

export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const
