export interface ApiEndpoint {
  id: string
  name: string
  description: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  url: string
  headers: Record<string, string>
  body?: string
  variables?: Record<string, any>
  isActive: boolean
  lastTested?: string
  responseTime?: number
  status?: "success" | "error" | "pending"
}

export interface ApiKey {
  id: string
  name: string
  key: string
  description: string
  permissions: string[]
  isActive: boolean
  createdAt: string
  lastUsed?: string
  expiresAt?: string
}

export interface GraphQLQuery {
  id: string
  name: string
  description: string
  query: string
  variables: Record<string, any>
  model: string
  isActive: boolean
  lastExecuted?: string
  responseTime?: number
}

export interface ApiConfiguration {
  domain: string
  port?: number
  endpoint: string
  defaultHeaders: Record<string, string>
  timeout: number
  retryAttempts: number
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
  }
}

export interface ApiResponse<T = any> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
    extensions?: {
      code: string
      field?: string
    }
  }>
  status: number
  responseTime: number
  timestamp: string
}
