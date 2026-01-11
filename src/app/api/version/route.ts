/**
 * API Version Info Endpoint
 * 
 * GET /api/version
 * Returns API version information and supported versions
 */

import { NextResponse } from 'next/server'
import { getVersionInfo, addVersionHeaders, CURRENT_VERSION } from '@/lib/api-version'

export async function GET() {
  const versionInfo = getVersionInfo()
  
  const response = NextResponse.json({
    success: true,
    data: versionInfo,
    timestamp: new Date().toISOString(),
  })
  
  return addVersionHeaders(response, CURRENT_VERSION)
}
