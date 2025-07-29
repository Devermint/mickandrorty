import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // SECURITY: Strip the vulnerable header first
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-middleware-subrequest');

  const hostname = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto');
  const pathname = request.nextUrl.pathname;

  // Handle Heroku's specific protocol header
  const isHttps = protocol ? protocol.includes('https') : false;

  // Check if we're at the root path and need to redirect to /home
  if (pathname === '/') {
    const url = new URL('/agents', request.url);
    return NextResponse.redirect(url);
  }

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
