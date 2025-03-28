import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if the request is using HTTP
  if (process.env.NODE_ENV === 'production' && !request.headers.get('x-forwarded-proto')?.includes('https')) {
    // Create the HTTPS URL from the original request
    const httpsUrl = 'https://' + request.headers.get('host') + request.nextUrl.pathname + request.nextUrl.search
    return NextResponse.redirect(httpsUrl, 301)
  }
  
  return NextResponse.next()
} 