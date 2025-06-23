// API Configuration with secure environment variable handling
export const API_CONFIG = {
  // Odoo GraphQL API URL
  ODOO_URL: process.env.NEXT_PUBLIC_ODOO_URL || 'https://portal.alromaihcars.com',
  
  // API Key for authentication - SERVER SIDE ONLY
  API_KEY: process.env.API_KEY || '', // Removed hardcoded key - must be set in environment
  
  // Database name (optional for multi-database setups)
  DATABASE: process.env.NEXT_PUBLIC_ODOO_DB || 'alromaih_cars',
  
  // Authentication method
  AUTH_METHOD: process.env.NEXT_PUBLIC_AUTH_METHOD || 'apikey',
  
  // GraphQL endpoint path
  GRAPHQL_PATH: '/graphql',
  
  // Default pagination limits
  DEFAULT_LIMIT: 100,
  DEFAULT_OFFSET: 0,
  
  // Image URL patterns
  IMAGE_URL_PATTERN: '/web/image/{model}/{id}/{field}',
  
  // Supported languages
  SUPPORTED_LANGUAGES: ['en_US', 'ar_SA'],
  
  // Default language
  DEFAULT_LANGUAGE: 'en_US'
}

// Validation function to ensure required environment variables are set
export const validateConfig = () => {
  const errors: string[] = []
  
  if (!API_CONFIG.API_KEY && typeof window === 'undefined') {
    // Only check API key on server side
    errors.push('API_KEY environment variable is required but not set')
  }
  
  if (!API_CONFIG.ODOO_URL) {
    errors.push('NEXT_PUBLIC_ODOO_URL environment variable is required')
  }
  
  if (errors.length > 0) {
    console.error('Configuration errors:', errors)
    throw new Error(`Configuration validation failed: ${errors.join(', ')}`)
  }
}

// Helper functions
export const getImageUrl = (model: string, id: string, field: string = 'image') => {
  return `${API_CONFIG.ODOO_URL}${API_CONFIG.IMAGE_URL_PATTERN
    .replace('{model}', model)
    .replace('{id}', id)
    .replace('{field}', field)}`
}

export const getGraphQLUrl = () => {
  return `${API_CONFIG.ODOO_URL}${API_CONFIG.GRAPHQL_PATH}`
}

// Server-side only function to get API key
export const getServerApiKey = (): string => {
  if (typeof window !== 'undefined') {
    throw new Error('API key should not be accessed on client side')
  }
  
  const apiKey = process.env.API_KEY
  if (!apiKey) {
    throw new Error('API_KEY environment variable is not configured')
  }
  
  return apiKey
} 