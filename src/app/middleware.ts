import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // SECURITY: Strip the vulnerable header first (CVE-2025-29927 mitigation)
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-middleware-subrequest');

  // Check for HTTPS
  const hostname = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto');
  
  // Handle Heroku's specific protocol header which might contain multiple values
  const isHttps = protocol ? protocol.includes('https') : false;

  // Only redirect in production and when not already using HTTPS
  if (process.env.NODE_ENV === 'production' && !isHttps) {
    return NextResponse.redirect(
      `https://${hostname}${request.nextUrl.pathname}${request.nextUrl.search}`,
      301
    );
  }

  // If no redirect needed, continue but with the vulnerable header removed
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// Only run on specific paths to maintain performance
export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images, and other
     * files that don't need the security check
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};