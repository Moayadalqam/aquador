import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Generate a unique request ID
  const requestId = crypto.randomUUID();

  // Clone the request headers and add the request ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // TEMPORARY: Auth disabled for admin routes - allow all access
  // TODO: Re-enable authentication before production
  const isAdminLoginRoute = request.nextUrl.pathname === '/admin/login';

  // Redirect login page directly to dashboard since auth is disabled
  if (isAdminLoginRoute) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Also add request ID to response headers for client-side debugging
  response.headers.set('x-request-id', requestId);

  return response;
}

// Run middleware on API routes and admin routes
export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
