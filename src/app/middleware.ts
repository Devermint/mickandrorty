import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (
    process.env.NODE_ENV === 'production' && 
    request.headers.get('x-forwarded-proto') !== 'https'
  ) {
    const httpsUrl = 'https://' + request.headers.get('host') + request.nextUrl.pathname + request.nextUrl.search
    return NextResponse.redirect(httpsUrl, 301)
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/:path*',
} 