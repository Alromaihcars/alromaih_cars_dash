/**
 * Unified GraphQL Client for Alromaih Cars Dashboard
 * 
 * ✨ Features:
 * - 🔒 Automatic security: API keys only on server-side
 * - 🌐 Universal: Works client-side and server-side
 * - 💾 Smart caching with TTL
 * - 🔄 Retry logic with exponential backoff
 * - 📊 Performance monitoring
 * - 🎯 TypeScript support
 * - 📁 File upload support
 * - 🌍 Automatic language detection
 */

// ========================================
// TYPES
// ========================================

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: Array<string | number>
  }>
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
  duration: number
  cached?: boolean
}

export interface RequestOptions {
  timeout?: number
  retries?: number
  cache?: boolean
  headers?: Record<string, string>
  signal?: AbortSignal
}

export type ApiErrorType = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'SERVER_ERROR'
  | 'GRAPHQL_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR'

export interface ApiError extends Error {
  type: ApiErrorType
  code?: number
  details?: Record<string, any>
  retry?: boolean
  timestamp: number
}

// ========================================
// CONFIGURATION
// ========================================

interface ApiConfig {
  endpoint: string
  apiKey: string
  timeout: number
  retryAttempts: number
  retryDelay: number
  cacheEnabled: boolean
  cacheTtl: number
}

const getApiConfig = (): ApiConfig => {
  const getApiKey = (): string => {
    if (typeof window !== 'undefined') {
      return '' // Client-side: empty string, will use proxy
    }
    
    const apiKey = process.env.API_KEY
    if (!apiKey) {
      // For build time or development, return a placeholder
      // The actual validation will happen at runtime when requests are made
      if (process.env.NODE_ENV === 'development' || process.env.NEXT_PHASE === 'phase-production-build') {
        console.warn('⚠️ API_KEY not set - GraphQL client will require configuration at runtime')
        return 'BUILD_TIME_PLACEHOLDER'
      }
      throw new Error('API_KEY environment variable is required but not set')
    }
    
    return apiKey
  }

  return {
    endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'https://portal.alromaihcars.com/graphql',
    apiKey: getApiKey(),
    timeout: parseInt(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT || '') || 30000,
    retryAttempts: parseInt(process.env.NEXT_PUBLIC_RETRY_ATTEMPTS || '') || 3,
    retryDelay: parseInt(process.env.NEXT_PUBLIC_RETRY_DELAY || '') || 1000,
    cacheEnabled: process.env.NEXT_PUBLIC_CACHE_ENABLED !== 'false',
    cacheTtl: parseInt(process.env.NEXT_PUBLIC_CACHE_TTL || '') || 300000 // 5 minutes
  }
}

// ========================================
// CACHE
// ========================================

interface CacheEntry<T = any> {
  data: T
  timestamp: number
  ttl: number
  key: string
}

class ApiCache {
  private cache = new Map<string, CacheEntry>()
  private readonly defaultTtl: number

  constructor(defaultTtl: number = 300000) { // 5 minutes default
    this.defaultTtl = defaultTtl
  }

  generateKey(query: string, variables?: Record<string, any>): string {
    const normalizedQuery = query.replace(/\s+/g, ' ').trim()
    const variablesStr = variables ? JSON.stringify(variables, Object.keys(variables).sort()) : ''
    return btoa(normalizedQuery + variablesStr).replace(/[+/=]/g, '')
  }

  set<T>(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTtl,
      key
    }
    
    this.cache.set(key, entry)
    this.cleanup()
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats(): { 
    size: number
    hits: number
    misses: number
    memoryUsage: number
  } {
    let memoryUsage = 0

    for (const entry of this.cache.values()) {
      memoryUsage += JSON.stringify(entry).length
    }

  return {
      size: this.cache.size,
      hits: 0, // Would need to track these in production
      misses: 0,
      memoryUsage
    }
  }

  smartSet<T>(query: string, variables: Record<string, any> | undefined, data: T): void {
    const key = this.generateKey(query, variables)
    
    let ttl = this.defaultTtl
    
    if (query.includes('mutation')) {
      return // Don't cache mutations
    } else if (query.includes('__introspection') || query.includes('__schema')) {
      ttl = 3600000 // 1 hour
    } else if (query.includes('count') || query.includes('aggregate')) {
      ttl = 60000 // 1 minute
    }
    
    this.set(key, data, ttl)
  }

