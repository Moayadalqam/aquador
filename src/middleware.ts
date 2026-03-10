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

  // --- Maintenance gate ---
  const isMaintenancePage = pathname === '/maintenance';
  const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js|woff2?)$/);
  const hasAccess = request.cookies.get('aq_access')?.value === '1';

  // If accessing maintenance page with valid cookie, redirect to home
  if (isMaintenancePage && hasAccess) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If not authorized and not on maintenance page and not a static asset/API, redirect
  if (!hasAccess && !isMaintenancePage && !isStaticAsset && !pathname.startsWith('/admin')) {
    return NextResponse.redirect(new URL('/maintenance', request.url));
  }

  const isAdminRoute = pathname.startsWith('/admin');
  const isAdminLoginRoute = pathname === '/admin/login';

  // Handle admin route authentication
  if (isAdminRoute && !isAdminLoginRoute) {
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

    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Check if user is an admin - use maybeSingle to avoid throwing on no results
    const { data: adminUser, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (adminError || !adminUser) {
      return NextResponse.redirect(new URL('/admin/login?error=unauthorized', request.url));
    }
  }

  // Add request ID to response headers for debugging
  response.headers.set('x-request-id', requestId);

  return response;
}

// Run middleware on all routes (maintenance gate needs to intercept everything)
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|woff2?|css|js)$).*)'],
};
