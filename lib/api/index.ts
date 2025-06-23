/**
 * AlRomaih Cars Dashboard - API Module
 * 
 * 🎯 Unified GraphQL Client - One client to rule them all!
 * 
 * ✨ Features:
 * - 🔒 Automatic security (API keys only server-side)
 * - 🌐 Universal (works everywhere)
 * - 💾 Smart caching with TTL
 * - 🔄 Retry logic with exponential backoff
 * - 📊 Performance monitoring
 * - 🎯 Full TypeScript support
 * - 📁 File upload support
 * - 🌍 Automatic language detection
 */

// ========================================
// 🚀 UNIFIED GRAPHQL CLIENT (Use this everywhere!)
// ========================================

export { 
  // Main client instance
  graphqlClient,
  
  // Convenience functions (recommended)
  query,           // For queries - returns ApiResponse
  mutate,          // For mutations - returns ApiResponse  
  gql,             // For queries - throws on error, returns data directly
  gqlMutate,       // For mutations - throws on error, returns data directly
  
  // Utility functions
  testConnection,
  clearCache,
  getCacheStats,
  
  // Types
  type GraphQLResponse,
  type ApiResponse,
  type RequestOptions,
  type ApiError,
  type ApiErrorType,
  
  // Default export
  default
} from './graphql-client'

// ========================================
// 🔧 ADDITIONAL EXPORTS FROM UNIFIED CLIENT
// ========================================

// All configuration, caching, and utility functions are now
// included in the unified graphql-client.ts file

// ========================================
// 📁 QUERY DEFINITIONS
// ========================================

// Query definitions are available in ./queries/ but not re-exported here
// to avoid conflicts. Import directly from specific query files:
// import { GET_CARS } from '@/lib/api/queries/cars'
// import { GET_CAR_BRANDS } from '@/lib/api/queries/car-brands'

// ========================================
// 🛠️ DEVELOPMENT UTILITIES
// ========================================

/**
 * Get current language for API calls with Arabic-first priority
 */
export const getCurrentLanguage = (): string => {
  if (typeof window !== 'undefined') {
    // Check document direction first
    if (document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar') {
      return 'ar_001'
    }
    
    // Try to get from localStorage
    const savedLocale = localStorage.getItem('locale') || localStorage.getItem('language')
    if (savedLocale) {
      if (savedLocale === 'ar' || savedLocale === 'ar_001') return 'ar_001'
      if (savedLocale === 'en' || savedLocale === 'en_US') return 'en_US'
    }
    
    // Try to get from document lang attribute
    const documentLang = document.documentElement.lang
    if (documentLang) {
      if (documentLang === 'ar' || documentLang === 'ar_001') return 'ar_001'
      if (documentLang === 'en' || documentLang === 'en_US') return 'en_US'
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.languages?.[0]
    if (browserLang?.startsWith('ar')) return 'ar_001'
    if (browserLang?.startsWith('en')) return 'en_US'
  }
  
  return 'ar_001' // Default to Arabic as primary language
}

/**
 * Test API connection with detailed diagnostics
 */
export const testAPI = async (): Promise<{
  success: boolean
  latency?: number
  error?: string
}> => {
  try {
    const { testConnection } = await import('./graphql-client')
    return await testConnection()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    }
  }
}

/**
 * Get comprehensive API statistics
 */
export const getAPIStats = async () => {
  const { getCacheStats } = await import('./graphql-client')
  return getCacheStats()
}

/**
 * Clear all API caches
 */
export const clearAPICache = async (): Promise<void> => {
  const { clearCache } = await import('./graphql-client')
  clearCache()
}

/**
 * Enable debug mode for API requests
 */
export const enableDebugMode = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    console.log('🔧 Debug mode enabled for unified GraphQL client')
    console.log('📝 Available functions:')
    console.log('  • gql(query, variables) - Direct data access')
    console.log('  • query(query, variables) - Full response with metadata')
    console.log('  • gqlMutate(mutation, variables) - Direct mutation')
    console.log('  • mutate(mutation, variables) - Full mutation response')
    console.log('  • testConnection() - Test API connectivity')
    console.log('  • clearCache() - Clear all cached data')
    console.log('  • getCacheStats() - Get cache statistics')
  }
}

// ========================================
// ⚠️ LEGACY COMPATIBILITY (Deprecated)
// ========================================

/**
 * @deprecated Use `gql()` instead - this function is kept for backward compatibility only
 */
export const fetchGraphQL = async (query: string, variables?: Record<string, any>) => {
  console.warn('⚠️ fetchGraphQL is deprecated. Use gql() instead for better performance and features.')
  const { gql } = await import('./graphql-client')
  return gql(query, variables)
}

/**
 * @deprecated Use `testAPI()` instead - this function is kept for backward compatibility only
 */
export const testGraphQLConnection = async () => {
  console.warn('⚠️ testGraphQLConnection is deprecated. Use testAPI() instead.')
  return testAPI()
}

// ========================================
// 📖 USAGE EXAMPLES
// ========================================

/*

// 🎯 SIMPLE USAGE (Recommended)

import { gql, gqlMutate } from '@/lib/api'

// Query - throws on error, returns data directly
const cars = await gql(`
  query GetCars {
    AlromaihCar {
      id
      name
    }
  }
`)

// Mutation - throws on error, returns data directly  
const newCar = await gqlMutate(`
  mutation CreateCar($values: AlromaihCarValues!) {
    AlromaihCar(AlromaihCarValues: $values) {
      id
      name
    }
  }
`, { values: { name: 'New Car' } })

// 🔧 ADVANCED USAGE

import { query, mutate } from '@/lib/api'

// Query - returns ApiResponse with metadata
const result = await query(`query GetCars { ... }`)
if (result.success) {
  console.log('Data:', result.data)
  console.log('Duration:', result.duration, 'ms')
  console.log('Cached:', result.cached)
} else {
  console.error('Error:', result.error)
}

// 🌐 UNIVERSAL CLIENT

import { graphqlClient } from '@/lib/api'

// Works the same everywhere (server-side and client-side)
const response = await graphqlClient.query(`query { ... }`)

// 🛠️ UTILITIES

import { testConnection, clearCache, getCacheStats } from '@/lib/api'

await testConnection()  // Test API connectivity
clearCache()           // Clear all cached data
getCacheStats()        // Get cache statistics

*/ 