  invalidatePattern(pattern: string): number {
    let invalidated = 0
    const regex = new RegExp(pattern, 'i')
    
    for (const [key, entry] of this.cache.entries()) {
      if (regex.test(key) || regex.test(entry.key)) {
        this.cache.delete(key)
        invalidated++
      }
    }
    
    return invalidated
  }
}

// ========================================
// UNIFIED GRAPHQL CLIENT
// ========================================

interface GraphQLRequest {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

class UnifiedGraphQLClient {
  private config = getApiConfig()
  private isServer = typeof window === 'undefined'
  private requestCounter = 0
  private cache = new ApiCache(this.config.cacheTtl)

  /**
   * Main request method - automatically handles server vs client-side
   */
  async request<T = any>(
    query: string,
    variables?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId()
    const startTime = Date.now()

    // Validate query parameter
    if (!query || typeof query !== 'string') {
      return {
        success: false,
        error: 'GraphQL query is required and must be a non-empty string',
        timestamp: Date.now(),
        duration: Date.now() - startTime
      }
    }

        console.log(`🚀 GraphQL Request [${requestId}]:`, {
      isServer: this.isServer,
      query: query ? query.substring(0, 100) + (query.length > 100 ? '...' : '') : 'undefined',
      variables: variables ? Object.keys(variables) : [],
      timestamp: new Date().toISOString()
    })

    try {
      // Check cache first (only for queries, not mutations)
      const cacheKey = this.cache.generateKey(query, variables)
      const useCache = options.cache !== false && this.config.cacheEnabled && !query.includes('mutation')
      
      if (useCache) {
        const cached = this.cache.get<T>(cacheKey)
        if (cached !== null) {
          console.log(`💾 Cache Hit [${requestId}]:`, cacheKey)
          return {
            success: true,
            data: cached,
            timestamp: Date.now(),
            duration: Date.now() - startTime,
            cached: true
          }
        }
      }

      // Process file uploads if any
      const processedVariables = variables ? await this.processFileUploads(variables) : undefined

      // Make the actual request
      let result: T
      if (this.isServer) {
        result = await this.serverRequest<T>(query, requestId, processedVariables, options)
      } else {
        result = await this.clientRequest<T>(query, requestId, processedVariables, options)
      }

      // Cache successful responses
      if (useCache && result) {
        this.cache.smartSet(query, variables, result)
        console.log(`📦 Cached [${requestId}]:`, cacheKey)
      }

      const duration = Date.now() - startTime
      console.log(`✅ Request Success [${requestId}]:`, `${duration}ms`)

      return {
        success: true,
        data: result,
        timestamp: Date.now(),
        duration,
        cached: false
      }

    } catch (error: unknown) {
      const duration = Date.now() - startTime
      const apiError = this.createApiError(error)
      
      console.error(`❌ Request Failed [${requestId}]:`, {
        error: apiError.message,
        type: apiError.type,
        duration: `${duration}ms`
      })

      return {
        success: false,
        error: apiError.message,
        timestamp: Date.now(),
        duration
      }
    }
  }

  /**
   * Server-side request with API key
   */
  private async serverRequest<T>(
    query: string,
    requestId: string,
    variables?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<T> {
    // Validate API key at runtime
    if (this.config.apiKey === 'BUILD_TIME_PLACEHOLDER') {
      throw this.createApiError('API_KEY environment variable is required but not configured. Please set API_KEY in your environment.', 'AUTHENTICATION_ERROR')
    }

    const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
      'X-API-KEY': this.config.apiKey,
      'Accept-Language': this.getCurrentLanguage(),
      ...options.headers
    }

    const response = await this.executeRequest({
      query,
      variables
    }, headers, options, requestId)

    return response.data as T
  }

  /**
   * Client-side request through secure API route
   */
  private async clientRequest<T>(
    query: string,
    requestId: string,
    variables?: Record<string, any>,
    options: RequestOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    }

