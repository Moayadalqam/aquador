import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  // Generate a unique request ID
  const requestId = crypto.randomUUID();

  // Clone the request headers and add the request ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-request-id', requestId);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';
  const isAdminApiRoute = pathname.startsWith('/api/admin');
  // Setup route bootstraps the first admin — it has its own secret-gated auth.
  const isAdminSetupRoute = pathname === '/api/admin/setup';

  const needsAdminAuth =
    (isAdminRoute && !isAdminLoginRoute) || (isAdminApiRoute && !isAdminSetupRoute);

  // Handle admin route authentication (defense-in-depth for both UI and API routes)
  if (needsAdminAuth) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    const denyUnauthenticated = () => {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401, headers: { 'x-request-id': requestId } }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    };

    const denyUnauthorized = () => {
      if (isAdminApiRoute) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403, headers: { 'x-request-id': requestId } }
        );
      }
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    };

    if (!user) return denyUnauthenticated();

    // Check if user is an admin - use maybeSingle to avoid throwing on no results
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (adminError || !adminUser) return denyUnauthorized();
  }

  // Add request ID to response headers for debugging
  response.headers.set('x-request-id', requestId);

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
