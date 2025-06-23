/**
 * Secure GraphQL API Route
 * Handles GraphQL requests server-side to keep API keys secure
 */

import { NextRequest, NextResponse } from 'next/server'
import { graphqlClient } from '@/lib/api'

interface GraphQLRequestBody {
  query: string
  variables?: Record<string, any>
  operationName?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GraphQLRequestBody = await request.json()
    
    if (!body.query) {
      return NextResponse.json(
        { error: 'GraphQL query is required' },
        { status: 400 }
      )
    }

    // Validate query (basic security check)
    if (typeof body.query !== 'string') {
      return NextResponse.json(
        { error: 'Invalid query format' },
        { status: 400 }
      )
    }

    // Basic query validation - prevent dangerous operations
    const queryLower = body.query.toLowerCase()
    const dangerousPatterns = ['__schema', '__type', 'introspection']
    
    if (dangerousPatterns.some(pattern => queryLower.includes(pattern))) {
      return NextResponse.json(
        { error: 'Introspection queries are not allowed' },
        { status: 403 }
      )
    }

    console.log('🔒 API Route: Processing GraphQL request via unified client')

    // Use the unified GraphQL client (server-side execution)
    // Determine if it's a mutation or query
    const queryLowerCase = body.query.toLowerCase().trim()
    const isMutation = queryLowerCase.startsWith('mutation')
    
    const result = isMutation 
      ? await graphqlClient.mutate(body.query, body.variables || {}, {
          timeout: 30000,
          retries: 2,
          cache: false
        })
      : await graphqlClient.query(body.query, body.variables || {}, {
          timeout: 30000,
          retries: 2,
          cache: false
        })

    // Check if the result indicates an error
    if (!result.success) {
      console.error('GraphQL execution failed:', result.error)
      return NextResponse.json(
        { 
          error: 'GraphQL request failed',
          details: result.error || 'Server error'
        },
        { status: 500 }
      )
    }

    // Return successful response
    return NextResponse.json({
      data: result.data,
      cached: result.cached || false
    })

  } catch (error) {
    console.error('API route error:', error)

    // Handle timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Request timeout' },
        { status: 408 }
      )
    }

    // Handle network errors
    if (error instanceof Error && error.message.includes('fetch')) {
      return NextResponse.json(
        { error: 'Network error - unable to connect to GraphQL server' },
        { status: 503 }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Generic error handling
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
      },
      { status: 500 }
    )
  }
}

// Handle preflight requests for CORS
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = process.env.NEXT_PUBLIC_ALLOWED_ORIGINS?.split(',') || []
  
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }

  // Only allow specific origins in production
  if (process.env.NODE_ENV === 'production' && origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin
  } else if (process.env.NODE_ENV === 'development') {
    headers['Access-Control-Allow-Origin'] = '*'
  }

  return new NextResponse(null, { status: 200, headers })
} 