import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

/**
 * GET /api/docs
 * 
 * Returns OpenAPI specification for API documentation.
 */
export async function GET() {
  try {
    const openApiPath = join(process.cwd(), 'public', 'openapi.json')
    
    if (!existsSync(openApiPath)) {
      return NextResponse.json(
        { error: 'OpenAPI specification not found' },
        { status: 404 }
      )
    }
    
    const spec = readFileSync(openApiPath, 'utf-8')
    const data = JSON.parse(spec)
    
    return NextResponse.json(data, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
      },
    })
    
  } catch (error) {
    console.error('OpenAPI spec error:', error)
    return NextResponse.json(
      { error: 'Failed to load API specification' },
      { status: 500 }
    )
  }
}