    try {
      console.log(`🌐 Client Request [${requestId}]: Making request to /api/graphql`)

      // Use the secure API route
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers,
        signal: options.signal,
        body: JSON.stringify({
          query,
          variables
        })
      })

      console.log(`📡 Response Status [${requestId}]:`, response.status, response.statusText)

      // Handle different response statuses
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        
        try {
          const errorBody = await response.json()
          if (errorBody.error) {
            errorMessage = errorBody.error
          } else if (errorBody.message) {
            errorMessage = errorBody.message
          }
        } catch (parseError) {
          console.warn('Could not parse error response body:', parseError)
        }

        throw this.createApiError(
          new Error(errorMessage),
          response.status === 401 ? 'AUTHENTICATION_ERROR' : 
          response.status === 403 ? 'AUTHENTICATION_ERROR' :
          response.status === 404 ? 'SERVER_ERROR' :
          response.status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN_ERROR',
          response.status
        )
      }

      // Parse successful response
      const result = await response.json()
      console.log(`✅ Response Parsed [${requestId}]:`, Object.keys(result))

      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw this.createApiError(
          new Error('Invalid response format - expected JSON object'),
          'SERVER_ERROR'
        )
      }

      // Check for GraphQL errors in response
      if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
        const errorMessages = result.errors.map((err: any) => err.message || 'Unknown GraphQL error').join(', ')
        throw this.createApiError(
          new Error(`GraphQL errors: ${errorMessages}`),
          'GRAPHQL_ERROR'
        )
      }

      // Return the data (API route should return { data: ... })
      return result as T

    } catch (error) {
      console.error(`❌ Client Request Error [${requestId}]:`, error)
      
      // Re-throw ApiError instances as-is
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }
      
      // Handle fetch-specific errors
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw this.createApiError(
          new Error('Network error - unable to reach API server. Check your internet connection.'),
          'NETWORK_ERROR'
        )
      }
      
      // Handle timeout errors
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw this.createApiError(
          new Error('Request timeout - server took too long to respond'),
          'TIMEOUT_ERROR'
        )
      }
      
      // Generic error handling
      throw this.createApiError(error, 'UNKNOWN_ERROR')
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest(
    request: GraphQLRequest,
    headers: Record<string, string>,
    options: RequestOptions,
    requestId: string
  ): Promise<GraphQLResponse> {
    const maxRetries = options.retries ?? this.config.retryAttempts
    let lastError: ApiError | undefined

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = this.config.retryDelay * Math.pow(2, attempt - 1)
          console.log(`🔄 Retry ${attempt}/${maxRetries} [${requestId}]:`, `waiting ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), options.timeout ?? this.config.timeout)

        const response = await fetch(this.config.endpoint, {
          method: 'POST',
          headers,
          signal: options.signal || controller.signal,
          body: JSON.stringify(request)
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          throw this.createApiError(
            `HTTP ${response.status}: ${response.statusText} - ${errorText}`,
            response.status >= 500 ? 'SERVER_ERROR' : 'AUTHENTICATION_ERROR',
            response.status
          )
        }

        const result: GraphQLResponse = await response.json()

        if (result.errors && result.errors.length > 0) {
          throw this.createApiError(
            `GraphQL Error: ${result.errors[0]?.message || 'Unknown error'}`,
            'GRAPHQL_ERROR',
            undefined,
            { graphqlErrors: result.errors }
          )
        }

        return result

      } catch (error) {
        lastError = this.createApiError(error)
        
        // Don't retry non-retryable errors or on last attempt
        if (!lastError.retry || attempt === maxRetries) {
          throw lastError
        }
      }
    }

    throw lastError!
  }

  /**
   * Process file uploads to base64
   */
  private async processFileUploads(variables: Record<string, any>): Promise<Record<string, any>> {
  const processed: Record<string, any> = {}

  for (const [key, value] of Object.entries(variables)) {
      if (value instanceof File) {
        processed[key] = await this.fileToBase64(value)
      } else if (Array.isArray(value)) {
        processed[key] = await Promise.all(
          value.map(async (item) => 
            item instanceof File ? await this.fileToBase64(item) : item
          )
        )
    } else {
      processed[key] = value
    }
  }

  return processed
}

  /**
   * Convert file to base64
   */
  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(this.createApiError('File must be an image', 'VALIDATION_ERROR'))
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        reject(this.createApiError('File too large (max 10MB)', 'VALIDATION_ERROR'))
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // Remove data:image/type;base64, prefix
      }
      reader.onerror = () => reject(this.createApiError('Failed to read file', 'VALIDATION_ERROR'))
      reader.readAsDataURL(file)
    })
  }

  /**
   * Get current language
   */
  private getCurrentLanguage(): string {
    if (typeof window !== 'undefined') {
      // Client-side language detection
      try {
      const savedLocale = localStorage.getItem('locale')
      if (savedLocale === 'ar') return 'ar_001'
      if (savedLocale === 'en') return 'en_US'
      
      if (document.documentElement.dir === 'rtl' || document.documentElement.lang === 'ar') {
        return 'ar_001'
        }
      } catch (error) {
        console.warn('Error accessing localStorage or document:', error)
      }
    }
    return 'ar_001' // Default to Arabic
  }

  /**
   * Create standardized API error
   */
  private createApiError(
    error: unknown,
    type?: ApiErrorType,
    code?: number,
    details?: Record<string, any>
  ): ApiError {
    let message = 'Unknown error'
    let errorType: ApiErrorType = type || 'UNKNOWN_ERROR'

    if (error instanceof Error) {
      message = error.message
      
      if (error.name === 'AbortError') {
        errorType = 'TIMEOUT_ERROR'
        message = 'Request timeout'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('ERR_NETWORK')) {
        errorType = 'NETWORK_ERROR'
        message = 'Network error - unable to connect to server'
      } else if (error.message.includes('API_KEY')) {
        errorType = 'AUTHENTICATION_ERROR'
        message = 'API key configuration error'
      } else if (error.message.includes('GraphQL')) {
        errorType = 'GRAPHQL_ERROR'
      }
    } else if (typeof error === 'string') {
      message = error
    } else if (typeof error === 'object' && error !== null) {
      // Handle cases where error is an object but not an Error instance
      if ('message' in error && typeof error.message === 'string') {
        message = error.message
      } else if ('error' in error && typeof error.error === 'string') {
        message = error.error
      } else {
        message = JSON.stringify(error)
      }
    }

    // Provide more helpful error messages based on common issues
    if (message.includes('404') || message.includes('Not Found')) {
      errorType = 'SERVER_ERROR'
      message = 'API endpoint not found - check NEXT_PUBLIC_GRAPHQL_ENDPOINT configuration'
    } else if (message.includes('401') || message.includes('Unauthorized')) {
      errorType = 'AUTHENTICATION_ERROR'
      message = 'Authentication failed - check API_KEY configuration'
    } else if (message.includes('403') || message.includes('Forbidden')) {
      errorType = 'AUTHENTICATION_ERROR'
      message = 'Access denied - API key may not have sufficient permissions'
    } else if (message.includes('500')) {
      errorType = 'SERVER_ERROR'
      message = 'Server error - GraphQL server may be experiencing issues'
    } else if (message.includes('timeout')) {
      errorType = 'TIMEOUT_ERROR'
      message = 'Request timeout - server took too long to respond'
    }

    const apiError = new Error(message) as ApiError
    apiError.type = errorType
    apiError.code = code
    apiError.details = details
    apiError.timestamp = Date.now()
    apiError.retry = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'SERVER_ERROR'].includes(errorType)

    return apiError
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`
  }

  /**
   * Query method (for better semantics)
   */
  async query<T = any>(
    query: string,
    variables?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.request<T>(query, variables, options)
  }

  /**
   * Mutation method
   */
  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const result = await this.request<T>(mutation, variables, { ...options, cache: false })
    
    // Invalidate related cache entries after successful mutations
    if (result.success) {
      this.invalidateCache(mutation)
    }
    
    return result
  }

  /**
   * Invalidate cache based on mutation
   */
  private invalidateCache(mutation: string): void {
    const modelMatches = mutation.match(/(?:create|update|delete)(\w+)/gi)
    if (modelMatches) {
      modelMatches.forEach(match => {
        const modelName = match.replace(/^(create|update|delete)/i, '').toLowerCase()
        const invalidated = this.cache.invalidatePattern(modelName)
        if (invalidated > 0) {
          console.log(`🗑️ Invalidated ${invalidated} cache entries for ${modelName}`)
        }
      })
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<{ success: boolean; error?: string; latency?: number }> {
    const startTime = Date.now()
    
    try {
      console.log('🔍 Testing GraphQL connection...')
      console.log('📋 Configuration:', {
        endpoint: this.config.endpoint,
        isServer: this.isServer,
        apiKeyConfigured: this.isServer ? (this.config.apiKey !== 'BUILD_TIME_PLACEHOLDER' && this.config.apiKey.length > 0) : 'N/A (client-side)',
        timeout: this.config.timeout,
        cacheEnabled: this.config.cacheEnabled
      })
      
      const result = await this.request('{ __typename }', {}, { cache: false })
      const latency = Date.now() - startTime
      
      console.log('✅ Connection test result:', { success: result.success, latency: `${latency}ms` })
      
      return {
        success: result.success,
        error: result.error,
        latency
      }
    } catch (error) {
      const latency = Date.now() - startTime
      console.error('❌ Connection test failed:', error)
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection test failed',
        latency
      }
    }
  }

  /**
   * Validate configuration and provide helpful debugging info
   */
  validateConfiguration(): { valid: boolean; issues: string[]; recommendations: string[] } {
    const issues: string[] = []
    const recommendations: string[] = []

    // Check endpoint configuration
    if (!this.config.endpoint || this.config.endpoint === 'https://portal.alromaihcars.com/graphql') {
      if (this.config.endpoint === 'https://portal.alromaihcars.com/graphql') {
        recommendations.push('Using default endpoint. Ensure this is correct for your environment.')
      } else {
        issues.push('NEXT_PUBLIC_GRAPHQL_ENDPOINT is not configured')
        recommendations.push('Set NEXT_PUBLIC_GRAPHQL_ENDPOINT in your environment variables')
      }
    }

    // Check API key configuration (server-side only)
    if (this.isServer) {
      if (!this.config.apiKey || this.config.apiKey === 'BUILD_TIME_PLACEHOLDER') {
        issues.push('API_KEY is not configured')
        recommendations.push('Set API_KEY in your environment variables (server-side only)')
      } else if (this.config.apiKey.length < 20) {
        issues.push('API_KEY appears to be too short - it may be invalid')
        recommendations.push('Verify your API_KEY is correct and properly generated')
      }
    }

    // Check timeout settings
    if (this.config.timeout < 5000) {
      recommendations.push('Request timeout is quite short. Consider increasing if you experience timeout errors.')
    }

    return {
      valid: issues.length === 0,
      issues,
      recommendations
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
    console.log('🧹 Cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats()
  }
}

// ========================================
// EXPORTS
// ========================================

// Create and export singleton instance
export const graphqlClient = new UnifiedGraphQLClient()

// Export convenience functions
export const query = <T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: RequestOptions
) => graphqlClient.query<T>(query, variables, options)

export const mutate = <T = any>(
  mutation: string,
  variables?: Record<string, any>,
  options?: RequestOptions
) => graphqlClient.mutate<T>(mutation, variables, options)

export const testConnection = () => graphqlClient.testConnection()

export const clearCache = () => graphqlClient.clearCache()

export const getCacheStats = () => graphqlClient.getCacheStats()

// Easy-to-use wrapper functions that throw on error
export const gql = async <T = any>(
  query: string,
  variables?: Record<string, any>,
  options?: RequestOptions
): Promise<T> => {
  if (!query || typeof query !== 'string') {
    throw new Error('GraphQL query is required and must be a non-empty string')
  }
  
  const result = await graphqlClient.query<T>(query, variables, options)
  if (!result.success) {
    throw new Error(result.error || 'GraphQL query failed')
  }
  return result.data!
}

export const gqlMutate = async <T = any>(
  mutation: string,
  variables?: Record<string, any>,
  options?: RequestOptions
): Promise<T> => {
  const result = await graphqlClient.mutate<T>(mutation, variables, options)
  if (!result.success) {
    throw new Error(result.error || 'GraphQL mutation failed')
  }
  return result.data!
}

// Default export
export default graphqlClient 