import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Generate a unique request ID
  const requestId = crypto.randomUUID();

  // Clone the request headers and add the request ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  // Create response with the request ID header
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Also add request ID to response headers for client-side debugging
  response.headers.set('x-request-id', requestId);

  return response;
}

// Only run middleware on API routes
export const config = {
  matcher: '/api/:path*',
};
