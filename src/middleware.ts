import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

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

  // Check if this is an admin route
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isAdminLoginRoute = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute) {
    // Create Supabase client for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    // Check auth
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !isAdminLoginRoute) {
      // Redirect to admin login if not authenticated
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (user && isAdminLoginRoute) {
      // Redirect to admin dashboard if already logged in
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Check if user is an admin (for non-login routes)
    if (user && !isAdminLoginRoute) {
      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!adminUser) {
        // User is not an admin, sign out and redirect
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
      }
    }
  }

  // Also add request ID to response headers for client-side debugging
  response.headers.set('x-request-id', requestId);

  return response;
}

// Run middleware on API routes and admin routes
export const config = {
  matcher: ['/api/:path*', '/admin/:path*'],
};
